// Thiên Trục — đồng hồ cơ "Calibre TT·01" (concept). Mặt số sunburst vẽ bằng canvas, cọc số và kim nổi 3D, kính vòm, dây da khâu tay.
export const VAR={
 blue:{name:'Xanh đêm',dial:['#0d1f40','#2e508e','#060e20'],ink:'#eef1f6',metal:'steel',hand:'silver',strap:'#131c33',stitch:'#8b93a8',sub:'#081326'},
 ivory:{name:'Ngà · vàng hồng',dial:['#f3ead8','#fffaf0','#dccdaa'],ink:'#2b2420',metal:'#f7c6b0',hand:'#f7c6b0',lightDial:1,strap:'#6b3a1e',stitch:'#d9bf98',sub:'#d8cbb0'},
 smoke:{name:'Khói · titan đen',dial:['#26272b','#55575e','#0b0b0d'],ink:'#e9e6df',metal:'gun',hand:'champagne',strap:'#141414',stitch:'#5c5c5c',sub:'#121214'},
 jade:{name:'Lục thẫm · vàng',dial:['#0e3a2c','#2f7a5c','#051a13'],ink:'#f4ecd6',metal:'yellow',hand:'yellow',strap:'#10281f',stitch:'#b9a878',sub:'#07241a'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3,V2}=L;
 function dialTex(v){const S=2048,c=cv(S),x=c.getContext('2d'),C=S/2,R=S/2;
  const cg=x.createConicGradient(-.5,C,C),n=14,r=L.rng(7);for(let i=0;i<=n;i++){cg.addColorStop(Math.min(1,i/n),i%2?v.dial[1]:v.dial[0]);if(i<n)cg.addColorStop((i+.5)/n,i%2?v.dial[0]:v.dial[2])}
  x.fillStyle=cg;x.fillRect(0,0,S,S);
  const rg=x.createRadialGradient(C,C,R*.2,C,C,R);rg.addColorStop(0,'rgba(255,255,255,.08)');rg.addColorStop(.6,'rgba(0,0,0,.04)');rg.addColorStop(1,v.lightDial?'rgba(60,40,10,.16)':'rgba(0,0,0,.5)');x.fillStyle=rg;x.fillRect(0,0,S,S);
  /* vành phút */
  x.strokeStyle=v.ink;for(let i=0;i<60;i++){const a=i/60*6.2832,l=i%5?24:44;x.lineWidth=i%5?3:6;x.globalAlpha=i%5?.75:1;x.beginPath();x.moveTo(C+Math.sin(a)*(R*.965-l),C-Math.cos(a)*(R*.965-l));x.lineTo(C+Math.sin(a)*R*.965,C-Math.cos(a)*R*.965);x.stroke()}x.globalAlpha=1;
  /* dấu hiệu: vòng tròn + trục nghiêng 23.4° */
  x.lineWidth=5;x.beginPath();x.arc(C,C-R*.545,30,0,7);x.stroke();x.save();x.translate(C,C-R*.545);x.rotate(.41);x.beginPath();x.moveTo(0,-50);x.lineTo(0,50);x.stroke();x.restore();
  txt(x,'THIÊN TRỤC',C,C-R*.375,'400 92px Cormorant',v.ink,{ls:20});
  txt(x,'TỰ ĐỘNG',C,C-R*.3,'500 32px "Be Vietnam Pro"',v.ink,{ls:14});
  /* kim giây nhỏ ở 6 giờ */
  const sy=C+R*.5,sr=R*.27;x.fillStyle=v.sub;x.beginPath();x.arc(C,sy,sr,0,7);x.fill();
  for(let k=6;k<sr;k+=7){x.strokeStyle=k%14<7?'rgba(255,255,255,.07)':'rgba(0,0,0,.12)';x.lineWidth=3;x.beginPath();x.arc(C,sy,k,0,7);x.stroke()}
  x.strokeStyle=v.ink;x.lineWidth=3;x.globalAlpha=.6;x.beginPath();x.arc(C,sy,sr,0,7);x.stroke();x.globalAlpha=1;
  for(let i=0;i<60;i+=5){const a=i/60*6.2832,l=i%15?16:30;x.lineWidth=i%15?3:5;x.beginPath();x.moveTo(C+Math.sin(a)*(sr-8-l),sy-Math.cos(a)*(sr-8-l));x.lineTo(C+Math.sin(a)*(sr-8),sy-Math.cos(a)*(sr-8));x.stroke()}
  txt(x,'60',C,sy-sr*.46,'500 34px "Be Vietnam Pro"',v.ink);txt(x,'30',C,sy+sr*.66,'500 34px "Be Vietnam Pro"',v.ink);
  txt(x,'CALIBRE TT·01',C,C+R*.15,'400 26px "Be Vietnam Pro"',v.ink,{ls:9});
  return c}
 function watch(v,o={}){const g=new T.Group(),h=new T.Group();g.add(h);
  const pol=M.metal(v.metal,.1,{envMapIntensity:1.5}),bru=M.brushedMetal(v.metal,.3,[6,1],{bs:.5,envMapIntensity:1.4}),hm=M.metal(v.hand,.08,{envMapIntensity:1.8});
  const rx=[Math.PI/2,0,0];
  mesh(L.lathe([[0,-.3],[.8,-.3],[.9,-.27],[.975,-.2],[1.005,-.1],[1.005,.03],[.99,.065]],128),bru,{r:rx,to:h});
  mesh(L.lathe([[.99,.065],[.985,.08],[.965,.13],[.925,.158],[.89,.16],[.874,.148],[.868,.11],[.862,.062]],128),pol,{r:rx,to:h});
  /* càng nối dây */
  const ls=new T.Shape();ls.moveTo(.6,.05);ls.quadraticCurveTo(.95,.05,1.07,-.07);ls.quadraticCurveTo(1.15,-.15,1.17,-.27);ls.lineTo(1.1,-.31);ls.lineTo(.6,-.31);ls.closePath();
  const lg=new T.ExtrudeGeometry(ls,{depth:.16,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:4,curveSegments:16});lg.translate(0,0,-.08);lg.applyMatrix4(new T.Matrix4().makeBasis(V3(0,1,0),V3(0,0,1),V3(1,0,0)));
  for(const sx of[-1,1])for(const sy of[-1,1]){const m=mesh(lg,bru,{to:h});m.position.set(sx*.645,0,0);m.scale.set(1,sy,1)}
  /* núm vặn */
  const cr=new T.CylinderGeometry(.125,.125,.16,26,1);mesh(cr,new T.MeshPhysicalMaterial({color:L.METAL[v.metal]||v.metal,metalness:1,roughness:.2,flatShading:true}),{p:[1.1,0,-.1],r:[0,0,Math.PI/2],to:h});
  mesh(new T.CylinderGeometry(.1,.125,.03,26),pol,{p:[1.195,0,-.1],r:[0,0,-Math.PI/2],to:h});mesh(new T.CylinderGeometry(.07,.07,.06,20),pol,{p:[1.0,0,-.1],r:[0,0,Math.PI/2],to:h});
  /* mặt số */
  const dt=tex(dialTex(v)),dm=new T.MeshPhysicalMaterial({map:dt,roughness:.38,metalness:v.lightDial?.0:.35,clearcoat:.4,clearcoatRoughness:.2,...(v.lightDial?{emissive:new T.Color('#ffffff'),emissiveMap:dt,emissiveIntensity:.22}:{})});mesh(new T.CircleGeometry(.868,128),dm,{p:[0,0,.062],to:h,cast:false});
  for(let i=0;i<12;i++){if(i===6)continue;const a=i/12*6.2832,r=.69;const add=(dx)=>{const m=mesh(L.rbox(.05,.2,.034,.009,2),hm,{to:h});m.position.set(Math.sin(a)*r+Math.cos(a)*dx,Math.cos(a)*r-Math.sin(a)*dx,.079);m.rotation.z=-a};i===0?(add(-.038),add(.038)):add(0)}
  const hand=(len,wd,ang,z,tail=.1)=>{const s=new T.Shape();s.moveTo(0,-tail);s.lineTo(wd,0);s.lineTo(0,len);s.lineTo(-wd,0);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:.004,bevelEnabled:true,bevelThickness:.007,bevelSize:.012,bevelSegments:1});const m=mesh(ge,hm,{to:h});m.position.z=z;m.rotation.z=-ang*Math.PI/180};
  hand(.44,.042,304,.092);hand(.7,.034,48,.108);
  mesh(new T.CylinderGeometry(.04,.04,.03,24),hm,{p:[0,0,.112],r:rx,to:h});
  const ss=mesh(L.rbox(.011,.25,.006,.002,1),hm,{to:h});ss.position.set(Math.sin(2.2)*.075,-.435+Math.cos(2.2)*.075,.075);ss.rotation.z=-2.2;mesh(new T.CylinderGeometry(.02,.02,.016,16),hm,{p:[0,-.435,.076],r:rx,to:h});
  /* kính sapphire vòm */
  mesh(L.lathe([[0,.118],[.868,.118],[.874,.148],[.8,.172],[.6,.196],[.3,.21],[0,.214]],128),M.glass({thick:.02,ior:1.6,env:.75}),{r:rx,to:h,cast:false});
  /* dây: vòng kín phía sau */
  const pts=[[0,1.04,-.2],[0,1.42,-.5],[0,1.52,-1.15],[0,1.0,-1.95],[0,0,-2.22],[0,-1.0,-1.95],[0,-1.52,-1.15],[0,-1.42,-.5],[0,-1.04,-.2]],sc=L.curve3(pts,false,.5);
  const sec=t=>{const e=Math.min(t,1-t),pad=1-L.smooth(0,.16,e),wd=.98-.16*L.smooth(.05,.4,e);return L.rrSection(.085+.07*pad,wd,.04,4)};
  const lea=M.leather(v.strap,{fine:true,rep:[10,2],bs:.5,cc:.3,ccr:.4,r:.5});
  mesh(L.sweep(sc,sec,160,{up:V3(1,0,0),uvLen:8}),lea,{to:h});
  const sm=new T.MeshPhysicalMaterial({color:v.stitch,roughness:.7});
  for(const sx of[-1,1]){const sp=[];for(let i=0;i<=120;i++){const t=.012+i/120*.976,e=Math.min(t,1-t),P=sc.getPointAt(t),tg=sc.getTangentAt(t),n=V3(1,0,0).cross(tg).normalize();if(n.dot(V3(0,P.y,P.z+1.1))<0)n.negate();const pad=1-L.smooth(0,.16,e),wd=.98-.16*L.smooth(.05,.4,e);P.x=sx*(wd/2-.07);P.addScaledVector(n,(.085+.07*pad)/2);P.userData=n;sp.push(P)}
   const c2=L.curve3(sp,false,.5);h.add(L.stitches(c2,(t)=>{const tg=sc.getTangentAt(Math.min(1,Math.max(0,.012+t*.976))),n=V3(1,0,0).cross(tg).normalize(),P=sc.getPointAt(Math.min(1,Math.max(0,.012+t*.976)));if(n.dot(V3(0,P.y,P.z+1.1))<0)n.negate();return n},{mat:sm,len:.04,gap:.03,w:.011,lift:.001}))}
  /* thanh chốt */
  for(const sy of[-1,1])mesh(new T.CylinderGeometry(.03,.03,1.1,12),pol,{p:[0,sy*1.04,-.2],r:[0,0,Math.PI/2],to:h});
  if(o.cushion){const cu=mesh(new T.CylinderGeometry(1,1,1.5,64),M.velvet(o.cushion,{rep:[8,8]}),{to:h});cu.rotation.z=Math.PI/2;cu.scale.set(1.36,1,.9);cu.position.set(0,0,-1.2)}
  h.rotation.x=o.tilt??-.14;g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(h,true);h.position.y=-bb.min.y;return g}

 const bg=(gx=.5)=>L.backdrop({stops:[[0,'#0b0d10'],[.5,'#1b2027'],[.66,'#272e37'],[1,'#0c0e11']],glows:[{x:gx,y:.46,r:.42,color:'rgba(150,175,210,.3)',sy:.85}],vig:.5});
 const env=L.ENV.dark({room:['#30343a','#16181c','#060607'],key:'#ffffff',keyI:10,fill:'#dfe9ff',fillI:6,topI:4,rimI:5,frontI:2.5,extra:[{size:[16,8],pos:[0,4,14],i:2.4,soft:.6},{size:[10,6],pos:[-2,11,8],i:3,soft:.6},{size:[.8,12],pos:[-7,3,-9],i:10,soft:.3}]});
 const lights=[{pos:[-3,8,5],i:1.6,soft:1,color:'#ffffff',ext:5},{pos:[1,9,-1],i:.9,soft:2.6,ext:5}];
 let st,camera,focus,aperture=.012,reflect={y0:.72,y1:1,k:.3,blur:2.5},post={bloom:.22,vig:.18};
 if(VAR[shot]){const v=VAR[shot];st=L.makeStage(renderer,{bg:bg(),env,tone:'aces',exp:1.22,shadow:.5,lights});
  const wt=watch(v);wt.rotation.y=.42;wt.position.set(0,0,.3);st.stage.add(wt);
  camera=L.cam(22,[0,2.3,10.4]);focus=V3(0,1.52,.9);
 }else if(shot==='set'){st=L.makeStage(renderer,{bg:bg(),env,tone:'aces',exp:1.22,shadow:.5,lights:lights.map(l=>({...l,ext:7}))});
  [['ivory',-3.1,-.6,.5],['blue',0,.5,.12],['smoke',3.1,-.6,-.4]].forEach(([k,x,z,ry])=>{const wt=watch(VAR[k]);wt.position.set(x,0,z);wt.rotation.y=ry;st.stage.add(wt)});
  camera=L.cam(24,[0,2.2,12.6]);focus=V3(0,1.6,1);aperture=.012;reflect.y0=.7;
 }else if(shot==='detail'){const v=VAR.blue;st=L.makeStage(renderer,{bg:bg(.5),env,tone:'aces',exp:1.22,shadow:.5,lights});
  const wt=watch(v);wt.rotation.y=.3;st.stage.add(wt);
  camera=L.cam(16,[-1.5,2.5,5.6]);focus=V3(.12,1.72,.72);aperture=.03;reflect=null;
 }else if(shot==='box'){const v=VAR.ivory;st=L.makeStage(renderer,{bg:bg(),env,tone:'aces',exp:1.22,shadow:.5,lights:lights.map(l=>({...l,ext:7}))});
  const lac=M.lacquer('#14110f',{r:.25}),vel=M.velvet('#3a2a1c',{rep:[10,10]}),bw=4.6,bh=1.5,bd=4.2,bx=new T.Group();
  mesh(L.rbox(bw,bh,bd,.06,5),lac,{p:[0,bh/2,0],to:bx});mesh(L.rbox(bw-.3,.1,bd-.3,.03,3),vel,{p:[0,bh-.02,0],to:bx});
  /* nắp mở */
  const lid=new T.Group();mesh(L.rbox(bw,.5,bd,.06,5),lac,{p:[0,.25,bd/2],to:lid});mesh(L.rbox(bw-.3,.06,bd-.3,.02,3),M.velvet('#4a3626',{rep:[10,10]}),{p:[0,-.005,bd/2],to:lid});
  const lc=cv(1024,512),lx=lc.getContext('2d');txt(lx,'THIÊN TRỤC',512,250,'400 110px Cormorant','#e3c58c',{ls:26});txt(lx,'CHẾ TÁC ĐỒNG HỒ  ·  CALIBRE TT·01',512,330,'500 30px "Be Vietnam Pro"','#e3c58c',{ls:10});
  const d=L.decal(lc,2.8,1.4,{metal:.5,r:.4,emissive:'#b8904c',ei:.6,side:T.DoubleSide});d.rotation.set(Math.PI/2,0,0);d.position.set(0,-.04,bd*.55);lid.add(d);
  lid.position.set(0,bh+.01,-bd/2);lid.rotation.x=-1.78;bx.add(lid);
  /* gối nhung trong khay */
  const cu=mesh(new T.CylinderGeometry(1,1,1.6,64),M.velvet('#5a4330',{rep:[8,8]}),{to:bx});cu.rotation.z=Math.PI/2;cu.scale.set(.5,1,1.25);cu.position.set(0,bh+.3,0);
  bx.rotation.y=.42;bx.position.set(-1.2,0,-1.3);st.stage.add(bx);
  const wt=watch(v);wt.rotation.y=-.35;wt.position.set(2.6,0,1.3);st.stage.add(wt);
  camera=L.cam(24,[0,3.6,14.2]);focus=V3(.4,1.7,.6);aperture=.015;reflect.y0=.7;
 }
 return{st,camera,focus,aperture,samples:28,reflect,post}}
