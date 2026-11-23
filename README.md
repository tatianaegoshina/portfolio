# Tatiana Egoshina — Portfolio

Astro builds the portfolio from published Lace CMS content. The homepage lists
projects in CMS order, `/about` shows the CV, and `/projects/<slug>/` renders each
published project's text and media. The Lace Worker serves the CMS and its API.

## Local development

Use Node.js 24 and pnpm 12. Create a read-only build token in Lace Admin under
**Settings → Build tokens**, then copy `.env.example` to `.env` in the repository
root and set `LACE_BUILD_TOKEN`. Publish **Home** and **About** before building.

```sh
pnpm install --frozen-lockfile
pnpm dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
pnpm build
```

## Publish the existing import

For a bulk publication, create a publish-enabled token under **Settings →
Import tokens**. Run the dry run from the repository root and review the plan
before running the second import command.

```sh
read -rs LACE_IMPORT_TOKEN && export LACE_IMPORT_TOKEN
pnpm --dir cms exec lace import ./import --url https://portfolio-cms.tategodi.workers.dev --publish --dry-run
pnpm --dir cms exec lace import ./import --url https://portfolio-cms.tategodi.workers.dev --publish
unset LACE_IMPORT_TOKEN
```

## Cloudflare Pages

In **Workers & Pages → Create application → Pages → Connect to Git**, select
`tatianaegoshina/portfolio`. Push the Astro changes to `main` before running the
first build. [Cloudflare Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/)

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Production branch | `main` |
| Root directory | Leave blank to use the repository root |
| Build command | `pnpm build` |
| Build output directory | `dist` |

Set these build variables in Pages for **Production**. If you enable branch
previews, set the required build variables for **Preview** as well and set
`LACE_SITE_INDEXING=off` there.

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `24.22.1` |
| `PNPM_VERSION` | `12.18.0` |
| `LACE_API_BASE_URL` | `https://portfolio-cms.tategodi.workers.dev/` |
| `LACE_PUBLIC_BASE_URL` | Same as `LACE_API_BASE_URL` |
| `LACE_BUILD_TOKEN` | Read-only Lace build token, saved as a secret |
| `LACE_BUILD_SITE_URL` | Public site URL, for example `https://<project>.pages.dev/` until the custom domain is connected |

Click **Save and Deploy** and review the first build log. Future pushes to
`main` trigger production builds through the Git integration.

## Rebuild on CMS publication

1. In the Pages project, open **Settings → Builds → Add deploy hook**. Name it
   `lace-publish` and select `main`.
2. From the repository root, run the command below and paste the deploy hook URL
   at the Wrangler secret prompt.
3. Publish a change in Lace Admin and check **Deployments** in the Pages project.
   Confirm that the hook-triggered deployment succeeded and the change appears
   on the site.

```sh
pnpm --dir cms exec wrangler secret put LACE_DEPLOY_HOOK_URL --config worker/wrangler.jsonc
```

Keep the hook URL in the Worker secret and the build token in Pages build secrets.
Lace can also report the Pages deployment result if deployment tracking is enabled.
[Lace deployment tracking](cms/docs/lace-operations.md#recovery) ·
[Cloudflare Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
