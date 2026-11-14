# Переход Lace CMS с rc3 на rc4

Статус на 14 ноября 2026: в локальном исходном репозитории Lace rc4 указан как кандидат, публикация ожидается. До публикации всех пакетов и `create-lace@0.1.0-rc4` не запускайте обновление: существующие зависимости и lock-файлы оставлены на rc3. Проверьте также актуальные release notes: опубликованный релиз может отличаться от кандидата.

Команды ниже рассчитаны на этот репозиторий, Node >= 24.12 и pnpm >= 12. Они не запускаются автоматически. CMS использует Worker `portfolio-cms`, D1 `portfolio-cms` и R2 `portfolio-media`; статический сайт развёртывается отдельно. Проверяйте каждую команду и останавливайтесь при ошибке.

## 1. Подготовка и резервная копия

Из корня репозитория проверьте публикацию и доступность всех пакетов:

```sh
for pkg in create-lace @lacecms/cli @lacecms/config @lacecms/content @lacecms/db @lacecms/platform-cloudflare @lacecms/astro @lacecms/render @lacecms/sdk; do
  pnpm view "$pkg@0.1.0-rc4" version || break
done
```

Сохраните код, lock-файлы, конфигурацию и настройки развёртывания. Остановите изменения контента и другие записи на время согласованной копии D1 и R2. Из `cms/`, после проверки аккаунта:

```sh
cd cms
pnpm exec wrangler whoami --config worker/wrangler.jsonc
pnpm exec wrangler d1 export portfolio-cms --remote --config worker/wrangler.jsonc --output /private/path/portfolio-cms-before-rc4.sql
```

Замените путь на защищённый существующий каталог вне репозитория. Отдельно скопируйте все объекты `portfolio-media` через S3-совместимый API R2; SQL не содержит медиа. Проверьте восстановление копии в изолированной среде. Откат Worker или файлов проекта не отменяет миграции и изменения данных.

## 2. Обновление проекта

Создайте чистый шаблон того же типа (существующий Astro-сайт и Cloudflare), не меняя свой сайт. Используется временный каталог с минимальной копией его метаданных:

```sh
# Из корня репозитория
upgrade_dir=$(mktemp -d /private/tmp/portfolio-lace-rc4.XXXXXX)
cp package.json astro.config.mjs "$upgrade_dir/"
pnpm dlx create-lace@0.1.0-rc4 create "$upgrade_dir/cms" --existing-site .. --cloudflare
cd cms
pnpm exec lace upgrade --template "$upgrade_dir/cms"
```

Изучите план. При отсутствии конфликтов примените его; если команда сообщает о конфликтах, разберите предлагаемые файлы и diff в `.lace/conflicts/`, сохранив свои изменения. `lace.config.ts`, Worker-конфигурация, сайт и `.env` принадлежат проекту и автоматически не заменяются.

```sh
pnpm exec lace upgrade --template "$upgrade_dir/cms" --apply
pnpm install
pnpm --dir .. add @lacecms/astro@0.1.0-rc4 @lacecms/content@0.1.0-rc4 @lacecms/render@0.1.0-rc4 @lacecms/sdk@0.1.0-rc4
pnpm cf:build
```

Убедитесь, что все прямые зависимости `@lacecms/*` в обоих `package.json` имеют версию rc4, а оба lock-файла обновлены. Проверьте изменения управляемых файлов и закоммитьте их вместе. Если используется Compose, вручную обновите `LACE_API_IMAGE` и `LACE_BUILDER_IMAGE` в приватном `.env` до соответствующих образов rc4; для Worker они не используются. При необходимости обновите установленные компоненты через `pnpm exec lace add block --all --site ..` и рассмотрите конфликты, не перезаписывая собственные изменения.

## 3. Cloudflare: миграция и публикация

В `cms/.lace/cloudflare-operator.env` должны быть корректные account ID, D1 ID, токен для D1 и `LACE_WRANGLER_CONFIG=worker/wrangler.jsonc`. Не выводите содержимое файла. В примере используется отдельная OAuth-авторизация Wrangler для развёртывания; сначала проверьте нужный аккаунт и настройки Worker, включая vars и bindings, поскольку deploy может изменить удалённую конфигурацию.

```sh
# Из cms/
pnpm exec wrangler login
pnpm exec lace cloudflare preflight --target cloudflare-remote --wrangler-auth oauth --operator-env .lace/cloudflare-operator.env
pnpm exec wrangler whoami --config worker/wrangler.jsonc
pnpm exec lace db migrate --target cloudflare-remote --operator-env .lace/cloudflare-operator.env
pnpm exec lace content sync --target cloudflare-remote --operator-env .lace/cloudflare-operator.env
pnpm exec wrangler deploy --config worker/wrangler.jsonc
```

Миграция и синхронизация изменяют production D1. Не запускайте `auth bootstrap`: он нужен для первичной настройки, а не для обновления. Проверьте `https://portfolio-cms.tategodi.workers.dev/health/ready`, вход в `/admin/`, версию CMS в настройках, содержимое и доступность медиа.

Пересоберите и опубликуйте статический сайт отдельно существующим способом Cloudflare Pages, используя обновлённый lock-файл и настроенные `LACE_API_BASE_URL`, `LACE_PUBLIC_BASE_URL` и секрет `LACE_BUILD_TOKEN`. Успешное развёртывание Worker само по себе сайт не обновляет. Шаблон workflow в `cms/.github/workflows/` не запускается GitHub из вложенной папки; если он ещё не перенесён и настроен в корневой `.github/workflows/`, используйте действующий процесс сборки Pages. Проверьте опубликованные страницы и изображения.
