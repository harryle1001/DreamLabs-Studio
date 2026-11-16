/* reel2 — bộ dựng "cảnh quay" 3D bằng Three.js cho các phim Edit Video.
   Cảnh được render theo thời gian t (không theo đồng hồ thật) rồi mới qua lớp dựng: cắt cảnh, speed ramp, grade, phụ đề. */
import * as THREE from '../../vendor/three.module.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
export {THREE,RoundedBoxGeometry};
const R2=window.R2;let SCENE=null;

export function setup({W,H,ss=1,bg=0x0b0b0d,exposure=1,env=.6,parent=document.getElementById('footage'),fov=35}){
  const canvas=document.createElement('canvas');parent.prepend(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!R2.Q.has('noaa'),preserveDrawingBuffer:true,powerPreference:'high-performance'});
  ss=+R2.Q.get('ss')||ss;renderer.setPixelRatio(ss);renderer.setSize(W,H,false);canvas.style.width=W+'px';canvas.style.height=H+'px';
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.transmissionResolutionScale=.5;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene();SCENE=scene;scene.background=new THREE.Color(bg);
  const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=env;
  const camera=new THREE.PerspectiveCamera(fov,W/H,.05,200);
  window.__3d={renderer,scene,camera,THREE};return {renderer,scene,camera,canvas};
}
export const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export function mk(geo,mat,{pos,rot,scale,cast=true,recv=true,parent,name}={}){const m=new THREE.Mesh(geo,mat);
  if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);if(scale)(typeof scale==='number'?m.scale.setScalar(scale):m.scale.set(...scale));
  m.castShadow=cast;m.receiveShadow=recv;if(name)m.name=name;(parent||SCENE).add(m);return m}
export function group(parent,pos){const g=new THREE.Group();if(pos)g.position.set(...pos);(parent||SCENE).add(g);return g}

/* ---------- texture thủ tục ---------- */
export function canvasTex(w,h,draw,{srgb=true,repeat,aniso=4}={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat)}t.anisotropy=aniso;return t}
function fbm(size,seed,oct=4,base=4){const rnd=R2.rng(seed),out=new Float32Array(size*size);let amp=1,tot=0;
  for(let o=0;o<oct;o++){const n=base<<o,g=new Float32Array(n*n);for(let i=0;i<n*n;i++)g[i]=rnd();
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const fx=x/size*n,fy=y/size*n,x0=fx|0,y0=fy|0,x1=(x0+1)%n,y1=(y0+1)%n,u=fx-x0,v=fy-y0,su=u*u*(3-2*u),sv=v*v*(3-2*v);
      out[y*size+x]+=amp*((g[y0*n+x0]*(1-su)+g[y0*n+x1]*su)*(1-sv)+(g[y1*n+x0]*(1-su)+g[y1*n+x1]*su)*sv)}
    tot+=amp;amp*=.5}
  for(let i=0;i<out.length;i++)out[i]/=tot;return out}
/* vân nhiễu xám: dùng làm bump / roughness */
export function noiseTex(size=256,seed=1,{oct=4,base=8,contrast=1,repeat=[1,1],grain=0}={}){const f=fbm(size,seed,oct,base),rnd=R2.rng(seed+9);
  return canvasTex(size,size,(g)=>{const im=g.createImageData(size,size);for(let i=0;i<f.length;i++){let v=(f[i]-.5)*contrast+.5+(rnd()-.5)*grain;v=Math.max(0,Math.min(1,v))*255;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}g.putImageData(im,0,0)},{srgb:false,repeat})}
/* đá cẩm thạch / travertine: nền loang + gân */
export function stoneTex({size=1024,base=[232,226,216],dark=[150,140,128],vein=[110,100,92],veins=9,seed=3,bands=0,repeat}={}){const f=fbm(256,seed,5,3),rnd=R2.rng(seed*7+1);
  return canvasTex(size,size,(g)=>{const c=document.createElement('canvas');c.width=c.height=256;const cg=c.getContext('2d'),im=cg.createImageData(256,256);
    for(let i=0;i<f.length;i++){let v=f[i];if(bands){const y=(i/256|0)/256;v=.5+.5*Math.sin((y*bands+f[i]*2.2)*6.283)*.6+ (f[i]-.5)*.5}v=Math.max(0,Math.min(1,(v-.3)*1.7));
      for(let k=0;k<3;k++)im.data[i*4+k]=dark[k]+(base[k]-dark[k])*v;im.data[i*4+3]=255}cg.putImageData(im,0,0);
    g.imageSmoothingQuality='high';g.drawImage(c,0,0,size,size);
    g.lineCap='round';g.lineJoin='round';
    for(let v=0;v<veins;v++){let x=rnd()*size,y=rnd()*size,a=rnd()*6.28;const w=.6+rnd()*rnd()*5,al=.12+rnd()*.4;g.strokeStyle=`rgba(${vein},${al})`;g.filter=`blur(${(.4+rnd()*1.6).toFixed(1)}px)`;
      g.lineWidth=w;g.beginPath();g.moveTo(x,y);for(let s=0;s<60;s++){a+=(rnd()-.5)*.7;x+=Math.cos(a)*size*.03;y+=Math.sin(a)*size*.03;g.lineTo(x,y);if(rnd()<.06){g.stroke();g.lineWidth=w*(.4+rnd()*.8);g.beginPath();g.moveTo(x,y)}}g.stroke()}
    g.filter='none'},{repeat})}
/* bóng đổ kiểu "ánh sáng qua cửa sổ / tán lá" cho SpotLight.map */
export function gobo(kind='window',seed=2){const rnd=R2.rng(seed);return canvasTex(512,512,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.filter='blur(6px)';g.fillStyle='#fff';
  if(kind==='window'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)g.fillRect(70+i*128,60+j*132,104,108)}
  else if(kind==='slats'){for(let i=0;i<9;i++)g.fillRect(40,44+i*50,432,26)}
  else if(kind==='arch'){g.beginPath();g.moveTo(150,470);g.lineTo(150,230);g.arc(256,230,106,Math.PI,0);g.lineTo(362,470);g.closePath();g.fill()}
  else{g.fillRect(0,0,w,h);g.fillStyle='#000';for(let i=0;i<70;i++){const x=rnd()*w,y=rnd()*h,r=14+rnd()*38,a=rnd()*3.14;g.beginPath();g.ellipse(x,y,r,r*.36,a,0,6.283);g.fill()}}
  g.filter='none'},{srgb:true})}

/* ---------- vật liệu ---------- */
export const M={
  glass:(o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color:0xffffff,transmission:1,roughness:.04,metalness:0,ior:1.5,thickness:.3,attenuationColor:new THREE.Color(0xffffff),attenuationDistance:5,specularIntensity:1,envMapIntensity:1.2},o)),
  liquid:(color,o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color,transmission:.9,roughness:.02,ior:1.36,thickness:.6,attenuationColor:new THREE.Color(color),attenuationDistance:.35},o)),
  metal:(color=0xd9b266,rough=.22,o={})=>new THREE.MeshStandardMaterial(Object.assign({color,metalness:1,roughness:rough},o)),
  leather:(color,o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.5,metalness:0,bumpMap:noiseTex(256,5,{oct:3,base:32,contrast:1.6,grain:.35,repeat:[3,3]}),bumpScale:1.2,sheen:.4,sheenRoughness:.5,sheenColor:new THREE.Color(0xffffff),clearcoat:.15,clearcoatRoughness:.5},o)),
  matte:(color,rough=.9,o={})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:rough,metalness:0},o)),
  lacquer:(color,o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.25,clearcoat:1,clearcoatRoughness:.06},o)),
  glow:(color,i=1)=>new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(i),toneMapped:false}),
};
/* đèn spot đổ bóng mềm (key light) */
export function spot(scene,{pos=[3,5,3],target=[0,0,0],color=0xffffff,intensity=60,angle=.5,pen=.7,map,shadow=true,size=2048,radius=5,decay=2,bias=-.0005}={}){
  const l=new THREE.SpotLight(color,intensity,0,angle,pen,decay);l.position.set(...pos);l.target.position.set(...target);scene.add(l,l.target);
  if(map)l.map=map;if(shadow){l.castShadow=true;l.shadow.mapSize.set(size,size);l.shadow.radius=radius;l.shadow.bias=bias;l.shadow.normalBias=.02;l.shadow.camera.near=.5;l.shadow.camera.far=40}return l}
export function plight(scene,{pos,color=0xffffff,intensity=10,decay=2,shadow=false}){const l=new THREE.PointLight(color,intensity,0,decay);l.position.set(...pos);if(shadow){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.radius=4;l.shadow.bias=-.002}scene.add(l);return l}

/* ---------- hệ cảnh quay: mỗi shot có máy quay p0->p1, điểm nhìn l0->l1, fov, speed ramp ----------
   shot={t0,t1,p0,p1,l0,l1,f0,f1,roll0,roll1,ease,ramp,shake,on(v,u,shot)}  ramp(u)->v là hàm bẻ tốc độ */
export const ramp={
  lin:u=>u,
  slowmid:(k=.75)=>u=>u+k*Math.sin(2*Math.PI*u)/(2*Math.PI),     /* nhanh – chậm (slow-mo) – nhanh */
  fastmid:(k=.75)=>u=>u-k*Math.sin(2*Math.PI*u)/(2*Math.PI),
  out:(p=2.2)=>u=>1-Math.pow(1-u,p),                               /* vào nhanh rồi hãm lại */
  in:(p=2.2)=>u=>Math.pow(u,p),
};
export function shots(list,camera){const tmpP=new THREE.Vector3(),tmpL=new THREE.Vector3(),L=(a,b,u,out)=>out.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u);
  return t=>{let i=0;for(let k=0;k<list.length;k++)if(t>=list[k].t0-1e-6)i=k;const s=list[i],u=R2.clamp((t-s.t0)/(s.t1-s.t0)),v=(s.ramp||ramp.lin)(u),e=s.ease?s.ease(v):v;
    L(s.p0,s.p1||s.p0,e,tmpP);L(s.l0,s.l1||s.l0,e,tmpL);const sh=s.shake??.012;
    tmpP.x+=R2.noise(t*1.3,i+1)*sh;tmpP.y+=R2.noise(t*1.1,i+7)*sh;tmpL.x+=R2.noise(t*.9,i+13)*sh*.6;tmpL.y+=R2.noise(t*1.2,i+19)*sh*.6;
    camera.position.copy(tmpP);camera.up.set(0,1,0);camera.lookAt(tmpL);
    const roll=(s.roll0||0)+((s.roll1??s.roll0??0)-(s.roll0||0))*e;if(roll)camera.rotateZ(roll);
    const f=(s.f0||35)+((s.f1??s.f0??35)-(s.f0||35))*e;if(camera.fov!==f){camera.fov=f;camera.updateProjectionMatrix()}
    if(s.on)s.on(v,u,s,t);return {i,u,v,s}}}
