import { describe, expect, it } from 'vitest';
import { HISTORY_CHAPTERS } from '../src/content/history';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
describe('history library presentation contract',()=>{
  it('has eight authored pages, three events and 350–500 narrative words in each book',()=>{
    for(const chapter of HISTORY_CHAPTERS){
      expect(chapter.pages).toHaveLength(8);expect(chapter.events).toHaveLength(3);
      const words=chapter.pages.slice(0,7).map(p=>p.body).join(' ').trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(350);expect(words).toBeLessThanOrEqual(500);
      expect(chapter.pages.filter(p=>p.media)).toHaveLength(3);
      const ids=new Set(chapter.sources.map(s=>s.id));
      for(const page of chapter.pages)for(const id of page.sourceIds)expect(ids.has(id),id).toBe(true);
      for(const event of chapter.events)expect(ids.has(event.sourceId),event.title).toBe(true);
    }
  });
  it('ships local coordinated covers, material tiles and the pinned r165 module',()=>{
    for(const chapter of HISTORY_CHAPTERS)for(const side of ['front','back','spine'])expect(existsSync(path.join(root,`public/assets/museum/covers/${chapter.id}-${side}.webp`))).toBe(true);
    for(const tile of ['wall','paper','linen','walnut'])expect(existsSync(path.join(root,`public/assets/museum/textures/${tile}.webp`))).toBe(true);
    expect(readFileSync(path.join(root,'public/assets/museum/runtime/three.module.js'),'utf8')).toContain("const REVISION = '165'");
    const credits=JSON.parse(readFileSync(path.join(root,'public/assets/museum/covers/CREDITS.json'),'utf8'));
    expect(credits).toHaveLength(6);expect(credits.find((c:{id:string})=>c.id==='integration').coverLicense).toContain('CC BY-SA 4.0');
  });
});
