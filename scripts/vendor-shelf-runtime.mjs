#!/usr/bin/env node
// Run with Node 18+: node scripts/vendor-shelf-runtime.mjs
// Only writes public/assets/museum/runtime/ and public/assets/museum/fonts/.
// Core/addons stay byte-for-byte upstream; the consuming page's import map needs:
// "three": "/assets/museum/runtime/three.module.js"
// "three/addons/": "/assets/museum/runtime/addons/"
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const threeRoot = path.join(projectRoot, 'node_modules', 'three165');
const addonRoot = path.join(threeRoot, 'examples', 'jsm');
const runtimeRoot = path.join(projectRoot, 'public', 'assets', 'museum', 'runtime');
const fontsRoot = path.join(projectRoot, 'public', 'assets', 'museum', 'fonts');
const addonEntries = [
  'controls/OrbitControls.js',
  'environments/RoomEnvironment.js',
  'geometries/RoundedBoxGeometry.js',
  'lights/RectAreaLightUniformsLib.js',
];

// These Google Fonts families are downloaded from their official upstream
// repositories in WOFF2 form, without conversion or subsetting. Both contain
// Vietnamese; Source Serif 4 is the permitted serif alternative under 1 MB.
// Use TrueType-based WOFF2 to avoid Source Serif's documented Windows CFF2 issue.
const interSource = 'https://raw.githubusercontent.com/rsms/inter/e3a3d4c57d5ecc01453a575621882a384c1995a3'; // v4.1
const serifSource = 'https://raw.githubusercontent.com/adobe-fonts/source-serif/2823e993c53fca27c5c8749f529b56a5a7c77b6b'; // 4.005R
const fontAssets = [
  {
    filename: 'InterVariable.woff2',
    url: `${interSource}/docs/font-files/InterVariable.woff2`,
    bytes: 352240,
    sha256: '693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3',
    family: 'Inter',
    weight: '100 900',
    format: 'woff2',
  },
  {
    filename: 'Inter-OFL.txt',
    url: `${interSource}/LICENSE.txt`,
    bytes: 4380,
    sha256: '262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a',
  },
  {
    filename: 'SourceSerif4Variable-Roman.woff2',
    url: `${serifSource}/WOFF2/VAR/SourceSerif4Variable-Roman.ttf.woff2`,
    bytes: 429100,
    sha256: '940a76eda1388de39d38c8e7a79bf6ea058a387faee0a9f33c8d25c6ba05e1be',
    family: 'Source Serif 4',
    weight: '200 900',
    format: 'woff2',
  },
  {
    filename: 'SourceSerif4-OFL.txt',
    url: `${serifSource}/LICENSE.md`,
    bytes: 4492,
    sha256: '75784a295293a8992f5a8d99210566e0064a012e6dab6731305e3787f15896c7',
  },
];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function resolveInside(root, relativePath) {
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Path is outside the asset root: ${relativePath}`);
  }
  return target;
}

// Sufficient for the unmodified, version-locked r165 module syntax: static
// imports/re-exports (including multiline imports), plus literal dynamic imports.
function moduleSpecifiers(source) {
  const staticImports = /^\s*(?:import|export)\s+(?:[^'";]*?\s+from\s*)?(['"])([^'"]+)\1/gm;
  const dynamicImports = /\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
  return [...source.matchAll(staticImports), ...source.matchAll(dynamicImports)]
    .map((match) => match[2]);
}

async function collectAddons() {
  const seen = new Set();
  async function visit(relativePath) {
    const sourcePath = resolveInside(addonRoot, relativePath);
    const normalized = path.relative(addonRoot, sourcePath).split(path.sep).join('/');
    if (seen.has(normalized)) return;
    seen.add(normalized);
    const source = await readFile(sourcePath, 'utf8');
    for (const specifier of moduleSpecifiers(source)) {
      if (specifier === 'three') continue;
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
        throw new Error(`Unexpected dependency in ${normalized}: ${specifier}`);
      }
      await visit(path.join(path.dirname(normalized), specifier));
    }
  }
  for (const entry of addonEntries) await visit(entry);
  return [...seen].sort();
}

async function copyRuntimeFile(sourcePath, relativePath) {
  const destination = resolveInside(runtimeRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(sourcePath, destination);
  const [original, copied] = await Promise.all([readFile(sourcePath), readFile(destination)]);
  if (!original.equals(copied)) throw new Error(`Copy verification failed: ${relativePath}`);
  return { filename: relativePath, bytes: copied.length, sha256: sha256(copied) };
}

function validateFontAsset(asset, bytes) {
  if (bytes.length !== asset.bytes || sha256(bytes) !== asset.sha256) {
    throw new Error(`Size/checksum mismatch: ${asset.filename}`);
  }
  if (asset.format === 'woff2') {
    if (bytes.toString('ascii', 0, 4) !== 'wOF2' || bytes.readUInt32BE(8) !== bytes.length) {
      throw new Error(`Invalid WOFF2 header: ${asset.filename}`);
    }
  } else if (!bytes.toString('utf8').includes('SIL OPEN FONT LICENSE Version 1.1')) {
    throw new Error(`Missing original OFL license: ${asset.filename}`);
  }
}

async function ensureFontAsset(asset) {
  const destination = resolveInside(fontsRoot, asset.filename);
  try {
    validateFontAsset(asset, await readFile(destination));
    return { filename: asset.filename, bytes: asset.bytes, status: 'cached' };
  } catch (error) {
    if (error.code && error.code !== 'ENOENT') throw error;
  }
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${asset.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  validateFontAsset(asset, bytes);
  // Write only the verified original download, never an empty placeholder.
  await writeFile(destination, bytes);
  validateFontAsset(asset, await readFile(destination));
  return { filename: asset.filename, bytes: bytes.length, status: 'downloaded' };
}

async function directoryBytes(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) total += await directoryBytes(filename);
    else if (entry.isFile()) total += (await readFile(filename)).length;
  }
  return total;
}

async function main() {
  const packageInfo = JSON.parse(await readFile(path.join(threeRoot, 'package.json'), 'utf8'));
  if (packageInfo.name !== 'three' || packageInfo.version !== '0.165.0') {
    throw new Error(`Expected three165 to contain three@0.165.0; found ${packageInfo.name}@${packageInfo.version}`);
  }
  const modulePath = path.join(threeRoot, 'build', 'three.module.js');
  const core = await readFile(modulePath, 'utf8');
  const revision = core.match(/\bconst\s+REVISION\s*=\s*['"]([^'"]+)['"]/u)?.[1];
  if (revision !== '165' || moduleSpecifiers(core).length !== 0) {
    throw new Error('Expected the standalone Three.js r165 ES module');
  }
  // Resolve the entire required graph before copying; never copy an addon tree.
  const addons = await collectAddons();
  const runtime = [];
  runtime.push(await copyRuntimeFile(modulePath, 'three.module.js'));
  runtime.push(await copyRuntimeFile(path.join(threeRoot, 'LICENSE'), 'LICENSE'));
  for (const addon of addons) {
    runtime.push(await copyRuntimeFile(resolveInside(addonRoot, addon), `addons/${addon}`));
  }
  await mkdir(fontsRoot, { recursive: true });
  const fonts = [];
  for (const asset of fontAssets) fonts.push(await ensureFontAsset(asset));
  const fontTotalBytes = fontAssets.filter((asset) => asset.format)
    .reduce((sum, asset) => sum + asset.bytes, 0);
  console.log(JSON.stringify({
    threeVersion: packageInfo.version,
    revision,
    runtimeTotalBytes: await directoryBytes(runtimeRoot),
    runtimeJavaScriptBytes: runtime.filter((file) => file.filename.endsWith('.js'))
      .reduce((sum, file) => sum + file.bytes, 0),
    relativeAddonDependencies: addons.filter((addon) => !addonEntries.includes(addon)),
    runtime,
    fontTotalBytes,
    fontsDirectoryTotalBytes: await directoryBytes(fontsRoot),
    fonts,
    cssFonts: fontAssets.filter((asset) => asset.format)
      .map(({ filename, family, weight, format }) => ({ filename, family, style: 'normal', weight, format })),
  }, null, 2));
}

main().catch((error) => {
  console.error(`Vendoring failed: ${error.message}`);
  process.exitCode = 1;
});
