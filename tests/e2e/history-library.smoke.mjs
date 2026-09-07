import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const host='127.0.0.1',port=4177,url=`http://${host}:${port}/`;
const evidence=process.env.LIBRARY_QA_OUTPUT||path.join(tmpdir(),'dong-lich-su-qa');mkdirSync(evidence,{recursive:true});
const server=spawn(process.execPath,[path.resolve('node_modules/vite/bin/vite.js'),'preview','--host',host,'--port',String(port),'--strictPort'],{stdio:'pipe',windowsHide:true});
const chrome=process.env.PLAYWRIGHT_EXECUTABLE_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
let browser;
const errors=[],external=[];
const state=f=>f.evaluate(()=>window.DongLichSu.getState());
async function load(context,name){
  await context.route('**/*',route=>{const request=route.request().url();if(/^https?:/.test(request)&&new URL(request).hostname!==host){external.push(request);return route.abort();}return route.continue();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(name+': '+e.message));
  await page.goto(url);assert.match(await page.title(),/Dòng Lịch Sử/);
  await page.locator('iframe').waitFor();const frame=page.frames()[1];await frame.waitForFunction(()=>document.querySelector('#loading')?.hidden,null,{timeout:60000});
  assert.ok((await frame.locator('body').innerText()).includes('Dòng Lịch Sử'));
  assert.equal(await page.locator('vite-error-overlay').count(),0);
  return {page,frame};
}
async function snap(page,name){await page.screenshot({path:path.join(evidence,name+'.png')});}
try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'preview server ready');
  browser=await chromium.launch({headless:true,executablePath:chrome,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const desktop=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const {page,frame}=await load(desktop,'desktop');assert.equal((await state(frame)).revision,'165');assert.equal((await state(frame)).books,6);
  await snap(page,'library-shelf');
  await frame.evaluate(()=>{window.qaOriginalCanvas=document.querySelector('#scene');});
  await frame.locator('#inspect').click();assert.equal((await state(frame)).mode,'detail');await snap(page,'library-cover');
  await page.mouse.move(620,420);await page.mouse.down();await page.mouse.move(435,425,{steps:12});await page.mouse.up();
  assert.equal((await state(frame)).readingOpen,true,'dragging the physical cover opens it');
  await snap(page,'library-open');
  await page.mouse.click(505,295);await frame.locator('#history-media').waitFor({state:'visible'});
  assert.equal(await frame.locator('#media-full').evaluate(e=>getComputedStyle(e).objectFit),'contain');
  await frame.locator('#media-zoom').click();assert.equal(await frame.locator('#media-zoom').getAttribute('aria-pressed'),'true');await frame.locator('#media-close').click();assert.equal((await state(frame)).spread,0);
  await page.mouse.move(620,495);await page.mouse.down();await page.mouse.move(410,493,{steps:12});await page.mouse.up();assert.equal((await state(frame)).spread,1,'dragging a physical page changes the spread');
  await frame.locator('#read-clear').click();assert.deepEqual(await frame.locator('.reader-page').evaluateAll(es=>es.map(e=>e.dataset.page)),['2','3']);
  await page.keyboard.press('ArrowRight');assert.equal((await state(frame)).spread,2);assert.deepEqual(await frame.locator('.reader-page').evaluateAll(es=>es.map(e=>e.dataset.page)),['4','5']);await snap(page,'library-reader');
  await frame.locator('.inline-media').first().click();await frame.locator('#history-media').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await frame.locator('#history-media').evaluate(e=>e.open),false);assert.equal(await frame.locator('#history-reader').evaluate(e=>e.open),true);
  await frame.locator('#reader-close').click();assert.equal((await state(frame)).spread,2);await frame.locator('#history-sources').click();assert.ok(await frame.locator('.sources-list a').count()>=6);await frame.locator('#reader-close').click();
  await frame.locator('#close-detail').click();await frame.waitForFunction(()=>window.DongLichSu.getState().mode==='hero');
  await frame.locator('[data-chapter="integration"].marker').click();assert.equal((await state(frame)).chapter,'integration');assert.equal(await frame.evaluate(()=>window.qaOriginalCanvas===document.querySelector('#scene')),true,'timeline does not remount the scene');
  await page.setViewportSize({width:1920,height:1080});await snap(page,'library-wide');
  console.log('PASS desktop: physical cover/page drag, physical photo, zoom, synchronized reader, Escape, sources, six-stage timeline; 1366x768 and 1920x1080.');
  await desktop.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const m=await load(mobile,'mobile');
  await m.frame.locator('[data-chapter="integration"].marker').tap();assert.equal((await state(m.frame)).chapter,'integration');await snap(m.page,'library-mobile-shelf');
  await m.frame.locator('#inspect').tap();await m.frame.locator('#toggle-book').tap();await snap(m.page,'library-mobile-open');
  const readBounds=await m.frame.locator('#read-clear').boundingBox();assert.ok(readBounds&&readBounds.y>=0&&readBounds.y+readBounds.height<=844,'mobile read control is on screen');
  await m.frame.locator('#read-clear').tap();await m.frame.locator('#reader-next').tap();assert.deepEqual(await m.frame.locator('.reader-page').evaluateAll(es=>es.map(e=>e.dataset.page)),['2','3']);await m.frame.locator('#reader-close').tap();
  await m.frame.locator('#scene').evaluate(e=>e.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await m.frame.locator('#static-fallback').waitFor({state:'visible'});assert.equal(await m.frame.locator('.fallback-card').count(),6);
  await m.frame.locator('.fallback-card[data-chapter="resistance"]').tap();await m.frame.locator('#reader-next').tap();assert.deepEqual(await m.frame.locator('.reader-page').evaluateAll(es=>es.map(e=>e.dataset.page)),['2','3']);
  console.log('PASS mobile: normal taps, timeline, opening/reading, context-loss fallback.');await mobile.close();
  const fallback=await browser.newContext({viewport:{width:1366,height:768}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/^webgl|experimental-webgl/.test(type))return null;return original.call(this,type,...args);};});
  const f=await load(fallback,'no-webgl');assert.equal((await state(f.frame)).fallback,true);assert.equal(await f.frame.locator('.fallback-card').count(),6);await f.frame.locator('.fallback-card[data-chapter="integration"]').click();for(let i=0;i<4;i++)await f.frame.locator('#reader-next').click();assert.deepEqual(await f.frame.locator('.reader-page').evaluateAll(es=>es.map(e=>e.dataset.page)),['8']);await snap(f.page,'library-fallback');await fallback.close();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS unavailable WebGL: all six books readable; no external runtime requests or uncaught app errors.');console.log('Evidence: '+evidence);
}finally{await browser?.close();server.kill();}
