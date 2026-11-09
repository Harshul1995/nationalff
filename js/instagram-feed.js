(function(){
var box=document.getElementById('nrh-ig'); if(!box) return;
var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){if(ctl)ctl.abort();},6000);
fetch('/.netlify/functions/instagram-feed',{headers:{Accept:'application/json'},signal:ctl?ctl.signal:undefined})
.then(function(r){if(!r.ok)throw new Error('off');return r.json();})
.then(function(d){
  clearTimeout(to); var posts=(d&&d.posts||[]).filter(function(p){return p&&p.img&&p.link;}).slice(0,6); if(posts.length<3) return;
  var sec=document.getElementById('instagram'),grid=document.getElementById('nrh-ig-grid'); grid.innerHTML='';
  posts.forEach(function(p){
    var a=document.createElement('a'); a.className='nrh-ig-tile'; a.href=p.link; a.target='_blank'; a.rel='noopener'; a.setAttribute('aria-label','View this post on Instagram');
    var im=document.createElement('img'); im.src=p.img; im.alt=(p.caption||'National Foam & Fabrics on Instagram').slice(0,110); im.loading='lazy'; im.width=400; im.height=400; im.referrerPolicy='no-referrer';
    var ov=document.createElement('span'); ov.className='nrh-ig-ov'; ov.innerHTML=p.video?'<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>':'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/></svg>';
    a.appendChild(im); a.appendChild(ov); grid.appendChild(a);
  });
  sec.hidden=false; box.classList.add('live');
}).catch(function(){clearTimeout(to);});
})();
