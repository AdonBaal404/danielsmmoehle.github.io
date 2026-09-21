(() => {
  'use strict';
  const body=document.body;
  if(!body)return;
  body.classList.add('js-enabled');
  const menu=document.querySelector('.menu-toggle');
  const nav=document.getElementById('main-navigation');
  const header=document.querySelector('.site-header');
  if(menu&&nav&&header){
    function close(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');}
    menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');});
    nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
    document.addEventListener('click',event=>{if(!header.contains(event.target))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){close();menu.focus();}});
    window.matchMedia('(min-width:761px)').addEventListener('change',close);
  }
  const toc=document.querySelector('.toc');
  if(toc&&'IntersectionObserver'in window){
    const links=Array.from(toc.querySelectorAll('a'));
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        for(const link of links){
          if(link.getAttribute('href')===`#${entry.target.id}`)link.setAttribute('aria-current','true');
          else link.removeAttribute('aria-current');
        }
      }
    },{rootMargin:'-5% 0px -65% 0px'});
    for(const section of document.querySelectorAll('.article-section'))observer.observe(section);
  }
  const galleryLinks=Array.from(document.querySelectorAll('[data-gallery-image]'));
  const dialog=document.getElementById('image-viewer');
  if(!galleryLinks.length||!dialog||typeof dialog.showModal!=='function')return;
  const image=dialog.querySelector('.lightbox-image');
  const caption=dialog.querySelector('.lightbox-caption');
  const counter=dialog.querySelector('.lightbox-counter');
  const credit=dialog.querySelector('.lightbox-credit');
  const close=dialog.querySelector('.lightbox-close');
  const previous=dialog.querySelector('.lightbox-prev');
  const next=dialog.querySelector('.lightbox-next');
  if(!image||!caption||!counter||!credit||!close||!previous||!next)return;
  let selected=0,opener=null,savedOverflow='';
  function show(index){
    selected=(index+galleryLinks.length)%galleryLinks.length;
    const link=galleryLinks[selected];
    const figure=link.closest('figure');
    const source=link.querySelector('img');
    image.src=link.href;
    image.alt=source?.alt||'';
    caption.textContent=figure?.querySelector('figcaption')?.textContent||'';
    credit.textContent=link.dataset.credit||'Beispielbild';
    counter.textContent=`${selected+1} / ${galleryLinks.length}`;
  }
  function finish(){if(dialog.open)dialog.close();}
  for(let i=0;i<galleryLinks.length;i++){
    galleryLinks[i].addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();opener=galleryLinks[i];show(i);
      savedOverflow=body.style.overflow;body.style.overflow='hidden';dialog.showModal();close.focus();
    });
  }
  close.addEventListener('click',finish);
  previous.addEventListener('click',()=>show(selected-1));
  next.addEventListener('click',()=>show(selected+1));
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();show(selected-1);}
    if(event.key==='ArrowRight'){event.preventDefault();show(selected+1);}
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)finish();}});
  dialog.addEventListener('close',()=>{body.style.overflow=savedOverflow;opener?.focus();});
})();
