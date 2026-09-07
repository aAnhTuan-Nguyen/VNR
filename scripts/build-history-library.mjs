import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const source = read('public/landing-pages/complete-shelf-v2.html');
const expected = '606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e';
if (createHash('sha256').update(source).digest('hex') !== expected) throw new Error('Canonical ThreeUI source changed. Stop rather than silently rebuilding a different revision.');
const module = stripTypeScriptTypes(read('src/content/history.ts'));
const { HISTORY_CHAPTERS } = await import(`data:text/javascript;base64,${Buffer.from(module).toString('base64')}`);
const roman = ['I','II','III','IV','V','VI'];
const colors = ['#203c50','#8d3026','#4b5638','#683331','#96503c','#26485c'];
const foils = ['#d5a777','#e8c477','#d9cca0','#e5d6b3','#e5b184','#c8d7dd'];
const books = HISTORY_CHAPTERS.map((history, i) => ({
  id: history.id, title: history.title, roman: roman[i], discipline: history.period,
  note: history.summary, deck: history.summary, binding: 'Bìa vải · chữ ép nhũ', format: '8 trang · 3 dấu mốc',
  theme: history.takeaway, motif: history.motif, motifKey: 'paths', paletteLabel: history.period,
  color: history.cover?.color || colors[i], foil: history.cover?.foil || foils[i],
  palette: { paper:'#171714', paperDeep:'#10110f', paperPale:'#eee5d3', ink:'#f0e6d5', inkSoft:'#b7ab94', wall:'#777368', shelf:'#997557', shelfDark:'#594330', light:'#ffe0ae', fill:'#bdc9d0' },
  width:[1.04,1.1,1.04,1.08,1.02,1.07][i], height:[1.68,1.61,1.65,1.7,1.62,1.68][i], depth:[.25,.29,.28,.26,.27,.25][i],
  chapters: history.events?.map(e=>e.title) || history.keyPoints, seed:11*(i+1), history,
}));
if (books.length !== 6) throw new Error('The collection must contain exactly six books.');
let html = source.replaceAll('\r\n','\n');
function patch(search, replacement, label) {
  const next = html.replace(search, () => replacement);
  if (next === html) throw new Error(`Missing canonical anchor: ${label}`);
  html = next;
}
patch(/    const BOOKS = \[[\s\S]*?\n    \];\n\n    const COVER_ATLAS_DATA/, `    const BOOKS = ${JSON.stringify(books)};\n\n    const COVER_ATLAS_DATA`, 'catalog');
patch(/    const COVER_ATLAS_DATA = "data:image\/webp;base64,[^"]*";/, '    const COVER_ATLAS_DATA = "/assets/museum/textures/linen.webp";', 'legacy atlas');
patch(/    const WOOD_TEXTURE_DATA = "data:image\/webp;base64,[^"]*";/, '    const WOOD_TEXTURE_DATA = "/assets/museum/textures/walnut.webp";', 'wood');
patch(/<link rel="preconnect"[\s\S]*?  <style>/, '  <style>', 'remote fonts');
html = html.replaceAll('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js','/assets/museum/runtime/three.module.js').replaceAll('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/','/assets/museum/runtime/addons/');
patch(/<html lang="en">/, '<html lang="vi">', 'language');
patch(/<title>.*?<\/title>/, '<title>Dòng Lịch Sử · Thư viện ký ức</title>', 'title');
patch(/content="Working Volumes is[^"]*"/, 'content="Sáu cuốn sách tương tác về lịch sử Đảng và Việt Nam, từ 1911 đến hiện tại. Tư liệu có nguồn, lưu trên máy."', 'description');
patch(/<body>[\s\S]*?  <script type="module">/, `<body>\n${read('scripts/history-shelf/interface.html')}\n  <script type="module">`, 'interface');
patch('  </style>', `${read('scripts/history-shelf/library.css')}\n  </style>`, 'styles');
const overridden = ['makeCoverTexture','makeFoilTexture','makeInteriorPageTextures','makeBackCoverTexture','makeBackFoilTexture','makeSpineFoilTexture','addRoom','buildMarkers','populateDetail','getSpreadLabels','updatePageControls','showFallback','onKeyDown','resetInspectionView','applyDetailViewOffset'];
for (const name of overridden) patch(`function ${name}(`, `function authored_${name}(`, name);
patch('    async function initialize() {', '    async function initialize() {\n      await prepareHistoryAssets();', 'assets before rigs');
patch('      addLights();', '      addLights();\n      addDust();\n      roomLights.key.shadow.mapSize.set(historyLowQuality ? 1024 : 2048, historyLowQuality ? 1024 : 2048);', 'lighting');
patch('const dustCount = 110;', 'const dustCount = historyLowQuality ? 28 : 66;', 'dust budget');
patch('controls.enablePan = true;', 'controls.enablePan = false;\n      controls.minAzimuthAngle = -0.62; controls.maxAzimuthAngle = 0.62;', 'bounded orbit');
patch('controls.minPolarAngle = Math.PI * 0.24;', 'controls.minPolarAngle = Math.PI * 0.34;', 'polar minimum');
patch('controls.maxPolarAngle = Math.PI * 0.76;', 'controls.maxPolarAngle = Math.PI * 0.66;', 'polar maximum');
patch('shelfCameraPosition.set(0, narrow ? 2.02 : 1.92, narrow ? 8.7 : 8.1);', 'shelfCameraPosition.set(narrow ? .2 : .55, narrow ? 2.08 : 2.05, narrow ? 8.1 : 6.5);', 'shelf framing');
patch('shelfCameraTarget.set(0, narrow ? 1.57 : 1.55, 0);','shelfCameraTarget.set(0, narrow ? 1.17 : 1.02, 0);','shelf target');
patch('const targetRotationY = -offset * 0.105;', 'const targetRotationY = -0.12 - offset * 0.105;', 'book oblique angle');
patch('rig.root.rotation.set(0, -offset * 0.105, -offset * 0.018);','rig.root.rotation.set(0, -0.12 - offset * 0.105, -offset * 0.018);','book resting angle');
patch('if (!activeBook || viewWidth < 820) return 0.82;', 'if (!activeBook || viewWidth < 820) return Math.min(.62, viewWidth / 680);', 'mobile spread fit');
patch('renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, viewWidth < 820 ? 1.5 : 2));','renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, historyLowQuality ? 1.15 : 1.75));','quality');
patch('camera.position.x = damp(camera.position.x, shelfCameraPosition.x, 8, delta);','camera.position.x = damp(camera.position.x, shelfCameraPosition.x + shelfOrbit.x, 8, delta);','shelf orbit x');
patch('camera.position.y = damp(camera.position.y, shelfCameraPosition.y, 8, delta);','camera.position.y = damp(camera.position.y, shelfCameraPosition.y + shelfOrbit.y, 8, delta);','shelf orbit y');
patch('      renderer.render(scene, camera);\n\n      const shelfMoving', '      adaptHistoryQuality(delta);\n      renderer.render(scene, camera);\n\n      const shelfMoving','adaptive quality');
patch('    function onCanvasClick(event) {', '    function onCanvasClick(event) {\n      if (historyImageClick(event) || shelfOrbit.moved) return;', 'page photo click');
patch('      const shouldClickOpen = event.type === "pointerup"', '      if (event.type === "pointerup" && dragKind === "page" && releaseDistance <= 6 && historyImageClick(event)) { cancelPageDrag(); return; }\n      const shouldClickOpen = event.type === "pointerup"', 'page release photo');
patch('      const delta = Math.min((time - lastTime) / 1000, 0.05);', '      const transitionDelta = Math.max(0, (time - lastTime) / 1000);\n      const delta = Math.min(transitionDelta, 0.05);', 'wall clock transition');
patch('      updateTransition(delta);', '      updateTransition(transitionDelta);', 'transition timing');
patch('      renderer.render(scene, camera);\n\n      const shelfMoving', '      applyDetailViewOffset();\n      renderer.render(scene, camera);\n\n      const shelfMoving', 'responsive reading frame');
patch('    initialize().catch(() => {', `${read('scripts/history-shelf/library.js')}\n\n    (new URLSearchParams(location.search).has('export-covers') ? prepareHistoryAssets() : initialize()).catch((error) => {\n      console.error(error);`, 'history runtime');
html = html.replaceAll('`Open ${book.title}`','`Mở ${book.title}`').replaceAll('`Volume ${book.roman} · ${book.discipline}`','`Quyển ${book.roman} · ${book.discipline}`');
html = html.replaceAll('`Selected volume ${selectedIndex + 1} of ${BOOKS.length}: ${book.title}. ${book.note}`','`Đang chọn cuốn ${selectedIndex + 1} trên ${BOOKS.length}: ${book.title}. ${book.note}`')
  .replaceAll('`Opening a closed copy of ${activeBook.data.title}. Drag the cover, click the book, or use Open book to begin reading.`','`Đang đưa ${activeBook.data.title} ra trước. Kéo bìa hoặc bấm Mở sách để đọc.`')
  .replaceAll('`${activeBook.data.title} opened to its title page. Drag a page horizontally or use the arrow controls to read.`','`Đã mở ${activeBook.data.title}. Kéo trang hoặc dùng mũi tên để lật.`')
  .replaceAll('`${activeBook.data.title} closed. Drag the cover, click the book, or use Open book to begin reading.`','`Đã đóng ${activeBook.data.title}. Kéo bìa hoặc bấm Mở sách để đọc tiếp.`')
  .replaceAll('`Returning ${activeBook.data.title} to the shelf.`','`Đang đưa ${activeBook.data.title} về kệ.`')
  .replaceAll('`${BOOKS[selectedIndex].title} returned to the shelf.`','`Đã đưa ${BOOKS[selectedIndex].title} về kệ.`')
  .replaceAll('`Inspection view reset for ${BOOKS[selectedIndex].title}.`','`Đã đặt lại góc nhìn cho ${BOOKS[selectedIndex].title}.`')
  .replaceAll('`Volume ${pad(index + 1)}`','`Cuốn ${pad(index + 1)}`');
const generated = path.join(root,'src/experience/generated'); mkdirSync(generated,{recursive:true});
writeFileSync(path.join(generated,'history-library.html'),html);
writeFileSync(path.join(root,'public/landing-pages/lich-su-dang-shelf.html'),html);
console.log(`Dòng Lịch Sử: ${books.length} books, source ${expected.slice(0,12)} intact, ${Math.round(Buffer.byteLength(html)/1024)} KB HTML.`);
