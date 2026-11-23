import { sitemapResponse } from '@lacecms/astro';
import { getSite } from '../lace/site';

export async function GET() {
  return sitemapResponse(await getSite(), {
    include: ({ modelKey }) => ['home', 'about', 'projects'].includes(modelKey),
  });
}
