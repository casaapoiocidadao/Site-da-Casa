
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('show');});},{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const counts=document.querySelectorAll('.count');const countObs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting) return; const el=entry.target; const target=+el.dataset.target; const start=performance.now(); const dur=1300; function tick(t){const p=Math.min((t-start)/dur,1); const n=Math.floor(target*(1-Math.pow(1-p,3))); el.textContent=n.toLocaleString('pt-BR'); if(p<1) requestAnimationFrame(tick); else el.textContent=target.toLocaleString('pt-BR');} requestAnimationFrame(tick); countObs.unobserve(el);});},{threshold:.6});counts.forEach(el=>countObs.observe(el));

/* As fotos históricas integram o mesmo menu interativo, sem alterar outros conteúdos. */
const albumGrid=document.querySelector('.gallery-grid');
if(albumGrid && Array.isArray(window.CASA_ACERVO)){
  const fragment=document.createDocumentFragment();
  const jaExibidas=new Set([...albumGrid.querySelectorAll('.gallery-item img')].map(img=>img.getAttribute('src')));
  function categoriaDaAtividade(nome){
    const n=String(nome||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(/passeio|praia|parque/.test(n)) return 'convivencia';
    if(/oftalm|oftam|saude|bombeiro/.test(n)) return 'saude';
    if(/artesan|capacit|palestra|gerando falcoes|eu lidero/.test(n)) return 'capacitacao';
    if(/capoeira|karate|jiu|esporte/.test(n)) return 'esporte';
    if(/festa|evento|desfile|dia das criancas|dia das maes|junina/.test(n)) return 'eventos';
    return 'solidariedade';
  }
  window.CASA_ACERVO.forEach(foto=>{
    if(!foto.imagem || jaExibidas.has(foto.imagem)) return;
    jaExibidas.add(foto.imagem);
    const titulo=String(foto.atividade||'Atividade da Casa de Apoio');
    const album=String(foto.ano||'Acervo')+' · Foto '+String(foto.foto||1);
    const figure=document.createElement('figure');
    figure.className='gallery-item';
    figure.dataset.category=categoriaDaAtividade(titulo);
    figure.dataset.title=titulo;
    figure.dataset.activity=titulo;
    figure.dataset.album=album;
    const img=document.createElement('img');
    img.alt=titulo+' — '+album;
    img.loading='lazy';
    img.decoding='async';
    img.src=foto.imagem;
    const legenda=document.createElement('figcaption');
    legenda.className='gallery-caption';
    const forte=document.createElement('strong');
    forte.textContent=titulo;
    const detalhe=document.createElement('span');
    detalhe.textContent=album;
    legenda.append(forte,detalhe);
    figure.append(img,legenda);
    fragment.append(figure);
  });
  albumGrid.append(fragment);
  window.CASA_ACERVO=null;
}

/* Filtros encadeados: ano > nome original da pasta/atividade. */
const items=[...document.querySelectorAll('.gallery-item')];
const filtersContainer=document.querySelector('.filters') || document.querySelector('.filter-btn')?.parentElement;
function anoDaFoto(item){
  const direct=String(item.dataset.year || item.dataset.ano || '').match(/\b(?:19|20)\d{2}\b/);
  if(direct) return direct[0];
  const campos=[item.dataset.album,item.dataset.title,item.querySelector('.gallery-caption')?.textContent,item.querySelector('img')?.getAttribute('src')?.slice(0,240)];
  for(const campo of campos){
    const m=String(campo||'').match(/(?:^|[^0-9])((?:19|20)\d{2})(?=[^0-9]|$)/);
    if(m) return m[1];
  }
  return 'sem-data';
}
items.forEach(item=>{
  item.dataset.year=anoDaFoto(item);
  // O campo atividade do acervo contém o nome da pasta enviada no ZIP.
  item.dataset.activity=item.dataset.activity || item.dataset.title || 'Outras fotos';
});
if(filtersContainer){
  const subfilters=document.createElement('div');
  subfilters.className='filters gallery-subfilters';
  subfilters.setAttribute('aria-label','Filtrar por atividade');
  filtersContainer.insertAdjacentElement('afterend',subfilters);
  const anos=[...new Set(items.map(item=>item.dataset.year).filter(ano=>ano!=='sem-data'))].sort((a,b)=>Number(b)-Number(a));
  const opcoes=[['all','Todos'],...anos.map(ano=>[ano,ano])];
  if(items.some(item=>item.dataset.year==='sem-data'))opcoes.push(['sem-data','Sem ano informado']);
  let anoSelecionado='all';
  let atividadeSelecionada='all';
  function criaBotao(valor,rotulo,ativo,acao){
    const btn=document.createElement('button');
    btn.type='button';btn.className='filter-btn'+(ativo?' active':'');
    btn.dataset.filter=valor;btn.textContent=rotulo;
    btn.setAttribute('aria-pressed',String(ativo));
    btn.addEventListener('click',()=>acao(valor));
    return btn;
  }
  function filtrar(){
    items.forEach(item=>{
      const anoOk=anoSelecionado==='all'||item.dataset.year===anoSelecionado;
      const atividadeOk=atividadeSelecionada==='all'||item.dataset.activity===atividadeSelecionada;
      item.style.display=anoOk&&atividadeOk?'block':'none';
    });
  }
  function montarSubcategorias(){
    const correspondentes=items.filter(item=>anoSelecionado==='all'||item.dataset.year===anoSelecionado);
    const atividades=[...new Set(correspondentes.map(item=>item.dataset.activity).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    subfilters.replaceChildren();
    if(!atividades.length){subfilters.hidden=true;return;}
    subfilters.hidden=false;
    subfilters.append(criaBotao('all','Todas as atividades',atividadeSelecionada==='all',selecionarAtividade));
    atividades.forEach(nome=>subfilters.append(criaBotao(nome,nome,atividadeSelecionada===nome,selecionarAtividade)));
  }
  function selecionarAtividade(valor){
    atividadeSelecionada=valor;
    montarSubcategorias();
    filtrar();
  }
  function selecionarAno(valor){
    anoSelecionado=valor;
    atividadeSelecionada='all';
    montarAnos();
    montarSubcategorias();
    filtrar();
  }
  function montarAnos(){
    filtersContainer.replaceChildren();
    opcoes.forEach(([valor,rotulo])=>filtersContainer.append(criaBotao(valor,rotulo,valor===anoSelecionado,selecionarAno)));
  }
  montarAnos();
  montarSubcategorias();
  filtrar();
}
const lightbox=document.getElementById('lightbox');if(lightbox){const lbImg=document.getElementById('lightboxImage'); const lbCap=document.getElementById('lightboxCaption'); items.forEach(item=>item.addEventListener('click',()=>{const img=item.querySelector('img'); lbImg.src=img.src; lbCap.textContent=item.dataset.title+' — '+item.dataset.album; lightbox.classList.add('open');})); document.getElementById('lightboxClose').addEventListener('click',()=>lightbox.classList.remove('open')); lightbox.addEventListener('click',e=>{if(e.target===lightbox) lightbox.classList.remove('open');});}
