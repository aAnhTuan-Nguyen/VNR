import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';

const input = process.argv[2];
if (!input) throw new Error('Pass the generated four-quadrant material atlas path.');
const destination = path.resolve('public/assets/museum/textures');
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage();
  const source = `data:image/png;base64,${(await readFile(input)).toString('base64')}`;
  const tiles = await page.evaluate(async (src) => {
    const image = new Image(); image.src = src; await image.decode();
    return ['wall', 'linen', 'paper', 'walnut'].map((name, index) => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 768;
      canvas.getContext('2d').drawImage(image, index % 2 * image.width / 2, Math.floor(index / 2) * image.height / 2, image.width / 2, image.height / 2, 0, 0, 768, 768);
      return { name, data: canvas.toDataURL('image/webp', .84).split(',')[1] };
    });
  }, source);
  for (const tile of tiles) await writeFile(path.join(destination, `${tile.name}.webp`), Buffer.from(tile.data, 'base64'));
  console.log('Saved four local decorative material textures.');
} finally { await browser.close(); }
