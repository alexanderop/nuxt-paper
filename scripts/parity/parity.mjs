#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

export const UPSTREAM_SHA = '35cfa7fbe0b897306d27670d3819e55d5205f3dd';
const EXCLUDED = new Set(['node_modules', '.git', '.nuxt', '.output', '.data', '.cache', '.pnpm-store', 'coverage', 'test-results', 'playwright-report', 'dist', '.DS_Store']);

export function transformContent(raw, rewriteAsset = value => value, { mdx = false } = {}) {
  let fence = null;
  let frontmatter = raw.startsWith('---\n') || raw.startsWith('---\r\n');
  return raw.split(/(?<=\n)/).map((line, index) => {
    if (frontmatter) {
      if (index > 0 && /^---\s*$/.test(line)) frontmatter = false;
      return line.replace(/^(ogImage:\s*)([^\r\n]+)/, (_, prefix, value) => prefix + rewriteAsset(value));
    }
    const marker = line.match(/^\s*(?:>\s*)?(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && /^\s*$/.test(line.slice(line.indexOf(marker[1]) + marker[1].length))) fence = null;
      return line;
    }
    if (marker) { fence = marker[1]; return line; }
    if (/^import ResponsiveTable from ['"]@\/components\/ResponsiveTable\.astro['"];?\s*$/.test(line)) return '';
    return line.split(/(`+[^`]*`+)/g).map((part, partIndex) => partIndex % 2 ? part : part
      .replace(/<ResponsiveTable\s*([^>]*)>/g, (_, attrs) => `::responsive-table${attrs.trim() ? `{${attrs.trim()}}` : ''}`)
      .replace(/<\/ResponsiveTable>/g, '::')
      .replaceAll('{" "}', ' ')
      .replace(/(<figcaption\b[^>]*>)/g, (_, tag) => mdx ? `${tag}<p>` : tag)
      .replace(/<\/figcaption>/g, tag => mdx ? `</p>${tag}` : tag)
      .replace(/^(>\s*)\[!(\w+)\]/, '$1\\[!$2]')
      .replace(/(\]\()([^\s)]+)([^)]*\))/g, (_, start, asset, end) => start + rewriteAsset(asset) + end)
      .replace(/(\b(?:src|poster)=["'])([^"']+)(["'])/g, (_, start, asset, end) => start + rewriteAsset(asset) + end)
    ).join('');
  }).join('');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).toSorted((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const name = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected source symlink: ${name}`);
    return entry.isDirectory() ? walk(name) : [name];
  });
}

function replaceConfig(text, name, value) {
  const expression = new RegExp(`export const ${name}(?::[^=]+)? = \\{[\\s\\S]*?\\n\\};`);
  if (!expression.test(text)) throw new Error(`Missing ${name} configuration interface`);
  return text.replace(expression, `export const ${name} = ${JSON.stringify(value, null, 2)} as const;`);
}

export function prepare({ source, upstream, output, install = false, build = false, now = new Date().toISOString(), assetMap }) {
  source = fs.realpathSync(source);
  upstream = fs.realpathSync(upstream);
  output = path.resolve(output);
  const outputParent = fs.realpathSync(path.dirname(output));
  output = path.join(outputParent, path.basename(output));
  for (const input of [source, upstream]) {
    if (output === input || output.startsWith(input + path.sep) || input.startsWith(output + path.sep)) throw new Error('Output must be separate from both sources');
  }
  if (fs.existsSync(output)) throw new Error(`Output already exists; use a new staging path: ${output}`);
  const git = (...args) => execFileSync('git', ['-C', upstream, ...args], { encoding: 'utf8' }).trim();
  if (git('rev-parse', 'HEAD') !== UPSTREAM_SHA) throw new Error(`Expected upstream ${UPSTREAM_SHA}`);
  if (git('diff', 'HEAD', '--')) throw new Error('Upstream tracked files are modified');
  if (git('ls-files', '--others', '--exclude-standard', '--', 'src/content', 'src/assets', 'public')) throw new Error('Upstream fixture inputs contain untracked files');
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid --now timestamp');
  const assetOverrides = new Map();
  if (assetMap) {
    const records = JSON.parse(fs.readFileSync(assetMap, 'utf8'));
    if (!Array.isArray(records)) throw new Error('Asset map must be an array');
    for (const record of records) {
      const original = path.resolve(upstream, record.source);
      const optimized = path.resolve(path.dirname(path.resolve(assetMap)), record.optimized);
      if (!original.startsWith(upstream + path.sep)) throw new Error('Mapped source escapes upstream');
      if (digest(original) !== record.sourceSha256 || digest(optimized) !== record.optimizedSha256) throw new Error(`Asset map hash mismatch: ${record.source}`);
      if (assetOverrides.has(original)) throw new Error(`Duplicate asset override: ${record.source}`);
      assetOverrides.set(original, { ...record, optimized });
    }
  }
  fs.cpSync(source, output, { recursive: true, filter: input => {
    const relative = path.relative(source, input);
    if (relative.split(path.sep).some(part => EXCLUDED.has(part) || part === '.env' || part.startsWith('.env.'))) return false;
    if (fs.lstatSync(input).isSymbolicLink()) throw new Error(`Unexpected project symlink: ${input}`);
    return true;
  }});
  const sourceFiles = walk(output).map(file => ({ path: path.relative(output, file).split(path.sep).join('/'), sha256: digest(file) }));
  const content = path.join(output, 'content');
  fs.rmSync(content, { recursive: true, force: true });
  fs.mkdirSync(content, { recursive: true });
  fs.cpSync(path.join(upstream, 'public'), path.join(output, 'public'), { recursive: true });
  const manifest = { upstream: UPSTREAM_SHA, source, output, publicationNow: now, sourceFiles, files: [], assets: [], assetOverrides: [] };
  const contentRoot = path.join(upstream, 'src/content');
  for (const input of walk(contentRoot).filter(file => /\.mdx?$/.test(file))) {
    const relative = path.relative(contentRoot, input).replace(/\.mdx$/, '.md');
    const rewrite = original => {
      const quote = /^(["']).*\1$/.test(original) ? original[0] : '';
      const asset = quote ? original.slice(1, -1) : original;
      if (/^(?:[a-z]+:|\/|#)/i.test(asset)) return original;
      const resolved = asset.startsWith('@/') ? path.join(upstream, 'src', asset.slice(2)) : path.resolve(path.dirname(input), asset);
      if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return original;
      if (!resolved.startsWith(upstream + path.sep)) throw new Error(`Asset escapes upstream: ${asset}`);
      const relativeAsset = path.relative(upstream, resolved).split(path.sep).join('/');
      const override = assetOverrides.get(resolved);
      const publicPath = `/parity-assets/${relativeAsset}${override ? path.extname(override.optimized) : ''}`;
      const target = path.join(output, 'public', publicPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(override?.optimized ?? resolved, target);
      if (override && !manifest.assetOverrides.some(item => item.source === override.source)) manifest.assetOverrides.push({ ...override, publicPath });
      if (!manifest.assets.includes(publicPath)) manifest.assets.push(publicPath);
      return quote + publicPath + quote;
    };
    const target = path.join(content, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const transformed = transformContent(fs.readFileSync(input, 'utf8'), rewrite, { mdx: input.endsWith('.mdx') });
    fs.writeFileSync(target, transformed);
    manifest.files.push({ path: relative, sha256: createHash('sha256').update(transformed).digest('hex') });
  }
  const configPath = path.join(output, 'shared/utils/site.ts');
  let config = fs.readFileSync(configPath, 'utf8');
  config = replaceConfig(config, 'SITE', { url: 'https://astro-paper.pages.dev/', title: 'AstroPaper', description: 'A minimal, responsive and SEO-friendly Astro blog theme.', author: 'Sat Naing', profile: 'https://satna.ing', ogImage: '/default-og.jpg', lang: 'en', timezone: 'Asia/Bangkok', dir: 'ltr', googleVerification: '' });
  config = replaceConfig(config, 'HOME', { title: 'Mingalaba', description: 'AstroPaper is a minimal, responsive, accessible and SEO-friendly Astro blog theme. This theme follows best practices and provides accessibility out of the box. Light and dark mode are supported by default. Moreover, additional color schemes can also be configured.', readMorePrefix: 'Read the blog posts or check', readMoreLabel: 'README', readMoreUrl: 'https://github.com/satnaing/astro-paper#readme', readMoreSuffix: 'for more info.' });
  config = replaceConfig(config, 'POSTS', { perPage: 4, perIndex: 4, scheduledPostMargin: 15 * 60 * 1000 });
  config = replaceConfig(config, 'FEATURES', { lightAndDarkMode: true, dynamicOgImage: true, showArchives: true, showBackButton: true, editPost: { enabled: true, url: 'https://github.com/satnaing/astro-paper/edit/main/' }, search: true, giscus: false });
  const socials = [
    { name: 'github', url: 'https://github.com/satnaing/astro-paper' },
    { name: 'x', url: 'https://x.com/username' },
    { name: 'linkedin', url: 'https://www.linkedin.com/in/username/' },
    { name: 'mail', url: 'mailto:yourmail@gmail.com' },
  ];
  const socialsPattern = /export const SOCIALS[^=]*= \[[\s\S]*?\n\];/;
  if (!socialsPattern.test(config)) throw new Error('Missing SOCIALS interface');
  config = config.replace(socialsPattern, `export const SOCIALS: SocialLink[] = ${JSON.stringify(socials, null, 2)};`);
  fs.writeFileSync(configPath, config);
  fs.writeFileSync(path.join(output, 'parity-fixture.json'), JSON.stringify(manifest, null, 2) + '\n');
  const env = { ...process.env, NUXT_CONTENT_ROOT: content, NUXT_PUBLICATION_NOW: String(Date.parse(now)), NUXT_APP_BASE_URL: '/' };
  if (install || build) execFileSync('pnpm', ['install', '--offline', '--frozen-lockfile'], { cwd: output, env, stdio: 'inherit' });
  if (build) execFileSync('pnpm', ['generate'], { cwd: output, env, stdio: 'inherit' });
  return manifest;
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
  const options = {};
  for (let i = 2; i < process.argv.length; i++) {
    const flag = process.argv[i];
    if (flag === '--install' || flag === '--build') options[flag.slice(2)] = true;
    else if (['--source', '--upstream', '--output', '--now', '--asset-map'].includes(flag) && process.argv[i + 1]) options[flag === '--asset-map' ? 'assetMap' : flag.slice(2)] = process.argv[++i];
    else throw new Error(`Unknown or incomplete option ${flag}`);
  }
  if (!options.source || !options.upstream || !options.output) throw new Error('Usage: node parity.mjs --source PROJECT --upstream PINNED_CHECKOUT --output NEW_DIRECTORY [--now ISO_DATE] [--install|--build]');
  const result = prepare(options);
  console.log(JSON.stringify({ output: result.output, upstream: result.upstream, files: result.files.length, assets: result.assets.length, publicationNow: result.publicationNow }, null, 2));
}
