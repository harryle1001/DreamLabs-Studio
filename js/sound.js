/* Dream Labs — nhạc nền trong video (nhạc tự tổng hợp: tools/music/).
   · Video tự chạy (class "av" / thuộc tính muted) luôn chạy KHÔNG tiếng; nút loa nhỏ trên video để bật/tắt tiếng.
   · Video khách bấm phát (Phòng mẫu, "Xem phim"): có tiếng ngay, nhạc tăng dần trong 1 giây (trừ khi khách đã tắt tiếng).
   · Một lúc chỉ một video có tiếng; lựa chọn bật/tắt của khách nhớ trong localStorage "dl-sound".
   · iOS Safari: bật tiếng chỉ sau chạm (đúng luật trình duyệt); volume chỉ đọc nên không có fade, vẫn phát bình thường. */
(()=>{
const D=window.DL||{},T=(s,v)=>D.t?D.t(s,v):s,K='dl-sound';
const pref=()=>{try{return localStorage.getItem(K)}catch(e){return null}},save=v=>{try{localStorage.setItem(K,v)}catch(e){}};
let act=0;['pointerdown','keydown','touchend'].forEach(t=>addEventListener(t,()=>{act=Date.now()},true));
const gesture=()=>!!(navigator.userActivation&&navigator.userActivation.isActive)||Date.now()-act<1500;
const auto=v=>v.classList.contains('av')||v.hasAttribute('muted');
const vids=()=>[...document.querySelectorAll('video')];

const raf=new WeakMap();
const fade=(v,to,ms,done)=>{cancelAnimationFrame(raf.get(v));const from=v.volume,t0=performance.now();
  const step=n=>{const k=Math.min(1,(n-t0)/ms);try{v.volume=from+(to-from)*k*k*(3-2*k)}catch(e){}
    if(k<1)raf.set(v,requestAnimationFrame(step));else done&&done()};
  raf.set(v,requestAnimationFrame(step))};
const hush=v=>fade(v,0,250,()=>{v.muted=true;try{v.volume=1}catch(e){}});
/* chỉ video v có tiếng */
const solo=v=>vids().forEach(o=>{if(o!==v&&!o.muted)hush(o)});
const loud=v=>{solo(v);try{v.volume=0}catch(e){}v.muted=false;fade(v,1,1000)};

const SVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" fill="currentColor"/><path class="snd-x" d="M10.6 6.1l3.8 3.8m0-3.8l-3.8 3.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg><span class="snd-w" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const sync=v=>{const b=v._snd;if(!b)return;const on=!v.muted;
  b.classList.toggle('on',on);b.classList.toggle('play',on&&!v.paused&&!v.ended);
  b.setAttribute('aria-pressed',on);const l=T(on?'Tắt tiếng':'Bật tiếng');b.setAttribute('aria-label',l);b.title=l};

function attach(v){
  if(v._snd||!v.parentElement)return;
  const h=(v.closest('button,a')||v).parentElement;if(!h)return;
  if(getComputedStyle(h).position==='static')h.classList.add('snd-rel');
  const b=document.createElement('button');b.type='button';b.className='snd';b.hidden=true;b.innerHTML=SVG;
  h.appendChild(b);v._snd=b;sync(v);
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();
    if(v.muted||v.paused){save('on');loud(v);if(v.paused){const p=v.play();p&&p.catch&&p.catch(()=>{})}}
    else{save('off');hush(v)}});
  let was=v.muted;/* khách bật tiếng bằng điều khiển gốc của trình duyệt cũng chỉ giữ một video có tiếng */
  ['volumechange','play','pause','ended'].forEach(t=>v.addEventListener(t,()=>{if(was&&!v.muted)solo(v);was=v.muted;sync(v)}));
  /* nút hiện khi video đã chạy (thẻ mẫu chưa vào khung nhìn / phim chưa bấm phát thì chưa cần) */
  const show=()=>{b.hidden=false;sync(v)};v.readyState>2&&!v.paused?show():v.addEventListener('playing',show,{once:true})}

/* video khách chủ động phát (không phải video tự chạy): có tiếng + fade in, trừ khi khách đã chọn tắt tiếng */
document.addEventListener('play',e=>{const v=e.target;if(!(v instanceof HTMLVideoElement))return;attach(v);
  if(auto(v)){if(!v.muted)solo(v);return}
  if(pref()==='off'||!gesture())v.muted=true;else loud(v)},true);

const scan=n=>{if(n.nodeType!==1)return;n.tagName==='VIDEO'?attach(n):n.querySelectorAll&&n.querySelectorAll('video').forEach(attach)};
const boot=()=>{scan(document.body);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(scan))).observe(document.body,{childList:true,subtree:true})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
