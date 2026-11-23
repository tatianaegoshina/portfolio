// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { laceImageConfig } from '@lacecms/astro';
import { defineConfig } from 'astro/config';

const envFile = new URL('./.env', import.meta.url);
const localEnv = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};

export default defineConfig({
  output: 'static',
  image: laceImageConfig({ ...localEnv, ...process.env }),
});
