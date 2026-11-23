import { robotsResponse } from '@lacecms/astro';
import { getSite } from '../lace/site';

export async function GET() {
  return robotsResponse(await getSite());
}
