import { createAstroSiteLoader } from '@lacecms/astro';
import type { PublishedSite } from '@lacecms/sdk';

export const getSite = createAstroSiteLoader({
  env: { ...import.meta.env, ...process.env },
  dev: import.meta.env.DEV,
  onLinkDiagnostics(diagnostics) {
    if (diagnostics.total > 0) {
      console.warn('[lace] Unavailable internal links', diagnostics);
    }
  },
});

export function projectsInOrder(site: PublishedSite) {
  return [...site.entries('projects')].sort(
    (a, b) => order(a.fields.order) - order(b.fields.order),
  );
}

export function order(value: unknown) {
  return typeof value === 'number' ? value : Number.MAX_SAFE_INTEGER;
}

export function label(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function firstYear(value: unknown) {
  return Number(label(value)?.match(/^\d{4}/)?.[0] ?? 0);
}
