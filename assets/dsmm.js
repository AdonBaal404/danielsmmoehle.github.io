/* Progressive presentation only: no analytics, no storage, no remote requests. */
(() => {
  'use strict';
  const body = document.body;
  if (!body || body.classList.contains('dsmm')) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const path = body.dataset.page || location.pathname.split('/').pop() || 'index.html';
  const home = path === 'index.html';
  const icons = {
    pause:'<path d="M8 5v14M16 5v14"/>', play:'<path d="m8 5 11 7-11 7z"/>',
    menu:'<path d="M4 8h16M4 16h16"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
    up:'<path d="m5 12 7-7 7 7M12 5v15"/>'
  };
  function button(label,icon,cls='') {
    const element=document.createElement('button');
    element.type='button';element.className=`ds-tool ${cls}`;
    element.setAttribute('aria-label',label);element.title=label;
    element.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg>`;
    return element;
  }
  function element(tag,cls,text) {
    const node=document.createElement(tag);node.className=cls;
    if(text!==undefined) node.textContent=text;
    return node;
  }
  body.classList.add('dsmm');if(home)body.classList.add('ds-home');
  const main=document.querySelector('main');
  // Unknown legacy layouts keep their content untouched; basic styles still apply.
  if(!main) return;
  main.id=main.id||'dsmm-main';
  const skip=element('a','ds-skip','Zum Inhalt');skip.href=`#${main.id}`;body.prepend(skip);
  const header=document.querySelector('header');
  if(header){
    header.classList.add('ds-header');
    let nav=header.querySelector('nav');
    if(!nav){nav=element('nav','');header.append(nav);}
    nav.classList.add('ds-nav');nav.id=nav.id||'dsmm-navigation';nav.setAttribute('aria-label','Hauptnavigation');
    // Reuse existing links and preserve any additional original destinations.
    const navigation=[['index.html','Home'],['angebote.html','Angebote'],['projekte.html','Projekte'],['medien.html','Medien'],['ueber-mich.html','Über mich']];
    for(const [href,label] of navigation){
      let link=Array.from(nav.querySelectorAll('a')).find(a=>{try{return new URL(a.href,location.href).pathname.split('/').pop()===href;}catch{return false;}});
      if(!link){link=element('a','',label);link.href=href;nav.append(link);}
      if(path===href)link.setAttribute('aria-current','page');
    }
    const oldList=nav.querySelector('ul');
    if(oldList){for(const a of Array.from(oldList.querySelectorAll('a')))nav.insertBefore(a,oldList);if(!oldList.textContent.trim())oldList.remove();}
    const tools=element('div','ds-tools');header.append(tools);
    const menu=button('Menü öffnen','menu','ds-menu');tools.append(menu);
    menu.setAttribute('aria-controls',nav.id);menu.setAttribute('aria-expanded','false');
    function closeMenu(){nav.dataset.open='false';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');}
    menu.addEventListener('click',()=>{const open=nav.dataset.open!=='true';nav.dataset.open=String(open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.dataset.open==='true'){closeMenu();menu.focus();}});
    nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
    document.addEventListener('click',event=>{if(!header.contains(event.target))closeMenu();});
  }
  const footer=document.querySelector('footer');if(footer)footer.classList.add('ds-footer');
  const noticeStart=/^(Hinweis:|Urheberrecht:|Schutz und Urheberschaft:)/;
  for(const p of main.querySelectorAll('p'))if(noticeStart.test(p.textContent.trim()))p.classList.add('ds-notice');
  for(const a of main.querySelectorAll('a[href^="mailto:"]'))a.classList.add('ds-mail');

  // Headings and associated original nodes are moved, never copied or rewritten.
  const directHeadings=Array.from(main.children).filter(n=>/^H[23]$/.test(n.tagName));
  const sectionHeadings=directHeadings.filter((n,index)=>index>0||home);
  for(let i=0;i<sectionHeadings.length;i++){
    const heading=sectionHeadings[i];
    if(heading.parentElement!==main)continue;
    const section=element('section','ds-section');main.insertBefore(section,heading);
    let node=heading;
    for(let j=0;node&&j<1000;j++){
      if(node!==heading&&(/^H[23]$/.test(node.tagName)||node.classList.contains('ds-notice')))break;
      const next=node.nextElementSibling;section.append(node);node=next;
    }
    if(!heading.id)heading.id=`abschnitt-${i+1}`;
    section.setAttribute('aria-labelledby',heading.id);
    if(path==='projekte.html')section.classList.add('ds-project');
  }
  const sections=Array.from(main.querySelectorAll(':scope > .ds-section'));
  if(!home&&path!=='projekte.html'&&sections.length>=3){
    const layout=element('div','ds-content-layout');main.insertBefore(layout,sections[0]);
    const toc=element('nav','ds-toc');toc.setAttribute('aria-label','Auf dieser Seite');
    const article=element('div','ds-article');layout.append(toc,article);
    for(const section of sections){const h=section.querySelector('h2,h3');if(!h)continue;const a=element('a','',h.textContent);a.href=`#${h.id}`;toc.append(a);article.append(section);}
    if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;for(const a of toc.children){if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}}},{rootMargin:'-15% 0px -60% 0px'});for(const h of article.querySelectorAll('h2,h3'))observer.observe(h);}
  }
  const offerLinks=Array.from(main.querySelectorAll('a')).filter(a=>a.querySelector('h3')&&/\.html(?:#.*)?$/.test(a.getAttribute('href')||''));
  if(path==='angebote.html'&&offerLinks.length){
    const parents=new Set(offerLinks.map(a=>a.parentElement));
    if(parents.size===1&&offerLinks[0].parentElement!==main)offerLinks[0].parentElement.classList.add('ds-card-grid');
    else{const grid=element('div','ds-card-grid');offerLinks[0].before(grid);for(const a of offerLinks)grid.append(a);}
    offerLinks.forEach((a,i)=>{a.classList.add('ds-card');a.dataset.index=String(i+1).padStart(2,'0');});
  }
  function createSpectrum(hero){
    const art=element('div','ds-hero-art');const canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Drehbares Spektralobjekt. Mit Maus oder Finger ziehen. Pfeiltasten drehen, Pos1 setzt die Ansicht zurück.');canvas.title='Ziehen zum Drehen · Pfeiltasten · Pos1 zum Zurücksetzen';art.append(canvas);hero.append(art);
    const context=canvas.getContext('2d');if(!context)return;
    let width=1,height=1,frame=0,last=0,phase=0,inView=true,running=false;
    const tools=document.querySelector('.ds-tools');
    const toggle=button('Animation abspielen','play');if(tools)tools.prepend(toggle);
    let autoStop=0;
    let yaw=.82,pitch=0,pointerId=null,pointerX=0,pointerY=0,interactionFrame=0;
    function label(){const label=running?'Animation pausieren':'Animation abspielen';toggle.setAttribute('aria-label',label);toggle.title=label;toggle.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[running?'pause':'play']}</svg>`;}
    function render(){
      context.clearRect(0,0,width,height);
      const size=Math.min(width*.42,height*.51),cx=width*.58,cy=height*.49;
      const glow=context.createRadialGradient(cx,cy,0,cx,cy,size*1.4);glow.addColorStop(0,'#37576719');glow.addColorStop(.6,'#1629321b');glow.addColorStop(1,'#080b1000');context.fillStyle=glow;context.fillRect(0,0,width,height);
      // Bounded parametric toroidal interference surface: 70 curves × 130 points.
      for(let ring=0;ring<70;ring++){
        const v=ring/70*Math.PI*2;context.beginPath();
        const hue=155+ring/70*105;context.strokeStyle=`hsla(${hue},60%,${65+Math.sin(v)*12}%,${.22+.36*(1+Math.cos(v))/2})`;context.lineWidth=.7;
        for(let step=0;step<=130;step++){
          const u=step/130*Math.PI*2;const modulation=.09*Math.sin(u*3+phase);
          const r=.69+(.27+modulation)*Math.cos(v);
          const x=r*Math.cos(u),y=r*Math.sin(u),z=(.27+modulation)*Math.sin(v);
          const rx=x*Math.cos(yaw)-z*Math.sin(yaw),rz=x*Math.sin(yaw)+z*Math.cos(yaw);
          const rotatedY=y*Math.cos(pitch)-rz*Math.sin(pitch),rotatedZ=y*Math.sin(pitch)+rz*Math.cos(pitch);
          const ry=rotatedY*.65-rotatedZ*.58;const angle=-.42;
          const px=cx+size*(rx*Math.cos(angle)-ry*Math.sin(angle));const py=cy+size*(rx*Math.sin(angle)+ry*Math.cos(angle));
          if(step===0)context.moveTo(px,py);else context.lineTo(px,py);
        }
        context.stroke();
      }
      context.strokeStyle='#c3e3f02a';context.lineWidth=.7;
      for(let i=0;i<4;i++){const x=cx+(i%2?1:-1)*size*1.05,y=cy+(i<2?-1:1)*size*.78;context.beginPath();context.moveTo(x-5,y);context.lineTo(x+5,y);context.moveTo(x,y-5);context.lineTo(x,y+5);context.stroke();}
    }
    function size(){const rect=art.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);render();}
    function tick(now){frame=0;if(!running||!inView||document.hidden)return;if(now-last>33){phase+=.007;render();last=now;}frame=requestAnimationFrame(tick);}
    function sync(){cancelAnimationFrame(frame);frame=0;if(running&&inView&&!document.hidden)frame=requestAnimationFrame(tick);}
    function pauseForInteraction(){clearTimeout(autoStop);running=false;label();sync();}
    function requestRender(){if(!interactionFrame)interactionFrame=requestAnimationFrame(()=>{interactionFrame=0;render();});}
    function rotate(dx,dy){
      yaw=(yaw+dx)%(Math.PI*2);
      pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+dy));
      requestRender();
    }
    canvas.addEventListener('pointerdown',event=>{
      if(pointerId!==null||!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
      pointerId=event.pointerId;pointerX=event.clientX;pointerY=event.clientY;
      canvas.setPointerCapture(pointerId);canvas.classList.add('is-dragging');pauseForInteraction();
    });
    canvas.addEventListener('pointermove',event=>{
      if(event.pointerId!==pointerId)return;
      rotate((event.clientX-pointerX)*.008,(event.clientY-pointerY)*.008);
      pointerX=event.clientX;pointerY=event.clientY;
    });
    function endDrag(event){
      if(event.pointerId!==pointerId)return;
      const id=pointerId;pointerId=null;canvas.classList.remove('is-dragging');
      if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
    }
    canvas.addEventListener('pointerup',endDrag);
    canvas.addEventListener('pointercancel',endDrag);
    canvas.addEventListener('lostpointercapture',endDrag);
    canvas.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
      event.preventDefault();pauseForInteraction();
      const step=event.shiftKey?.2:.08;
      if(event.key==='Home'){yaw=.82;pitch=0;requestRender();return;}
      rotate(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0);
    });
    toggle.addEventListener('click',()=>{clearTimeout(autoStop);running=!running;label();sync();});
    if('ResizeObserver'in window)new ResizeObserver(size).observe(art);else window.addEventListener('resize',size,{passive:true});
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(hero);
    document.addEventListener('visibilitychange',sync);
    reduce.addEventListener('change',()=>{if(reduce.matches){running=false;label();sync();}});
    size();running=!reduce.matches;label();sync();
    // Calm by default: initial motion ends automatically, explicit replay remains available.
    autoStop=window.setTimeout(()=>{running=false;label();sync();},4500);
  }
  if(home){
    const tagline=Array.from(main.querySelectorAll('p,div')).find(n=>n.children.length===0&&n.textContent.trim()==='Science · Software · Audio · Photography');
    if(tagline){const hero=element('div','ds-hero');main.prepend(hero);tagline.classList.add('ds-hero-title');tagline.textContent='';['Science','Software','Audio','Photography'].forEach((word,i)=>{const line=element('span','',word);if(i<3)line.append(element('span','ds-separator',' · '));tagline.append(line);});hero.append(tagline);createSpectrum(hero);const key=element('div','ds-orbit-key');key.setAttribute('aria-hidden','true');key.append(element('i',''),element('span','','DSMM / 01'));hero.append(key);}
  }
  const progress=element('div','ds-progress');progress.setAttribute('aria-hidden','true');body.append(progress);
  const back=button('Nach oben','up','ds-backtop');back.hidden=true;body.append(back);back.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'});const focusTarget=header?.querySelector('a,button')||main;if(focusTarget===main)focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true});});
  let scrollPending=false;
  function scroll(){scrollPending=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;back.hidden=scrollY<650;}
  window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(scroll);}},{passive:true});window.addEventListener('resize',scroll,{passive:true});scroll();
  if(path==='medien.html'){
    const gallery=main.querySelector('.gallery,.medien-grid,.media-grid');if(gallery)gallery.classList.add('ds-gallery');
    // Do not interfere with an existing lightbox or anchors already used by original scripts.
    if(!document.querySelector('dialog,.lightbox,[data-lightbox]')){
      const images=Array.from(main.querySelectorAll('a[href]')).filter(a=>/\.(?:jpe?g|png|webp|avif)(?:\?.*)?$/i.test(a.getAttribute('href')||''));
      if(images.length){const dialog=element('dialog','ds-lightbox');const close=button('Bild schließen','close');const img=document.createElement('img');const caption=element('p','');caption.id='dsmm-image-caption';dialog.setAttribute('aria-label','Bildansicht');dialog.setAttribute('aria-describedby',caption.id);dialog.append(close,img,caption);body.append(dialog);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});for(const a of images){a.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();img.src=a.href;img.alt=a.querySelector('img')?.alt||a.textContent.trim();caption.textContent=img.alt;dialog.showModal();});}}
    }
  }
})();
