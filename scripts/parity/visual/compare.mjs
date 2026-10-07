/* eslint-disable no-await-in-loop -- Serial captures preserve rendering conditions; serial diffs bound full-page image memory. */
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const [baselineDir, candidateDir, outputDir] = process.argv.slice(2);
if (!outputDir) throw new Error('Usage: node compare.mjs BASELINE_DIR CANDIDATE_DIR OUTPUT_DIR');
const outputPath = path.join(await realpath(path.dirname(path.resolve(outputDir))), path.basename(outputDir));
for (const input of [baselineDir, candidateDir]) {
  const source = await realpath(input);
  if (outputPath === source || outputPath.startsWith(source + path.sep) || source.startsWith(outputPath + path.sep)) throw new Error('Diff output must be separate from screenshot inputs');
}
await mkdir(outputPath);
const baseline = JSON.parse(await readFile(path.join(baselineDir, 'manifest.json'), 'utf8'));
const candidate = JSON.parse(await readFile(path.join(candidateDir, 'manifest.json'), 'utf8'));
if (baseline.browser !== candidate.browser) throw new Error('Browser versions differ');
const results = [];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
for (const capture of baseline.captures) {
  const referenceBytes = await readFile(path.join(baselineDir, capture.file));
  if (digest(referenceBytes) !== capture.sha256) throw new Error(`Baseline screenshot hash changed: ${capture.file}`);
  const a = PNG.sync.read(referenceBytes);
  const candidateCapture = candidate.captures.find(item => item.file === capture.file);
  if (!candidateCapture) { results.push({ file: capture.file, pass: false, failure: 'missing candidate manifest entry' }); continue; }
  if (capture.errors.length || candidateCapture.errors.length) { results.push({ file: capture.file, pass: false, failure: 'browser runtime errors', errors: [...capture.errors, ...candidateCapture.errors] }); continue; }
  let b;
  try {
    const candidateBytes = await readFile(path.join(candidateDir, capture.file));
    if (digest(candidateBytes) !== candidateCapture.sha256) throw new Error('Candidate screenshot hash changed');
    b = PNG.sync.read(candidateBytes);
  }
  catch (error) { results.push({ file: capture.file, pass: false, failure: String(error) }); continue; }
  const width = Math.max(a.width, b.width), height = Math.max(a.height, b.height);
  const padded = [a, b].map(source => {
    const target = new PNG({ width, height });
    PNG.bitblt(source, target, 0, 0, source.width, source.height, 0, 0);
    return target;
  });
  const diff = new PNG({ width, height });
  const changedPixels = pixelmatch(padded[0].data, padded[1].data, diff.data, width, height, { threshold: 0, includeAA: true });
  let changedBytes = 0;
  for (let index = 0; index < padded[0].data.length; index++) if (padded[0].data[index] !== padded[1].data[index]) changedBytes++;
  await writeFile(path.join(outputDir, capture.file), PNG.sync.write(diff));
  results.push({ file: capture.file, pass: changedBytes === 0 && a.width === b.width && a.height === b.height, baseline: [a.width, a.height], candidate: [b.width, b.height], changedPixels, changedBytes, changedPixelPercentage: changedPixels / (width * height) * 100 });
}
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ settings: { threshold: 0, includeAA: true, passRequires: 'zero changed bytes and identical dimensions', masks: [] }, results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.every(result => result.pass) ? 0 : 1;
