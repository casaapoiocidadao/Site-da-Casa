/* Abertura e fechamento acessíveis do menu em todas as páginas. */
(()=>{'use strict';
 const button=document.querySelector('.site-menu-toggle');
 const menu=document.getElementById('main-navigation');
 if(!button||!menu)return;
 const close=()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Abrir menu');button.textContent='☰';};
 button.addEventListener('click',()=>{const open=!menu.classList.contains('open');menu.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');button.textContent=open?'✕':'☰';});
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('open')){close();button.focus();}});
 document.addEventListener('click',event=>{if(!menu.contains(event.target)&&!button.contains(event.target))close();});
 window.addEventListener('resize',()=>{if(window.innerWidth>1060)close();});
})();


/* Modo de demonstração: ativado exclusivamente por ?demo=1.
   Mantém menus, fotos, álbuns e interações existentes; nunca altera a aparência padrão. */
(()=>{
  'use strict';
  const url=new URL(window.location.href);
  if(url.searchParams.get('demo')!=='1')return;
  document.documentElement.classList.add('demo-redblue');
  const sheet=document.createElement('link');
  sheet.rel='stylesheet';
  // O arquivo JS está na pasta assets/js, mas o URL base do documento é a raiz do site.
  sheet.href=new URL('assets/css/demo-azul-vermelho.css',document.baseURI).href;
  document.head.appendChild(sheet);
  const makePreviewLink=(anchor)=>{
    if(!anchor || !anchor.getAttribute('href'))return;
    const original=anchor.getAttribute('href');
    if(original.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(original))return;
    try {
      const target=new URL(original,document.baseURI);
      if(target.origin===location.origin && /\.html$/i.test(target.pathname)){
        target.searchParams.set('demo','1');
        anchor.href=target.href;
      }
    }catch(_){}
  };
  document.querySelectorAll('a[href]').forEach(makePreviewLink);
  // Protege links montados dinamicamente por filtros dos álbuns.
  document.addEventListener('click',(event)=>{
    const anchor=event.target.closest?.('a[href]');
    if(anchor)makePreviewLink(anchor);
  },true);
  const bar=document.createElement('aside');
  bar.id='demo-layout-switch';
  bar.setAttribute('aria-label','Prévia do novo layout');
  const caption=document.createElement('span');
  caption.textContent='PRÉVIA • Azul + vermelho + branco';
  const back=document.createElement('a');
  const normal=new URL(location.href);
  normal.searchParams.delete('demo');
  back.href=normal.href;
  back.textContent='Ver original';
  bar.append(caption,back);
  document.body.appendChild(bar);
})();
