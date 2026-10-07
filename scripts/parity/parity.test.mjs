import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transformContent } from './parity.mjs';

const fences = text => [...text.matchAll(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm)].map(match => match[0]);

const fenced = '```mdx\nimport ResponsiveTable from \'@/components/ResponsiveTable.astro\';\n<ResponsiveTable variant="minimal">\n![x](@/assets/images/example.jpg)\n> [!NOTE]\n{" "}\n</ResponsiveTable>\n```\n';
assert.equal(transformContent(fenced, () => '/replaced'), fenced);
const longerFence = '~~~~md\n~~~\n![x](assets/example.jpg)\n~~~~\n';
assert.equal(transformContent(longerFence, () => '/replaced'), longerFence);
assert.equal(transformContent('`![x](assets/example.jpg)`\n', () => '/replaced'), '`![x](assets/example.jpg)`\n');
assert.equal(transformContent('import ResponsiveTable from \'@/components/ResponsiveTable.astro\';\n<ResponsiveTable variant="minimal" class="max-sm:-mx-4">\n| A | B |\n</ResponsiveTable>\n'), '::responsive-table{variant="minimal" class="max-sm:-mx-4"}\n| A | B |\n::\n');
assert.equal(transformContent('---\nslug: custom-path\nogImage: assets/image.png\n---\n![x](assets/image.png)\n', () => '/image.png'), '---\nslug: custom-path\nogImage: /image.png\n---\n![x](/image.png)\n');
assert.equal(transformContent('> [!NOTE]\n'), '> \\[!NOTE]\n');

if (process.argv[2]) {
  const upstream = process.argv[2];
  const fixture = process.argv[3];
  const manifest = JSON.parse(fs.readFileSync(`${fixture}/parity-fixture.json`, 'utf8'));
  for (const file of manifest.files) {
    const source = `${upstream}/src/content/${file.path}`;
    const raw = fs.readFileSync(fs.existsSync(source) ? source : source.replace(/\.md$/, '.mdx'), 'utf8');
    const converted = fs.readFileSync(`${fixture}/content/${file.path}`, 'utf8');
    assert.deepEqual(fences(converted), fences(raw), `${file.path} preserves code examples`);
  }
  assert.ok(manifest.files.some(file => file.path.startsWith('posts/_releases/')));
  for (const asset of manifest.assets) assert.ok(fs.existsSync(`${fixture}/public${asset}`), asset);
}
console.log('Converter preserves fenced examples, inline code, slugs, attributes, and copied assets.');

assert.equal(transformContent('<figcaption class="text-center">\nPhoto by{" "}\n</figcaption>\n', undefined, { mdx: true }), '<figcaption class="text-center"><p>\nPhoto by \n</p></figcaption>\n');

const rawCaption = '<figcaption class="text-center">Photo by <a href="/">Author</a></figcaption>\n';
assert.equal(transformContent(rawCaption), rawCaption);
