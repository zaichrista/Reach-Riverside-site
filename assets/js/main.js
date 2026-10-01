(function(){
  var d=document, root=d.documentElement;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){} return null; }

  /* day / night */
  function setTheme(t){
    if(t==='night') root.setAttribute('data-theme','night'); else root.removeAttribute('data-theme');
    [].forEach.call(d.querySelectorAll('[data-theme-set]'),function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-theme-set')===t?'true':'false'); });
    ls('reach-theme',t);
  }
  setTheme(ls('reach-theme')==='night'?'night':'day');
  [].forEach.call(d.querySelectorAll('[data-theme-set]'),function(b){ b.addEventListener('click',function(){ setTheme(b.getAttribute('data-theme-set')); }); });

  /* London clock */
  var clock=d.getElementById('clock');
  function tick(){ if(!clock) return; try{ clock.textContent=new Date().toLocaleTimeString('en-GB',{timeZone:'Europe/London',hour:'numeric',minute:'2-digit',hour12:true}).toUpperCase().replace(/\s?(AM|PM)/,' $1'); }catch(e){} }
  tick(); setInterval(tick,15000);

  /* header */
  var head=d.querySelector('.site-header');
  function onScroll(){ if(head) head.classList.toggle('scrolled', window.scrollY>(d.body.classList.contains('home')?window.innerHeight*.55:20)); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* overlay menu */
  var ov=d.getElementById('overlay'), burger=d.getElementById('burger');
  function openOv(o){ ov.classList.toggle('open',o); ov.setAttribute('aria-hidden',o?'false':'true'); burger.setAttribute('aria-expanded',o?'true':'false'); d.body.style.overflow=o?'hidden':''; if(o) ov.querySelector('.close').focus(); else burger.focus(); }
  if(ov&&burger){
    burger.addEventListener('click',function(){ openOv(true); });
    ov.querySelector('.close').addEventListener('click',function(){ openOv(false); });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape'&&ov.classList.contains('open')) openOv(false); });
    [].forEach.call(ov.querySelectorAll('nav a'),function(a){ a.addEventListener('click',function(){ openOv(false); }); });
  }

  /* reveal on scroll */
  root.classList.add('js');
  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:.12});
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  /* day-part timeline */
  var tl=d.getElementById('timeline'), wrap=d.querySelector('.dayparts');
  if(tl&&wrap&&'IntersectionObserver' in window){
    var parts=[].slice.call(wrap.querySelectorAll('.part'));
    var vis=new IntersectionObserver(function(es){ es.forEach(function(e){ tl.classList.toggle('on',e.isIntersecting); }); },{rootMargin:'-35% 0px -35% 0px'});
    vis.observe(wrap);
    var act=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var n=e.target.getAttribute('data-n');
      [].forEach.call(tl.querySelectorAll('.tick,.lab'),function(x){ x.classList.toggle('active', x.getAttribute('data-n')===n); }); } }); },{rootMargin:'-48% 0px -48% 0px'});
    parts.forEach(function(p){ act.observe(p); });
  }

  /* video respects reduced motion */
  var v=d.querySelector('video[data-autoplay]');
  if(v&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){ v.removeAttribute('autoplay'); v.pause(); }

  /* private dining enquiry: opens an email draft */
  var f=d.getElementById('enquiry');
  if(f){ f.addEventListener('submit',function(e){ e.preventDefault(); var g=function(n){ return (f.elements[n]&&f.elements[n].value||'').trim(); };
    var body=['Name: '+g('name'),'Email: '+g('email'),'Phone: '+g('phone'),'Date: '+g('date'),'Guests: '+g('guests'),'Occasion: '+g('occasion'),'','Message:',g('message')].join('\n');
    location.href='mailto:info@thereachbrasserie.com?subject='+encodeURIComponent('Private dining enquiry: '+(g('occasion')||'The Reach Riverside'))+'&body='+encodeURIComponent(body); }); }
})();
