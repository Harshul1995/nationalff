(function(){
var items=[].slice.call(document.querySelectorAll('.nrh-gi')),vcs=[].slice.call(document.querySelectorAll('.nrh-vc')),tagBar=document.getElementById('nrh-tags'),empty=document.getElementById('nrh-gal-empty');
var lb=document.getElementById('nrh-lb'),img=document.getElementById('nrh-lb-img'),vm=document.getElementById('nrh-vm'),vv=document.getElementById('nrh-vm-v'),moreBtn=document.getElementById('nrh-more'),moreN=document.getElementById('nrh-more-n'),vsec=document.getElementById('more-videos');
var cur=-1,lastFocus=null,PH='919825290860',PAGE=36,limit=PAGE,tag='all';
function has(f,t){return t==='all'||(' '+f.dataset.tags+' ').indexOf(' '+t+' ')>-1;}
function filtered(){return items.filter(function(f){return has(f,tag);});}
var all=tagBar.querySelector('[data-tag=all]'); all.querySelector('b').textContent='('+items.length+')';
[].slice.call(tagBar.querySelectorAll('.nrh-tag')).forEach(function(b){var t=b.dataset.tag;if(t==='all')return;var n=items.filter(function(f){return has(f,t);}).length;if(n){b.hidden=false;b.querySelector('b').textContent='('+n+')';}});
function render(){var F=filtered();items.forEach(function(f){f.hidden=true;});F.slice(0,limit).forEach(function(f){f.hidden=false;});
  empty.hidden=F.length>0;var rest=F.length-limit;moreBtn.parentNode.hidden=rest<=0;if(rest>0){moreBtn.textContent='Show '+Math.min(PAGE,rest)+' more photos';moreN.textContent=rest+' more in this category';}
  var vis=0;vcs.forEach(function(c){var ok=has(c,tag);c.hidden=!ok;if(ok)vis++;});vsec.hidden=vis===0;}
function setTag(t,push){tag=t;limit=PAGE;[].slice.call(tagBar.querySelectorAll('.nrh-tag')).forEach(function(b){b.classList.toggle('on',b.dataset.tag===t);b.setAttribute('aria-pressed',b.dataset.tag===t);});render();
  if(push&&history.replaceState)history.replaceState(null,'',t==='all'?location.pathname:'#'+t);}
tagBar.addEventListener('click',function(e){var b=e.target.closest('.nrh-tag');if(b&&!b.hidden)setTag(b.dataset.tag,true);});
moreBtn.addEventListener('click',function(){limit+=PAGE;render();});
// photo lightbox (navigates every photo in the current tag, not only the ones shown)
function show(i){var v=filtered();if(!v.length)return;cur=(i+v.length)%v.length;var f=v[cur];img.src=f.dataset.full;img.alt=f.dataset.title+' - '+f.dataset.desc;
  document.getElementById('nrh-lb-t').textContent=f.dataset.title;document.getElementById('nrh-lb-d').textContent=f.dataset.desc;document.getElementById('nrh-lb-c').textContent=(cur+1)+' / '+v.length;
  document.getElementById('nrh-lb-wa').href='https://wa.me/'+PH+'?text='+encodeURIComponent('Hello, I saw "'+f.dataset.title+'" in your gallery and would like to enquire.');
  if(history.replaceState)history.replaceState(null,'',location.pathname+'#'+f.id);
  [v[(cur+1)%v.length],v[(cur-1+v.length)%v.length]].forEach(function(x){(new Image()).src=x.dataset.full;});}
function open(i){lastFocus=document.activeElement;lb.hidden=false;document.body.classList.add('nrh-lb-open');show(i);lb.querySelector('.nrh-lb-x').focus();}
function close(){lb.hidden=true;document.body.classList.remove('nrh-lb-open');img.removeAttribute('src');if(history.replaceState)history.replaceState(null,'',location.pathname);if(lastFocus)lastFocus.focus();}
document.getElementById('nrh-masonry').addEventListener('click',function(e){var a=e.target.closest('.nrh-gi a');if(!a)return;e.preventDefault();open(filtered().indexOf(a.parentNode));});
lb.querySelector('.nrh-lb-x').onclick=close;lb.querySelector('.next').onclick=function(){show(cur+1);};lb.querySelector('.prev').onclick=function(){show(cur-1);};
lb.addEventListener('click',function(e){if(e.target===lb)close();});
var sx=0;lb.addEventListener('touchstart',function(e){sx=e.changedTouches[0].clientX;},{passive:true});lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(cur+(d<0?1:-1));},{passive:true});
// video player modal
function openV(c){lastFocus=document.activeElement;vv.poster=c.dataset.poster;vv.src=c.dataset.src;vv.style.aspectRatio=c.dataset.w+'/'+c.dataset.h;document.getElementById('nrh-vm-t').textContent=c.dataset.title;vm.hidden=false;document.body.classList.add('nrh-lb-open');vm.querySelector('.nrh-lb-x').focus();var p=vv.play();if(p&&p.catch)p.catch(function(){});}
function closeV(){vv.pause();vv.removeAttribute('src');vv.load();vm.hidden=true;document.body.classList.remove('nrh-lb-open');if(lastFocus)lastFocus.focus();}
document.getElementById('nrh-vgrid').addEventListener('click',function(e){var c=e.target.closest('.nrh-vc');if(c)openV(c);});
vm.querySelector('.nrh-lb-x').onclick=closeV;vm.addEventListener('click',function(e){if(e.target===vm)closeV();});
document.addEventListener('keydown',function(e){
  if(!vm.hidden){if(e.key==='Escape')closeV();return;}
  if(lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')show(cur+1);else if(e.key==='ArrowLeft')show(cur-1);
  else if(e.key==='Tab'){var f=[].slice.call(lb.querySelectorAll('button,a[href]')).filter(function(x){return x.offsetParent;});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
// featured intro video: big play button
var iv=document.getElementById('nrh-showreel'),pb=document.getElementById('nrh-vplay');
if(iv&&pb){pb.addEventListener('click',function(){iv.play();});iv.addEventListener('play',function(){pb.hidden=true;});iv.addEventListener('pause',function(){if(!iv.ended)pb.hidden=false;});iv.addEventListener('ended',function(){pb.hidden=false;});}
// deep links: #sofa (filter), #p-sofa1 (photo), #showreel
function route(){var h=location.hash.slice(1);if(!h)return;var f=document.getElementById(h);
  if(h.indexOf('p-')===0&&f&&f.classList.contains('nrh-gi')){setTag('all',false);var F=filtered(),ix=F.indexOf(f);if(ix>=limit){limit=ix+1;render();}setTimeout(function(){open(ix);},250);}
  else if(tagBar.querySelector('[data-tag="'+h+'"]:not([hidden])')){setTag(h,false);document.getElementById('photos').scrollIntoView();}}
setTag('all',false);route();
})();
