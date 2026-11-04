
        document.querySelectorAll('.nav-toggle').forEach(btn=>btn.addEventListener('click',()=>{
          const nav=document.getElementById(btn.getAttribute('aria-controls'));
          const opened=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(opened));
          btn.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');btn.textContent=opened?'✕':'☰';
        }));
        document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{
          const nav=document.getElementById('main-navigation');if(!nav)return;nav.classList.remove('open');
          const btn=document.querySelector('.nav-toggle');if(btn){btn.setAttribute('aria-expanded','false');btn.textContent='☰';}
        }));
        