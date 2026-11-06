/* Galeria: álbuns abertos dentro da própria página, sem redirecionamento. */
document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
(() => {
  'use strict';
  const section = document.getElementById('acervo-historico');
  if (!section) return;
  section.querySelectorAll('.hist-actions').forEach(actions=>actions.remove());
  const cache = new Map();
  let current = [], position = 0, previousFocus = null;
  const box = document.getElementById('lightbox');
  const big = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  const closeOriginal = document.getElementById('lightboxClose');
  if (!box || !big || !caption) return;
  const styles = document.createElement('style');
  styles.textContent = `
    #acervo-historico .hist-inline-gallery{width:100%;margin-top:14px;grid-column:1/-1}
    #acervo-historico .hist-activity-content .hist-inline-gallery{margin-top:10px}
    #acervo-historico .hist-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:12px;padding:12px 0}
    #acervo-historico .hist-photo-button{border:2px solid #2855a1;border-bottom:3px solid #ef373a;border-radius:13px;background:white;padding:5px;cursor:zoom-in;overflow:hidden;transition:transform .15s,border-color .15s}
    #acervo-historico .hist-photo-button:hover,#acervo-historico .hist-photo-button:focus-visible{transform:translateY(-2px);border-color:#ef373a}
    #acervo-historico .hist-photo-button img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:9px;display:block}
    #acervo-historico .hist-photo-button span{display:block;padding:5px;font-size:.78rem;color:#0f2d74;text-align:center}
    #acervo-historico .hist-thumb{box-sizing:border-box;border:2px solid #2855a1;border-bottom:3px solid #ef373a}
    #acervo-historico .hist-inline-title{font-weight:800;color:#0f2d74;margin:8px 0 2px;font-size:.95rem}
    #acervo-historico .hist-inline-status{padding:12px 0;color:#52688e}
    #acervo-historico .hist-card[aria-expanded="true"]{border-color:#ef373a}
    #lightbox.hist-inline-open{display:flex!important;position:fixed;inset:0;z-index:9999;background:rgba(5,16,43,.92);align-items:center;justify-content:center}
    #lightbox.hist-inline-open .lightbox-inner{max-width:min(92vw,1080px);max-height:90vh;display:flex;flex-direction:column;align-items:center}
    #lightbox.hist-inline-open #lightboxImage{max-width:100%;max-height:78vh;object-fit:contain}
    #lightbox .hist-inline-controls{display:flex;justify-content:center;gap:12px;margin-top:10px}
    #lightbox .hist-inline-controls button{border:1px solid #ffffff90;color:#fff;background:#193f9c;padding:9px 15px;border-radius:9px;cursor:pointer}
    @media(max-width:520px){#acervo-historico .hist-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.appendChild(styles);
  const controls = document.createElement('div');
  controls.className = 'hist-inline-controls';
  const prev = document.createElement('button'), next = document.createElement('button');
  prev.type = next.type = 'button'; prev.textContent = '← Anterior'; next.textContent = 'Próxima →';
  controls.append(prev,next);
  box.querySelector('.lightbox-inner').append(controls);
  function renderLarge(index) {
    if (!current.length) return;
    position = (index + current.length) % current.length;
    const p = current[position];
    big.src = p.imagem || p.miniatura;
    big.alt = 'Fotografia: ' + (p.atividade || 'Memória institucional');
    caption.textContent = (p.titulo || p.atividade || 'Registro fotográfico') + ' • Foto ' + (position + 1) + ' de ' + current.length;
  }
  function openLightbox(items,index) {
    previousFocus=document.activeElement;current=items;renderLarge(index);
    box.classList.add('hist-inline-open');box.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    if(closeOriginal) closeOriginal.focus();
  }
  function closeLightbox() {
    if(!box.classList.contains('hist-inline-open')) return;
    box.classList.remove('hist-inline-open');box.setAttribute('aria-hidden','true');
    document.body.style.overflow='';big.removeAttribute('src');
    if(previousFocus && previousFocus.focus) previousFocus.focus();
  }
  prev.addEventListener('click',()=>renderLarge(position-1));
  next.addEventListener('click',()=>renderLarge(position+1));
  if(closeOriginal) closeOriginal.addEventListener('click',closeLightbox);
  box.addEventListener('click',e=>{if(e.target===box)closeLightbox();});
  document.addEventListener('keydown',e=>{
    if(!box.classList.contains('hist-inline-open'))return;
    if(e.key==='Escape')closeLightbox();
    if(e.key==='ArrowLeft')renderLarge(position-1);
    if(e.key==='ArrowRight')renderLarge(position+1);
  });
  async function getPhotos(url) {
    const page = new URL(url,location.href);
    const key = page.pathname;
    if(!cache.has(key)) cache.set(key,fetch(page.pathname).then(r=>{
      if(!r.ok)throw new Error('Falha ao obter álbum');
      return r.text();
    }).then(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const data=doc.getElementById('fotografias-json');
      if(!data) throw new Error('Fotografias indisponíveis');
      return JSON.parse(data.textContent);
    }).catch(err=>{cache.delete(key);throw err;}));
    const all=await cache.get(key);
    const selected=page.searchParams.get('atividade');
    return selected ? all.filter(p=>p.atividade===selected) : all;
  }
  async function showAlbum(a, toggle = true) {
    const url=new URL(a.getAttribute('href'),location.href);
    const activity=a.closest('.hist-activity');
    const parent=activity?.querySelector('.hist-activity-content') || a.closest('.hist-cards');
    if(!parent)return;
    let target=parent.querySelector(':scope > .hist-inline-gallery');
    if(target){
      const wasVisible=toggle && !target.hidden;
      target.hidden=wasVisible;a.setAttribute('aria-expanded',String(!wasVisible));
      return;
    }
    target=document.createElement('div');target.className='hist-inline-gallery';
    target.setAttribute('role','region');
    const status=document.createElement('p');status.className='hist-inline-status';
    status.textContent='Carregando fotografias…';target.append(status);parent.append(target);
    a.setAttribute('aria-expanded','true');
    try{
      const photos=await getPhotos(url.href);
      if(!photos.length){status.textContent='Nenhuma fotografia encontrada neste álbum.';return;}
      target.replaceChildren();
      const heading=document.createElement('p');heading.className='hist-inline-title';
      const name=activity?.querySelector('.hist-activity-name')?.textContent || 'Memória institucional — Destaques';
      heading.textContent=name+' • '+photos.length+' fotografia'+(photos.length===1?'':'s');
      target.append(heading);
      const grid=document.createElement('div');grid.className='hist-photo-grid';
      photos.forEach((p,i)=>{
        const button=document.createElement('button');button.type='button';button.className='hist-photo-button';
        button.setAttribute('aria-label','Ampliar foto '+(i+1)+' de '+photos.length);
        const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=p.miniatura||p.imagem;
        img.alt=(p.titulo||p.atividade||name)+' — foto '+(i+1);
        const label=document.createElement('span');label.textContent='Foto '+(i+1);
        button.append(img,label);button.addEventListener('click',()=>openLightbox(photos,i));grid.append(button);
      });
      target.append(grid);
    }catch(err){console.error('Falha ao abrir álbum',err);status.textContent='Não foi possível abrir as fotografias. Clique novamente para tentar.';target.remove();a.setAttribute('aria-expanded','false');}
  }
  // Cada atividade abre as fotografias com o mesmo grid e visualizador dos Destaques.
  section.querySelectorAll('.hist-activity').forEach(activity=>{
    activity.addEventListener('toggle',()=>{
      if(!activity.open)return;
      const link=activity.querySelector('a.hist-card');
      if(link)showAlbum(link,false);
    });
  });
  section.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    if(!a || !section.contains(a))return;
    const url=new URL(a.getAttribute('href'),location.href);
    if(!/^galeria-(?:memoria|20\d\d)\.html$/.test(url.pathname.split('/').pop()))return;
    e.preventDefault();
    showAlbum(a,!a.closest('.hist-activity'));
  });
})();
