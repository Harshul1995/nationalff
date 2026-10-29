(function(){
var box=document.getElementById('nrh-gr'); if(!box) return;
var MAPS=box.querySelector('.nrh-gr-btn').href;
function stars(n,size){var s='';for(var i=1;i<=5;i++){s+='<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" class="'+(i<=Math.round(n)?'on':'off')+'" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"/></svg>';}return s;}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){if(ctl)ctl.abort();},6000);
fetch('/.netlify/functions/google-reviews',{headers:{Accept:'application/json'},signal:ctl?ctl.signal:undefined})
.then(function(r){if(!r.ok)throw new Error('off');return r.json();})
.then(function(d){
  clearTimeout(to);
  if(typeof d.rating==='number'&&d.count){document.getElementById('nrh-gr-score').textContent=d.rating.toFixed(1);document.getElementById('nrh-gr-count').textContent=d.count;var st=document.getElementById('nrh-gr-stars');st.innerHTML=stars(d.rating,26);st.setAttribute('aria-label','Rated '+d.rating.toFixed(1)+' out of 5');}
  var rv=(d.reviews||[]).filter(function(v){return v&&v.text&&v.rating>=4;}).slice(0,6); if(!rv.length) return;
  var list=document.getElementById('nrh-gr-list'); list.innerHTML='';
  rv.forEach(function(v){
    var c=el('article','nrh-gr-rev'),h=el('div','nrh-gr-rh');
    if(v.photo){var im=el('img');im.src=v.photo;im.alt='';im.width=40;im.height=40;im.referrerPolicy='no-referrer';im.loading='lazy';h.appendChild(im);}
    var w=el('div'),a=el(v.authorUrl?'a':'strong','nrh-gr-au',v.author||'Google user'); if(v.authorUrl){a.href=v.authorUrl;a.target='_blank';a.rel='noopener';} w.appendChild(a); w.appendChild(el('span','nrh-gr-when',v.when||'')); h.appendChild(w);
    var s=el('div','nrh-gr-rs');s.innerHTML=stars(v.rating,16);
    var tx=v.text.length>230?v.text.slice(0,227).replace(/\s+\S*$/,'')+'\u2026':v.text;
    c.appendChild(h);c.appendChild(s);c.appendChild(el('p','nrh-gr-tx',tx));
    if(v.text.length>230){var m=el('a','nrh-gr-more','Read more on Google');m.href=MAPS;m.target='_blank';m.rel='noopener';c.appendChild(m);}
    list.appendChild(c);
  });
  list.hidden=false; box.classList.add('has-list');
}).catch(function(){clearTimeout(to);});
})();
