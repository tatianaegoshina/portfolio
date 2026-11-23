# Your Lace site

Lace is a single-site CMS for your existing static Astro website. You edit `lace.config.ts` here and your site's own source; the API/admin and builder come from packaged runtimes.

Site mode: **existing site** at `..` (relative to this directory). This project contains no `site/` directory, and the generator did not modify your site. Connect it once with `pnpm exec lace add block --all --site ..` and the steps in [Connect an existing Astro site](docs/lace-astro-site.md); the development guide lists them in order.

This README is an index. Every command sequence lives in the scenario guides below; run them from this directory (the CMS installation root, for example `cms/`).

## Requirements

- Node `>=24.12.0` and pnpm `>=12`. See the [tested versions](https://github.com/lacecms/lace/blob/main/docs/compatibility.md#minimum-requirements-and-tested-versions) for verified combinations.
- Docker with Compose and a running daemon for the Compose scenarios. Compose pulls the pinned SILO image for object storage.
- Lace packages and API/builder images from the same release, `1.0.0`, as pinned in `package.json` and `.env.example`.

## Layout and ownership

| Path | Owner | Purpose |
| --- | --- | --- |
| `lace.config.ts` | you | Models (singleton Home at `/`, Posts at `/blog/:slug`), fields and permitted blocks |
| `..` | you | Your Astro site; Lace never creates or changes its files |
| `README.md` | you | This index; upgrades preserve your edits |
| `.env` | you, private | Local settings and generated credentials; never commit it |
| `worker/wrangler.jsonc` | you | CMS Worker configuration and resource IDs |
| `.lace/cloudflare-operator.env` | you, private | Remote Cloudflare management credentials, loaded only when selected |
| `docs/`, `docker-compose.yml`, `deploy/`, `package.json` | managed | Updated by `lace upgrade` with hash/conflict review |

## Choose a scenario

- [Docker Compose development](docs/lace-compose-dev.md): install, prepare `.env`, create the first administrator, publish and build the site on your machine.
- [Docker Compose production](docs/lace-compose-production.md): run the CMS, fixed-command builder and static web proxy on a server with reviewed public origins.
- [Cloudflare](docs/lace-cloudflare.md): run the CMS Worker locally without an account, then provision and deploy it to your Cloudflare account. The CMS Worker and the static site are separate deployments.

Each guide states its working directory, prerequisites, one-time and repeat steps, expected results, recovery and next step.

## References

- [Lace operations](docs/lace-operations.md): environment preparation, private setup input, doctor limits and exit codes, configuration sync, build-site selection, publication visibility, diagnostics and, for Cloudflare projects, management credentials.
- [Import content](docs/lace-operations.md#import-content): load pages, posts and images from another site with `pnpm exec lace import <dir>` and a short-lived import token.
- [Connect an existing Astro site](docs/lace-astro-site.md): Lace site packages, the server-only loader, routes, block components and styling hooks.

## Drafts, publication and deployment

Saving a draft never changes published content. Publishing makes a revision readable through the authenticated build export, but it does not deploy anything by itself: a static site changes only after a fresh build is deployed. Builds in Admin show whether a build is proven `succeeded` or only `accepted` by a provider; see [when published content becomes visible](docs/lace-operations.md#when-published-content-becomes-visible).

The CMS Worker and the static site are deployed separately: deploying one never deploys, migrates or configures the other.

## Extend the site

Change models in `lace.config.ts`, then review and apply them with an explicit configuration sync; Lace never generates routes or renderers for you.
Routes, layouts and block components belong to your site at `..`.
See [configuration, routes, renderers and styling](docs/lace-operations.md#configuration-routes-renderers-and-styling) and [Connect an existing Astro site](docs/lace-astro-site.md).
