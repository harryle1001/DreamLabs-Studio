/* reel2 — engine chung cho 12 phim mẫu (Motion Graphic + Edit Video).
   Quy ước giống tools/reel: mọi chuyển động nằm trong GSAP timeline paused lộ ra window.__tl,
   render.js gọi __tl.time(t,false) từng khung hình rồi chụp. Không có gì chạy theo đồng hồ thật.
   ?play  phát thử trong trình duyệt   ?t=3.2  đứng ở giây 3.2   ?raw  bản "trước khi chỉnh" (tắt grade + đồ họa) */
(function(){
const PHI=1.61803,GA=137.50776*Math.PI/180,Q=new URLSearchParams(location.search);
const R2=window.R2={PHI,GA,Q,raw:Q.has('raw'),fns:[]};
const clamp=R2.clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
R2.lerp=(a,b,u)=>a+(b-a)*u;
R2.map=(x,a,b,c=0,d=1)=>c+(d-c)*clamp((x-a)/(b-a));
R2.ss=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
R2.rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
/* nhiễu mượt 1 chiều (rung máy cầm tay, hơi thở ánh sáng) */
R2.noise=(x,seed=0)=>{const h=n=>{const s=Math.sin(n*127.1+seed*311.7)*43758.5453;return s-Math.floor(s)};const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return(h(i)*(1-u)+h(i+1)*u)*2-1};
R2.phyllo=(n,c=1)=>Array.from({length:n},(_,i)=>{const r=c*Math.sqrt(i+.5),a=i*GA;return{i,r,a,x:r*Math.cos(a),y:r*Math.sin(a)}});

R2.init=o=>{
  const st=document.getElementById('stage'),de=document.documentElement;
  R2.o=Object.assign({fps:30},o);R2.W=o.W;R2.H=o.H;R2.D=o.dur;
  de.style.setProperty('--W',o.W+'px');de.style.setProperty('--H',o.H+'px');
  if(R2.raw)de.classList.add('raw');
  return st;
};
/* tách chữ thành span (giữ nguyên tổ hợp dấu tiếng Việt) */
R2.split=(el,by='chars')=>{
  const out=[];const walk=node=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const frag=document.createDocumentFragment();
      n.textContent.normalize('NFC').split(/(\s+)/).forEach(tok=>{if(!tok)return;
        if(/^\s+$/.test(tok)){frag.appendChild(document.createTextNode(' '));return}
        const w=document.createElement('span');w.className='wd';
        if(by==='chars'){for(const c of Array.from(tok)){const s=document.createElement('span');s.className='ch';s.textContent=c;w.appendChild(s);out.push(s)}}
        else{w.textContent=tok;out.push(w)}
        frag.appendChild(w)});
      n.replaceWith(frag)}
    else if(n.nodeType===1&&!n.classList.contains('nosplit'))walk(n)})};
  walk(el);return out;
};
R2.el=(tag,attrs={},parent)=>{const svg=/^(svg|g|path|circle|rect|line|ellipse|polygon|polyline|defs|linearGradient|radialGradient|stop|clipPath|mask|filter|use|text|tspan)$/.test(tag);
  const e=svg?document.createElementNS('http://www.w3.org/2000/svg',tag):document.createElement(tag);
  for(const k in attrs){if(k==='html')e.innerHTML=attrs[k];else if(k==='text')e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}
  if(parent)parent.appendChild(e);return e};
R2.frame=fn=>{R2.fns.push(fn);return fn};

/* ---- color grading: bảng curve cho feComponentTransfer ---- */
const tbl=f=>Array.from({length:17},(_,i)=>clamp(f(i/16)).toFixed(4)).join(' ');
const S=(x,k)=>{const s=x*x*(3-2*x);return x+(s-x)*k};
/* look: {con: độ tương phản S-curve, split: tách tông (bóng lạnh / sáng ấm), lift, gain, sat, tint:[r,g,b] cộng thêm} */
R2.grade=(id,{con=.6,split=.08,lift=0,gain=1,sat=1.1,tint=[0,0,0],piv=.38}={})=>{
  const ch=(sgn,tn)=>tbl(x=>(S(x,con)+sgn*split*(x-piv)*1.6)*gain+lift*(1-x)+tn);
  return `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
  <feComponentTransfer><feFuncR type="table" tableValues="${ch(1,tint[0])}"/><feFuncG type="table" tableValues="${ch(.12,tint[1])}"/><feFuncB type="table" tableValues="${ch(-1,tint[2])}"/></feComponentTransfer>
  <feColorMatrix type="saturate" values="${sat}"/></filter>`};
/* bản "log" phẳng: nén tương phản, nhấc đen, hạ bão hòa, ám xanh nhẹ */
R2.logFilter=()=>`<filter id="r2-log" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
  <feComponentTransfer><feFuncR type="table" tableValues="${tbl(x=>.17+Math.pow(x,.82)*.58)}"/><feFuncG type="table" tableValues="${tbl(x=>.18+Math.pow(x,.8)*.6)}"/><feFuncB type="table" tableValues="${tbl(x=>.175+Math.pow(x,.84)*.57)}"/></feComponentTransfer>
  <feColorMatrix type="saturate" values=".42"/></filter>`;
R2.filters=(...defs)=>{const s=document.createElement('div');s.innerHTML=`<svg width="0" height="0" style="position:absolute"><defs>${R2.logFilter()}${defs.join('')}</defs></svg>`;document.body.appendChild(s.firstChild)};

/* phụ đề kiểu Reels: từng từ bật lên, từ đang đọc được tô sáng. cues=[{t,d,text,hi:[chỉ số từ nhấn]}] */
R2.captions=(box,cues,tl,{pop=.16,gap=.045}={})=>{
  cues.forEach(c=>{const ln=R2.el('div',{class:'cap-ln'},box);ln.innerHTML=c.text;const ws=R2.split(ln,'words');
    tl.set(ln,{autoAlpha:1},c.t);
    const per=Math.min(gap*6,(c.d-.3)/ws.length);
    ws.forEach((w,i)=>{if(c.hi&&c.hi.includes(i))w.classList.add('hi');
      tl.fromTo(w,{autoAlpha:0,y:16,scale:.86},{autoAlpha:1,y:0,scale:1,duration:pop,ease:'back.out(2.2)'},c.t+i*per)});
    tl.to(ln,{autoAlpha:0,y:-10,duration:.12,ease:'power2.in'},c.t+c.d-.12);
    gsap.set(ln,{autoAlpha:0})});
};

R2.done=(tl,extra={})=>{
  const o=R2.o,draw=()=>{const t=tl.time();for(const f of R2.fns)f(t)};
  tl.eventCallback('onUpdate',draw);
  if(tl.duration()<o.dur)tl.set({},{},o.dur);
  window.__tl=tl;
  window.__info=Object.assign({W:o.W,H:o.H,fps:o.fps,duration:o.dur,frames:Math.round(o.dur*o.fps),poster:o.poster??+(o.dur*.618).toFixed(2),cover:o.cover},extra);
  (document.fonts?document.fonts.ready:Promise.resolve()).then(async()=>{
    if(R2.ready)await R2.ready;
    tl.time(+Q.get('t')||0,false);draw();window.__ready=true;
    if(Q.has('play'))tl.repeat(-1).play();
  });
};
})();
