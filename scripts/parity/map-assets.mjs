import { readFile, writeFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const [checkout, output] = process.argv.slice(2);
if (!checkout || !output) throw new Error('Usage: node map-assets.mjs BUILT_UPSTREAM OUTPUT_JSON');
const upstream = await realpath(checkout);
const html = await readFile(path.join(upstream, 'dist/about/index.html'), 'utf8');
const candidates = [...html.matchAll(/<img\b[^>]*\bsrc="([^"<>]+)"/g)].map(match => match[1]).filter(src => src.startsWith('/_astro/'));
if (candidates.length !== 1) throw new Error('Expected one optimized image on the pinned upstream about page');
const source = 'src/assets/images/astropaper-og.jpg';
const optimized = path.join(upstream, 'dist', candidates[0]);
const digest = async file => createHash('sha256').update(await readFile(file)).digest('hex');
await writeFile(output, JSON.stringify([{
  source,
  sourceSha256: await digest(path.join(upstream, source)),
  optimized,
  optimizedSha256: await digest(optimized),
}], null, 2) + '\n', { flag: 'wx' });
