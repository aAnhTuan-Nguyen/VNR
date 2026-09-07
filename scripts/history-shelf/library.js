    // The history variant shares the authored selectedIndex/currentSpread/readingOpen state.
    const historyImages = new Map();
    const historyMaterials = {};
    const historyLowQuality = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || window.innerWidth < 650;
    const shelfOrbit = { x:0, y:0, active:false, moved:false, startX:0, startY:0, originX:0, originY:0 };
    let fallbackActive = false;
    let graphicsFailed = false;
    let readerSources = false;
    let mediaZoomed = false;
    let qualityFrames = 0, qualityCost = 0, qualityReduced = false;
    let photoPress = { x:0, y:0 };
    const historyReader = document.querySelector('#history-reader');
    const historyMedia = document.querySelector('#history-media');
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const mediaTypeLabel = type => ({'historical-photo':'Ảnh tư liệu lịch sử','artifact-photo':'Ảnh chụp hiện vật / trưng bày','site-photo':'Ảnh chụp di tích','contemporary-photo':'Ảnh đương đại'}[type] || 'Ảnh có hồ sơ nguồn');
    const currentHistory = () => BOOKS[selectedIndex].history;
    const visibleHistoryPages = () => currentSpread === 0 ? [0] : currentSpread === 4 ? [7] : [currentSpread*2-1, currentSpread*2];
    const historyPages = (book) => book.history.pages || Array.from({length:8},(_,i)=>({title:i===0?book.title:['Bối cảnh',...book.chapters,'Ý nghĩa','Bài học','Nguồn'][i-1],body:i===0?book.note:book.deck,sourceIds:[]}));
    function libraryCanvas(width=768,height=1152) { const c=document.createElement('canvas');c.width=width;c.height=height;return c; }
    function libraryLines(ctx,text,maxWidth) {
      const result=[];
      for(const paragraph of String(text).split('\n')) {
        let line='';
        for(const word of paragraph.split(/\s+/).filter(Boolean)) { const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){result.push(line);line=word;}else line=next; }
        result.push(line);
      }
      return result;
    }
    function libraryText(ctx,text,x,y,width,lineHeight) { const lines=libraryLines(ctx,text,width);for(const line of lines){ctx.fillText(line,x,y);y+=lineHeight;}return y; }
    function fitPhoto(ctx,image,x,y,width,height,contain=false) {
      if(!image) return;
      const ratio=(contain?Math.min:Math.max)(width/image.width,height/image.height);
      ctx.save();ctx.beginPath();ctx.rect(x,y,width,height);ctx.clip();
      ctx.drawImage(image,x+(width-image.width*ratio)/2,y+(height-image.height*ratio)/2,image.width*ratio,image.height*ratio);ctx.restore();
    }
    function clothCanvas(book,width=768,height=1152) {
      const c=libraryCanvas(width,height),ctx=c.getContext('2d');ctx.fillStyle=book.color;ctx.fillRect(0,0,width,height);
      if(historyMaterials.linen){ctx.globalAlpha=.3;ctx.globalCompositeOperation='multiply';ctx.drawImage(historyMaterials.linen,0,0,width,height);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}
      const shade=ctx.createLinearGradient(0,0,width,0);shade.addColorStop(0,'#0008');shade.addColorStop(.055,'#0000');shade.addColorStop(.08,'#ffffff12');shade.addColorStop(.13,'#0000');shade.addColorStop(.94,'#0000');shade.addColorStop(1,'#0005');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);return c;
    }
    function historyCoverCanvas(book) {
      const c=clothCanvas(book),ctx=c.getContext('2d');
      ctx.fillStyle='#e4d8bd';ctx.fillRect(63,173,642,517);
      fitPhoto(ctx,historyImages.get(book.history.heroImage.localPath),68,178,632,507);
      ctx.strokeStyle='#16181099';ctx.lineWidth=3;ctx.strokeRect(66,176,636,511);
      ctx.font='400 12px Inter';ctx.fillStyle='#dfd4c1';ctx.fillText(book.history.heroImage.date,68,715);
      // An underprint keeps type legible between the highlights of the physical foil.
      const print=historyFoilCanvas(book),pctx=print.getContext('2d');pctx.globalCompositeOperation='source-in';pctx.fillStyle=book.foil;pctx.fillRect(0,0,768,1152);ctx.globalAlpha=.68;ctx.drawImage(print,0,0);ctx.globalAlpha=1;
      return c;
    }
    function historyFoilCanvas(book) {
      const c=libraryCanvas(),ctx=c.getContext('2d');ctx.fillStyle=ctx.strokeStyle='#fff';
      ctx.lineWidth=1.6;ctx.strokeRect(36,36,696,1080);ctx.strokeRect(44,44,680,1064);
      ctx.font='500 15px Inter';ctx.fillText('DÒNG LỊCH SỬ   /   '+book.roman,68,99);
      ctx.fillRect(68,123,110,2);ctx.font='400 27px Inter';ctx.textAlign='right';ctx.fillText(book.roman,699,103);ctx.textAlign='left';
      ctx.font='400 88px "Library Serif",Georgia,serif';
      const words=book.title.split(/\s+/);let split=1,best=Infinity;
      for(let i=1;i<words.length;i++){const width=Math.max(ctx.measureText(words.slice(0,i).join(' ')).width,ctx.measureText(words.slice(i).join(' ')).width);if(width<best){best=width;split=i;}}
      const titleLines=[words.slice(0,split).join(' '),words.slice(split).join(' ')];
      ctx.font='400 88px "Library Serif",Georgia,serif';
      titleLines.forEach((line,i)=>ctx.fillText(line,65,817+i*108,626));
      ctx.font='400 22px Inter';ctx.fillText(book.discipline,68,1066);ctx.fillRect(570,1057,126,1);
      return c;
    }
    function makeCoverTexture(book) { const t=configureCanvasTexture(new THREE.CanvasTexture(historyCoverCanvas(book)));t.name=book.id+'-cover';return t; }
    function makeFoilTexture(book) { return configureCanvasTexture(new THREE.CanvasTexture(historyFoilCanvas(book))); }
    function makeBackCoverTexture(book) {return configureCanvasTexture(new THREE.CanvasTexture(clothCanvas(book)));}
    function historyBackFoilCanvas(book) {
      const c=libraryCanvas(),ctx=c.getContext('2d');ctx.fillStyle=ctx.strokeStyle='#fff';ctx.strokeRect(40,40,688,1072);
      ctx.font='400 17px Inter';ctx.fillText('DÒNG LỊCH SỬ / '+book.roman,70,100);
      ctx.font='400 44px "Library Serif",Georgia';let y=libraryText(ctx,book.title,70,215,625,59)+55;
      ctx.font='400 28px "Library Serif",Georgia';y=libraryText(ctx,book.history.summary,70,y,620,42)+50;
      ctx.font='400 22px Inter';libraryText(ctx,book.history.takeaway,70,y,620,36);
      ctx.fillRect(70,996,628,1);ctx.font='400 19px Inter';ctx.fillText(book.discipline,70,1048);ctx.textAlign='right';ctx.fillText('THƯ VIỆN KÝ ỨC VIỆT NAM',698,1080);return c;
    }
    function makeBackFoilTexture(book) {return configureCanvasTexture(new THREE.CanvasTexture(historyBackFoilCanvas(book)));}
    function historySpineFoilCanvas(book) {
      const c=libraryCanvas(384,1536),ctx=c.getContext('2d');ctx.fillStyle=ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(34,38,316,1460);
      ctx.textAlign='center';ctx.font='500 33px Inter';ctx.fillText(book.roman,192,144);ctx.save();ctx.translate(192,768);ctx.rotate(Math.PI/2);
      let size=62;ctx.font=`400 ${size}px "Library Serif",Georgia`;while(ctx.measureText(book.title).width>1080&&size>30){ctx.font=`400 ${--size}px "Library Serif",Georgia`;}
      ctx.fillText(book.title,0,0);ctx.restore();ctx.font='400 20px Inter';ctx.fillText(book.discipline,192,1413,295);return c;
    }
    function makeSpineFoilTexture(book) {return configureCanvasTexture(new THREE.CanvasTexture(historySpineFoilCanvas(book)));}
    function flattenedCover(book,kind='front') {
      const c=kind==='spine'?clothCanvas(book,384,1536):kind==='back'?clothCanvas(book):historyCoverCanvas(book);
      const mask=kind==='spine'?historySpineFoilCanvas(book):kind==='back'?historyBackFoilCanvas(book):historyFoilCanvas(book);
      const ctx=mask.getContext('2d');ctx.globalCompositeOperation='source-in';ctx.fillStyle=book.foil;ctx.fillRect(0,0,mask.width,mask.height);
      c.getContext('2d').drawImage(mask,0,0);return c;
    }
    function makeInteriorPageTextures(book) {
      return historyPages(book).map((page,index)=>{
        const c=libraryCanvas(),ctx=c.getContext('2d');ctx.fillStyle='#eee6d5';ctx.fillRect(0,0,768,1152);
        if(historyMaterials.paper){ctx.globalAlpha=.45;ctx.drawImage(historyMaterials.paper,0,0,768,1152);ctx.globalAlpha=1;}
        ctx.fillStyle='#3b382d';ctx.font='400 14px Inter';ctx.fillText('DÒNG LỊCH SỬ  /  '+book.roman,62,64);ctx.textAlign='right';ctx.fillText(pad(index+1),706,64);ctx.textAlign='left';ctx.fillRect(62,83,644,1);
        ctx.font='400 43px "Library Serif",Georgia';let y=libraryText(ctx,page.title,62,155,637,56)+30;
        let imageBounds;
        if(page.media&&historyImages.has(page.media.localPath)){
          const h=272;fitPhoto(ctx,historyImages.get(page.media.localPath),62,y,644,h,true);
          imageBounds={left:62/768,right:706/768,top:y/1152,bottom:(y+h)/1152,media:page.media};
          y+=h+25;ctx.font='400 13px Inter';ctx.fillStyle='#675d4c';y=libraryText(ctx,page.media.date+' · '+page.media.title,62,y,644,19)+30;ctx.fillStyle='#3b382d';
        }
        const body=index===7?page.body+'\n\n'+book.history.sources.map((source,i)=>(i+1)+'. '+source.title.split(' — ')[0]+' · '+new URL(source.url).hostname).join('\n\n'):page.body;
        let size=29;ctx.font=`400 ${size}px "Library Serif",Georgia`;
        while(y+libraryLines(ctx,body,644).length*size*1.55>1040&&size>12){size--;ctx.font=`400 ${size}px "Library Serif",Georgia`;}
        libraryText(ctx,body,62,y,644,size*1.55);
        ctx.fillStyle='#8c775a';ctx.fillRect(62,1070,644,1);ctx.font='400 13px Inter';ctx.fillText(book.discipline,62,1104);ctx.textAlign='right';ctx.fillText('Nguồn và ảnh đầy đủ trong “Đọc rõ”',706,1104);
        const texture=configureCanvasTexture(new THREE.CanvasTexture(c));texture.name=book.id+'-interior-page-'+(index+1);texture.userData={imageBounds};return texture;
      });
    }
    function historyMaterialTexture(name,repeatX=1,repeatY=1) {
      if(!historyMaterials[name])return null;
      const t=configureCanvasTexture(new THREE.Texture(historyMaterials[name]));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeatX,repeatY);return t;
    }
    function addRoom() {
      const wallMap=historyMaterialTexture('wall',5,3),wood=historyMaterialTexture('walnut',5,1.2);
      shared.walnut.map=wood;shared.walnut.roughness=.63;shared.walnutDark.map=wood;
      const wallMaterial=new THREE.MeshStandardMaterial({color:'#777368',map:wallMap,roughness:1,bumpMap:wallMap,bumpScale:.016});
      const floorMaterial=new THREE.MeshStandardMaterial({color:'#171b14',roughness:.88});
      function box(name,w,h,d,x,y,z,mat=shared.walnut,parent=shelfStage,radius=.025){const mesh=createMesh(new RoundedBoxGeometry(w,h,d,3,radius),mat,name);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
      const wall=createMesh(shared.plane,wallMaterial,'library-plaster-wall',false,true);wall.scale.set(28,14,1);wall.position.set(0,4,-2.5);scene.add(wall);
      const floor=createMesh(shared.plane,floorMaterial,'library-floor',false,true);floor.scale.set(30,20,1);floor.rotation.x=-Math.PI/2;floor.position.y=-.12;scene.add(floor);
      box('walnut-shelf',15,.32,1.85,0,.31,-.30);box('walnut-shelf-lip',15.06,.085,1.91,0,.135,-.28,shared.walnutDark);
      const niche=new THREE.MeshStandardMaterial({color:'#282b20',map:wallMap,roughness:.98});
      box('recessed-shelf-back',15,4.6,.16,0,2.65,-1.30,niche);
      box('upper-walnut-cornice',15,.23,1.86,0,3.08,-.35);
      [-5.65,5.65].forEach((x,i)=>box('niche-upright-'+i,.16,3.1,1.75,x,1.92,-.30,shared.walnutDark));
      const brass=new THREE.MeshStandardMaterial({color:'#b49862',metalness:.78,roughness:.3});
      box('brass-shelf-inlay',14.7,.012,.012,0,.34,.633,brass,shelfStage,.004);
      for(const x of [-4.75,4.6]) {box('brass-bookend-base',.44,.035,.52,x,.49,.02,brass);box('brass-bookend-upright',.045,.57,.52,x+.18,.76,.02,brass);}
      const archiveMat=new THREE.MeshStandardMaterial({color:'#5d5c43',roughness:.96,map:historyMaterialTexture('linen')});
      for(let i=0;i<3;i++){box('archive-file-box-'+i,.30,1.0+i*.10,.56,5.15+i*.32,1.0+i*.05,-.30,archiveMat);box('archive-file-label-'+i,.15,.14,.015,5.15+i*.32,.91,-.01,new THREE.MeshStandardMaterial({color:'#d2c5a5'}),shelfStage,.005);}
      const lamp=new THREE.Group();lamp.position.set(-2.62,.47,-1.03);shelfStage.add(lamp);
      const base=createMesh(new THREE.CylinderGeometry(.32,.35,.06,32),brass,'reading-lamp-base');base.position.y=.03;lamp.add(base);
      const stem=createMesh(new THREE.CylinderGeometry(.024,.024,1.98,16),brass,'reading-lamp-stem');stem.position.y=1.02;lamp.add(stem);
      const shade=createMesh(new THREE.ConeGeometry(.41,.27,40,1,true),new THREE.MeshStandardMaterial({color:'#355340',metalness:.35,roughness:.32,side:THREE.DoubleSide}),'green-reading-lamp');shade.position.y=2.02;lamp.add(shade);
      const bulb=createMesh(new THREE.SphereGeometry(.085,16,12),new THREE.MeshBasicMaterial({color:'#ffddb0'}),'warm-lamp-bulb',false,false);bulb.position.y=1.90;lamp.add(bulb);
      const pool=new THREE.PointLight('#ffce87',3.2,4,2);pool.position.set(0,1.84,0);lamp.add(pool);
      const strip=new THREE.RectAreaLight('#ffe0ab',1.65,10,.16);strip.position.set(0,2.89,-.55);strip.lookAt(0,.5,.2);shelfStage.add(strip);
      roomMaterials.floor=floorMaterial;roomMaterials.wall=wallMaterial;roomMaterials.shelf=shared.walnut;roomMaterials.shelfDark=shared.walnutDark;
    }
    function buildMarkers() {
      markers.replaceChildren();BOOKS.forEach((book,index)=>{
        const button=document.createElement('button');button.className='marker';button.type='button';button.role='tab';button.dataset.chapter=book.id;
        button.setAttribute('aria-label',book.discipline+': '+book.title);button.setAttribute('aria-current',String(index===selectedIndex));button.setAttribute('aria-selected',String(index===selectedIndex));button.tabIndex=index===selectedIndex?0:-1;
        button.innerHTML=`<span>${pad(index+1)}</span><strong>${escapeHtml(book.discipline)}</strong>`;button.addEventListener('click',()=>selectMarker(index,button));markers.append(button);
      });
    }
    function populateDetail(book) {
      authored_populateDetail(book);detailEyebrow.textContent='QUYỂN '+book.roman+' / '+book.discipline;
      document.querySelector('#history-points').innerHTML=book.history.keyPoints.map(p=>`<li>${escapeHtml(p)}</li>`).join('');
      const thumbs=document.querySelector('#history-thumbnails');thumbs.replaceChildren();
      for(const media of [book.history.heroImage,...book.history.supportingMedia]){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Xem ảnh: '+media.title);const img=document.createElement('img');img.src=media.localPath;img.alt=media.alt;button.append(img);button.addEventListener('click',()=>openHistoryMedia(media));thumbs.append(button);}
    }
    function getSpreadLabels(book) {const pages=historyPages(book);return [pages[0].title,pages[1].title+' / '+pages[2].title,pages[3].title+' / '+pages[4].title,pages[5].title+' / '+pages[6].title,pages[7].title];}
    function updatePageControls(announce=false) {
      const book=activeBook?.data||BOOKS[selectedIndex];const locked=mode!=='detail'||!readingOpen;
      previousPageButton.disabled=locked||currentSpread===0;nextPageButton.disabled=locked||currentSpread===4;
      pageLabel.textContent=readingOpen?getSpreadLabels(book)[currentSpread]:'Bìa sách';
      pageCounter.textContent=readingOpen?'Trang '+visibleHistoryPages().map(n=>n+1).join('–')+' / 8':'Kéo bìa hoặc bấm để mở';
      toggleBookButton.textContent=readingOpen?'Đóng sách':'Mở sách';toggleBookButton.setAttribute('aria-pressed',String(readingOpen));
      previousPageButton.setAttribute('aria-label','Trang trước');nextPageButton.setAttribute('aria-label','Trang sau');
      detailMicrocopy.textContent=readingOpen?'Kéo trang để lật · Chọn ảnh để xem lớn':'Kéo bìa để mở · Kéo nền để xoay';
      document.body.dataset.chapter=book.id;document.body.dataset.spread=String(currentSpread);document.body.dataset.reading=String(readingOpen);
      if(historyReader.open&&!readerSources)renderReader();
      if(announce)liveRegion.textContent=book.title+'. '+pageCounter.textContent;
    }
    function mediaButtonHtml(media){return `<button type="button" class="inline-media" data-media="${escapeHtml(media.localPath)}"><img src="${escapeHtml(media.localPath)}" alt="${escapeHtml(media.alt)}"><span>${escapeHtml(media.title)} · ${escapeHtml(media.date)}<br>Chọn để xem ảnh nguyên khung</span></button>`;}
    function renderReader() {
      const book=BOOKS[selectedIndex],history=book.history;
      document.querySelector('#reader-period').textContent='QUYỂN '+book.roman+' / '+history.period;
      document.querySelector('#reader-title').textContent=readerSources?'Nguồn & ghi công':history.title;
      const body=document.querySelector('#reader-body');
      if(readerSources){
        body.innerHTML=`<div class="sources-list"><h3>Nội dung & đối chiếu</h3><p>Biên soạn phục vụ học tập, không thay thế giáo trình. Cập nhật: ${escapeHtml(history.updatedAt||'2026-09-05')}. Các liên kết nguồn cần Internet; nội dung và ảnh đã lưu trên máy.</p><ol>${(history.sources||[]).map(s=>`<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)} ↗</a></li>`).join('')}</ol><h3>Ảnh tư liệu</h3><ol>${[history.heroImage,...history.supportingMedia].map(m=>`<li><a href="${escapeHtml(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m.title)} ↗</a><small>${escapeHtml(m.creator)} · ${escapeHtml(m.date)}<br>${escapeHtml(m.license)}<br>${escapeHtml(mediaTypeLabel(m.mediaType))}</small></li>`).join('')}</ol><h3>Thiết kế & công nghệ</h3><p>Bộ dựng sách: ThreeUI, nguồn gốc được giữ riêng để đối chiếu. Three.js r165: MIT. Font: giấy phép lưu trong bộ tài sản. Texture tường, gỗ, vải và giấy được tạo bằng AI; không dùng AI giả lập ảnh sự kiện lịch sử. Bìa kết hợp ảnh tư liệu được cắt khung, bố cục và chữ dựng riêng. Bìa trước Việt Nam kết nối sử dụng ảnh của Xuanphuocle và được phân phối theo CC BY-SA 4.0; chi tiết trong bộ bìa/CREDITS.json.</p></div>`;
      }else{
        body.innerHTML=`<div class="reader-spread">${visibleHistoryPages().map(index=>{const p=historyPages(book)[index];return `<article class="reader-page" data-page="${index+1}"><span class="page-number">TRANG ${pad(index+1)} / 08</span><h3>${escapeHtml(p.title)}</h3>${p.media?mediaButtonHtml(p.media):''}<p>${escapeHtml(p.body)}</p><div class="page-sources">${(p.sourceIds||[]).map(id=>{const s=(history.sources||[]).find(s=>s.id===id);return s?`<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)} ↗</a>`:'';}).join('<br>')}</div></article>`;}).join('')}</div>`;
        body.querySelectorAll('[data-media]').forEach(button=>button.addEventListener('click',()=>{const m=[history.heroImage,...history.supportingMedia,...historyPages(book).map(p=>p.media).filter(Boolean)].find(m=>m.localPath===button.dataset.media);if(m)openHistoryMedia(m);}));
      }
      body.scrollTop=0;document.querySelector('.reader-footer').hidden=readerSources;
      document.querySelector('#reader-prev').disabled=currentSpread===0;document.querySelector('#reader-next').disabled=currentSpread===4;
      document.querySelector('#reader-page-status').textContent='Trang '+visibleHistoryPages().map(n=>n+1).join('–')+' / 8';
    }
    function openReader(sources=false) {readerSources=sources;if(!sources&&!fallbackActive&&mode==='detail'&&!readingOpen)setReadingOpen(true);renderReader();if(!historyReader.open)historyReader.showModal();}
    function historyTurn(direction){if(fallbackActive){currentSpread=clamp(currentSpread+direction,0,4);renderReader();}else turnPage(direction);}
    function openHistoryMedia(media) {
      mediaZoomed=false;document.querySelector('#media-title').textContent=media.title;
      const img=document.querySelector('#media-full');img.src=media.localPath;img.alt=media.alt;
      document.querySelector('#media-credit').innerHTML=`${escapeHtml(media.creator)} · ${escapeHtml(media.date)}<br>${escapeHtml(media.license)}<br><a href="${escapeHtml(media.sourceUrl)}" target="_blank" rel="noopener noreferrer">Hồ sơ ảnh & giấy phép ↗</a>`;
      setMediaZoom(false);if(!historyMedia.open)historyMedia.showModal();
    }
    function setMediaZoom(value){mediaZoomed=value;const viewport=document.querySelector('#media-viewport');viewport.classList.toggle('is-zoomed',value);viewport.scrollTop=viewport.scrollLeft=0;const button=document.querySelector('#media-zoom');button.textContent=value?'Thu về nguyên khung':'Phóng to 2×';button.setAttribute('aria-pressed',String(value));}
    function historyImageClick(event){
      if(mode!=='detail'||!readingOpen||Math.hypot(event.clientX-photoPress.x,event.clientY-photoPress.y)>6)return false;
      setPointerFromEvent(event);raycaster.setFromCamera(pointer.ndc,camera);
      for(const hit of raycaster.intersectObjects(activeBook.pageSurfaces,false)){
        const bounds=hit.object.material?.map?.userData?.imageBounds;
        if(bounds&&hit.uv&&hit.uv.x>=bounds.left&&hit.uv.x<=bounds.right&&1-hit.uv.y>=bounds.top&&1-hit.uv.y<=bounds.bottom){openHistoryMedia(bounds.media);return true;}
        break;
      }
      return false;
    }
    function onKeyDown(event) {
      if(historyReader.open||historyMedia.open||fallbackActive)return;
      if(mode==='detail'&&event.key==='Tab'){
        const buttons=[...detailPanel.querySelectorAll('button,a[href]')].filter(b=>!b.disabled&&b.getClientRects().length);
        const at=buttons.indexOf(document.activeElement);event.preventDefault();buttons[mod(at+(event.shiftKey?-1:1),buttons.length)]?.focus();return;
      }
      authored_onKeyDown(event);
      if(mode==='hero'&&(event.key==='ArrowLeft'||event.key==='ArrowRight')&&document.activeElement?.classList.contains('marker'))markers.children[selectedIndex]?.focus();
    }
    function resetInspectionView(){if(mode==='hero'){shelfOrbit.x=shelfOrbit.y=0;camera.position.copy(shelfCameraPosition);camera.lookAt(shelfCameraTarget);requestFrame();return;}authored_resetInspectionView();}
    function applyDetailViewOffset(){
      if(!camera)return;
      if(viewWidth>=820){authored_applyDetailViewOffset();return;}
      const transition=mode==='detail'?1:mode==='opening'?transitionTime:mode==='closing'?1-transitionTime:0;
      if(transition===0){camera.clearViewOffset();return;}
      const distance=Math.abs(inspectCameraPosition.z-inspectPosition.z);
      const pixels=viewHeight/(2*distance*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5)));
      const open=activeBook?clamp(Math.abs(activeBook.frontPivot.rotation.y)/Math.PI,0,1):0;
      const offsetX=-(activeBook?.base.width||1)*getInspectScale()*pixels*.5*open*transition;
      camera.setViewOffset(viewWidth,viewHeight,offsetX,viewHeight*.12*transition,viewWidth,viewHeight);
    }
    function buildHistoryFallback(){
      const holder=document.querySelector('#fallback-books');holder.replaceChildren();
      BOOKS.forEach((book,index)=>{const button=document.createElement('button');button.className='fallback-card';button.type='button';button.dataset.chapter=book.id;button.innerHTML=`<img src="${flattenedCover(book).toDataURL('image/webp',.8)}" alt="Bìa ${escapeHtml(book.title)}"><strong>${escapeHtml(book.title)}</strong><span>${escapeHtml(book.discipline)} · Đọc 8 trang ↗</span>`;button.addEventListener('click',()=>{selectedIndex=index;currentSpread=0;openReader();});holder.append(button);});
    }
    function showFallback(message){graphicsFailed=true;if(!document.querySelector('#fallback-books').children.length)buildHistoryFallback();activateFallback('Chế độ 3D không khả dụng trên thiết bị này. Bạn vẫn đọc được đầy đủ sáu cuốn sách và ảnh tư liệu.');console.info(message);}
    function activateFallback(message='Chế độ đọc 2D · Toàn bộ nội dung và tư liệu được lưu trên máy.'){
      fallbackActive=true;suspended=true;if(rafId)cancelAnimationFrame(rafId);rafId=0;
      loading.hidden=true;experience.classList.remove('webgl-ready');staticFallback.hidden=false;fallbackStatus.textContent=message;
      document.querySelector('#restore-3d').hidden=graphicsFailed;staticFallback.querySelector('button:not([hidden])')?.focus();
    }
    function adaptHistoryQuality(delta){
      if(qualityReduced||reducedMotion||mode==='opening'||mode==='closing'||document.hidden)return;
      qualityFrames++;qualityCost+=delta;
      if(qualityFrames===180&&qualityCost/qualityFrames>.032){qualityReduced=true;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;const dust=scene.getObjectByName('paper-dust');if(dust)dust.visible=false;}
    }
    async function prepareHistoryAssets(){
      await Promise.all([document.fonts.load('400 30px Inter'),document.fonts.load('400 60px "Library Serif"')]);
      const load=async(src)=>{const img=new Image();img.src=src;await img.decode();return img;};
      await Promise.all(['linen','wall','paper','walnut'].map(async key=>{historyMaterials[key]=await load('/assets/museum/textures/'+key+'.webp');}));
      const paths=[...new Set(BOOKS.flatMap(b=>[b.history.heroImage,...b.history.supportingMedia,...historyPages(b).map(p=>p.media).filter(Boolean)].map(m=>m.localPath)))];
      await Promise.all(paths.map(async src=>{historyImages.set(src,await load(src));}));
      buildHistoryFallback();
      document.body.dataset.assetsReady='true';
    }
    document.querySelector('#read-clear').addEventListener('click',()=>openReader());
    document.querySelector('#history-sources').addEventListener('click',()=>openReader(true));
    document.querySelector('#reader-close').addEventListener('click',()=>historyReader.close());
    document.querySelector('#reader-prev').addEventListener('click',()=>historyTurn(-1));
    document.querySelector('#reader-next').addEventListener('click',()=>historyTurn(1));
    document.querySelector('#media-close').addEventListener('click',()=>historyMedia.close());
    document.querySelector('#media-zoom').addEventListener('click',()=>setMediaZoom(!mediaZoomed));
    document.querySelector('#shelf-reset').addEventListener('click',resetInspectionView);
    document.querySelector('#read-2d').addEventListener('click',()=>activateFallback());
    document.querySelector('#restore-3d').addEventListener('click',()=>{if(graphicsFailed)return;fallbackActive=false;staticFallback.hidden=true;experience.classList.add('webgl-ready');selectedIndex=mod(selectedIndex,BOOKS.length);position=targetPosition=selectedIndex;updateSelection(selectedIndex,true);suspended=false;lastTime=performance.now();requestFrame();document.querySelector('#read-2d').focus();});
    window.addEventListener('keydown',event=>{if(historyMedia.open){event.stopPropagation();return;}if(historyReader.open){event.stopPropagation();if(!readerSources&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();historyTurn(event.key==='ArrowLeft'?-1:1);}}},true);
    canvas.addEventListener('pointerdown',event=>{
      photoPress={x:event.clientX,y:event.clientY};shelfOrbit.moved=false;
      if(mode!=='hero'||event.button!==0)return;setPointerFromEvent(event);if(bookIndexAtPointer()>=0)return;
      Object.assign(shelfOrbit,{active:true,startX:event.clientX,startY:event.clientY,originX:shelfOrbit.x,originY:shelfOrbit.y});canvas.setPointerCapture(event.pointerId);
    },true);
    canvas.addEventListener('pointermove',event=>{if(!shelfOrbit.active)return;const dx=event.clientX-shelfOrbit.startX,dy=event.clientY-shelfOrbit.startY;shelfOrbit.moved=Math.hypot(dx,dy)>6;shelfOrbit.x=clamp(shelfOrbit.originX-dx*.008,-1.2,1.2);shelfOrbit.y=clamp(shelfOrbit.originY+dy*.005,-.25,.7);requestFrame();});
    const endShelfDrag=()=>{shelfOrbit.active=false;};canvas.addEventListener('pointerup',endShelfDrag);canvas.addEventListener('pointercancel',endShelfDrag);
    // Read-only inspection/export helpers; do not drive the user state from another scene.
    window.DongLichSu={
      getState:()=>({chapter:BOOKS[selectedIndex].id,spread:currentSpread,readingOpen,mode,fallback:fallbackActive,revision:THREE.REVISION,books:bookRigs.length,camera:camera?.position.toArray()}),
      exportCovers:()=>BOOKS.flatMap(book=>['front','back','spine'].map(kind=>({name:book.id+'-'+kind,data:flattenedCover(book,kind).toDataURL('image/webp',.91).split(',')[1]}))),
    };
