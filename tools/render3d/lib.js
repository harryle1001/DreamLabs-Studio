// Session P — thư viện render ảnh sản phẩm: môi trường softbox PMREM, tích lũy nhiều mẫu (AA + bóng mềm + DOF), hậu kỳ.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export {T,RoundedBoxGeometry};
export const PHI=1.61803398875,W=1440,H=890;
export const cv=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
export function rng(seed=1){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const tex=(c,o={})=>{const t=new T.CanvasTexture(c);if(o.srgb!==false)t.colorSpace=T.SRGBColorSpace;t.anisotropy=16;if(o.repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(o.repeat[0],o.repeat[1])}if(o.flipY===false)t.flipY=false;return t};
export const V2=(a,b)=>new T.Vector2(a,b),V3=(a,b,c)=>new T.Vector3(a,b,c);
const halton=(i,b)=>{let f=1,r=0;while(i>0){f/=b;r+=f*(i%b);i=Math.floor(i/b)}return r};

/* ---------- chữ ---------- */
export const FONTS=['300 40px "Be Vietnam Pro"','400 40px "Be Vietnam Pro"','500 40px "Be Vietnam Pro"','600 40px "Be Vietnam Pro"','400 40px Cormorant','italic 400 40px Cormorant','400 40px Playfair','600 40px Playfair','italic 400 40px Playfair','300 40px Fraunces','400 40px Fraunces','italic 300 40px Fraunces','italic 400 40px Fraunces','400 40px Unbounded','300 40px Unbounded','400 40px "Space Mono"'];
export async function loadFonts(){await Promise.all(FONTS.map(f=>document.fonts.load(f,'Khuê Lam Tịnh Vân Hạc Thiên Trục Ánh Triêu Vân Sơn Tĩnh Dạ Bạch Liên Mặc Đặng ƯỜỞ ẩm ự ỹ №·—')));await document.fonts.ready}
/* vẽ chữ: canh theo align, tự co cho vừa mw, giãn chữ ls(px) */
export function txt(x,s,px,py,font,fill,o={}){const ls=o.ls||0,m=/(\d+(?:\.\d+)?)px/.exec(font);x.save();x.font=font;x.letterSpacing=ls+'px';
 if(o.mw){const w=x.measureText(s).width;if(w>o.mw){const k=o.mw/w;x.font=font.replace(m[0],(+m[1]*k).toFixed(1)+'px');x.letterSpacing=(ls*k)+'px'}}
 x.fillStyle=fill;x.textAlign=o.align||'center';x.textBaseline=o.base||'alphabetic';
 /* giãn chữ làm lệch tâm nửa ls: bù lại */
 const dx=(o.align||'center')==='center'?ls/2:0;if(o.stroke){x.strokeStyle=o.stroke;x.lineWidth=o.sw||1;x.strokeText(s,px+dx,py)}x.fillText(s,px+dx,py);x.restore()}

/* ---------- texture thủ tục ---------- */
export function noiseCanvas(size=256,lo=110,hi=146,seed=3){const c=cv(size),x=c.getContext('2d'),d=x.createImageData(size,size),r=rng(seed);for(let i=0;i<size*size;i++){const v=lo+r()*(hi-lo);d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255}x.putImageData(d,0,0);return c}
/* vân da hạt: nhiều đốm sáng nhỏ trên nền xám, lặp được */
export function leatherBump(size=512,cell=9,seed=5,soft=1){const c=cv(size),x=c.getContext('2d'),r=rng(seed);x.fillStyle='#5a5a5a';x.fillRect(0,0,size,size);const n=Math.round(size*size/(cell*cell)*1.35);
 for(let i=0;i<n;i++){const px=r()*size,py=r()*size,rad=cell*(.38+r()*.5);for(const ox of[-size,0,size])for(const oy of[-size,0,size]){if(px+ox<-rad*2||px+ox>size+rad*2||py+oy<-rad*2||py+oy>size+rad*2)continue;const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,rad);g.addColorStop(0,'rgba(215,215,215,.9)');g.addColorStop(.55,'rgba(150,150,150,.55)');g.addColorStop(1,'rgba(60,60,60,0)');x.fillStyle=g;x.beginPath();x.ellipse(px+ox,py+oy,rad,rad*(.7+r()*.3),r()*3,0,7);x.fill()}}
 if(soft){const c2=cv(size),x2=c2.getContext('2d');x2.filter=`blur(${soft}px)`;x2.drawImage(c,0,0);return c2}return c}
/* saffiano / vân chéo */
export function crossBump(size=256,step=7){const c=cv(size),x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,size,size);x.lineWidth=1.4;for(const s of[1,-1]){x.strokeStyle=s>0?'rgba(30,30,30,.8)':'rgba(40,40,40,.7)';for(let i=-size;i<size*2;i+=step){x.beginPath();x.moveTo(i,0);x.lineTo(i+s*size,size);x.stroke()}}return c}
/* vải / linen: sợi dọc ngang */
export function linenBump(size=256,seed=2){const c=cv(size),x=c.getContext('2d'),r=rng(seed);x.fillStyle='#808080';x.fillRect(0,0,size,size);for(let i=0;i<size;i+=2){x.fillStyle=`rgba(${r()>.5?255:0},${r()>.5?255:0},${r()>.5?255:0},${.05+r()*.14})`;x.fillRect(0,i,size,1);x.fillStyle=`rgba(${r()>.5?230:20},${r()>.5?230:20},${r()>.5?230:20},${.05+r()*.14})`;x.fillRect(i,0,1,size)}return c}
/* kim loại xước: sọc mảnh theo một chiều */
export function brushed(size=512,seed=4,vertical=false){const c=cv(size),x=c.getContext('2d'),r=rng(seed);x.fillStyle='#808080';x.fillRect(0,0,size,size);for(let i=0;i<size*3;i++){const p=r()*size,a=.04+r()*.12,v=r()>.5?255:0;x.fillStyle=`rgba(${v},${v},${v},${a})`;const l=size*(.2+r()*.8),s=r()*size;vertical?x.fillRect(p,s,1,l):x.fillRect(s,p,l,1);if(s+l>size)vertical?x.fillRect(p,0,1,s+l-size):x.fillRect(0,p,s+l-size,1)}return c}
/* vân gỗ */
export function wood(w=1024,h=1024,base='#5a3a22',dark='#2c1a0e',light='#8a5c36',seed=9){const c=cv(w,h),x=c.getContext('2d'),r=rng(seed);x.fillStyle=base;x.fillRect(0,0,w,h);
 for(let i=0;i<260;i++){const px=r()*w,amp=4+r()*14,f=1+r()*2.4,ph=r()*7;x.strokeStyle=r()>.42?dark:light;x.globalAlpha=.05+r()*.2;x.lineWidth=.6+r()*2.6;x.beginPath();for(let y=0;y<=h;y+=16){const xx=px+Math.sin(y/h*f*6.283+ph)*amp+Math.sin(y/h*13+ph*2)*amp*.25;y?x.lineTo(xx,y):x.moveTo(xx,y)}x.stroke()}
 x.globalAlpha=1;return c}
/* đá cẩm thạch / onyx */
export function marble(size=1024,base='#efece6',vein='#8d8a84',seed=11,n=16){const c=cv(size),x=c.getContext('2d'),r=rng(seed);x.fillStyle=base;x.fillRect(0,0,size,size);
 /* mây loang */
 for(let i=0;i<60;i++){const g=x.createRadialGradient(r()*size,r()*size,0,r()*size,r()*size,size*(.1+r()*.3));g.addColorStop(0,vein);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=.035+r()*.05;x.fillStyle=g;x.fillRect(0,0,size,size)}
 x.filter='blur(1.2px)';for(let i=0;i<n;i++){let px=r()*size,py=r()*size,a=r()*6.28;x.strokeStyle=vein;x.globalAlpha=.16+r()*.5;x.lineWidth=.5+r()*r()*5;x.beginPath();x.moveTo(px,py);const st=24+r()*40;for(let k=0;k<st;k++){a+=(r()-.5)*.9;px+=Math.cos(a)*size*.035;py+=Math.sin(a)*size*.035;x.lineTo(px,py)}x.stroke()}
 x.filter='none';x.globalAlpha=1;return c}
export const solid=(col,s=8)=>{const c=cv(s),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,s,s);return c};

/* ---------- vật liệu ---------- */
const bump=(c,rep,scale)=>({bumpMap:tex(c,{srgb:false,repeat:rep}),bumpScale:scale});
let _brush,_leather,_leatherFine,_linen,_cross;
export const TX={get brush(){return _brush||(_brush=brushed())},get leather(){return _leather||(_leather=leatherBump(512,10,5,.8))},get leatherFine(){return _leatherFine||(_leatherFine=leatherBump(512,5,8,.6))},get linen(){return _linen||(_linen=linenBump())},get cross(){return _cross||(_cross=crossBump())}};
export const METAL={gold:'#f5cf82',yellow:'#ffd68a',rose:'#eeb49e',steel:'#d3d5d9',silver:'#eceded',gun:'#4a4b50',black:'#1b1b1e',bronze:'#b98a5a',champagne:'#ead6ad'};
export const M={
 metal:(col='gold',r=.18,o={})=>new T.MeshPhysicalMaterial({color:METAL[col]||col,metalness:1,roughness:r,...o}),
 brushedMetal:(col='steel',r=.32,rep=[2,2],o={})=>{const {bs=.6,...rest}=o;return new T.MeshPhysicalMaterial({color:METAL[col]||col,metalness:1,roughness:r,...bump(TX.brush,rep,bs),...rest})},
 glass:(o={})=>new T.MeshPhysicalMaterial({color:o.color||'#ffffff',metalness:0,roughness:o.r??.03,transmission:1,ior:o.ior||1.5,thickness:o.thick??.5,attenuationColor:new T.Color(o.tint||'#ffffff'),attenuationDistance:o.dist||5,specularIntensity:1,envMapIntensity:o.env??1,clearcoat:o.cc??0,side:o.side||T.FrontSide,dispersion:o.disp||0}),
 leather:(col,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:o.r??.48,metalness:0,clearcoat:o.cc??.25,clearcoatRoughness:o.ccr??.35,sheen:o.sheen??.25,sheenRoughness:.5,sheenColor:new T.Color(o.sheenColor||'#ffffff'),...bump(o.fine?TX.leatherFine:o.cross?TX.cross:TX.leather,o.rep||[4,4],o.bs??.9),side:o.side||T.FrontSide}),
 patent:(col,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:o.r??.22,metalness:0,clearcoat:1,clearcoatRoughness:o.ccr??.04,side:o.side||T.FrontSide}),
 velvet:(col,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:1,metalness:0,sheen:1,sheenRoughness:o.sr??.45,sheenColor:new T.Color(o.sheen||col).multiplyScalar(o.sk??1.6),...bump(noiseCanvas(256,90,170,21),o.rep||[6,6],.25),side:o.side||T.FrontSide}),
 paper:(col,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:o.r??.82,metalness:0,...bump(o.linen===false?noiseCanvas(256,118,138,31):TX.linen,o.rep||[6,6],o.bs??.35),side:o.side||T.FrontSide}),
 lacquer:(col,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:o.r??.3,metalness:0,clearcoat:1,clearcoatRoughness:o.ccr??.03,side:o.side||T.FrontSide}),
 matte:(col,r=.7,o={})=>new T.MeshPhysicalMaterial({color:col,roughness:r,metalness:0,...o}),
 stone:(canvas,o={})=>new T.MeshPhysicalMaterial({map:tex(canvas,{repeat:o.rep}),roughness:o.r??.28,metalness:0,clearcoat:o.cc??.6,clearcoatRoughness:.12}),
};
export const mesh=(g,m,o={})=>{const me=new T.Mesh(g,m);if(o.p)me.position.set(...o.p);if(o.r)me.rotation.set(...o.r);if(o.s)typeof o.s==='number'?me.scale.setScalar(o.s):me.scale.set(...o.s);me.castShadow=o.cast!==false;me.receiveShadow=o.recv!==false;if(o.to)o.to.add(me);if(o.order!=null)me.renderOrder=o.order;return me};
export const lathe=(pts,seg=96)=>new T.LatheGeometry(pts.map(p=>V2(p[0],p[1])),seg);
/* profile bo mượt: nối các điểm bằng spline rồi lấy mẫu */
export const latheSmooth=(pts,seg=96,n=80)=>{const c=new T.SplineCurve(pts.map(p=>V2(p[0],p[1])));return new T.LatheGeometry(c.getPoints(n),seg)};
/* hình chữ nhật bo góc làm Shape */
export function rrShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.absarc(x+w-r,y+r,r,-Math.PI/2,0);s.lineTo(x+w,y+h-r);s.absarc(x+w-r,y+h-r,r,0,Math.PI/2);s.lineTo(x+r,y+h);s.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI);s.lineTo(x,y+r);s.absarc(x+r,y+r,r,Math.PI,Math.PI*1.5);return s}
/* khối đùn đứng (đáy ở y=0) từ Shape nằm trên mặt XZ */
export function prism(shape,h,bev=.02,seg=4,curve=24){const g=new T.ExtrudeGeometry(shape,{depth:h-bev*2,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelSegments:seg,curveSegments:curve});g.rotateX(-Math.PI/2);g.translate(0,bev,0);return g}
export const rbox=(w,h,d,r=.02,seg=5)=>{const g=new RoundedBoxGeometry(w,h,d,seg,r);return g};
/* chữ / logo phẳng trong suốt (decal) */
export function decal(canvas,w,h,o={}){const t=tex(canvas);const m=new T.MeshPhysicalMaterial({map:t,transparent:true,alphaTest:o.at??0,roughness:o.r??.35,metalness:o.metal??0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:o.side||T.FrontSide,...(o.emissive?{emissive:new T.Color(o.emissive),emissiveMap:t,emissiveIntensity:o.ei??.4}:{})});const me=new T.Mesh(new T.PlaneGeometry(w,h),m);me.castShadow=false;me.receiveShadow=false;me.renderOrder=5;return me}
/* decal ôm mặt trụ */
export function decalCyl(canvas,r,h,arc,o={}){const t=tex(canvas);const m=new T.MeshPhysicalMaterial({map:t,transparent:true,roughness:o.r??.35,metalness:o.metal??0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});const me=new T.Mesh(new T.CylinderGeometry(r,o.r2??r,h,96,1,true,-arc/2,arc),m);me.castShadow=false;me.renderOrder=5;return me}

/* ---------- môi trường softbox ---------- */
function softRect(fall=.25){const c=cv(256),x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,256);const f=Math.max(2,fall*128);x.filter=`blur(${f*.5}px)`;x.fillStyle='#fff';x.fillRect(f,f,256-2*f,256-2*f);return c}
export function buildEnv(renderer,spec={}){
 const env=new T.Scene();
 /* phòng: cầu gradient dọc */
 const gc=cv(16,256),gx=gc.getContext('2d'),gg=gx.createLinearGradient(0,0,0,256);(spec.room||['#3a3a40','#1c1c20','#0c0c0e']).forEach((c,i,a)=>gg.addColorStop(i/(a.length-1),c));gx.fillStyle=gg;gx.fillRect(0,0,16,256);
 const rm=new T.MeshBasicMaterial({map:tex(gc),side:T.BackSide});rm.color.multiplyScalar(spec.roomI??1);env.add(new T.Mesh(new T.SphereGeometry(40,32,24),rm));
 for(const p of spec.panels||[]){const m=new T.MeshBasicMaterial({map:tex(softRect(p.soft??.25)),color:p.color||'#ffffff',blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,transparent:true});m.color.multiplyScalar(p.i??4);
  const me=new T.Mesh(new T.PlaneGeometry(p.size[0],p.size[1]),m);me.position.set(...p.pos);me.lookAt(...(p.at||[0,0,0]));if(p.roll)me.rotateZ(p.roll);env.add(me)}
 const pm=new T.PMREMGenerator(renderer);const rt=pm.fromScene(env,spec.sigma??.012,.1,100,{size:spec.size||512});pm.dispose();return rt.texture}
/* các bộ đèn dựng sẵn */
export const ENV={
 /* tối, kịch tính: hai dải softbox hai bên + đèn trần, hợp thủy tinh và kim loại */
 dark:(o={})=>({room:o.room||['#26262b','#121215','#050506'],roomI:o.roomI??1,panels:[
  {size:[3.2,16],pos:[-11,3,4],color:o.key||'#fff3e2',i:o.keyI??9,soft:.3},
  {size:[2.2,14],pos:[11,3,1],color:o.fill||'#dfe8ff',i:o.fillI??5,soft:.3},
  {size:[10,6],pos:[0,13,2],color:'#ffffff',i:o.topI??3.2,soft:.5},
  {size:[14,1.6],pos:[0,2.4,-13],color:o.rim||'#ffffff',i:o.rimI??4,soft:.35},
  {size:[2,9],pos:[5,4,11],color:'#ffffff',i:o.frontI??1.6,soft:.4},
  ...(o.extra||[])]}),
 /* sáng, mềm: hộp đèn lớn, hợp da, giấy, gốm */
 light:(o={})=>({room:o.room||['#d9d6d2','#a9a6a3','#6f6d6b'],roomI:o.roomI??.85,panels:[
  {size:[9,12],pos:[-10,6,6],color:o.key||'#fff6ea',i:o.keyI??5,soft:.5},
  {size:[7,10],pos:[11,4,3],color:o.fill||'#eef2ff',i:o.fillI??2.4,soft:.5},
  {size:[12,8],pos:[0,13,1],color:'#ffffff',i:o.topI??3,soft:.5},
  {size:[12,2],pos:[0,3,-13],color:'#ffffff',i:o.rimI??2.6,soft:.35},
  ...(o.extra||[])]}),
};

/* ---------- nền 2D ---------- */
/* nền liền mạch: gradient dọc + quầng sáng + tối góc. o.stops [[t,color]…] */
export function backdrop(o){const c=cv(W,H),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,H);o.stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,W,H);
 for(const gl of o.glows||[]){const cx=gl.x*W,cy=gl.y*H,r=gl.r*W;x.save();x.translate(cx,cy);x.scale(1,gl.sy||1);const rg=x.createRadialGradient(0,0,0,0,0,r);rg.addColorStop(0,gl.color);rg.addColorStop(gl.mid??.5,gl.color.replace(/[\d.]+\)$/,m=>(parseFloat(m)*.38)+')'));rg.addColorStop(1,gl.color.replace(/[\d.]+\)$/,'0)'));x.fillStyle=rg;x.globalCompositeOperation=gl.op||'source-over';x.fillRect(-r,-r,2*r,2*r);x.restore()}
 if(o.vig){const rg=x.createRadialGradient(W*.5,H*.5,H*.3,W*.5,H*.5,W*.75);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,`rgba(0,0,0,${o.vig})`);x.fillStyle=rg;x.fillRect(0,0,W,H)}
 if(o.paint)o.paint(x);return c}

/* ---------- sân khấu ---------- */
export function makeStage(renderer,o={}){
 const scene=new T.Scene(),stage=new T.Group();scene.add(stage);
 scene.environment=buildEnv(renderer,o.env||ENV.dark());scene.environmentIntensity=o.envI??1;if(o.envRot!=null)scene.environmentRotation=new T.Euler(0,o.envRot,0);
 const bgC=o.bg;scene.background=tex(bgC);
 renderer.toneMapping={aces:T.ACESFilmicToneMapping,agx:T.AgXToneMapping,neutral:T.NeutralToneMapping,none:T.NoToneMapping}[o.tone||'neutral'];renderer.toneMappingExposure=o.exp??1;
 /* sàn hứng bóng */
 const floor=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({opacity:o.shadow??.42,color:new T.Color(o.shadowColor||'#000000')}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const lights=[];
 const addLight=(pos,i,soft,col='#ffffff',o2={})=>{const l=new T.DirectionalLight(col,i);l.position.set(...pos);l.castShadow=o2.cast!==false;const s=l.shadow,e=o2.ext||4.5;s.mapSize.set(o2.map||2048,o2.map||2048);s.camera.left=-e;s.camera.right=e;s.camera.top=e;s.camera.bottom=-e;s.camera.near=.5;s.camera.far=40;s.bias=o2.bias??-.0004;s.normalBias=o2.nb??.012;l.userData.soft=soft;l.userData.base=l.position.clone();if(o2.target)l.target.position.set(...o2.target);scene.add(l,l.target);lights.push(l);return l};
 (o.lights||[{pos:[-4,7,5],i:1.6,soft:.9,color:'#fff4e6'},{pos:[1.5,9,-1],i:.9,soft:2.6}]).forEach(l=>addLight(l.pos,l.i,l.soft,l.color,l));
 return{scene,stage,floor,lights,bgC,addLight}}
/* bóng tiếp xúc mềm vẽ sẵn (đặt dưới chân vật) */
export function blob(rx=1,rz=rx,op=.5,col='#000000'){const c=cv(256),x=c.getContext('2d'),g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,col);g.addColorStop(.5,col+'77');g.addColorStop(1,col+'00');x.fillStyle=g;x.fillRect(0,0,256,256);const m=new T.Mesh(new T.PlaneGeometry(rx*2,rz*2),new T.MeshBasicMaterial({map:tex(c),transparent:true,opacity:op,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.y=.003;m.renderOrder=-1;m.castShadow=false;return m}

/* ---------- render tích lũy ---------- */
const LUT=new Float32Array(256);for(let i=0;i<256;i++){const c=i/255;LUT[i]=c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
export async function accumulate(renderer,scene,camera,o={}){
 const gl=renderer.getContext(),n=o.samples||24,buf=new Uint8Array(W*H*4),acc=new Float32Array(W*H*3),base=camera.position.clone(),focus=o.focus||V3(0,.8,0),ap=o.aperture||0;
 camera.lookAt(focus);camera.updateMatrixWorld();const right=V3().setFromMatrixColumn(camera.matrixWorld,0),up=V3().setFromMatrixColumn(camera.matrixWorld,1);
 const lights=o.lights||[];
 for(let i=0;i<n;i++){
  camera.setViewOffset(W,H,halton(i+1,2)-.5,halton(i+1,3)-.5,W,H);
  if(ap){const a=6.2832*halton(i+1,5),rad=ap*Math.sqrt(halton(i+1,7));camera.position.copy(base).addScaledVector(right,Math.cos(a)*rad).addScaledVector(up,Math.sin(a)*rad);camera.lookAt(focus)}
  lights.forEach((l,k)=>{const b=l.userData.base,s=l.userData.soft||0;if(!s)return;const d=b.clone().sub(l.target.position).normalize(),u=V3(0,1,0).cross(d);if(u.lengthSq()<1e-4)u.set(1,0,0);u.normalize();const v=d.clone().cross(u);const a=6.2832*halton(i+1,11+k*2),rad=s*Math.sqrt(halton(i+1,13+k*4));l.position.copy(b).addScaledVector(u,Math.cos(a)*rad).addScaledVector(v,Math.sin(a)*rad)});
  renderer.render(scene,camera);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,buf);
  for(let p=0,q=0;p<buf.length;p+=4,q+=3){acc[q]+=LUT[buf[p]];acc[q+1]+=LUT[buf[p+1]];acc[q+2]+=LUT[buf[p+2]]}
  if(i%2===1)await new Promise(r=>setTimeout(r,0))}
 camera.position.copy(base);camera.clearViewOffset();camera.lookAt(focus);lights.forEach(l=>l.position.copy(l.userData.base));
 const out=cv(W,H),x=out.getContext('2d'),d=x.createImageData(W,H),r=rng(99),inv=1/n;
 for(let y=0;y<H;y++){const sy=(H-1-y)*W*3;for(let xx=0;xx<W;xx++){const q=sy+xx*3,p=(y*W+xx)*4;for(let k=0;k<3;k++){const l=acc[q+k]*inv,s=l<=.0031308?l*12.92:1.055*Math.pow(l,1/2.4)-.055;d.data[p+k]=Math.max(0,Math.min(255,s*255+r()-.5+.5))}d.data[p+3]=255}}
 x.putImageData(d,0,0);return out}

/* phản chiếu trên mặt sàn bóng: render cảnh lật ngược, trộn vào nền */
export async function reflect(renderer,st,camera,o={}){
 const {scene,stage,floor,bgC}=st;stage.scale.y=-1;floor.visible=false;const hid=[];scene.traverse(n=>{if(n.userData.noReflect&&n.visible){n.visible=false;hid.push(n)}});
 const R=await accumulate(renderer,scene,camera,{samples:o.samples||6,focus:o.focus,lights:[]});
 stage.scale.y=1;floor.visible=true;hid.forEach(n=>n.visible=true);
 const m=cv(W,H),mx=m.getContext('2d');mx.filter=`blur(${o.blur??2.5}px)`;mx.drawImage(R,0,0);mx.filter='none';
 /* mặt nạ: phần khác nền → giữ; mờ dần theo chiều dọc từ y0 tới y1 */
 mx.globalCompositeOperation='destination-in';const g=mx.createLinearGradient(0,o.y0*H,0,o.y1*H);g.addColorStop(0,`rgba(0,0,0,${o.k??.42})`);g.addColorStop(1,'rgba(0,0,0,0)');mx.fillStyle=g;mx.fillRect(0,0,W,H);
 const c2=cv(W,H),x2=c2.getContext('2d');x2.drawImage(bgC,0,0);x2.drawImage(m,0,0);scene.background.dispose();scene.background=tex(c2);st.bgC=c2;return c2}

/* ---------- hậu kỳ ---------- */
export function post(src,o={}){const c=cv(W,H),x=c.getContext('2d');x.drawImage(src,0,0);
 if(o.bloom){const b=cv(W/4,H/4),bx=b.getContext('2d');bx.filter=`brightness(${o.bloomCut??.55}) contrast(${o.bloomCon??3})`;bx.drawImage(src,0,0,W/4,H/4);const b2=cv(W/4,H/4),b2x=b2.getContext('2d');b2x.filter=`blur(${o.bloomR??7}px)`;b2x.drawImage(b,0,0);x.save();x.globalCompositeOperation='screen';x.globalAlpha=o.bloom;x.imageSmoothingQuality='high';x.drawImage(b2,0,0,W,H);x.restore()}
 if(o.vig){const rg=x.createRadialGradient(W*.5,H*.5,H*.35,W*.5,H*.5,W*.72);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,`rgba(0,0,0,${o.vig})`);x.fillStyle=rg;x.fillRect(0,0,W,H)}
 if(o.over)o.over(x);return c}
export const cam=(fov,pos)=>{const c=new T.PerspectiveCamera(fov,W/H,.1,100);c.position.set(...pos);return c};

/* ---------- hình học bổ sung ---------- */
/* tiết diện chữ nhật bo góc: trả về vòng điểm [a(dày), b(rộng)] */
export function rrSection(thick,width,r,n=6){const pts=[],hw=width/2,ht=thick/2;r=Math.min(r,hw,ht);const cs=[[ht-r,hw-r,0],[-(ht-r),hw-r,Math.PI/2],[-(ht-r),-(hw-r),Math.PI],[ht-r,-(hw-r),Math.PI*1.5]];
 for(const [ca,cb,a0] of cs)for(let i=0;i<=n;i++){const a=a0+i/n*Math.PI/2;pts.push([ca+r*Math.cos(a),cb+r*Math.sin(a)])}return pts}
export const circSection=(r,n=16,sb=1)=>Array.from({length:n},(_,i)=>{const a=i/n*6.28318;return[r*Math.cos(a),r*sb*Math.sin(a)]});
/* quét tiết diện kín dọc đường cong. section: mảng điểm hoặc hàm t→mảng điểm. up: vectơ tham chiếu (bề rộng b chạy theo up, bề dày a theo pháp tuyến trong mặt phẳng cong) */
export function sweep(curve,section,segs=64,o={}){const up0=o.up||V3(0,0,1),pos=[],uv=[],idx=[],closed=!!o.closed;let n=0;
 for(let i=0;i<=segs;i++){const t=i/segs,P=curve.getPointAt(closed&&i===segs?0:t),tg=curve.getTangentAt(closed&&i===segs?0:t).normalize();const up=up0.clone().addScaledVector(tg,-up0.dot(tg)).normalize(),side=V3().crossVectors(up,tg).normalize();
  const sec=typeof section==='function'?section(t):section;n=sec.length;for(let j=0;j<=n;j++){const [a,b]=sec[j%n];pos.push(P.x+side.x*a+up.x*b,P.y+side.y*a+up.y*b,P.z+side.z*a+up.z*b);uv.push(t*(o.uvLen||1),j/n*(o.uvAround||1))}}
 const row=n+1;for(let i=0;i<segs;i++)for(let j=0;j<n;j++){const a=i*row+j,b=a+1,c=a+row,d=c+1;idx.push(a,c,b,b,c,d)}
 if(!closed&&o.caps!==false){for(const e of[0,segs]){const c0=pos.length/3;let cx=0,cy=0,cz=0;for(let j=0;j<n;j++){cx+=pos[(e*row+j)*3];cy+=pos[(e*row+j)*3+1];cz+=pos[(e*row+j)*3+2]}pos.push(cx/n,cy/n,cz/n);uv.push(0,0);for(let j=0;j<n;j++){const a=e*row+j,b=e*row+j+1;e?idx.push(c0,a,b):idx.push(c0,b,a)}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 /* hàn pháp tuyến ở đường nối vòng tiết diện */
 const N=g.attributes.normal;for(let i=0;i<=segs;i++){const a=i*row,b=i*row+n;const x=N.getX(a)+N.getX(b),y=N.getY(a)+N.getY(b),z=N.getZ(a)+N.getZ(b),l=Math.hypot(x,y,z)||1;N.setXYZ(a,x/l,y/l,z/l);N.setXYZ(b,x/l,y/l,z/l)}
 if(closed)for(let j=0;j<=n;j++){const a=j,b=segs*row+j;const x=N.getX(a)+N.getX(b),y=N.getY(a)+N.getY(b),z=N.getZ(a)+N.getZ(b),l=Math.hypot(x,y,z)||1;N.setXYZ(a,x/l,y/l,z/l);N.setXYZ(b,x/l,y/l,z/l)}
 return g}
export const curve3=(pts,closed=false,tension=.5)=>new T.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V3(p[0],p[1],p[2]||0)),closed,'catmullrom',tension);
/* đường chỉ khâu: các mũi nhỏ dọc theo đường (mảng Vector3), nằm trên mặt có pháp tuyến normal (Vector3 hoặc hàm i→Vector3) */
export function stitches(path,normal,o={}){const len=o.len||.034,gap=o.gap||.026,w=o.w||.009,c=path.getPointAt?path:curve3(path,!!o.closed,.5),L=c.getLength(),cnt=Math.floor(L/(len+gap));
 const geo=new T.CapsuleGeometry(w/2,len-w,3,6);geo.rotateZ(Math.PI/2);const m=new T.InstancedMesh(geo,o.mat||new T.MeshPhysicalMaterial({color:o.color||'#e9dcc6',roughness:.65}),cnt),mt=new T.Matrix4(),q=new T.Quaternion(),bx=V3(),by=V3(),bz=V3(),s=V3(1,1,o.flat??.55);
 for(let i=0;i<cnt;i++){const t=(i+.5)/cnt,P=c.getPointAt(t);bx.copy(c.getTangentAt(t)).normalize();const nn=typeof normal==='function'?normal(t,P):normal;bz.copy(nn).addScaledVector(bx,-nn.dot(bx)).normalize();by.crossVectors(bz,bx);mt.makeBasis(bx,by,bz);q.setFromRotationMatrix(mt);P.addScaledVector(bz,o.lift??.002);mt.compose(P,q,s);m.setMatrixAt(i,mt)}
 m.castShadow=false;m.receiveShadow=true;return m}
/* lưới tham số (u,v)→Vector3, có thể đóng theo v */
export function paramSurface(fn,nu,nv,o={}){const pos=[],uv=[],idx=[],p=V3();for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){fn(i/nu,j/nv,p);pos.push(p.x,p.y,p.z);uv.push(i/nu*(o.uvU||1),j/nv*(o.uvV||1))}
 const row=nv+1;for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*row+j,b=a+1,c=a+row,d=c+1;o.flip?idx.push(a,b,c,b,d,c):idx.push(a,c,b,b,c,d)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 if(o.weld){const N=g.attributes.normal;for(let i=0;i<=nu;i++){if(!o.weld(i/nu))continue;const a=i*row,b=i*row+nv;const x=N.getX(a)+N.getX(b),y=N.getY(a)+N.getY(b),z=N.getZ(a)+N.getZ(b),l=Math.hypot(x,y,z)||1;N.setXYZ(a,x/l,y/l,z/l);N.setXYZ(b,x/l,y/l,z/l)}}
 return g}
/* nội suy trơn qua các điểm [x,y] (Catmull-Rom 1D theo x đơn điệu) */
export function spline1(pts){const c=new T.SplineCurve(pts.map(p=>V2(p[0],p[1]))),N=400,tab=c.getPoints(N);return x=>{if(x<=tab[0].x)return tab[0].y;if(x>=tab[N].x)return tab[N].y;let lo=0,hi=N;while(hi-lo>1){const m=(lo+hi)>>1;tab[m].x<=x?lo=m:hi=m}const a=tab[lo],b=tab[hi],k=(x-a.x)/((b.x-a.x)||1);return a.y+(b.y-a.y)*k}}
export const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
/* loang màu tự nhiên cho da/đá: nền trắng, đốm đậm nhạt mờ → nhân với màu vật liệu */
export function mottle(size=512,amt=.1,seed=17,n=140){const c=cv(size),x=c.getContext('2d'),r=rng(seed);x.fillStyle='#f4f4f4';x.fillRect(0,0,size,size);for(let i=0;i<n;i++){const px=r()*size,py=r()*size,rad=size*(.04+r()*.16),d=r()>.5;for(const ox of[-size,0,size])for(const oy of[-size,0,size]){const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,rad);g.addColorStop(0,d?`rgba(0,0,0,${amt*(.4+r()*.6)})`:`rgba(255,255,255,${amt})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px+ox-rad,py+oy-rad,rad*2,rad*2)}}return c}
/* UV phẳng theo x,z (cho mặt bệ, mặt bàn) */
export function planarUV(g,s=1){const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*s+.5,p.getZ(i)*s+.5+p.getY(i)*s);uv.needsUpdate=true;return g}
