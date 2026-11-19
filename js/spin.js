/* Dream Labs — trình xem 360 độ dùng chung.
   DL.spin(host,{dir,frames,loop,arc,rev,title,kicker,tone,hotspots,auto,intro,start,v2,ground,hiStep}) → {node,destroy,play,pause,go,frame,playing}
   Hai định dạng bộ khung:
   - v2 (v2:true): sản phẩm cắt nền. dir/bg.webp (ảnh nền), dir/l/NNN.webp (khung nhỏ, đủ bộ, dùng khi xoay), dir/h/NNN.webp (khung nét, cách hiStep khung, dùng khi dừng và phóng to).
     Trình xem tự vẽ nền, quầng sáng, bóng đổ và cho sản phẩm bồng bềnh; ground = [y% mặt đất, bề rộng % chân vật].
   - cũ: dir/NNN.webp nền liền (ảnh quay thật, mẫu quét): vẫn có nội suy khung và kính phóng, không bồng bềnh.
   - dir: thư mục khung (kết thúc bằng /) · frames: số khung · loop: vòng kín (false = xoay qua lại, arc = số độ quét được)
   - rev: true nếu khung tăng dần làm mặt trước trôi sang trái · tone: 'dark' | 'light' (màu chữ phủ trên ảnh)
   - hotspots: [{a: góc 0..1, w: nửa bề rộng 0..1 (mặc định .1), x, y: vị trí %, p: [[góc,x,y]…] nếu điểm trôi theo góc, t: nhãn, d: mô tả ngắn, side: 'l' | 'r'}]
   Kéo chuột / vuốt ngang (vẫn cuộn dọc được) có quán tính, hai khung kề nhau được hòa vào nhau nên xoay liền mạch, tự xoay tới khi chạm,
   dừng thì trượt nhẹ về khung nét gần nhất, giữ chuột / chạm giữ để soi kính phóng, phím mũi tên, thanh góc, chỉ tải khung khi vào khung nhìn. */
(()=>{
const D=window.DL=window.DL||{};
const RMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2;                       /* in-out bậc 4: lấy đà chậm, dừng êm */
const PLAY='<svg viewBox="0 0 16 16" aria-hidden="true"><path class="spin-i-play" d="M5.5 3.2v9.6L13 8z"/><path class="spin-i-pause" d="M4.6 3.2h2.3v9.6H4.6zM9.1 3.2h2.3v9.6H9.1z"/></svg>';
const HAND='<svg viewBox="0 0 34 16" aria-hidden="true"><path d="M9 3.5 4 8l5 4.5M25 3.5 30 8l-5 4.5M4.5 8h25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LENS='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.2 10.2 13.6 13.6M7 5.2v3.6M5.2 7h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const TAU=Math.PI*2,FLOAT_MS=5200,ZOOM=2.6;

D.spin=function(host,o){
  o=o||{};
  if(o.depth&&D.real)return D.real(host,o);                                  /* ảnh chụp thật 2.5D: js/real.js */
  const N=Math.max(2,o.frames|0),loop=o.loop!==false,arc=loop?360:(+o.arc||120),sgn=o.rev?-1:1,dir=String(o.dir||''),RM=RMQ.matches;
  const V2=!!o.v2,HS=V2?Math.max(1,o.hiStep|0||2):0,GR=Array.isArray(o.ground)?o.ground:[78,40],light=o.tone==='light';
  const name=String(o.title||'').split(/\s[—–-]\s/)[0].trim(),hs=(Array.isArray(o.hotspots)?o.hotspots:[]).filter(h=>h&&h.t);
  const node=document.createElement('div');node.className='spin is-load'+(V2?' is-v2':'');node.tabIndex=0;node.dataset.tone=light?'light':'dark';
  node.setAttribute('role','group');const T=(window.DL&&DL.t)||(s=>s);node.setAttribute('aria-roledescription',T('trình xem 360 độ'));
  node.setAttribute('aria-label',(o.title?o.title+'. ':'')+T('Kéo ngang hoặc dùng phím mũi tên trái, phải để xoay sản phẩm.'));
  node.innerHTML=`${V2?'<i class="spin-bgp" aria-hidden="true"></i><i class="spin-aura" aria-hidden="true"></i><i class="spin-shadow" aria-hidden="true"></i>':''}<canvas class="spin-cv" role="img" aria-label="${esc((o.title||T('Sản phẩm'))+', '+T(loop?'ảnh xoay 360 độ':'ảnh xoay nhiều góc'))}"></canvas>
   ${name?`<div class="spin-tape" aria-hidden="true"><span>${(esc(name)+'<i>✦</i>').repeat(6)}</span></div>`:''}
   <i class="spin-sheen" aria-hidden="true"></i>
   <div class="spin-head"><span class="spin-k"><b>${loop?'360°':T('Đa góc')}</b>${o.kicker?esc(o.kicker):''}</span>${name?`<span class="spin-t" aria-hidden="true">${[...name].map((c,i)=>c===' '?' ':`<i style="--i:${i}">${esc(c)}</i>`).join('')}</span>`:''}</div>
   <div class="spin-hs">${hs.map((h,i)=>`<div class="spin-h" data-h="${i}" data-side="${h.side==='l'||(h.side!=='r'&&+h.x>56)?'l':'r'}" style="left:${+h.x||50}%;top:${+h.y||50}%"><i></i><p style="max-width:min(40cqw,calc(${h.side==='l'||(h.side!=='r'&&+h.x>56)?+h.x||50:100-(+h.x||50)}cqw - 50px))"><b>${esc(h.t)}</b>${h.d?`<small>${esc(h.d)}</small>`:''}</p></div>`).join('')}</div>
   <canvas class="spin-lens" aria-hidden="true"></canvas>
   <p class="spin-hint" aria-hidden="true">${HAND}<span>${T('Kéo để xoay')}</span></p>
   <p class="spin-msg" hidden>${T('Bộ ảnh xoay chưa tải được ở đây.')}</p>
   <div class="spin-prog" aria-hidden="true"><i></i></div>
   <div class="spin-bar"><button class="spin-pp" type="button" aria-label="${T('Tự xoay')}" aria-pressed="false">${PLAY}</button>
    <div class="spin-track" role="slider" tabindex="0" aria-label="${T('Góc xoay')}" aria-valuemin="0" aria-valuemax="${arc}" aria-valuenow="0" aria-valuetext="${T('{d} độ',{d:0})}"><i class="spin-thumb"></i></div>
    <output class="spin-deg" aria-hidden="true">0°</output>
    <button class="spin-zb" type="button" aria-pressed="false" aria-label="${T('Kính phóng')}">${LENS}</button></div>`;
  host.append(node);
  const q=s=>node.querySelector(s),cv=q('.spin-cv'),ctx=cv.getContext('2d'),tape=q('.spin-tape span'),sheen=q('.spin-sheen'),pp=q('.spin-pp'),zb=q('.spin-zb'),track=q('.spin-track'),thumb=q('.spin-thumb'),deg=q('.spin-deg'),prog=q('.spin-prog i'),hsBox=q('.spin-hs'),hsEl=[...node.querySelectorAll('.spin-h')],lens=q('.spin-lens'),lctx=lens.getContext('2d'),bgp=q('.spin-bgp'),aura=q('.spin-aura'),shd=q('.spin-shadow');
  if(V2){shd.style.left='50%';shd.style.top=GR[0]+'%';shd.style.width=(GR[1]*1.3)+'%'}
  const imgs=new Array(N),his=new Array(N),MAXI=loop?N:N-1,TOTAL=N+(V2?1:0);
  const F0=Math.max(0,Math.min(N-1,Math.round(+o.start||0)));
  let pos=F0,vel=0,count=0,fail=0,started=false,visible=false,dead=false,raf=0,last=0,playing=false,touched=false,intro=null,drag=null,swing=1,dirty=true,hinted=false;
  let bg=null,idleAt=0,settle=null,hiA=0,hiI=-1,zoom=null,zoomMode=false,hold=0,fy=0,t0=performance.now()-Math.random()*FLOAT_MS;
  const VT=N/120000;                                                          /* dưới tốc độ này coi như đã dừng */
  const AUTO=N/(loop?16000:9000);                                            /* khung mỗi ms: một vòng 16 giây */
  const coarse=window.matchMedia&&matchMedia('(pointer: coarse)').matches;
  const wrap=p=>loop?((p%N)+N)%N:clamp(p,0,N-1);
  const pad=i=>String(i+1).padStart(3,'0');
  const src=i=>dir+(V2?'l/':'')+pad(i)+'.webp';
  const hasHi=i=>V2&&i%HS===0;

  /* ── tải khung: nền + khung đầu trước, rồi thưa tới dày để kéo sớm vẫn có khung gần nhất ── */
  const order=()=>{const out=[F0],seen=new Set([F0]);for(let s=8;s>=1;s>>=1)for(let i=0;i<N;i+=s)if(!seen.has(i)){seen.add(i);out.push(i)}return out};
  function load(){
    if(started)return;started=true;const queue=order();let active=0;
    const tally=()=>{prog.style.transform=`scaleX(${(count+fail)/TOTAL})`;
      if(count+fail===TOTAL){node.classList.remove('is-load');node.classList.add('is-ready');ready()}dirty=true;kick()};
    const first=()=>{if(imgs[F0]&&(!V2||bg))node.classList.add('is-first')};
    if(V2){const im=new Image();im.decoding='async';im.onload=()=>{if(dead)return;bg=im;bgp.style.backgroundImage=`url("${dir}bg.webp")`;count++;first();tally()};im.onerror=()=>{if(dead)return;fail++;tally()};im.src=dir+'bg.webp'}
    const next=()=>{if(dead)return;while(active<5&&queue.length){const i=queue.shift(),im=new Image();active++;im.decoding='async';
      const done=ok=>{active--;if(dead)return;if(ok){imgs[i]=im;count++}else{fail++;if(i===F0){node.classList.add('is-bad');q('.spin-msg').hidden=false}}
        if(i===F0&&ok)first();tally();next()};
      im.onload=()=>{im.decode&&!coarse?im.decode().then(()=>done(true),()=>done(true)):done(true)};im.onerror=()=>done(false);im.src=src(i)}};
    next()}
  /* khung nét: chỉ tải khi dừng ở khung đó hoặc khi soi kính */
  function wantHi(i){if(!hasHi(i)||his[i])return;const im=new Image();his[i]=im;im.decoding='async';im.onload=()=>{if(dead)return;im.ok=true;dirty=true;kick()};im.onerror=()=>{his[i]=null};im.src=dir+'h/'+pad(i)+'.webp'}
  const nearest=i=>{for(let d=0;d<N;d++){const a=loop?(i+d)%N:i+d,b=loop?(i-d+N)%N:i-d;if(a<N&&imgs[a])return a;if(b>=0&&imgs[b])return b}return -1};

  /* ── vẽ một cảnh lên ctx bất kỳ (khung chính và kính phóng dùng chung) ── */
  const cover=(c,im,W,H,dy)=>{const s=Math.max(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;c.drawImage(im,(W-w)/2,(H-h)/2+(dy||0),w,h)};
  /* full=true (kính phóng): vẽ cả nền và độ nâng; khung chính chỉ vẽ sản phẩm, nền/bóng/độ nâng là lớp CSS */
  function scene(c,W,H,sharp,full){
    const f=wrap(pos),a=Math.floor(f)%N,fr=f-Math.floor(f),b=loop?(a+1)%N:Math.min(N-1,a+1),ia=imgs[a]?a:nearest(a);
    if(ia<0)return;
    const lift=V2&&full?fy*H:0;
    if(V2&&full){if(bg)cover(c,bg,W,H);else{c.fillStyle=light?'#e9e6e1':'#0d0b11';c.fillRect(0,0,W,H)}}
    const hi=sharp&&his[ia]&&his[ia].ok&&fr<.02?his[ia]:null;
    if(!(hi&&sharp===true)){cover(c,imgs[ia],W,H,lift);
      if(fr>.02&&imgs[b]&&ia===a){c.globalAlpha=fr;cover(c,imgs[b],W,H,lift);c.globalAlpha=1}}
    if(hi){c.globalAlpha=sharp===true?1:sharp;cover(c,hi,W,H,lift);c.globalAlpha=1}}

  /* canvas chỉ cần nét bằng ảnh đang vẽ: khung xoay 960px, khung nét tới 1600px */
  let CAP=V2?960:1200,key='';
  function size(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const k=Math.min(Math.min(window.devicePixelRatio||1,2),CAP/Math.max(w,h)),W=Math.round(w*k),H=Math.round(h*k);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;dirty=true;kick()}}
  function paint(now){
    const f=wrap(pos);
    if(V2){const cap=hiA>0||zoom?1600:960;if(cap!==CAP){CAP=cap;size()}}
    if(cv.width){const k=cv.width+'|'+Math.round(f*400)+'|'+hiA.toFixed(2)+'|'+count;
      if(k!==key||dirty){key=k;ctx.clearRect(0,0,cv.width,cv.height);scene(ctx,cv.width,cv.height,hiA>=1?true:hiA>0?hiA:0,false)}}
    dirty=false;
    if(V2){const ty=`translate3d(0,${(fy*100).toFixed(3)}cqw,0)`,up=clamp(-fy/.03,0,1);
      cv.style.transform=ty;hsBox.style.transform=ty;aura.style.transform=ty;aura.style.opacity=(.78+.22*up).toFixed(3);
      shd.style.transform=`translate(-50%,-50%) scale(${(1-.2*up).toFixed(3)})`;shd.style.opacity=(1-.45*up).toFixed(3)}
    const fr=f/MAXI,d=Math.round(fr*arc)%(loop?360:361);
    thumb.style.left=(fr*100).toFixed(2)+'%';deg.textContent=d+'°';track.setAttribute('aria-valuenow',d);track.setAttribute('aria-valuetext',T('{d} độ',{d}));
    if(tape)tape.style.transform=`translate3d(${(-50+((sgn*f/N*2)%1+1)%1*100/6).toFixed(3)}%,0,0)`;
    for(let k=0;k<hs.length;k++){const h=hs[k],c=(+h.a||0)*MAXI,w=(h.w==null?.1:+h.w)*N;let dd=Math.abs(f-c);if(loop)dd=Math.min(dd,N-dd);if(h.p){const P=h.p,u=f/MAXI;let j=0;while(j<P.length-2&&u>P[j+1][0])j++;const A=P[j],B=P[j+1]||A,t=clamp((u-A[0])/((B[0]-A[0])||1),0,1);hsEl[k].style.left=(A[1]+(B[1]-A[1])*t).toFixed(2)+'%';hsEl[k].style.top=(A[2]+(B[2]-A[2])*t).toFixed(2)+'%'}
      hsEl[k].classList.toggle('is-on',dd<=w&&!zoom&&!node.classList.contains('is-load'))}
    if(zoom)paintLens()}

  /* ── kính phóng ── */
  function paintLens(){
    const W=node.clientWidth,H=node.clientHeight,R=lens.clientWidth/2,k=Math.min(window.devicePixelRatio||1,2),S=Math.round(R*2*k);
    if(lens.width!==S){lens.width=lens.height=S}
    const lx=clamp(zoom.x,0,W),ly=clamp(zoom.y,0,H),off=zoom.touch?R*1.25:0;
    lens.style.transform=`translate3d(${(lx-R).toFixed(1)}px,${(Math.max(-R*.4,ly-R-off)).toFixed(1)}px,0)`;
    lctx.setTransform(1,0,0,1,0,0);lctx.clearRect(0,0,S,S);lctx.save();lctx.beginPath();lctx.arc(S/2,S/2,S/2,0,TAU);lctx.clip();
    lctx.setTransform(k*ZOOM,0,0,k*ZOOM,S/2-lx*k*ZOOM,S/2-ly*k*ZOOM);lctx.imageSmoothingQuality='high';
    if(!V2){lctx.fillStyle=light?'#e9e6e1':'#0d0b11';lctx.fillRect(0,0,W,H)}
    scene(lctx,W,H,true,true);lctx.restore()}
  function zoomOn(x,y,touch){
    if(node.classList.contains('is-load'))return;zoom={x,y,touch};vel=0;intro=null;if(playing)setPlay(false);
    /* đưa về khung nét gần nhất để kính soi được ảnh lớn */
    if(V2){const i=Math.round(wrap(pos)/HS)*HS%N;pos=i;wantHi(i);hiI=i;hiA=1}else pos=Math.round(wrap(pos))%N;
    node.classList.add('is-zoom');dirty=true;kick()}
  function zoomOff(){if(!zoom)return;zoom=null;node.classList.remove('is-zoom');dirty=true;kick()}
  function setZoomMode(on){zoomMode=!!on;zb.setAttribute('aria-pressed',String(zoomMode));node.classList.toggle('is-zmode',zoomMode);if(!zoomMode)zoomOff()}

  /* ── vòng lặp ── */
  function tick(now){
    raf=0;if(dead)return;const dt=Math.min(64,now-(last||now));last=now;let alive=false;
    if(intro){const t=clamp((now-intro.t0)/intro.dur,0,1);
      pos=loop?intro.p0+sgn*ease(t)*N:(t<.5?ease(t*2):1-ease(t*2-1))*(N-1);
      if(!intro.sh&&t>.3){intro.sh=1;flash()}
      if(t>=1){pos=intro.p0;intro=null;vel=0;node.classList.add('is-hint')}alive=true;idleAt=0;settle=null}
    else if(!drag&&!zoom){
      const target=playing?AUTO*sgn*swing:0;vel+=(target-vel)*(1-Math.exp(-dt/(playing?520:340)));
      if(Math.abs(vel)>VT||playing){pos+=vel*dt;idleAt=0;settle=null;
        if(!loop&&(pos<=0||pos>=N-1)){pos=clamp(pos,0,N-1);vel=0;if(playing)swing=pos<=0?sgn:-sgn}
        alive=true}
      else{vel=0;
        /* đứng yên: trượt nhẹ về khung trọn (v2: khung có ảnh nét) rồi hiện ảnh nét */
        if(!idleAt)idleAt=now;
        if(!settle&&now-idleAt>140){const st=V2?HS:1;let tg=Math.round(pos/st)*st;if(!loop)tg=clamp(tg,0,Math.floor((N-1)/st)*st);settle={to:tg};if(V2)wantHi(((tg%N)+N)%N)}
        if(settle){const d=settle.to-pos;if(Math.abs(d)<.004||RM){pos=settle.to}else{pos+=d*(1-Math.exp(-dt/150));alive=true}}}}
    else{idleAt=0;settle=null}
    pos=loop?wrap(pos):pos;
    /* độ nét: mờ dần vào ảnh lớn khi đã yên ở khung có ảnh lớn */
    const pi=Math.round(pos)%N,still=V2&&!drag&&!intro&&Math.abs(vel)<VT&&Math.abs(pos-Math.round(pos))<.004&&his[pi]&&his[pi].ok;
    if(still){if(hiI!==pi){hiI=pi;hiA=zoom?1:0}if(hiA<1){hiA=Math.min(1,hiA+dt/260);alive=true}}else if(!zoom){hiA=0;hiI=-1}
    /* bồng bềnh: hai sóng sin chồng nhau cho đỡ máy móc */
    if(V2&&!RM&&!zoom){const t=(now-t0)/FLOAT_MS*TAU;fy=-.016+.012*Math.sin(t)+.003*Math.sin(t*2.618+1.3);if(node.classList.contains('is-first'))alive=true}
    if(zoom)alive=alive||dirty;
    paint(now);
    if(alive&&visible)raf=requestAnimationFrame(tick);else last=0}
  const kick=()=>{if(!raf&&!dead&&(visible||dirty))raf=requestAnimationFrame(tick)};
  const flash=()=>{sheen.classList.remove('is-go');void sheen.offsetWidth;sheen.classList.add('is-go')};
  const setPlay=on=>{playing=!!on;pp.setAttribute('aria-pressed',String(playing));pp.setAttribute('aria-label',playing?T('Dừng tự xoay'):T('Tự xoay'));node.classList.toggle('is-play',playing);if(playing){intro=null;zoomOff()}kick()};
  const touch=()=>{touched=true;intro=null;if(!hinted){hinted=true;node.classList.add('is-used')}};
  /* đủ khung + đang trong khung nhìn: xoay một vòng giới thiệu rồi tự xoay chậm */
  function ready(){
    if(node.classList.contains('is-in')||!visible||!node.classList.contains('is-ready'))return;
    node.classList.add('is-in');
    if(RM||o.intro===false||touched){node.classList.add('is-hint');if(!RM&&!touched&&o.auto!==false)setPlay(true);kick();return}
    intro={t0:performance.now()+260,dur:loop?2900:3400,p0:pos};
    if(o.auto!==false){playing=true;pp.setAttribute('aria-pressed','true');pp.setAttribute('aria-label',T('Dừng tự xoay'));node.classList.add('is-play')}
    kick()}

  /* ── kéo / vuốt; giữ yên 320ms thì bật kính phóng ── */
  const local=e=>{const r=node.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
  const stageDown=e=>{
    if(e.button||e.target.closest('.spin-bar'))return;
    const [x,y]=local(e),tch=e.pointerType==='touch';
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,p:pos,t:e.timeStamp,vx:0,moved:false,z:false};touch();vel=0;node.classList.add('is-drag');
    try{node.setPointerCapture(e.pointerId)}catch(_){}
    clearTimeout(hold);
    if(zoomMode){drag.z=true;zoomOn(x,y,tch)}
    else hold=setTimeout(()=>{if(drag&&!drag.moved&&!dead){drag.z=true;zoomOn(x,y,tch)}},320)};
  const stageMove=e=>{
    if(zoomMode&&!drag&&e.pointerType==='mouse'&&!e.target.closest('.spin-bar')){const [x,y]=local(e);if(zoom){zoom.x=x;zoom.y=y;dirty=true;kick()}else zoomOn(x,y,false);return}
    if(!drag||e.pointerId!==drag.id)return;
    if(drag.z){const [x,y]=local(e);zoom&&(zoom.x=x,zoom.y=y);dirty=true;kick();return}
    const w=node.clientWidth||1,dx=e.clientX-drag.x;
    if(!drag.moved&&Math.hypot(dx,e.clientY-drag.y)<6)return;
    if(!drag.moved){drag.moved=true;clearTimeout(hold);drag.x=e.clientX;return}
    const np=drag.p+sgn*dx/w*N*(loop?.82:.9),dt=Math.max(1,e.timeStamp-drag.t),raw=(np-pos)/dt;
    drag.vx=drag.vx*.6+raw*.4;drag.t=e.timeStamp;drag.x=e.clientX;drag.p=np;pos=loop?np:clamp(np,0,N-1);if(!loop)drag.p=pos;
    if(playing)setPlay(false);kick()};
  const stageUp=e=>{
    if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;clearTimeout(hold);node.classList.remove('is-drag');
    if(d.z){if(!zoomMode||e.pointerType!=='mouse')zoomOff()}
    else if(d.moved&&e.type==='pointerup'&&e.timeStamp-d.t<90){vel=RM?0:clamp(d.vx,-N/260,N/260);if(Math.abs(vel)>N/2600)flash()}
    else if(playing&&d.moved)setPlay(false);
    last=0;kick()};
  node.addEventListener('pointerdown',stageDown);node.addEventListener('pointermove',stageMove);node.addEventListener('pointerup',stageUp);node.addEventListener('pointercancel',stageUp);
  node.addEventListener('pointerleave',e=>{if(zoomMode&&!drag&&e.pointerType==='mouse')zoomOff()});
  node.addEventListener('dragstart',e=>e.preventDefault());node.addEventListener('contextmenu',e=>{if(drag||zoom)e.preventDefault()});

  /* ── thanh góc ── */
  let tdrag=false;
  const seek=e=>{const r=track.getBoundingClientRect();pos=clamp((e.clientX-r.left)/r.width,0,1)*MAXI;if(loop&&pos>=N)pos=N-.001;vel=0;idleAt=0;settle=null;kick()};
  track.addEventListener('pointerdown',e=>{if(e.button)return;tdrag=true;touch();setPlay(false);zoomOff();try{track.setPointerCapture(e.pointerId)}catch(_){}seek(e);e.stopPropagation()});
  track.addEventListener('pointermove',e=>{if(tdrag)seek(e)});
  const tEnd=()=>{tdrag=false};track.addEventListener('pointerup',tEnd);track.addEventListener('pointercancel',tEnd);
  pp.addEventListener('click',()=>{touch();setPlay(!playing)});
  zb.addEventListener('click',()=>{touch();if(!zoomMode&&playing)setPlay(false);setZoomMode(!zoomMode)});

  /* ── bàn phím ── */
  node.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;const k=e.key,big=Math.max(1,Math.round(N/12));let d=null;
    if(k==='ArrowRight'||k==='ArrowUp')d=e.shiftKey?big:1;else if(k==='ArrowLeft'||k==='ArrowDown')d=-(e.shiftKey?big:1);
    else if(k==='PageUp')d=big;else if(k==='PageDown')d=-big;
    else if(k==='Home'){d=0;pos=0}else if(k==='End'){d=0;pos=N-1}
    else if(k==='Escape'&&(zoom||zoomMode)){e.preventDefault();e.stopPropagation();setZoomMode(false);return}
    else if((k===' '||k==='Enter')&&e.target!==pp&&e.target!==zb){e.preventDefault();e.stopPropagation();touch();setPlay(!playing);return}
    if(d==null)return;
    if((k==='ArrowUp'||k==='ArrowDown')&&e.target!==track)return;
    /* v2: mỗi lần bấm đi một khung nét để ảnh luôn sắc */
    const st=V2&&!e.shiftKey&&Math.abs(d)===1?HS:1;
    e.preventDefault();e.stopPropagation();touch();setPlay(false);zoomOff();vel=0;pos=wrap(Math.round(pos/st)*st+d*st*sgn);idleAt=0;settle=null;dirty=true;kick()});

  /* ── khung nhìn + kích thước ── */
  const io=window.IntersectionObserver?new IntersectionObserver(es=>{for(const en of es){visible=en.isIntersecting;if(visible){load();size();ready();kick()}}},{rootMargin:'160px 0px'}):null;
  if(io)io.observe(node);else{visible=true;load()}
  const ro=window.ResizeObserver?new ResizeObserver(size):null;ro&&ro.observe(cv);size();
  if(RM)node.classList.add('is-rm');
  if(o.start!=null&&o.intro===false){hinted=true;node.classList.add('is-used')}   /* dựng lại khi đổi mẫu mã: không nhắc kéo lần nữa */

  return{node,
    play(){setPlay(true)},pause(){setPlay(false)},
    go(i){pos=wrap(+i||0);vel=0;idleAt=0;settle=null;dirty=true;kick()},frame(){return Math.round(wrap(pos))%N},playing(){return playing},
    destroy(){dead=true;clearTimeout(hold);cancelAnimationFrame(raf);io&&io.disconnect();ro&&ro.disconnect();for(const im of imgs)if(im)im.onload=im.onerror=null;imgs.length=0;his.length=0;node.remove()}};
};
})();
