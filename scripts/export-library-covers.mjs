import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(root,'public');
const html=await readFile(path.join(root,'src/experience/generated/history-library.html'));
const types={'.js':'text/javascript','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.css':'text/css'};
const server=createServer(async(req,res)=>{try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);return;}
  const filename=path.resolve(publicRoot,'.'+name);
  if(!filename.startsWith(publicRoot+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream'});res.end(bytes);
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/?export-covers`);
 await page.waitForFunction(()=>document.body.dataset.assetsReady==='true');
 const covers=await page.evaluate(()=>window.DongLichSu.exportCovers());
 const destination=path.join(publicRoot,'assets/museum/covers');await mkdir(destination,{recursive:true});
 for(const cover of covers)await writeFile(path.join(destination,cover.name+'.webp'),Buffer.from(cover.data,'base64'));
 const source=stripTypeScriptTypes(await readFile(path.join(root,'src/content/history.ts'),'utf8'));
 const {HISTORY_CHAPTERS}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
 const credits=HISTORY_CHAPTERS.map(c=>({id:c.id,title:c.title,files:['front','back','spine'].map(k=>c.id+'-'+k+'.webp'),photo:c.heroImage,coverChanges:'Ảnh bìa được cắt khung trong bố cục; chữ, đường viền và nền vải là lớp thiết kế riêng. Ảnh nguyên khung được giữ ở thư mục history.',coverLicense:c.heroImage.license.includes('BY-SA')?'Bìa trước phái sinh: CC BY-SA 4.0; ghi công tác giả ảnh '+c.heroImage.creator:c.heroImage.license,licenseUrl:c.heroImage.licenseUrl||c.heroImage.sourceUrl}));
 await writeFile(path.join(destination,'CREDITS.json'),JSON.stringify(credits,null,2)+'\n');
 console.log(`Exported ${covers.length} coordinated cover assets (six fronts, backs and spines) with CREDITS.json.`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
