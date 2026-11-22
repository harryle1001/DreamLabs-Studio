/* reel3 — bộ máy dựng phim mẫu từ ẢNH / CLIP THẬT (thay cho bộ reel2 cũ dựng cảnh bằng code).
   Mỗi phim là một file tools/reel3/films/<tên>.js gọi R3.film({...}). Mọi chuyển động tính theo thời gian t (giây) nên
   render.js chỉ cần gọi window.__seek(t) từng khung rồi chụp. ?play phát thử · ?t=3.2 đứng ở giây 3.2 · ?raw bản "trước khi chỉnh"
   (tắt chỉnh màu + đồ họa, màu phẳng kiểu log).
   Cảnh (shots): {src, in, out, [seq:{n,fps,t:[[tCảnh,giâyNguồn],…]}], [fg: ảnh tách nền cho parallax 2.5D], cam:[[u,x,y,s,r?],…], focus:[fx,fy], tr:{type,d}}
     - src ảnh tĩnh: đường dẫn ảnh. Clip: src là thư mục khung hình JPEG (f00001.jpg…), seq.n số khung, seq.fps tốc độ nguồn,
       seq.t ánh xạ thời gian trong cảnh -> giây của nguồn (speed ramp / slow-motion; khung lẻ được trộn hai khung kề nhau).
     - cam: khóa hình theo u (0..1 trong cảnh): x,y lệch tâm theo tỉ lệ khung (-.5…+.5), s độ phóng, r độ xoay (độ).
     - tr: chuyển cảnh VÀO cảnh này: cut | fade | flash | whip | dip | zoom, d = thời lượng (giây). */
(function(){
const Q=new URLSearchParams(location.search),RAW=Q.has('raw');
const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x,lerp=(a,b,u)=>a+(b-a)*u;
const ez={io:u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,out:u=>1-Math.pow(1-u,3),in:u=>u*u*u,lin:u=>u,o5:u=>1-Math.pow(1-u,5)};
const R3=window.R3={Q,RAW,clamp,lerp,ez};
const rng=R3.rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const cache=new Map();
function img(url){let e=cache.get(url);if(!e){const im=new Image();e={im,p:null};e.p=new Promise((res,rej)=>{im.onload=()=>(im.decode?im.decode().catch(()=>{}):Promise.resolve()).then(res);im.onerror=()=>rej(new Error('ảnh lỗi '+url))});im.src=url;cache.set(url,e)}
  return e}
function trim(keep){if(cache.size<40)return;for(const k of [...cache.keys()]){if(cache.size<28)break;if(!keep.has(k)){cache.get(k).im.src='';cache.delete(k)}}}
/* nội suy khóa hình [[u,…giá trị]] */
function key(keys,u,e){if(!keys||!keys.length)return null;if(u<=keys[0][0])return keys[0];const L=keys[keys.length-1];if(u>=L[0])return L;
  for(let i=1;i<keys.length;i++)if(u<=keys[i][0]){const a=keys[i-1],b=keys[i],k=(e||ez.io)((u-a[0])/(b[0]-a[0]));return a.map((v,j)=>j?lerp(v,b[j]??v,k):u)}}

R3.film=async function(o){
  /* clip:'a' / photo:'p1' trỏ vào tools/reel3/_assets/<tên phim>/ (do prep.py tạo); index.json cho số khung + fps của từng clip */
  const NAME=Q.get('n'),BASE='_assets/'+NAME+'/',IDX=await fetch(BASE+'index.json').then(r=>r.json()).catch(()=>({}));
  const res=s=>{s=Object.assign({},s);const L=s.out-s.in;if(s.clip){const i=IDX[s.clip]||{n:1,fps:25};s.src=BASE+s.clip;const r=s.rate??1,ss=s.ss||0;
      s.seq=Object.assign({n:i.n,fps:i.fps,t:[[0,ss],[L,ss+L*r]],blend:r<.8},s.seq||{})}
    if(s.photo)s.src=BASE+s.photo+'.jpg';return s};
  o.shots=o.shots.map(res);const overlays=(o.overlays||[]).map(res);
  const W=o.W,H=o.H,FPS=o.fps||30,D=o.dur,de=document.documentElement,st=document.getElementById('stage');
  de.style.setProperty('--W',W+'px');de.style.setProperty('--H',H+'px');if(RAW)de.classList.add('raw');
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.id='footage';st.prepend(cv);const g=cv.getContext('2d');
  const gfx=document.createElement('div');gfx.id='gfx';st.appendChild(gfx);
  const shots=o.shots.map((s,i)=>Object.assign({i,tr:{type:'cut',d:0}},s));
  const G=Object.assign({filter:'none',tint:null,vig:.35,grain:.05,fade:[.25,.35]},o.grade||{});
  const RAWF=o.rawFilter||'saturate(.5) contrast(.78) brightness(1.1)';
  /* hạt phim: 4 ô nhiễu dựng sẵn, mỗi khung dùng một ô + lệch vị trí (tất định theo số khung) */
  const grains=[0,1,2,3].map(k=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),d=x.createImageData(256,256),r=rng(77+k);
    for(let i=0;i<d.data.length;i+=4){const v=128+(r()+r()+r()-1.5)*90;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c});
  const frameUrl=(s,n)=>s.src+'/f'+String(clamp(Math.round(n),1,s.seq.n)).padStart(5,'0')+'.jpg';
  function need(s,t){                      /* các ảnh cần cho cảnh s ở thời điểm t */
    if(!s.seq)return s.fg?[[s.src,1],[s.fg,1]]:[[s.src,1]];
    const lt=clamp(t-s.in,0,s.out-s.in),m=s.seq.t||[[0,0],[s.out-s.in,s.out-s.in]];let sec=m[m.length-1][1];
    for(let i=1;i<m.length;i++)if(lt<=m[i][0]){const a=m[i-1],b=m[i],k=(lt-a[0])/(b[0]-a[0]||1);sec=lerp(a[1],b[1],s.seq.ease?ez.io(k):k);break}
    const f=1+sec*s.seq.fps,a=Math.floor(f),fr=f-a;
    if(!s.seq.blend)return[[frameUrl(s,Math.round(f)),1]];           /* blend:true (slow-motion): trộn hai khung kề nhau cho mượt */
    return fr<.08?[[frameUrl(s,a),1]]:fr>.92?[[frameUrl(s,a+1),1]]:[[frameUrl(s,a),1],[frameUrl(s,a+1),fr]]}
  function cover(im,s,cam,alpha,dx){        /* vẽ ảnh phủ kín khung theo máy quay ảo */
    const iw=im.naturalWidth,ih=im.naturalHeight,fx=(s.focus||[.5,.5])[0],fy=(s.focus||[.5,.5])[1];
    const sc=Math.max(W/iw,H/ih)*cam[3],w=iw*sc,h=ih*sc;
    let x=W/2-w*fx-cam[1]*W,y=H/2-h*fy-cam[2]*H;x=clamp(x,W-w,0)+(dx||0);y=clamp(y,H-h,0);
    g.globalAlpha=alpha;if(cam[4]){g.save();g.translate(W/2,H/2);g.rotate(cam[4]*Math.PI/180);g.translate(-W/2,-H/2);g.drawImage(im,x,y,w,h);g.restore()}else g.drawImage(im,x,y,w,h)}
  function drawShot(s,t,alpha,dx,zoom){
    const u=clamp((t-s.in)/(s.out-s.in)),c=(key(s.cam,u,s.ease&&ez[s.ease])||[0,0,0,1,0]).slice();c[3]*=zoom||1;
    const list=need(s,t);
    if(s.fg&&!s.seq){const b=cache.get(s.src).im,f=cache.get(s.fg).im,p=s.par||.5;
      cover(b,s,[0,c[1]*(1-p),c[2]*(1-p),1+(c[3]-1)*(1-p*.6),c[4]],alpha,dx);cover(f,s,[0,c[1]*(1+p),c[2]*(1+p),1+(c[3]-1)*(1+p*.8),c[4]],alpha,dx)}
    else list.forEach(([url,a],k)=>cover(cache.get(url).im,s,c,k?alpha*a:alpha,dx));
    g.globalAlpha=1}
  const active=t=>{let cur=shots[0];for(const s of shots)if(t>=s.in-1e-6)cur=s;return cur};
  let hooks=[];R3.onDraw=f=>hooks.push(f);
  function paint(t){
    const s=active(t),pv=shots[s.i-1],tr=s.tr||{},d=tr.d||0,k=d&&pv?clamp((t-s.in)/d):1;
    g.filter='none';g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H);
    g.filter=RAW?RAWF:(s.filter||G.filter);
    if(k>=1||!pv||tr.type==='cut'||tr.type==='flash')drawShot(s,t,1);
    else if(tr.type==='fade'){drawShot(pv,t,1);drawShot(s,t,ez.io(k))}
    else if(tr.type==='dip'){k<.5?drawShot(pv,t,1):drawShot(s,t,1)}
    else if(tr.type==='zoom'){const e=ez.io(k);k<.5?drawShot(pv,t,1,0,1+e*1.6):drawShot(s,t,1,0,1.8-e*.8)}
    else if(tr.type==='whip'){const e=ez.io(k),dir=tr.dir||1,off=e*W*dir,n=9,sp=Math.sin(k*Math.PI)*W*.22;
      for(let i=0;i<n;i++){const j=(i/(n-1)-.5)*sp;drawShot(pv,t,1/(i+1),-off+j);drawShot(s,t,1/(i+1),W*dir-off+j)}}
    g.filter='none';
    if(!RAW){
      if(G.tint){g.globalCompositeOperation='soft-light';const lg=g.createLinearGradient(0,0,0,H);lg.addColorStop(0,G.tint[1]);lg.addColorStop(1,G.tint[0]);g.fillStyle=lg;g.globalAlpha=G.tintA??.5;g.fillRect(0,0,W,H);g.globalAlpha=1}
      if(G.vig){g.globalCompositeOperation='source-over';const r=g.createRadialGradient(W/2,H*.48,Math.min(W,H)*.3,W/2,H/2,Math.hypot(W,H)*.6);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,`rgba(0,0,0,${G.vig})`);g.fillStyle=r;g.fillRect(0,0,W,H)}
      if(G.grain){const fi=Math.round(t*FPS),gc=grains[fi%4],ox=(fi*97)%256,oy=(fi*57)%256;g.globalCompositeOperation='overlay';g.globalAlpha=G.grain;g.fillStyle=g.createPattern(gc,'repeat');g.save();g.translate(-ox,-oy);g.fillRect(0,0,W+256,H+256);g.restore();g.globalAlpha=1}
      g.globalCompositeOperation='source-over';
      if(pv&&d&&k<1){if(tr.type==='flash'){g.fillStyle=tr.color||'#fff';g.globalAlpha=Math.pow(1-k,1.6)*(tr.a??.9);g.fillRect(0,0,W,H)}
        if(tr.type==='dip'){g.fillStyle=tr.color||'#000';g.globalAlpha=Math.sin(k*Math.PI);g.fillRect(0,0,W,H)}g.globalAlpha=1}
    }
    if(!RAW)for(const v of overlays)if(t>=v.in&&t<v.out){g.globalCompositeOperation=v.mode||'screen';const e=Math.min(clamp((t-v.in)/(v.fin||.6)),clamp((v.out-t)/(v.fout||.6)));g.filter=RAW?'none':(v.filter||'none');drawShot(v,t,(v.alpha??1)*e);g.filter='none';g.globalCompositeOperation='source-over'}
    /* mở/đóng phim: mờ dần từ/về đen để lặp mượt */
    const fi=G.fade[0]?clamp(t/G.fade[0]):1,fo=G.fade[1]?clamp((D-t)/G.fade[1]):1,f=Math.min(fi,fo);if(f<1){g.fillStyle='#000';g.globalAlpha=1-f;g.fillRect(0,0,W,H);g.globalAlpha=1}
    hooks.forEach(h=>h(g,t,s));
  }
  const tl=gsap.timeline({paused:true});R3.tl=tl;R3.W=W;R3.H=H;R3.D=D;R3.gfx=gfx;R3.shots=shots;
  if(o.build&&!RAW)o.build(tl,gfx,R3);
  tl.set({},{},D);
  async function seek(t){t=clamp(t,0,D);
    const s=active(t),pv=shots[s.i-1],lst=[...need(s,t)];for(const v of overlays)if(t>=v.in&&t<v.out&&!RAW)lst.push(...need(v,t));if(pv&&s.tr&&s.tr.d&&clamp((t-s.in)/s.tr.d)<1)lst.push(...need(pv,t));
    const keep=new Set(lst.map(x=>x[0]));await Promise.all(lst.map(x=>img(x[0]).p));
    tl.time(t,false);paint(t);trim(keep);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
  window.__seek=seek;window.__tl=tl;
  window.__info={W,H,fps:FPS,duration:D,frames:Math.round(D*FPS),poster:o.poster??+(D*.6).toFixed(2),cover:o.cover};
  document.fonts.ready.then(async()=>{
    await seek(+Q.get('t')||0);window.__ready=true;
    if(Q.has('play')){const t0=performance.now();let busy=false;(function loop(){const t=((performance.now()-t0)/1000)%D;if(!busy){busy=true;seek(t).then(()=>busy=false)}requestAnimationFrame(loop)})()}
  });
};

/* ---------- đồ họa dùng chung ---------- */
/* tách chữ thành span theo ký tự (giữ tổ hợp dấu tiếng Việt) hoặc theo từ */
R3.split=(el,by='chars')=>{const txt=el.textContent;el.textContent='';const out=[];
  txt.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){el.appendChild(document.createTextNode(' '));return}
    const ws=document.createElement('span');ws.style.cssText='display:inline-block;white-space:nowrap';
    if(by==='words'){ws.textContent=w;out.push(ws)}else for(const ch of Array.from(w.normalize('NFC'))){const c=document.createElement('span');c.style.display='inline-block';c.textContent=ch;ws.appendChild(c);out.push(c)}
    el.appendChild(ws)});return out};
R3.el=(parent,cls,html,css)=>{const e=document.createElement('div');e.className=cls||'';if(html!=null)e.innerHTML=html;if(css)e.style.cssText=css;(parent||R3.gfx).appendChild(e);return e};
/* chữ hiện từng ký tự rồi biến mất: R3.type(tl,el,t0,t1,{by,stagger,y}) */
R3.type=(tl,el,t0,t1,p={})=>{const parts=R3.split(el,p.by||'chars');gsap.set(el,{autoAlpha:0});
  tl.set(el,{autoAlpha:1},t0).fromTo(parts,{autoAlpha:0,y:p.y??24,filter:'blur(6px)'},{autoAlpha:1,y:0,filter:'blur(0px)',duration:p.d||.5,stagger:p.stagger??.03,ease:'power3.out'},t0);
  if(t1!=null)tl.to(el,{autoAlpha:0,y:p.out??-14,duration:p.dOut||.3,ease:'power2.in'},t1-(p.dOut||.3));return parts};
/* khối hiện / ẩn đơn giản */
R3.show=(tl,el,t0,t1,from={},p={})=>{gsap.set(el,{autoAlpha:0});tl.fromTo(el,Object.assign({autoAlpha:0},from),{autoAlpha:1,x:0,y:0,scale:1,duration:p.d||.45,ease:p.ease||'power3.out'},t0);
  if(t1!=null)tl.to(el,{autoAlpha:0,duration:p.dOut||.28,ease:'power2.in'},t1-(p.dOut||.28));return el};
/* phụ đề động: mỗi dòng [t0,t1,'câu chữ có *từ nhấn*'] — từ bật lên theo nhịp */
R3.subs=(tl,host,lines,p={})=>{lines.forEach(([t0,t1,txt])=>{const ln=R3.el(host,'cap');
  const words=txt.split(' ').map(w=>{const s=document.createElement('span');const hot=/^\*.*\*$/.test(w);s.textContent=w.replace(/\*/g,'');if(hot)s.className='hot';ln.appendChild(s);ln.appendChild(document.createTextNode(' '));return s});
  gsap.set(ln,{autoAlpha:0});const step=Math.min(p.step||.16,(t1-t0-.3)/words.length);
  tl.set(ln,{autoAlpha:1},t0).fromTo(words,{autoAlpha:0,y:18,scale:.86},{autoAlpha:1,y:0,scale:1,duration:.22,stagger:step,ease:'back.out(2.2)'},t0).set(ln,{autoAlpha:0},t1)})};
/* thanh đen letterbox */
R3.letterbox=(h)=>{R3.el(null,'lb','','top:0;height:'+h+'px');R3.el(null,'lb','','bottom:0;height:'+h+'px')};
/* số đếm */
R3.count=(tl,el,from,to,t0,d,fmt)=>{const o={v:from};el.textContent=(fmt||Math.round)(from);tl.to(o,{v:to,duration:d,ease:'power2.out',onUpdate:()=>{el.textContent=(fmt||Math.round)(o.v)}},t0)};
})();
