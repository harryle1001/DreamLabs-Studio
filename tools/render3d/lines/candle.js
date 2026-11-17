// Tĩnh Dạ — nến thơm thủ công (concept). Cốc sứ / thủy tinh, nắp kim loại, chữ in, hộp quà nắp rời.
export const VAR={
 tram:{name:'Trầm hương',no:'№ 2',kind:'gloss',col:'#17151a',ink:'#d9b56c',metal:'yellow',wax:'#efe6d6',box:'#17151a',boxInk:'#d9b56c'},
 tra:{name:'Trà trắng',no:'№ 5',kind:'matte',col:'#e9e1d2',ink:'#3a332b',metal:'champagne',wax:'#f6f0e4',box:'#e6dccb',boxInk:'#5a4f40'},
 que:{name:'Quế & vỏ cam',no:'№ 8',kind:'glass',col:'#b5651d',ink:'#3a1c08',metal:'bronze',wax:'#f1dfc0',box:'#8a4a22',boxInk:'#f0dcc0'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3}=L;
 const print=(v,ink,bg)=>{const c=cv(1400,1000),x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,1400,1000);x.strokeStyle=ink;x.lineWidth=3;x.strokeRect(40,40,1320,920)}
  txt(x,v.no,700,250,'400 54px Cormorant',ink,{ls:8});
  txt(x,'Tĩnh Dạ',700,480,'italic 300 230px Fraunces',ink);
  x.fillStyle=ink;x.fillRect(640,560,120,3);
  txt(x,v.name.toUpperCase(),700,680,'500 50px "Be Vietnam Pro"',ink,{ls:22});
  txt(x,'NẾN THƠM THỦ CÔNG  ·  220 g  ·  50 GIỜ CHÁY',700,790,'400 32px "Be Vietnam Pro"',ink,{ls:9});return c};
 function candle(v,o={}){const g=new T.Group(),r=.64,h=1.3;
  const prof=[[0,0],[r-.05,0],[r-.012,.014],[r,.05],[r,h-.012],[r-.012,h],[r-.05,h-.004],[r-.055,h-.02],[r-.055,.9],[0,.9]];
  let m;if(v.kind==='gloss')m=M.lacquer(v.col,{r:.22});else if(v.kind==='matte'){m=M.matte(v.col,.82);m.bumpMap=tex(L.noiseCanvas(256,96,160,3),{srgb:false,repeat:[5,3]});m.bumpScale=.18}
  else m=M.glass({thick:.5,ior:1.5,tint:v.col,dist:.42,r:.04});
  if(v.kind==='glass'){mesh(L.lathe([[0,0],[r-.05,0],[r-.012,.014],[r,.05],[r,h-.012],[r-.012,h],[r-.03,h]],128),m,{to:g});
   mesh(L.lathe([[0,.07],[r-.07,.07],[r-.06,.09],[r-.06,1.02],[0,1.02]],96),M.matte('#c98a3a',.6,{emissive:new T.Color('#b5651d'),emissiveIntensity:.35}),{to:g,cast:false})}
  else mesh(L.lathe(prof,128),m,{to:g});
  /* sáp + bấc */
  if(v.kind!=='glass')mesh(new T.CircleGeometry(r-.054,64),M.matte(v.wax,.6,{sheen:.4}),{p:[0,1.04,0],r:[-Math.PI/2,0,0],to:g,cast:false});
  mesh(new T.CylinderGeometry(.013,.013,.14,8),M.matte('#2a221a',.9),{p:[0,1.1,0],r:[0,0,.12],to:g,cast:false});
  /* chữ in */
  const arc=1.75;if(v.kind==='glass'){const lm=new T.MeshPhysicalMaterial({map:tex(print(v,v.ink,'#efe3cc')),roughness:.8});const lb=new T.Mesh(new T.CylinderGeometry(r+.003,r+.003,.8,96,1,true,-arc/2,arc),lm);lb.position.y=.62;lb.castShadow=false;g.add(lb)}
  else{const d=L.decalCyl(print(v,v.ink),r+.003,.8,arc,{metal:v.kind==='gloss'?.7:0,r:.4});d.position.y=.62;if(v.kind==='gloss'){d.material.emissive=new T.Color('#a8853f');d.material.emissiveMap=d.material.map;d.material.emissiveIntensity=.4}g.add(d)}
  return g}
 function lid(v){const g=new T.Group();mesh(L.lathe([[0,0],[.6,0],[.6,.03],[.66,.03],[.672,.04],[.672,.085],[.66,.095],[0,.095]],128),M.brushedMetal(v.metal,.28,[5,1],{bs:.4,envMapIntensity:1.3}),{to:g});
  mesh(L.lathe([[.3,.095],[.31,.1],[.3,.105]],64),M.metal(v.metal,.12),{to:g,cast:false});return g}
 function box(v){const g=new T.Group(),w=1.62,h=1.7,pm=M.paper(v.box,{rep:[6,6],bs:.5,r:.82});
  mesh(L.rbox(w,h-.5,w,.012,2),pm,{p:[0,(h-.5)/2,0],to:g});mesh(L.rbox(w+.04,.52,w+.04,.012,2),pm,{p:[0,h-.26,0],to:g});
  const c=cv(1000,1000),x=c.getContext('2d');txt(x,'Tĩnh Dạ',500,470,'italic 300 190px Fraunces',v.boxInk);x.fillStyle=v.boxInk;x.fillRect(450,530,100,3);txt(x,v.no+'  ·  '+v.name.toUpperCase(),500,620,'500 40px "Be Vietnam Pro"',v.boxInk,{ls:16});
  const d=L.decal(c,w*.9,w*.9,{metal:.5,r:.4,emissive:v.boxInk,ei:.18});d.position.set(0,h*.44,w/2+.002);g.add(d);
  const d2=L.decal(c,w*.8,w*.8,{metal:.5,r:.4,emissive:v.boxInk,ei:.18});d2.rotation.x=-Math.PI/2;d2.position.set(0,h+.002,.02);g.add(d2);return g}

 const bg=()=>L.backdrop({stops:[[0,'#d9d0c2'],[.46,'#efe8dc'],[.62,'#e8dfd1'],[1,'#cdc2b2']],glows:[{x:.42,y:.36,r:.5,color:'rgba(255,252,244,.6)',sy:.8}],vig:.2});
 const env={room:['#e6e2dc','#8a8782','#3a3835'],roomI:.85,size:512,panels:[{size:[6,8],pos:[-9,7,6],i:8,soft:.6,color:'#fff4e2'},{size:[3,9],pos:[11,3,1],i:2.6,soft:.5,color:'#eef2ff'},{size:[9,5],pos:[1,13,1],i:3.2,soft:.6},{size:[12,1.6],pos:[0,3,-13],i:3.4,soft:.35},{size:[16,8],pos:[0,3,15],i:1,soft:.6},{size:[1.2,8],pos:[6,4,9],i:4,soft:.5}]};
 const lights=[{pos:[-5,7,5],i:2.8,soft:1.1,color:'#fff0da',ext:6},{pos:[2,9,-1],i:1.1,soft:3,ext:6}];
 const slab=(st,w=5.4,d=3.2,h=.16)=>{mesh(L.planarUV(L.rbox(w,h,d,.015,2),.16),M.stone(L.marble(1024,'#e4dccf','#b3a690',41,14),{r:.5,cc:.2}),{p:[0,h/2,0],to:st.stage});return h};
 let st,camera,focus,aperture=.025,post={bloom:.14,vig:.1};
 const mk=()=>L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.38,shadowColor:'#3a2c1e',lights});
 if(VAR[shot]){const v=VAR[shot];st=mk();const h=slab(st);
  const c=candle(v);c.position.set(-.45,h,.25);c.rotation.y=.12;st.stage.add(c);
  const b=box(v);b.position.set(1.25,h,-.55);b.rotation.y=-.4;st.stage.add(b);
  const l=lid(v);l.position.set(.72,h,1.05);l.rotation.y=.5;st.stage.add(l);
  camera=L.cam(23,[0,2.7,8.4]);focus=V3(.2,.9,.3);
 }else if(shot==='set'){st=mk();const h=slab(st,6.4,3.2);
  [['tram',-1.65,-.2,.25],['que',0,.45,0],['tra',1.65,-.2,-.25]].forEach(([k,x,z,ry])=>{const c=candle(VAR[k]);c.position.set(x,h,z);c.rotation.y=ry;st.stage.add(c)});
  camera=L.cam(23,[0,1.9,8.4]);focus=V3(0,.85,.3);
 }else if(shot==='detail'){const v=VAR.tram;st=mk();const h=slab(st);const c=candle(v);c.position.y=h;c.rotation.y=-.12;st.stage.add(c);const l=lid(v);l.position.set(1.5,h,.35);st.stage.add(l);
  camera=L.cam(18,[-1.2,2.6,6.2]);focus=V3(.25,.82,.3);aperture=.025;
 }else if(shot==='box'){st=mk();const h=slab(st,6.4,3.4);
  [['tra',-1.95,-.3,.4],['tram',0,.3,.08],['que',1.95,-.3,-.4]].forEach(([k,x,z,ry])=>{const b=box(VAR[k]);b.position.set(x,h,z);b.rotation.y=ry;st.stage.add(b)});
  const c=candle(VAR.tram);c.position.set(.95,h,1.25);c.scale.setScalar(.0001);
  camera=L.cam(23,[0,2.4,9.4]);focus=V3(0,1.05,.4);
 }
 return{st,camera,focus,aperture,samples:28,post}}
