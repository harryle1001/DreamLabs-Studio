// Vân Sơn — rượu mạch nha đơn cất ủ thùng sồi (concept). Dáng chai vai rộng đáy dày, nhãn giấy in nổi, màng co cổ chai, hộp gỗ óc chó.
export const VAR={
 y12:{name:'12 năm · Sồi Mỹ',age:'12',cask:'THÙNG SỒI MỸ',paper:'#efe6d2',ink:'#2a1c10',acc:'#a8552a',foil:'#b86a3a',liq:['#ffcf7a','#d98a1c','#8a4a08'],cap:'#2a1c10'},
 y18:{name:'18 năm · Sherry',age:'18',cask:'THÙNG SHERRY OLOROSO',paper:'#14110f',ink:'#e6c98e',acc:'#e6c98e',foil:'#d9b56c',liq:['#ffb45a',' #c7650e','#6e2c04'],cap:'#14110f'},
 y25:{name:'25 năm · Bản giới hạn',age:'25',cask:'THÙNG SỒI MIZUNARA',paper:'#1c2b24',ink:'#ead9b0',acc:'#d9b56c',foil:'#16110d',liq:['#f59a48','#a8480a','#521c02'],cap:'#16110d'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3,V2}=L;
 function labelTex(v){const W=1500,H=1000,c=cv(W,H),x=c.getContext('2d'),C=W/2;x.fillStyle=v.paper;x.fillRect(0,0,W,H);
  /* giấy: hạt nhẹ */
  const n=L.noiseCanvas(256,0,255,7);x.globalAlpha=.05;x.drawImage(n,0,0,W,H);x.globalAlpha=1;
  x.strokeStyle=v.acc;x.lineWidth=5;x.strokeRect(46,46,W-92,H-92);x.lineWidth=1.5;x.strokeRect(62,62,W-124,H-124);
  /* dấu hiệu: núi ba lớp và dải mây */
  x.lineWidth=4;x.strokeStyle=v.ink;x.lineJoin='round';x.beginPath();x.moveTo(C-120,238);x.lineTo(C-48,150);x.lineTo(C-8,196);x.lineTo(C+34,128);x.lineTo(C+120,238);x.stroke();
  x.beginPath();x.moveTo(C-150,214);x.bezierCurveTo(C-90,190,C-50,236,C,212);x.bezierCurveTo(C+50,188,C+90,236,C+150,212);x.strokeStyle=v.acc;x.stroke();
  txt(x,'VÂN SƠN',C,410,'400 170px Cormorant',v.ink,{ls:34});
  txt(x,'RƯỢU MẠCH NHA ĐƠN CẤT',C,482,'500 36px "Be Vietnam Pro"',v.ink,{ls:15});
  x.fillStyle=v.acc;x.fillRect(C-250,520,500,2);
  txt(x,v.age,C-10,720,'400 230px Playfair',v.acc);txt(x,'NĂM',C+ (v.age.length>1?168:120),720,'500 40px "Be Vietnam Pro"',v.ink,{ls:10,align:'left'});
  txt(x,'Ủ TRONG '+v.cask,C,800,'500 32px "Be Vietnam Pro"',v.ink,{ls:10});
  txt(x,'Chai số 0127 / 1.200   ·   43% vol   ·   700 ml',C,880,'italic 400 40px Cormorant',v.ink,{ls:2});
  return c}
 function bottle(v,o={}){const g=new T.Group();
  const body=[[0,0],[.5,0],[.57,.015],[.61,.06],[.62,.14],[.62,1.5],[.61,1.6],[.57,1.72],[.47,1.86],[.33,1.99],[.24,2.08],[.2,2.18],[.19,2.3],[.19,2.66],[.205,2.675],[.215,2.7],[.215,2.76],[.19,2.78]];
  /* rượu: trụ nhỏ hơn bên trong, đáy kính dày */
  const lc=cv(32,256),lx=lc.getContext('2d'),lg=lx.createLinearGradient(0,0,0,256);lg.addColorStop(0,v.liq[1].trim());lg.addColorStop(.6,v.liq[1].trim());lg.addColorStop(1,v.liq[0]);lx.fillStyle=lg;lx.fillRect(0,0,32,256);
  const liq=new T.MeshPhysicalMaterial({color:v.liq[2],roughness:.1,emissive:new T.Color('#ffffff'),emissiveMap:tex(lc),emissiveIntensity:.55,clearcoat:1});
  mesh(L.lathe([[0,.15],[.5,.15],[.55,.19],[.56,.26],[.56,1.5],[.55,1.6],[.51,1.71],[.42,1.83],[.29,1.95],[.2,2.04],[.15,2.12],[.14,2.18],[0,2.18]],96),liq,{to:g,cast:false});
  mesh(L.lathe(body,128),M.glass({thick:.3,ior:1.5,tint:'#fff6e8'}),{to:g});
  /* nhãn giấy: ôm 46% chu vi */
  const arc=Math.PI*.92,lh=.8,lt=tex(labelTex(v)),lm=new T.MeshPhysicalMaterial({map:lt,roughness:.78,bumpMap:tex(L.noiseCanvas(256,110,146,9),{srgb:false,repeat:[8,5]}),bumpScale:.2});
  const lab=new T.Mesh(new T.CylinderGeometry(.6235,.6235,lh,96,1,true,-arc/2,arc),lm);lab.position.y=.82;lab.castShadow=false;g.add(lab);
  /* màng co cổ chai + nút */
  const foil=new T.MeshPhysicalMaterial({color:v.foil,metalness:.85,roughness:.32});
  mesh(L.lathe([[.2,2.3],[.198,2.31],[.198,2.66],[.213,2.675],[.223,2.7],[.223,2.77],[.2,2.79],[0,2.79]],64),foil,{to:g});
  mesh(L.lathe([[.201,2.36],[.204,2.365],[.204,2.39],[.201,2.395]],64),M.metal('yellow',.2),{to:g});
  mesh(L.lathe([[0,2.79],[.25,2.79],[.262,2.8],[.262,2.98],[.25,2.995],[0,2.995]],64),M.lacquer(v.cap,{r:.35}),{to:g});
  mesh(L.lathe([[0,2.995],[.2,2.995],[.205,3.0],[.2,3.008],[0,3.008]],64),M.metal('yellow',.18),{to:g});
  /* huy hiệu vai chai */
  const mc=cv(256),mx=mc.getContext('2d');mx.fillStyle='#d9b56c';mx.beginPath();mx.arc(128,128,120,0,7);mx.fill();txt(mx,v.age,128,165,'400 130px Playfair','#2a1c10');
  const md=L.decalCyl(mc,.33,.2,.62,{metal:.9,r:.3,r2:.44});md.position.y=1.92;md.visible=false;g.add(md);
  g.userData.h=3;return g}
 function woodBox(v){const g=new T.Group(),w=1.75,h=3.5,d=1.6,wt=tex(L.wood(1024,1024,'#4a2c18','#22120a','#7a4c2a',19));
  const wm=new T.MeshPhysicalMaterial({map:wt,roughness:.45,clearcoat:.5,clearcoatRoughness:.25});
  mesh(L.rbox(w,h,d,.03,3),wm,{p:[0,h/2,0],to:g});
  const c=cv(1024,1600),x=c.getContext('2d'),ink='#e6c98e';x.strokeStyle=ink;x.lineWidth=4;x.strokeRect(90,90,844,1420);
  x.lineJoin='round';x.lineWidth=6;x.beginPath();x.moveTo(512-150,560);x.lineTo(512-60,450);x.lineTo(512-10,508);x.lineTo(512+42,422);x.lineTo(512+150,560);x.stroke();
  txt(x,'VÂN SƠN',512,780,'400 150px Cormorant',ink,{ls:30});txt(x,'RƯỢU MẠCH NHA ĐƠN CẤT',512,850,'500 32px "Be Vietnam Pro"',ink,{ls:13});
  txt(x,v.age+' NĂM',512,1010,'400 80px Playfair',ink,{ls:8});
  const dc=L.decal(c,w*.9,w*.9*1.5625,{metal:.6,r:.35,emissive:'#b8904c',ei:.4});dc.position.set(0,h/2+.1,d/2+.002);g.add(dc);
  /* khe nắp + bản lề đồng */
  mesh(L.rbox(w+.006,.012,d+.006,.004,1),M.matte('#120a06',.8),{p:[0,h-.62,0],to:g});
  for(const sy of[.9,2.5])mesh(L.rbox(.05,.26,.2,.012,2),M.metal('yellow',.25),{p:[w/2+.01,sy,-.2],to:g});
  return g}
 function tumbler(liqc){const g=new T.Group();mesh(L.lathe([[0,0],[.4,0],[.44,.02],[.46,.08],[.47,.9],[.455,.9],[.44,.2],[.4,.16],[0,.16]],96),M.glass({thick:.12,ior:1.5}),{to:g});
  const lm=new T.MeshPhysicalMaterial({color:liqc[2],roughness:.08,emissive:new T.Color(liqc[1].trim()),emissiveIntensity:.5,clearcoat:1});mesh(L.lathe([[0,.17],[.39,.17],[.432,.21],[.438,.42],[0,.42]],64),lm,{to:g,cast:false});return g}

 const bg=(gx=.44)=>L.backdrop({stops:[[0,'#120a05'],[.38,'#2e1a0c'],[.56,'#4a2c14'],[.6,'#3a2210'],[1,'#140b06']],glows:[{x:gx,y:.4,r:.44,color:'rgba(255,170,80,.42)',sy:.9},{x:gx+.2,y:.3,r:.3,color:'rgba(255,200,120,.12)'}],vig:.5});
 const env=L.ENV.dark({room:['#3a2a1c','#1a120b','#070504'],key:'#fff0dc',keyI:11,fill:'#ffe9cf',fillI:5,topI:3.5,rimI:6,frontI:2,extra:[{size:[.8,12],pos:[-7,3,-9],i:15,soft:.3,color:'#ffd9a8'},{size:[.8,12],pos:[7.5,3,-8],i:11,soft:.3,color:'#ffd9a8'},{size:[14,7],pos:[0,5,14],i:.7,soft:.6}]});
 const lights=[{pos:[-4,7,5],i:1.6,soft:1,color:'#fff0dc',ext:6},{pos:[1,9,-2],i:.9,soft:2.6,ext:6}];
 /* mặt bàn gỗ thật: nhận bóng, có ánh sơn */
 const table=(st)=>{const t=tex(L.wood(1024,1024,'#3a2212','#1a0e06','#5e3a1e',5),{repeat:[2.5,2.5]});t.rotation=Math.PI/2;const m=new T.MeshPhysicalMaterial({map:t,roughness:.36,clearcoat:.8,clearcoatRoughness:.18,transparent:true,opacity:.84});const p=mesh(new T.PlaneGeometry(40,17.4),m,{r:[-Math.PI/2,0,0],p:[0,.001,5.2],to:st.scene,cast:false});p.userData.noReflect=true;p.renderOrder=-2;st.floor.position.y=.004;
  /* mép bàn */
  const e=mesh(new T.PlaneGeometry(40,.5),new T.MeshPhysicalMaterial({color:'#1a0e06',roughness:.5}),{p:[0,-.25,-3.5],to:st.scene,cast:false});e.userData.noReflect=true;return p};
 let st,camera,focus,aperture=.03,reflect={y0:.66,y1:1,k:.32,blur:3},post={bloom:.3,vig:.2};
 if(VAR[shot]){const v=VAR[shot];st=L.makeStage(renderer,{bg:bg(),env,tone:'aces',exp:1.05,shadow:.55,lights});
  const b=bottle(v);b.position.set(-.55,0,.3);b.rotation.y=.1;st.stage.add(b);
  const bx=woodBox(v);bx.position.set(1.25,0,-.9);bx.rotation.y=-.42;st.stage.add(bx);
  const tb=tumbler(v.liq);tb.position.set(.62,0,1.15);st.stage.add(tb);
  camera=L.cam(23,[0,2.0,11.4]);focus=V3(.2,1.6,.3);
 }else if(shot==='set'){st=L.makeStage(renderer,{bg:bg(.5),env,tone:'aces',exp:1.05,shadow:.55,lights:lights.map(l=>({...l,ext:7}))});
  [['y12',-1.75,-.3,.25],['y18',0,.45,0],['y25',1.75,-.3,-.25]].forEach(([k,x,z,ry])=>{const b=bottle(VAR[k]);b.position.set(x,0,z);b.rotation.y=ry;st.stage.add(b)});
  camera=L.cam(24,[0,2.0,11.2]);focus=V3(0,1.5,.4);aperture=.03;reflect.y0=.7;
 }else if(shot==='detail'){const v=VAR.y18;st=L.makeStage(renderer,{bg:bg(.5),env,tone:'aces',exp:1.05,shadow:.55,lights});
  const b=bottle(v);b.rotation.y=-.13;st.stage.add(b);
  camera=L.cam(18,[-.8,1.5,6.4]);focus=V3(0,1.0,.6);aperture=.025;reflect=null;
 }else if(shot==='box'){const v=VAR.y25;st=L.makeStage(renderer,{bg:bg(.5),env,tone:'aces',exp:1.05,shadow:.55,lights:lights.map(l=>({...l,ext:7}))});
  [['y25',0,.5,.1],['y18',2.25,-.7,-.4],['y12',-2.25,-.7,.45]].forEach(([k,x,z,ry])=>{const b=woodBox(VAR[k]);b.position.set(x,0,z);b.rotation.y=ry;st.stage.add(b)});
  camera=L.cam(24,[0,2.3,13.6]);focus=V3(0,1.7,.6);aperture=.03;reflect.y0=.72;
 }
 return{st,camera,focus,aperture,samples:28,reflect,post}}
