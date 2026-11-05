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



/* Tema azul, vermelho e branco agora é o padrão OFICIAL de todo o site.
   A navegação continua usando as páginas, galerias e integrações reais do projeto.
   Não exige parâmetros ?demo=1 nem modifica links internos. */
(()=>{
  'use strict';
  document.documentElement.classList.add('demo-redblue');
  if(!document.querySelector('link[data-tema-oficial]')){
    const sheet=document.createElement('link');
    sheet.rel='stylesheet';
    sheet.dataset.temaOficial='true';
    sheet.href=new URL('assets/css/demo-azul-vermelho.css',document.baseURI).href;
    document.head.appendChild(sheet);
  }
})();
