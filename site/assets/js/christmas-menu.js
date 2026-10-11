/* the closing enquiry window holds centred in the space below the (scrolled) menu bar; one too tall for that holds with its bottom edge showing */
(function(){
  var w=document.querySelector('.x-hold>.x-window'); if(!w) return;
  function fit(){ var nav=window.innerWidth<=640?66:88, h=w.offsetHeight, room=window.innerHeight-nav-h; w.style.top=(room>=32?nav+room/2:Math.min(nav+16,window.innerHeight-h-16))+'px'; }
  fit(); window.addEventListener('resize',fit); window.addEventListener('load',fit);
  if(window.ResizeObserver) new ResizeObserver(fit).observe(w);
})();
