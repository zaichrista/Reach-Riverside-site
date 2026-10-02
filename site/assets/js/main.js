(function(){
  var d=document, root=d.documentElement;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){} return null; }

  /* day / night */
  function setTheme(t){
    if(t==='night') root.setAttribute('data-theme','night'); else root.removeAttribute('data-theme');
    [].forEach.call(d.querySelectorAll('[data-theme-set]'),function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-theme-set')===t?'true':'false'); });
    /* header icon shows the current mode (sun by day, moon by night); clicking switches to the other */
    var next=t==='night'?'daytime':'nighttime';
    [].forEach.call(d.querySelectorAll('[data-theme-toggle]'),function(b){ b.setAttribute('aria-label','Switch to '+next+' view'); b.title='Switch to '+next+' view'; });
    ls('reach-theme',t);
  }
  setTheme(ls('reach-theme')==='night'?'night':'day');
  [].forEach.call(d.querySelectorAll('[data-theme-set]'),function(b){ b.addEventListener('click',function(){ setTheme(b.getAttribute('data-theme-set')); }); });
  [].forEach.call(d.querySelectorAll('[data-theme-toggle]'),function(b){ b.addEventListener('click',function(){ setTheme(root.getAttribute('data-theme')==='night'?'day':'night'); }); });

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

  /* slow, eased page scroll (mouse wheel / trackpad only; touch stays native) */
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target=window.scrollY, cur=target, raf=0, lastT=0, ease=.06;
  function maxY(){ return root.scrollHeight-window.innerHeight; }
  function jump(y){ window.scrollTo({top:y,behavior:'instant'}); }
  function step(t){
    var dt=lastT?Math.min(t-lastT,64):16.7; lastT=t;
    cur+=(target-cur)*(1-Math.pow(1-ease,dt/16.7));
    if(Math.abs(target-cur)<.4){ cur=target; jump(cur); raf=0; lastT=0; return; }
    jump(cur); raf=requestAnimationFrame(step);
  }
  function glide(y,e){ target=Math.max(0,Math.min(maxY(),y)); if(reduced){ jump(target); return; } if(!raf){ cur=window.scrollY; } ease=e||.06; if(!raf) raf=requestAnimationFrame(step); }
  if(!reduced){
    window.addEventListener('wheel',function(e){
      if(e.ctrlKey||e.defaultPrevented||d.body.style.overflow==='hidden') return;
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
      e.preventDefault();
      var dy=e.deltaMode===1?e.deltaY*32:e.deltaMode===2?e.deltaY*window.innerHeight:e.deltaY;
      if(!raf){ target=cur=window.scrollY; }
      glide(target+dy*.85,.06);
    },{passive:false});
    window.addEventListener('scroll',function(){ if(!raf){ target=cur=window.scrollY; } },{passive:true});
    ['keydown','mousedown','touchstart'].forEach(function(ev){ window.addEventListener(ev,function(){ if(raf){ cancelAnimationFrame(raf); raf=0; lastT=0; target=cur=window.scrollY; } },{passive:true}); });
  }

  /* home: each section holds in the window for half a scroll (the closing gallery for a full one) */
  if(d.body.classList.contains('home')){
    var held=[].slice.call(d.querySelectorAll('.hero,.intro,.part,.group,.quote'));
    held.forEach(function(s){ var w=d.createElement('div'); w.className=s.classList.contains('quote')?'hold hold--long':'hold'; s.parentNode.insertBefore(w,s); w.appendChild(s); });
    /* a section taller than the window holds with its bottom edge in view instead */
    function fitHolds(){ held.forEach(function(s){ s.style.top=Math.min(0,window.innerHeight-s.offsetHeight)+'px'; }); }
    fitHolds(); window.addEventListener('resize',fitHolds); window.addEventListener('load',fitHolds);
  }

  /* day-part timeline: shows where you are, and each time of day is clickable */
  var tl=d.getElementById('timeline'), wrap=d.querySelector('.dayparts');
  if(tl&&wrap){
    var parts=[].slice.call(wrap.querySelectorAll('.part')), stops=[].slice.call(tl.querySelectorAll('.stop'));
    function setActive(n){ stops.forEach(function(s){ var on=s.getAttribute('data-n')===n; s.classList.toggle('active',on); if(on) s.setAttribute('aria-current','true'); else s.removeAttribute('aria-current'); }); }
    stops.forEach(function(s){ s.addEventListener('click',function(){
      var p=wrap.querySelector('.part[data-n="'+s.getAttribute('data-n')+'"]'); if(!p) return; if(p.parentNode.classList.contains('hold')) p=p.parentNode;
      setActive(s.getAttribute('data-n')); glide(p.getBoundingClientRect().top+window.scrollY,.045);
    }); });
    if('IntersectionObserver' in window){
      var vis=new IntersectionObserver(function(es){ es.forEach(function(e){ tl.classList.toggle('on',e.isIntersecting); }); },{rootMargin:'-35% 0px -35% 0px'});
      vis.observe(wrap);
      var act=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) setActive(e.target.getAttribute('data-n')); }); },{rootMargin:'-48% 0px -48% 0px'});
      parts.forEach(function(p){ act.observe(p); });
    }
  }

  /* Sunday roast: held in view while the photo slowly settles */
  var pin=d.querySelector('.roast-pin');
  if(pin&&!reduced){
    var busy=false;
    function roastZoom(){ busy=false; var r=pin.getBoundingClientRect(), span=r.height-window.innerHeight;
      var p=span>0?Math.max(0,Math.min(1,-r.top/span)):0; pin.style.setProperty('--roast-zoom',(1.12-.12*p).toFixed(4)); }
    window.addEventListener('scroll',function(){ if(!busy){ busy=true; requestAnimationFrame(roastZoom); } },{passive:true});
    roastZoom();
  }

  /* closing gallery: latest Instagram posts (via Behold) mixed with the site's photos; site photos alone if the feed is unavailable */
  var IG_FEED='https://feeds.behold.so/HKJoF9LjWSR1jA9mZCdZ';
  function igTiles(feed){
    var tiles=[];
    (feed&&feed.posts||[]).forEach(function(p){
      if(p.visibility&&p.visibility!=='visible') return;
      var alt=(p.prunedCaption||p.caption||'').replace(/\s+/g,' ').trim();
      alt=alt?'Instagram post: '+(alt.length>110?alt.slice(0,107)+'…':alt):'Instagram post from The Reach Riverside';
      var media=p.mediaType==='CAROUSEL_ALBUM'&&p.children&&p.children.length?p.children:[p];
      media.forEach(function(m){ var s=m.sizes&&(m.sizes.medium||m.sizes.small); var src=s&&s.mediaUrl||(m.mediaType==='VIDEO'?m.thumbnailUrl:m.mediaUrl)||p.thumbnailUrl;
        if(src) tiles.push({src:src,href:p.permalink,alt:alt}); });
    });
    return tiles;
  }
  /* weave Instagram posts and the site's own photos together, alternating */
  function weave(a,b){ var out=[], i=0; while(i<a.length||i<b.length){ if(i<a.length) out.push(a[i]); if(i<b.length) out.push(b[i]); i++; } return out; }
  function fillReel(reel,tiles,hidden){
    reel.innerHTML='';
    tiles.forEach(function(t){
      var f=d.createElement('figure'), im=d.createElement('img'), box=f;
      if(t.href){ box=d.createElement('a'); box.href=t.href; box.target='_blank'; box.rel='noopener'; if(hidden) box.tabIndex=-1; f.appendChild(box); }
      im.src=t.src; im.alt=hidden?'':t.alt; im.decoding='async';
      box.appendChild(im); reel.appendChild(f);
    });
  }
  function initReel(reel){
    var orig=[].slice.call(reel.children), n=orig.length, dir=+reel.getAttribute('data-dir')||1;
    if(!n) return;
    for(var k=0;k<3;k++) orig.forEach(function(f){ var c=f.cloneNode(true); c.setAttribute('aria-hidden','true'); var im=c.querySelector('img'); if(im){ im.alt=''; im.removeAttribute('loading'); } var a=c.querySelector('a'); if(a) a.tabIndex=-1; reel.appendChild(c); });
    function setW(){ return reel.children[n].offsetLeft-reel.children[0].offsetLeft; }
    var pos=0, hold=false, resume=0, prev=0;
    function wrapPos(){ var w=setW(); if(!w) return; while(pos<w) pos+=w; while(pos>=2*w) pos-=w; reel.scrollLeft=pos; }
    reel.addEventListener('scroll',function(){ if(Math.abs(reel.scrollLeft-pos)>1.5){ pos=reel.scrollLeft; wrapPos(); } },{passive:true});
    function pause(ms){ hold=true; clearTimeout(resume); resume=setTimeout(function(){ hold=false; },ms); }
    reel.addEventListener('mouseenter',function(){ hold=true; clearTimeout(resume); });
    reel.addEventListener('mouseleave',function(){ pause(400); });
    reel.addEventListener('touchstart',function(){ pause(2500); },{passive:true});
    reel.addEventListener('wheel',function(){ pause(2500); },{passive:true});
    var dragX=null, dragPos=0, moved=0;
    reel.addEventListener('mousedown',function(e){ dragX=e.clientX; dragPos=pos; moved=0; reel.classList.add('dragging'); e.preventDefault(); });
    window.addEventListener('mousemove',function(e){ if(dragX===null) return; moved=Math.max(moved,Math.abs(e.clientX-dragX)); pos=dragPos-(e.clientX-dragX); wrapPos(); dragPos=pos+(e.clientX-dragX); });
    window.addEventListener('mouseup',function(){ if(dragX===null) return; dragX=null; reel.classList.remove('dragging'); });
    /* a drag should not also open the post */
    reel.addEventListener('click',function(e){ if(moved>6){ e.preventDefault(); moved=0; } },true);
    function drift(t){ var dt=prev?Math.min(t-prev,64):16.7; prev=t;
      if(!hold&&dragX===null&&!reduced){ pos+=dt*.026*dir; wrapPos(); }
      requestAnimationFrame(drift); }
    window.addEventListener('load',wrapPos); window.addEventListener('resize',wrapPos);
    [].forEach.call(reel.querySelectorAll('img'),function(im){ if(!im.complete) im.addEventListener('load',wrapPos); });
    wrapPos(); requestAnimationFrame(drift);
  }
  var reels=[].slice.call(d.querySelectorAll('.reel'));
  /* the site's own gallery photos, taken from the top row before it is refilled; they link to the Instagram profile */
  var IG_PROFILE='https://www.instagram.com/thereachriverside/';
  var house=reels.length?[].map.call(reels[0].querySelectorAll('img'),function(im){ return {src:im.getAttribute('src'),alt:im.alt,href:IG_PROFILE}; }):[];
  function lay(tiles){ var half=Math.ceil(tiles.length/2);
    reels.forEach(function(reel,i){ fillReel(reel,i?tiles.slice(half).concat(tiles.slice(0,half)):tiles,i>0); }); }
  if(reels.length){
    var started=false;
    /* without the feed, the rows show the site photos alone (still linking to the profile) */
    function startReels(){ if(started) return; started=true; if(!reels[0].querySelector('a')) lay(house); reels.forEach(initReel); }
    var giveUp=setTimeout(startReels,4000);
    if(window.fetch){
      fetch(IG_FEED).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(feed){
        var ig=igTiles(feed); if(started||ig.length<2) return startReels();
        var tiles=weave(ig,house);
        clearTimeout(giveUp);
        lay(tiles);
        startReels();
      }).catch(startReels);
    } else startReels();
  }

  /* the gallery rows scroll into place above and below the line as you arrive */
  var quote=d.querySelector('.quote');
  if(quote){
    var qBusy=false;
    function quoteIn(){ qBusy=false; var box=quote.parentNode.classList.contains('hold')?quote.parentNode:quote;
      var top=box.getBoundingClientRect().top, vh=window.innerHeight;
      var p=reduced?1:Math.max(0,Math.min(1,(vh*.35-top)/(vh*.75)));
      quote.style.setProperty('--in',(1-Math.pow(1-p,3)).toFixed(4)); }
    window.addEventListener('scroll',function(){ if(!qBusy){ qBusy=true; requestAnimationFrame(quoteIn); } },{passive:true});
    window.addEventListener('resize',quoteIn); quoteIn();
  }

  /* video respects reduced motion */
  var v=d.querySelector('video[data-autoplay]');
  if(v&&reduced){ v.removeAttribute('autoplay'); v.pause(); }
  else if(v){ v.muted=true; var tryPlay=function(){ var q=v.play(); if(q&&q.catch) q.catch(function(){}); };
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) tryPlay(); }); },{threshold:.01}).observe(v); }
    v.addEventListener('loadeddata',tryPlay); window.addEventListener('resize',function(){ if(v.paused) tryPlay(); }); tryPlay(); }

  /* email links: open the mail app, and copy the address in case no mail app is set up */
  var toast=null, toastT=0;
  function say(msg){ if(!toast){ toast=d.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); d.body.appendChild(toast); }
    toast.textContent=msg; toast.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ toast.classList.remove('show'); },4200); }
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="mailto:"]'); if(!a) return;
    var addr=a.getAttribute('href').slice(7).split('?')[0];
    try{ navigator.clipboard.writeText(addr).then(function(){ say('Opening your email… address copied: '+addr); },function(){ say('Email us at '+addr); }); }catch(err){ say('Email us at '+addr); }
  });

})();

/* hero tree: glow only when the pointer is over the drawn tree, not its transparent surround */
(function(){
  var tree=document.querySelector('.hero-tree'), hero=document.querySelector('.hero');
  if(!tree||!hero||!window.matchMedia('(hover:hover)').matches) return;
  var cv=document.createElement('canvas'), ctx=cv.getContext('2d',{willReadFrequently:true}), ready=false;
  function load(){
    cv.width=tree.naturalWidth; cv.height=tree.naturalHeight;
    try{ ctx.drawImage(tree,0,0); ctx.getImageData(0,0,1,1); ready=true; }catch(err){ ready=false; }
  }
  if(tree.complete&&tree.naturalWidth) load(); else tree.addEventListener('load',load);
  hero.addEventListener('mousemove',function(e){
    var on=false;
    if(ready){
      var r=tree.getBoundingClientRect();
      var x=Math.floor((e.clientX-r.left)/r.width*cv.width), y=Math.floor((e.clientY-r.top)/r.height*cv.height);
      if(x>=0&&y>=0&&x<cv.width&&y<cv.height) on=ctx.getImageData(x,y,1,1).data[3]>40;
    }
    tree.classList.toggle('glow',on);
  });
  hero.addEventListener('mouseleave',function(){ tree.classList.remove('glow'); });
})();

/* phone: the tree runs from the bottom of the hero up to the bottom of the centre logo */
(function(){
  var hero=document.querySelector('.hero'), cue=document.querySelector('.hero-card .mark');
  if(!hero||!cue) return;
  function place(){
    var h=hero.getBoundingClientRect(), c=cue.getBoundingClientRect();
    hero.style.setProperty('--cue-th',Math.max(80,Math.round(h.bottom-c.bottom))+'px');
  }
  place(); window.addEventListener('resize',place); window.addEventListener('load',place);
  if(cue.complete===false) cue.addEventListener('load',place);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(place);
})();
