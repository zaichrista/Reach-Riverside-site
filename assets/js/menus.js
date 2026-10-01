(function(){
  var root=document.getElementById('menu-root'); if(!root||!window.MENU) return;
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function money(p){
    if(!p) return '';
    return p.split('|').map(function(x){x=x.trim(); return x?('£'+x):''}).filter(Boolean).join(' | ');
  }
  function tags(t){return t?'<span class="tags" aria-label="Dietary: '+esc(t.replace(/V G/,'VG'))+'">'+esc(t.split(' ').join(' · '))+'</span>':''}
  var html='', last='';
  window.MENU.forEach(function(s){
    if(s.group!==last){html+='<div class="menu-label">'+esc(s.group)+'</div>'; last=s.group;}
    var body='';
    if(s.note) body+='<p class="mh-note">'+esc(s.note)+'</p>';
    if(s.wine) body+='<div class="wine-head"><span></span><span>'+esc(s.head[0])+'</span><span>'+esc(s.head[1])+'</span></div>';
    s.items.forEach(function(it){
      if(typeof it==='string'){ body+='<p class="mh-sub">'+esc(it.slice(1))+'</p>'; return; }
      if(s.wine){
        body+='<div class="mrow wine"><span class="n">'+esc(it[0])+'</span><span class="p">'+(it[2]?'£'+esc(it[2]):'')+'</span><span class="p">£'+esc(it[3])+'</span><span class="d">'+esc(it[1])+'</span></div>';
      } else {
        body+='<div class="mrow"><span class="n">'+esc(it[0])+tags(it[3])+'</span><span class="p">'+esc(money(it[1]))+'</span>'+(it[2]?'<span class="d">'+esc(it[2])+'</span>':'')+'</div>';
      }
    });
    html+='<section class="mh" id="'+s.id+'" data-open="false"><button type="button" aria-expanded="false" aria-controls="p-'+s.id+'">'+esc(s.title)+'</button>'+
          '<div class="mh-panel" id="p-'+s.id+'" role="region"><div><div class="mh-inner">'+body+'</div></div></div></section>';
  });
  root.innerHTML=html;
  var secs=[].slice.call(root.querySelectorAll('.mh'));
  function setOpen(sec,open,scroll){
    sec.dataset.open=open?'true':'false';
    sec.querySelector('button').setAttribute('aria-expanded',open?'true':'false');
    if(open&&scroll){ setTimeout(function(){ var y=sec.getBoundingClientRect().top+window.scrollY-84; window.scrollTo({top:y,behavior:'smooth'}); },60); }
  }
  secs.forEach(function(sec){
    sec.querySelector('button').addEventListener('click',function(){
      var willOpen=sec.dataset.open!=='true';
      secs.forEach(function(o){ if(o!==sec) setOpen(o,false); });
      setOpen(sec,willOpen,willOpen);
      if(willOpen&&history.replaceState) history.replaceState(null,'','#'+sec.id);
    });
  });
  function fromHash(){
    var id=location.hash.slice(1); var sec=id&&document.getElementById(id);
    if(sec&&sec.classList.contains('mh')){ secs.forEach(function(o){ setOpen(o,o===sec); }); setTimeout(function(){ var y=sec.getBoundingClientRect().top+window.scrollY-84; window.scrollTo({top:y,behavior:'smooth'}); },350); }
  }
  window.addEventListener('hashchange',fromHash); fromHash();
})();
