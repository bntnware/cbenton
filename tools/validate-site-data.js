const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'data', 'project-registry.json');
const navigationPath = path.join(root, 'data', 'navigation.json');
const sampleDir = path.join(root, 'samples');

function warn(msg) { console.warn('WARN:', msg); }
function fail(msg) { console.error('ERROR:', msg); process.exitCode = 1; }

const projects = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const slugs = new Set();

for (const p of projects) {
  if (!p.slug) fail(`Project ${p.id} has no canonical slug.`);
  if (slugs.has(p.slug)) fail(`Duplicate slug found: ${p.slug}`);
  slugs.add(p.slug);

  const heroPath = path.join(root, p.hero || '');
  if (!p.hero || !fs.existsSync(heroPath)) fail(`Hero missing or not found for ${p.slug}: ${p.hero}`);
  if (p.visibleInSamples && !p.hero) fail(`Samples-visible project missing hero: ${p.slug}`);
  if (p.featuredInWork && !p.summary) fail(`Work-featured project missing summary: ${p.slug}`);
}

const assigned = new Set(projects.flatMap((p) => (p.assets || []).map((a) => a.path)));
const files = [];
function walkSampleAssets(dir, basePrefix = 'samples') {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    const rel = `${basePrefix}/${item}`;
    if (stat.isDirectory()) walkSampleAssets(full, rel);
    else files.push(rel);
  }
}
if (fs.existsSync(sampleDir)) {
  walkSampleAssets(sampleDir);
} else {
  fail('samples directory is missing, cannot validate sample asset assignment.');
}
const ignored = new Set(['samples/README.md']);
const unassigned = files.filter((f) => !assigned.has(f) && !ignored.has(f) && !f.endsWith('.html') && !f.endsWith('.txt'));
if (unassigned.length) warn(`Unassigned sample assets: ${unassigned.join(', ')}`);

const navConfig = JSON.parse(fs.readFileSync(navigationPath, 'utf8'));
const hrefs = (navConfig.nav || []).map((item) => item.href);

const htmlFiles = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !full.includes('.git')) walk(full);
    else if (full.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const routable = new Set(['/']);
for (const file of htmlFiles) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (!rel.endsWith('.html')) continue;
  if (rel === 'index.html') {
    routable.add('/');
  } else if (rel === 'samples/index.html') {
    routable.add('/samples');
  } else {
    const withoutExt = rel.slice(0, -5);
    routable.add(`/${withoutExt}`);
  }
}
for (const href of hrefs) {
  if (!routable.has(href)) warn(`Nav href has no matching canonical route: ${href}`);
}
if (!routable.has('/')) warn('Brand home route is missing index.html for /.');

const staleHeaders = htmlFiles.filter((f) => fs.readFileSync(f, 'utf8').includes('class="nav-list"'));
if (staleHeaders.length) warn(`Multiple header implementations remain in files: ${staleHeaders.map((f) => path.relative(root, f)).join(', ')}`);

if (!process.exitCode) console.log('Validation completed without blocking errors.');
