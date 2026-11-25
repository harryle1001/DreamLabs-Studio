/* Dream Labs — trình xem 2.5D cho ảnh chụp thật (gọi qua DL.spin khi cấu hình có depth:true).
   DL.real(host,{dir,shots:[{name,ground:[y%,w%]}],bg,tone,amp,title,kicker,start,auto,intro}) → {node,destroy,play,pause,go,frame,playing}
   Mỗi góc chụp trong dir: NN-s.webp (800px, tải trước), NN.webp (1600px, thay vào khi xong), NN-d.webp (bản đồ độ sâu).
   WebGL dịch từng điểm ảnh theo độ sâu nên vật nghiêng theo chuột / ngón tay như có khối, ánh sáng lướt theo góc nghiêng;
   vật bồng bềnh, bóng mềm co giãn theo độ cao. Đổi góc chụp bằng nút, vuốt mạnh sang ngang hoặc phím mũi tên. Nút kính: phóng 2,4 lần.
   Bộ ảnh dựng bằng tools/real25d/build.py. */
(()=>{
const D=window.DL=window.DL||{};
const RMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const PLAY='<svg viewBox="0 0 16 16" aria-hidden="true"><path class="spin-i-play" d="M5.5 3.2v9.6L13 8z"/><path class="spin-i-pause" d="M4.6 3.2h2.3v9.6H4.6zM9.1 3.2h2.3v9.6H9.1z"/></svg>';
const HAND='<svg viewBox="0 0 34 16" aria-hidden="true"><path d="M9 3.5 4 8l5 4.5M25 3.5 30 8l-5 4.5M4.5 8h25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LENS='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.2 10.2 13.6 13.6M7 5.2v3.6M5.2 7h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const TAU=Math.PI*2,FLOAT_MS=5200,ZOOM=2.4,SWAP_MS=620;
const VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;varying vec2 v;uniform sampler2D c0,d0,c1,d1;uniform float mx,zoom,sweep;uniform vec2 tilt,cen,lit;
vec4 shot(sampler2D C,sampler2D Dp,vec2 uv){
 vec2 o=tilt*.03;float d=texture2D(Dp,uv).r;vec2 q=uv-o*(d-.45);d=texture2D(Dp,q).r;q=uv-o*(d-.45);
 if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)return vec4(0.);
 vec4 c=texture2D(C,q,-.8);float e=1./72.;
 float gx=texture2D(Dp,q+vec2(e,0.)).r-texture2D(Dp,q-vec2(e,0.)).r,gy=texture2D(Dp,q+vec2(0.,e)).r-texture2D(Dp,q-vec2(0.,e)).r;
 vec3 n=normalize(vec3(-gx*2.2,-gy*2.2,1.));float l=dot(n,normalize(vec3(lit,1.4)))-.82;
 float band=exp(-pow((q.x+q.y*.35-sweep)*7.,2.))*d;
 c.rgb*=1.+l*.42;c.rgb+=c.a*band*.1;return c;}
void main(){vec2 uv=cen+(v-cen)/zoom;vec4 a=shot(c0,d0,uv);if(mx>0.){vec4 b=shot(c1,d1,uv);a=mix(a,b,smoothstep(.3,.7,mx));}gl_FragColor=a;}`;

D.real=function(host,o){
  o=o||{};
  const dir=String(o.dir||''),shots=(Array.isArray(o.shots)?o.shots:[]).filter(Boolean),N=shots.length,RM=RMQ.matches,light=o.tone!=='dark',AMP=clamp(+o.amp||1,.1,1.6);   /* amp: độ dịch theo độ sâu (vật trong suốt nên để thấp) */
  const T=(window.DL&&DL.t)||(s=>s),name=String(o.title||'').split(/\s[—–-]\s/)[0].trim();
  const node=document.createElement('div');node.className='spin is-real is-v2 is-load';node.tabIndex=0;node.dataset.tone=light?'light':'dark';
  node.setAttribute('role','group');node.setAttribute('aria-roledescription',T('trình xem ảnh thật nhiều góc'));
  node.setAttribute('aria-label',(o.title?o.title+'. ':'')+T('Di chuột hoặc kéo để nghiêng sản phẩm, phím mũi tên trái, phải để đổi góc chụp.'));
  if(o.bg)node.style.setProperty('--rbg',o.bg);
  node.innerHTML=`<i class="spin-bgp" aria-hidden="true"></i><i class="spin-aura" aria-hidden="true"></i><i class="spin-shadow" aria-hidden="true"></i><canvas class="spin-cv" role="img" aria-label="${esc((o.title||T('Sản phẩm'))+', '+T('ảnh chụp thật'))}"></canvas>
   ${name?`<div class="spin-tape" aria-hidden="true"><span>${(esc(name)+'<i>✦</i>').repeat(6)}</span></div>`:''}
   <div class="spin-head"><span class="spin-k"><b>${T('Ảnh thật')}</b>${o.kicker?esc(o.kicker):''}</span>${name?`<span class="spin-t" aria-hidden="true">${[...name].map((c,i)=>c===' '?' ':`<i style="--i:${i}">${esc(c)}</i>`).join('')}</span>`:''}</div>
   <p class="spin-hint" aria-hidden="true">${HAND}<span>${T('Kéo để nghiêng')}</span></p>
   <p class="spin-msg" hidden>${T('Bộ ảnh chưa tải được ở đây.')}</p>
   <div class="spin-bar"><button class="spin-pp" type="button" aria-label="${T('Tự đung đưa')}" aria-pressed="false">${PLAY}</button>
    <div class="real-shots" role="group" aria-label="${T('Góc chụp')}">${shots.map((s,i)=>`<button type="button" data-shot="${i}" aria-pressed="${!i}"><i></i><span>${esc(T(s.name||''))}</span></button>`).join('')}</div>
    <output class="spin-deg" aria-hidden="true">1/${N}</output>
    <button class="spin-zb" type="button" aria-pressed="false" aria-label="${T('Kính phóng')}">${LENS}</button></div>`;
  host.append(node);
  const q=s=>node.querySelector(s),cv=q('.spin-cv'),pp=q('.spin-pp'),zb=q('.spin-zb'),out=q('.spin-deg'),aura=q('.spin-aura'),shd=q('.spin-shadow'),tape=q('.spin-tape span'),btns=[...node.querySelectorAll('[data-shot]')];
  let gl=null;try{gl=cv.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true})||cv.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true})}catch(e){}
  const GL2=gl&&typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
  const ctx=gl?null:cv.getContext('2d');
  let U={},prog=null;
  if(gl){const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
    prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){gl=null}
    else{gl.useProgram(prog);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const l=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
      for(const k of['c0','d0','c1','d1','mx','zoom','sweep','tilt','cen','lit'])U[k]=gl.getUniformLocation(prog,k);
      gl.uniform1i(U.c0,0);gl.uniform1i(U.d0,1);gl.uniform1i(U.c1,2);gl.uniform1i(U.d1,3);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.clearColor(0,0,0,0)}}
  const ctx2=gl?null:(ctx||cv.getContext('2d'));
  /* mỗi góc: {s,h,d: ảnh · tc,td: texture · lv: 0 chưa có, 1 bản nhỏ, 2 bản nét} */
  const S=shots.map(()=>({s:null,h:null,d:null,tc:null,td:null,lv:0,want:false}));
  const pad=i=>String(i+1).padStart(2,'0');
  let cur=clamp(Math.round(+o.start||0),0,Math.max(0,N-1)),nxt=-1,mixT=0,dead=false,visible=false,raf=0,last=0,started=false,fail=0;
  let playing=false,touched=false,hinted=false,zoom=1,zoomTo=1,zoomMode=false,drag=null,over=false;
  let tx=0,ty=0,gx=0,gy=0,cx=.5,cy=.5,gcx=.5,gcy=.5,turn=0,t0=performance.now()-Math.random()*FLOAT_MS;
  const tex=(im,mip)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(mip&&GL2){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);return t};
  const img=(src,ok,bad)=>{const im=new Image();im.decoding='async';im.onload=()=>{if(!dead)ok(im)};im.onerror=()=>{if(!dead&&bad)bad()};im.src=src;return im};
  const up=(i,im,lv)=>{const s=S[i];if(lv<=s.lv)return;if(gl){s.tc&&gl.deleteTexture(s.tc);s.tc=tex(im,true)}s[lv===2?'h':'s']=im;s.lv=lv;ready()};
  function want(i){const s=S[i];if(!s||s.want)return;s.want=true;
    img(dir+pad(i)+'-d.webp',im=>{s.d=im;if(gl)s.td=tex(im,false);ready()},()=>{fail++;ready()});
    img(dir+pad(i)+'-s.webp',im=>{up(i,im,1);img(dir+pad(i)+'.webp',h=>up(i,h,2))},()=>{fail++;ready()})}
  const ok=i=>{const s=S[i];return s&&s.lv>0&&(s.d||!gl)};
  function ready(){
    if(fail&&!ok(cur)){q('.spin-msg').hidden=false;node.classList.remove('is-load');return}
    if(!started&&ok(cur)){started=true;node.classList.remove('is-load');node.classList.add('is-first');ground(cur);setPlay(o.auto!==false&&!RM);
      if(N>1)want((cur+1)%N);setTimeout(()=>{for(let i=0;i<N;i++)want(i)},900)}
    kick()}
  function ground(i){const g=(shots[i]&&shots[i].ground)||[80,40];shd.style.left='50%';shd.style.top=clamp(g[0],40,90)+'%';shd.style.width=clamp(g[1]*1.15,18,82)+'%'}
  function go(i,dirn){i=((i%N)+N)%N;if(i===cur&&nxt<0||i===nxt)return;want(i);
    if(nxt>=0){cur=nxt;nxt=-1}
    nxt=i;mixT=0;turn=dirn||(i>cur?1:-1);btns.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));out.textContent=(i+1)+'/'+N;kick()}
  function setPlay(v){playing=!!v&&!RM;pp.setAttribute('aria-pressed',String(playing));node.classList.toggle('is-play',playing);kick()}
  function touch(){if(!touched){touched=true}if(!hinted){hinted=true;node.classList.add('is-used')}}
  function setZoom(v){zoomMode=!!v;zoomTo=zoomMode?ZOOM:1;zb.setAttribute('aria-pressed',String(zoomMode));node.classList.toggle('is-zoom',zoomMode);if(!zoomMode){gcx=gcy=.5}kick()}
  function size(){const r=cv.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(Math.min(1600,r.width*dpr));
    if(cv.width!==w){cv.width=cv.height=w;gl&&gl.viewport(0,0,w,w)}kick()}
  function draw(sw){
    if(gl){gl.clear(gl.COLOR_BUFFER_BIT);const a=S[cur],b=nxt>=0&&ok(nxt)?S[nxt]:null;if(!a.tc||!a.td)return;
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,a.tc);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,a.td);
      gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,(b||a).tc);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,(b||a).td);
      gl.uniform1f(U.mx,b?mixT:0);gl.uniform1f(U.zoom,zoom);gl.uniform1f(U.sweep,sw);gl.uniform2f(U.tilt,tx*AMP,ty*AMP);gl.uniform2f(U.cen,cx,cy);gl.uniform2f(U.lit,-.45+tx*.9,-.6+ty*.7);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
    else if(ctx2){const w=cv.width,a=S[cur],b=nxt>=0&&ok(nxt)?S[nxt]:null,im=a.h||a.s;ctx2.clearRect(0,0,w,w);if(!im)return;
      const z=zoom,ox=-(cx*w)*(z-1),oy=-(cy*w)*(z-1);ctx2.globalAlpha=b?1-mixT:1;ctx2.drawImage(im,ox,oy,w*z,w*z);
      if(b){ctx2.globalAlpha=mixT;ctx2.drawImage(b.h||b.s,ox,oy,w*z,w*z)}ctx2.globalAlpha=1}}
  function tick(now){raf=0;if(dead)return;const dt=Math.min(64,now-(last||now));last=now;let moving=false;
    if(started){
      const t=now-t0,auto=playing&&!drag&&!over&&!zoomMode;
      if(auto){gx=Math.sin(t*TAU/6400)*.62;gy=Math.cos(t*TAU/9100)*.34;moving=true}
      else if(!drag&&!over){gx=0;gy=0}
      const k=1-Math.exp(-dt/(drag?70:170)),zk=zoomMode?.25:1;
      tx+=(gx*zk-tx)*k;ty+=(gy*zk-ty)*k;cx+=(gcx-cx)*k;cy+=(gcy-cy)*k;zoom+=(zoomTo-zoom)*(1-Math.exp(-dt/150));
      if(Math.abs(gx*zk-tx)+Math.abs(gy*zk-ty)+Math.abs(zoomTo-zoom)+Math.abs(gcx-cx)+Math.abs(gcy-cy)>.002)moving=true;
      let ry=0;
      if(nxt>=0){if(ok(nxt)){mixT=Math.min(1,mixT+dt/(RM?1:SWAP_MS));const e=ease(mixT);ry=(e<.5?e*2:(e-1)*2)*turn*-34;
          if(e>=.5)ground(nxt);if(mixT>=1){cur=nxt;nxt=-1;mixT=0}}moving=true}
      /* bồng bềnh: hai sóng sin lệch pha; bóng nhỏ và nhạt dần khi vật lên cao */
      const upv=RM?.5:.5+.5*(Math.sin(t*TAU/FLOAT_MS)*.72+Math.sin(t*TAU/(FLOAT_MS*1.62)+1.3)*.28),lift=(RM?0:-1.1-upv*2.3)*(zoomMode?0:1);
      if(!RM&&!zoomMode)moving=true;
      cv.style.transform=`perspective(${zoomMode?4000:900}px) translate3d(${(tx*-.6).toFixed(3)}cqw,${lift.toFixed(3)}cqw,0) rotateY(${(tx*7+ry).toFixed(2)}deg) rotateX(${(-ty*6).toFixed(2)}deg)`;
      shd.style.transform=`translate(${(-50+tx*5).toFixed(2)}%,-50%) scale(${(1-.16*upv).toFixed(3)})`;shd.style.opacity=zoomMode?0:(.9-.34*upv).toFixed(3);
      aura.style.transform=`translate3d(${(tx*1.6).toFixed(2)}cqw,${(lift*.5).toFixed(2)}cqw,0)`;
      if(tape)tape.style.transform=`translate3d(${(-tx*2.4-8).toFixed(2)}%,0,0)`;
      draw(RM?2:((t%7000)/7000)*3.2-1+tx*.25)}
    if(moving&&visible)raf=requestAnimationFrame(tick);else last=0}
  function kick(){if(!raf&&!dead&&visible)raf=requestAnimationFrame(tick)}

  /* ── con trỏ: chuột lướt là nghiêng; chạm thì kéo để nghiêng, vuốt mạnh sang ngang để đổi góc chụp ── */
  const rel=e=>{const r=node.getBoundingClientRect();return[clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1),r.width]};
  const aim=(x,y)=>{if(zoomMode){gcx=x;gcy=y}else{gx=clamp((x-.5)*2.2,-1,1);gy=clamp((y-.5)*2.2,-1,1)}};
  node.addEventListener('pointermove',e=>{if(e.target.closest('.spin-bar'))return;const[x,y,w]=rel(e);
    if(drag){if(e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.on){if(Math.abs(dx)<6&&Math.abs(dy)<6)return;if(e.pointerType!=='mouse'&&Math.abs(dy)>Math.abs(dx)&&!zoomMode){drag=null;return}drag.on=true;touch()}
      if(zoomMode)aim(x,y);else{gx=clamp(dx/w*3.2,-1,1);gy=clamp(dy/w*2.2,-1,1)}kick()}
    else if(e.pointerType==='mouse'){over=true;touch();aim(x,y);kick()}});
  node.addEventListener('pointerdown',e=>{if(e.target.closest('.spin-bar')||e.button>0)return;const[x,y]=rel(e);drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),on:false};
    if(zoomMode&&e.pointerType!=='mouse')aim(x,y);try{node.setPointerCapture(e.pointerId)}catch(_){}kick()});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;const[, ,w]=rel(e),dx=e.clientX-drag.x,quick=performance.now()-drag.t<600,was=drag.on;drag=null;
    if(was&&!zoomMode&&N>1&&Math.abs(dx)>w*(quick?.16:.3))go(cur+(dx<0?1:-1),dx<0?1:-1);
    if(e.pointerType!=='mouse'){gx=gy=0}kick()};
  node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);
  node.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!drag){over=false;if(zoomMode)gcx=gcy=.5;kick()}});
  node.addEventListener('click',e=>{const b=e.target.closest('[data-shot]');if(b){touch();go(+b.dataset.shot);return}
    if(e.target.closest('.spin-pp')){touch();setPlay(!playing);return}
    if(e.target.closest('.spin-zb')){touch();setZoom(!zoomMode)}});
  node.addEventListener('keydown',e=>{const k=e.key;
    if(k==='Escape'&&zoomMode){e.preventDefault();e.stopPropagation();setZoom(false);return}
    if((k===' '||k==='Enter')&&e.target===node){e.preventDefault();e.stopPropagation();touch();setPlay(!playing);return}
    const d=k==='ArrowRight'?1:k==='ArrowLeft'?-1:k==='Home'?-cur:k==='End'?N-1-cur:null;if(d==null||N<2)return;
    e.preventDefault();e.stopPropagation();touch();go((nxt>=0?nxt:cur)+d,d>0?1:-1)});
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;q('.spin-msg').hidden=false});

  const io=window.IntersectionObserver?new IntersectionObserver(es=>{for(const en of es){visible=en.isIntersecting;if(visible){want(cur);size();kick()}}},{rootMargin:'160px 0px'}):null;
  if(io)io.observe(node);else{visible=true;want(cur)}
  const ro=window.ResizeObserver?new ResizeObserver(size):null;ro&&ro.observe(cv);size();
  if(RM)node.classList.add('is-rm');
  if(o.intro===false){hinted=true;node.classList.add('is-used')}
  btns.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===cur)));out.textContent=(cur+1)+'/'+N;

  return{node,play(){setPlay(true)},pause(){setPlay(false)},go(i){go(+i||0)},frame(){return nxt>=0?nxt:cur},playing(){return playing},
    destroy(){dead=true;cancelAnimationFrame(raf);io&&io.disconnect();ro&&ro.disconnect();
      if(gl){for(const s of S){s.tc&&gl.deleteTexture(s.tc);s.td&&gl.deleteTexture(s.td)}const x=gl.getExtension('WEBGL_lose_context');x&&x.loseContext()}node.remove()}};
};
})();
