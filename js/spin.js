/* Dream Labs — trình xem 360 độ dùng chung (bộ khung ảnh img/spin/<slug>/001.webp…).
   DL.spin(host,{dir,frames,loop,arc,rev,title,kicker,tone,hotspots,auto,intro,start}) → {node,destroy,play,pause,go,frame,playing}
   - dir: thư mục khung (kết thúc bằng /) · frames: số khung · loop: vòng kín (false = xoay qua lại, arc = số độ quét được)
   - rev: true nếu khung tăng dần làm mặt trước trôi sang trái · tone: 'dark' | 'light' (màu chữ phủ trên ảnh)
   - hotspots: [{a: góc 0..1, w: nửa bề rộng 0..1 (mặc định .1), x, y: vị trí %, p: [[góc,x,y]…] nếu điểm trôi theo góc, t: nhãn, d: mô tả ngắn, side: 'l' | 'r'}]
   Kéo chuột / vuốt ngang (vẫn cuộn dọc được), quán tính, tự xoay tới khi chạm, phím mũi tên, thanh góc, chỉ tải khung khi vào khung nhìn. */
(()=>{
const D=window.DL=window.DL||{};
const RMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2;                       /* in-out bậc 4: lấy đà chậm, dừng êm */
const PLAY='<svg viewBox="0 0 16 16" aria-hidden="true"><path class="spin-i-play" d="M5.5 3.2v9.6L13 8z"/><path class="spin-i-pause" d="M4.6 3.2h2.3v9.6H4.6zM9.1 3.2h2.3v9.6H9.1z"/></svg>';
const HAND='<svg viewBox="0 0 34 16" aria-hidden="true"><path d="M9 3.5 4 8l5 4.5M25 3.5 30 8l-5 4.5M4.5 8h25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

D.spin=function(host,o){
  o=o||{};
  const N=Math.max(2,o.frames|0),loop=o.loop!==false,arc=loop?360:(+o.arc||120),sgn=o.rev?-1:1,dir=String(o.dir||''),RM=RMQ.matches;
  const name=String(o.title||'').split(/\s[—–-]\s/)[0].trim(),hs=(Array.isArray(o.hotspots)?o.hotspots:[]).filter(h=>h&&h.t);
  const node=document.createElement('div');node.className='spin is-load';node.tabIndex=0;node.dataset.tone=o.tone==='light'?'light':'dark';
  node.setAttribute('role','group');const T=(window.DL&&DL.t)||(s=>s);node.setAttribute('aria-roledescription',T('trình xem 360 độ'));
  node.setAttribute('aria-label',(o.title?o.title+'. ':'')+T('Kéo ngang hoặc dùng phím mũi tên trái, phải để xoay sản phẩm.'));
  node.innerHTML=`<canvas class="spin-cv" role="img" aria-label="${esc((o.title||T('Sản phẩm'))+', '+T(loop?'ảnh xoay 360 độ':'ảnh xoay nhiều góc'))}"></canvas>
   ${name?`<div class="spin-tape" aria-hidden="true"><span>${(esc(name)+'<i>✦</i>').repeat(6)}</span></div>`:''}
   <i class="spin-sheen" aria-hidden="true"></i>
   <div class="spin-head"><span class="spin-k"><b>${loop?'360°':T('Đa góc')}</b>${o.kicker?esc(o.kicker):''}</span>${name?`<span class="spin-t" aria-hidden="true">${[...name].map((c,i)=>c===' '?' ':`<i style="--i:${i}">${esc(c)}</i>`).join('')}</span>`:''}</div>
   <div class="spin-hs">${hs.map((h,i)=>`<div class="spin-h" data-h="${i}" data-side="${h.side==='l'||(h.side!=='r'&&+h.x>56)?'l':'r'}" style="left:${+h.x||50}%;top:${+h.y||50}%"><i></i><p style="max-width:min(40cqw,calc(${h.side==='l'||(h.side!=='r'&&+h.x>56)?+h.x||50:100-(+h.x||50)}cqw - 50px))"><b>${esc(h.t)}</b>${h.d?`<small>${esc(h.d)}</small>`:''}</p></div>`).join('')}</div>
   <p class="spin-hint" aria-hidden="true">${HAND}<span>${T('Kéo để xoay')}</span></p>
   <p class="spin-msg" hidden>${T('Bộ ảnh xoay chưa tải được ở đây.')}</p>
   <div class="spin-prog" aria-hidden="true"><i></i></div>
   <div class="spin-bar"><button class="spin-pp" type="button" aria-label="${T('Tự xoay')}" aria-pressed="false">${PLAY}</button>
    <div class="spin-track" role="slider" tabindex="0" aria-label="${T('Góc xoay')}" aria-valuemin="0" aria-valuemax="${arc}" aria-valuenow="0" aria-valuetext="${T('{d} độ',{d:0})}"><i class="spin-thumb"></i></div>
    <output class="spin-deg" aria-hidden="true">0°</output></div>`;
  host.append(node);
  const q=s=>node.querySelector(s),cv=q('.spin-cv'),ctx=cv.getContext('2d'),tape=q('.spin-tape span'),sheen=q('.spin-sheen'),pp=q('.spin-pp'),track=q('.spin-track'),thumb=q('.spin-thumb'),deg=q('.spin-deg'),prog=q('.spin-prog i'),hsEl=[...node.querySelectorAll('.spin-h')];
  const imgs=new Array(N),MAXI=loop?N:N-1;
  const F0=Math.max(0,Math.min(N-1,Math.round(+o.start||0)));
  let pos=F0,vel=0,shown=-1,count=0,fail=0,started=false,visible=false,dead=false,raf=0,last=0,playing=false,touched=false,intro=null,drag=null,swing=1,dirty=true,hinted=false;
  const AUTO=N/(loop?16000:9000);                                            /* khung mỗi ms: một vòng 16 giây */

  /* ── tải khung: khung đầu trước, rồi thưa tới dày để kéo sớm vẫn có khung gần nhất ── */
  const order=()=>{const out=[F0],seen=new Set([F0]);for(let s=8;s>=1;s>>=1)for(let i=0;i<N;i+=s)if(!seen.has(i)){seen.add(i);out.push(i)}return out};
  const src=i=>dir+String(i+1).padStart(3,'0')+'.webp';
  function load(){
    if(started)return;started=true;const queue=order();let active=0;
    const next=()=>{if(dead)return;while(active<5&&queue.length){const i=queue.shift(),im=new Image();active++;im.decoding='async';
      const done=ok=>{active--;if(dead)return;if(ok){imgs[i]=im;count++}else{fail++;if(i===F0){node.classList.add('is-bad');q('.spin-msg').hidden=false}}
        prog.style.transform=`scaleX(${(count+fail)/N})`;
        if(i===F0&&ok)node.classList.add('is-first');
        if(count+fail===N){node.classList.remove('is-load');node.classList.add('is-ready');ready()}
        dirty=true;kick();next()};
      im.onload=()=>{im.decode&&!coarse?im.decode().then(()=>done(true),()=>done(true)):done(true)};im.onerror=()=>done(false);im.src=src(i)}};
    next()}
  const coarse=window.matchMedia&&matchMedia('(pointer: coarse)').matches;
  const wrap=p=>loop?((p%N)+N)%N:clamp(p,0,N-1);
  const nearest=i=>{for(let d=0;d<N;d++){const a=loop?(i+d)%N:i+d,b=loop?(i-d+N)%N:i-d;if(a<N&&imgs[a])return a;if(b>=0&&imgs[b])return b}return -1};

  /* ── vẽ ── */
  function size(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const k=Math.min(Math.min(window.devicePixelRatio||1,2),1200/Math.max(w,h)),W=Math.round(w*k),H=Math.round(h*k);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;shown=-1;dirty=true;kick()}}
  function paint(){
    const f=wrap(pos),i=nearest(Math.round(f)%N);
    if(i>=0&&(i!==shown||dirty)&&cv.width){const im=imgs[i],s=Math.max(cv.width/im.naturalWidth,cv.height/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
      ctx.drawImage(im,(cv.width-w)/2,(cv.height-h)/2,w,h);shown=i}
    dirty=false;
    const fr=f/MAXI,d=Math.round(fr*arc)%(loop?360:361);
    thumb.style.left=(fr*100).toFixed(2)+'%';deg.textContent=d+'°';track.setAttribute('aria-valuenow',d);track.setAttribute('aria-valuetext',T('{d} độ',{d}));
    if(tape)tape.style.transform=`translate3d(${(-50+((sgn*f/N*2)%1+1)%1*100/6).toFixed(3)}%,0,0)`;
    for(let k=0;k<hs.length;k++){const h=hs[k],c=(+h.a||0)*MAXI,w=(h.w==null?.1:+h.w)*N;let dd=Math.abs(f-c);if(loop)dd=Math.min(dd,N-dd);if(h.p){const P=h.p,u=f/MAXI;let j=0;while(j<P.length-2&&u>P[j+1][0])j++;const A=P[j],B=P[j+1]||A,t=clamp((u-A[0])/((B[0]-A[0])||1),0,1);hsEl[k].style.left=(A[1]+(B[1]-A[1])*t).toFixed(2)+'%';hsEl[k].style.top=(A[2]+(B[2]-A[2])*t).toFixed(2)+'%'}
      hsEl[k].classList.toggle('is-on',dd<=w&&!node.classList.contains('is-load'))}}

  /* ── vòng lặp: chỉ chạy khi có chuyển động ── */
  function tick(now){
    raf=0;if(dead)return;const dt=Math.min(64,now-(last||now));last=now;let alive=false;
    if(intro){const t=clamp((now-intro.t0)/intro.dur,0,1);
      pos=loop?intro.p0+sgn*ease(t)*N:(t<.5?ease(t*2):1-ease(t*2-1))*(N-1);
      if(!intro.sh&&t>.3){intro.sh=1;flash()}
      if(t>=1){pos=intro.p0;intro=null;vel=0;node.classList.add('is-hint')}alive=true}
    else if(!drag){
      const target=playing?AUTO*sgn*swing:0;vel+=(target-vel)*(1-Math.exp(-dt/(playing?520:340)));
      if(Math.abs(vel)>.0004||playing){pos+=vel*dt;
        if(!loop&&(pos<=0||pos>=N-1)){pos=clamp(pos,0,N-1);vel=0;if(playing)swing=pos<=0?sgn:-sgn}
        alive=true}else vel=0}
    pos=loop?wrap(pos):pos;paint();
    if(alive&&visible)raf=requestAnimationFrame(tick);else last=0}
  const kick=()=>{if(!raf&&!dead&&(visible||dirty))raf=requestAnimationFrame(tick)};
  const flash=()=>{sheen.classList.remove('is-go');void sheen.offsetWidth;sheen.classList.add('is-go')};
  const setPlay=on=>{playing=!!on;pp.setAttribute('aria-pressed',String(playing));pp.setAttribute('aria-label',playing?T('Dừng tự xoay'):T('Tự xoay'));node.classList.toggle('is-play',playing);if(playing)intro=null;kick()};
  const touch=()=>{touched=true;intro=null;if(!hinted){hinted=true;node.classList.add('is-used')}};
  /* đủ khung + đang trong khung nhìn: xoay một vòng giới thiệu rồi tự xoay chậm */
  function ready(){
    if(node.classList.contains('is-in')||!visible||!node.classList.contains('is-ready'))return;
    node.classList.add('is-in');
    if(RM||o.intro===false||touched){node.classList.add('is-hint');if(!RM&&!touched&&o.auto!==false)setPlay(true);kick();return}
    intro={t0:performance.now()+260,dur:loop?2900:3400,p0:pos};
    if(o.auto!==false){playing=true;pp.setAttribute('aria-pressed','true');pp.setAttribute('aria-label',T('Dừng tự xoay'));node.classList.add('is-play')}
    kick()}

  /* ── kéo / vuốt ── */
  const stageDown=e=>{
    if(e.button||e.target.closest('.spin-bar'))return;
    drag={id:e.pointerId,x:e.clientX,p:pos,t:e.timeStamp,vx:0,moved:false};touch();vel=0;node.classList.add('is-drag');
    try{node.setPointerCapture(e.pointerId)}catch(_){}};
  const stageMove=e=>{
    if(!drag||e.pointerId!==drag.id)return;const w=node.clientWidth||1,dx=e.clientX-drag.x;
    if(!drag.moved&&Math.abs(dx)<3)return;drag.moved=true;
    const np=drag.p+sgn*dx/w*N*(loop?.82:.9),dt=Math.max(1,e.timeStamp-drag.t),raw=(np-pos)/dt;
    drag.vx=drag.vx*.6+raw*.4;drag.t=e.timeStamp;drag.x=e.clientX;drag.p=np;pos=loop?np:clamp(np,0,N-1);if(!loop)drag.p=pos;
    if(playing)setPlay(false);kick()};
  const stageUp=e=>{
    if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;node.classList.remove('is-drag');
    if(d.moved&&e.type==='pointerup'&&e.timeStamp-d.t<90){vel=RM?0:clamp(d.vx,-N/260,N/260);if(Math.abs(vel)>N/2600)flash()}
    else if(playing&&d.moved)setPlay(false);
    last=0;kick()};
  node.addEventListener('pointerdown',stageDown);node.addEventListener('pointermove',stageMove);node.addEventListener('pointerup',stageUp);node.addEventListener('pointercancel',stageUp);
  node.addEventListener('dragstart',e=>e.preventDefault());

  /* ── thanh góc ── */
  let tdrag=false;
  const seek=e=>{const r=track.getBoundingClientRect();pos=clamp((e.clientX-r.left)/r.width,0,1)*MAXI;if(loop&&pos>=N)pos=N-.001;vel=0;kick()};
  track.addEventListener('pointerdown',e=>{if(e.button)return;tdrag=true;touch();setPlay(false);try{track.setPointerCapture(e.pointerId)}catch(_){}seek(e);e.stopPropagation()});
  track.addEventListener('pointermove',e=>{if(tdrag)seek(e)});
  const tEnd=()=>{tdrag=false};track.addEventListener('pointerup',tEnd);track.addEventListener('pointercancel',tEnd);
  pp.addEventListener('click',()=>{touch();setPlay(!playing)});

  /* ── bàn phím ── */
  node.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;const k=e.key,big=Math.max(1,Math.round(N/12));let d=null;
    if(k==='ArrowRight'||k==='ArrowUp')d=e.shiftKey?big:1;else if(k==='ArrowLeft'||k==='ArrowDown')d=-(e.shiftKey?big:1);
    else if(k==='PageUp')d=big;else if(k==='PageDown')d=-big;
    else if(k==='Home'){d=0;pos=0}else if(k==='End'){d=0;pos=N-1}
    else if((k===' '||k==='Enter')&&e.target!==pp){e.preventDefault();e.stopPropagation();touch();setPlay(!playing);return}
    if(d==null)return;
    if((k==='ArrowUp'||k==='ArrowDown')&&e.target!==track)return;
    e.preventDefault();e.stopPropagation();touch();setPlay(false);vel=0;pos=wrap(Math.round(pos)+d*sgn);dirty=true;kick()});

  /* ── khung nhìn + kích thước ── */
  const io=window.IntersectionObserver?new IntersectionObserver(es=>{for(const en of es){visible=en.isIntersecting;if(visible){load();size();ready();kick()}}},{rootMargin:'160px 0px'}):null;
  if(io)io.observe(node);else{visible=true;load()}
  const ro=window.ResizeObserver?new ResizeObserver(size):null;ro&&ro.observe(cv);size();
  if(RM)node.classList.add('is-rm');
  if(o.start!=null&&o.intro===false){hinted=true;node.classList.add('is-used')}   /* dựng lại khi đổi mẫu mã: không nhắc kéo lần nữa */

  return{node,
    play(){setPlay(true)},pause(){setPlay(false)},
    go(i){pos=wrap(+i||0);vel=0;dirty=true;kick()},frame(){return Math.round(wrap(pos))%N},playing(){return playing},
    destroy(){dead=true;cancelAnimationFrame(raf);io&&io.disconnect();ro&&ro.disconnect();for(const im of imgs)if(im)im.onload=im.onerror=null;imgs.length=0;node.remove()}};
};
})();
