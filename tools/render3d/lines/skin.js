// Bạch Liên Privé — bộ dưỡng da (concept). Chai tinh chất nhỏ giọt, hũ kem, chai vòi nhấn: thủy tinh mờ, nắp kim loại, chữ in trực tiếp.
export const VAR={
 pearl:{name:'Ngọc trai',col:'#f1ebe0',liq:'#e9dcc4',metal:'yellow',ink:'#7a6236',bulb:'#f4efe6',box:'#f0e9dc',boxInk:'#8a6f3e'},
 celadon:{name:'Thanh thiên',col:'#a9c9b9',liq:'#8fb8a5',metal:'silver',ink:'#1f3d33',bulb:'#1f2b27',box:'#a9c9b9',boxInk:'#1f3d33'},
 blush:{name:'Hoàng hôn',col:'#ecbfae',liq:'#e2a48f',metal:'#f7c6b0',ink:'#6a3428',bulb:'#f4e6df',box:'#ecc4b4',boxInk:'#6a3428'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3}=L;
 const print=(v,a,b)=>{const c=cv(1000,800),x=c.getContext('2d');
  /* dấu hiệu: búp sen ba cánh */
  x.strokeStyle=v.ink;x.lineWidth=4;for(const k of[-1,0,1]){x.save();x.translate(500,190);x.rotate(k*.5);x.beginPath();x.moveTo(0,40);x.bezierCurveTo(-34,0,-22,-50,0,-70);x.bezierCurveTo(22,-50,34,0,0,40);x.stroke();x.restore()}
  txt(x,'Bạch Liên',500,400,'400 130px Cormorant',v.ink,{ls:6});txt(x,'P R I V É',500,465,'500 34px "Be Vietnam Pro"',v.ink,{ls:10});
  x.fillStyle=v.ink;x.fillRect(455,505,90,2.5);txt(x,a,500,590,'500 36px "Be Vietnam Pro"',v.ink,{ls:10});txt(x,b,500,650,'400 30px "Be Vietnam Pro"',v.ink,{ls:6});return c};
 const frost=v=>new T.MeshPhysicalMaterial({color:v.col,roughness:.42,metalness:0,transmission:.35,thickness:.4,ior:1.5,attenuationColor:new T.Color(v.col),attenuationDistance:1.2,clearcoat:.5,clearcoatRoughness:.35,sheen:.3,sheenColor:new T.Color('#ffffff')});
 const met=v=>M.metal(v.metal,.14,{envMapIntensity:1.5}),bru=v=>M.brushedMetal(v.metal,.26,[5,1],{bs:.35,envMapIntensity:1.4});
 function serum(v){const g=new T.Group(),r=.36;mesh(L.lathe([[0,0],[r-.04,0],[r-.008,.012],[r,.05],[r,.92],[r-.02,1.0],[r-.1,1.08],[.17,1.13],[.15,1.16],[.15,1.24],[0,1.24]],96),frost(v),{to:g});
  mesh(L.lathe([[.1,1.2],[.185,1.2],[.195,1.21],[.195,1.42],[.185,1.43],[.1,1.43]],64),bru(v),{to:g});
  mesh(L.lathe([[0,1.43],[.12,1.43],[.135,1.46],[.14,1.62],[.125,1.72],[.08,1.79],[0,1.81]],48),M.matte(v.bulb,.55,{sheen:.5}),{to:g});
  const d=L.decalCyl(print(v,'TINH CHẤT PHỤC HỒI','30 ml'),r+.003,.74,2.0);d.position.y=.5;g.add(d);return g}
 function jar(v){const g=new T.Group(),r=.66;mesh(L.lathe([[0,0],[r-.06,0],[r-.012,.014],[r,.06],[r,.5],[r-.03,.54],[r-.06,.55],[0,.55]],128),frost(v),{to:g});
  mesh(L.lathe([[0,.55],[r-.05,.55],[r+.012,.55],[r+.022,.56],[r+.022,.8],[r+.012,.815],[r-.1,.82],[r-.12,.812],[0,.812]],128),bru(v),{to:g});
  mesh(L.lathe([[r-.11,.812],[r-.1,.822],[r-.09,.812]],96),met(v),{to:g,cast:false});
  const d=L.decalCyl(print(v,'KEM DƯỠNG ĐÊM','50 g'),r+.003,.52,1.5);d.position.y=.275;g.add(d);return g}
 function pump(v){const g=new T.Group(),r=.4;mesh(L.lathe([[0,0],[r-.04,0],[r-.008,.012],[r,.05],[r,1.5],[r-.02,1.58],[r-.1,1.66],[.2,1.7],[.18,1.73],[.18,1.8],[0,1.8]],96),frost(v),{to:g});
  mesh(L.lathe([[.1,1.77],[.21,1.77],[.22,1.78],[.22,1.93],[.21,1.94],[.1,1.94]],64),bru(v),{to:g});
  mesh(new T.CylinderGeometry(.06,.06,.2,24),met(v),{p:[0,2.04,0],to:g});
  mesh(L.lathe([[0,2.12],[.15,2.12],[.16,2.13],[.16,2.22],[.15,2.235],[0,2.235]],48),met(v),{to:g});
  mesh(L.rbox(.3,.06,.11,.025,3),met(v),{p:[.2,2.19,0],to:g});
  const d=L.decalCyl(print(v,'SỮA DƯỠNG ẨM','150 ml'),r+.003,.86,2.0);d.position.y=.82;g.add(d);return g}
 function box(v){const g=new T.Group(),w=3.2,h=2.5,d=1.1,pm=M.paper(v.box,{rep:[9,7],bs:.5,r:.82});mesh(L.rbox(w,h,d,.012,2),pm,{p:[0,h/2,0],to:g});
  const c=cv(1280,1000),x=c.getContext('2d'),ink=v.boxInk;x.strokeStyle=ink;x.lineWidth=3;x.strokeRect(50,50,1180,900);
  x.lineWidth=5;for(const k of[-1,0,1]){x.save();x.translate(640,300);x.rotate(k*.5);x.beginPath();x.moveTo(0,50);x.bezierCurveTo(-42,0,-28,-62,0,-88);x.bezierCurveTo(28,-62,42,0,0,50);x.stroke();x.restore()}
  txt(x,'Bạch Liên',640,560,'400 170px Cormorant',ink,{ls:8});txt(x,'P R I V É',640,640,'500 40px "Be Vietnam Pro"',ink,{ls:12});txt(x,'BỘ DƯỠNG DA BA BƯỚC  ·  '+v.name.toUpperCase(),640,820,'400 30px "Be Vietnam Pro"',ink,{ls:9});
  const dc=L.decal(c,w*.94,w*.94/1.28,{metal:.5,r:.4,emissive:ink,ei:.15});dc.position.set(0,h/2,d/2+.002);g.add(dc);return g}

 const bg=()=>L.backdrop({stops:[[0,'#c9d6cf'],[.46,'#e6eeea'],[.62,'#dde7e2'],[1,'#bccbc3']],glows:[{x:.5,y:.36,r:.5,color:'rgba(255,255,255,.6)',sy:.8}],vig:.18});
 const env={room:['#eef2f0','#8f9692','#3c403e'],roomI:.85,size:512,panels:[{size:[6,8],pos:[-9,7,6],i:8,soft:.6,color:'#ffffff'},{size:[3,9],pos:[11,3,1],i:3,soft:.5,color:'#eef6ff'},{size:[9,5],pos:[1,13,1],i:3.4,soft:.6},{size:[12,1.6],pos:[0,3,-13],i:4,soft:.35},{size:[16,8],pos:[0,3,15],i:1,soft:.6},{size:[1.2,8],pos:[6,4,9],i:4,soft:.5}]};
 const lights=[{pos:[-5,7,5],i:2.6,soft:1.1,color:'#ffffff',ext:6},{pos:[2,9,-1],i:1.1,soft:3,ext:6}];
 const stone=()=>M.stone(L.marble(1024,'#f1f0ec','#a9b0ac',63,16),{r:.3,cc:.5});
 const mk=()=>L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.34,shadowColor:'#24332c',lights});
 let st,camera,focus,aperture=.025,post={bloom:.14,vig:.08};
 const trio=(v,st)=>{const sm=stone();mesh(L.planarUV(L.lathe([[0,0],[1.02,0],[1.03,.01],[1.03,.33],[1.02,.34],[0,.34]],128),.3),sm,{p:[.95,0,-.2],to:st.stage});mesh(L.planarUV(L.rbox(5.6,.12,3,.012,2),.16),sm,{p:[0,.06,.1],to:st.stage});
  const p=pump(v);p.position.set(-1.2,.12,-.35);p.rotation.y=.35;st.stage.add(p);const s=serum(v);s.position.set(-.3,.12,.75);s.rotation.y=.1;st.stage.add(s);const j=jar(v);j.position.set(.95,.34,-.2);j.rotation.y=-.2;st.stage.add(j)};
 if(VAR[shot]){st=mk();trio(VAR[shot],st);camera=L.cam(23,[0,2.3,9.2]);focus=V3(-.1,1.0,.3);
 }else if(shot==='set'){st=mk();mesh(L.planarUV(L.rbox(7,.12,3.2,.012,2),.16),stone(),{p:[0,.06,0],to:st.stage});
  [['celadon',pump,-2.2,-.3],['celadon',jar,-1.05,.7],['pearl',pump,-.15,-.5],['pearl',serum,.75,.6],['blush',jar,1.75,-.2],['blush',serum,2.55,.75]].forEach(([k,f,x,z],i)=>{const o=f(VAR[k]);o.position.set(x,.12,z);o.rotation.y=.2-i*.08;st.stage.add(o)});
  camera=L.cam(23,[0,2.4,10.2]);focus=V3(0,.9,.3);
 }else if(shot==='detail'){st=mk();const v=VAR.celadon;const j=jar(v);j.rotation.y=-.1;st.stage.add(j);const s=serum(v);s.position.set(-1.05,0,-.7);st.stage.add(s);
  camera=L.cam(18,[.9,1.9,4.6]);focus=V3(0,.5,.5);aperture=.03;
 }else if(shot==='box'){st=mk();const v=VAR.pearl;mesh(L.planarUV(L.rbox(7,.12,3.4,.012,2),.16),stone(),{p:[0,.06,0],to:st.stage});
  const b=box(v);b.position.set(-1.75,.12,-.6);b.rotation.y=.3;st.stage.add(b);
  const p=pump(v);p.position.set(.35,.12,.1);st.stage.add(p);const s=serum(v);s.position.set(1.25,.12,.85);st.stage.add(s);const j=jar(v);j.position.set(2.35,.12,-.25);j.rotation.y=-.3;st.stage.add(j);
  camera=L.cam(23,[0,2.5,10.6]);focus=V3(.3,1.1,.3);
 }
 return{st,camera,focus,aperture,samples:28,post}}
