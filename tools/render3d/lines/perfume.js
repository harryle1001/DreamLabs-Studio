// Khuê Lam — Extrait de Parfum (concept). Chai khối thủy tinh vuông bo, khoang chứa hình trụ, nắp đá + đai kim loại, hộp giấy vân.
export const VAR={
 amber:{name:'Hổ Phách',no:'№ 01',liq:['#ffcf7a','#e08a1e','#7a3604'],metal:'gold',stone:['#1a1511','#d9b06a',31],box:'#16110d',boxIn:'#c9a05a',ink:'#e9c98a',print:'#2b1505',glow:'rgba(255,170,70,.5)',bg:['#0a0705','#1d120a','#2a190c','#0c0806']},
 noir:{name:'Dạ Lan',no:'№ 02',liq:['#8f7fe0','#2d1d6e','#0d0626'],metal:'silver',stone:['#20264a','#aeb6e8',47],box:'#12122a',boxIn:'#b8bfe6',ink:'#d7dbf5',print:'#e6e8fa',glow:'rgba(130,120,255,.42)',bg:['#06060c','#11112a','#191a3a','#07070f']},
 rose:{name:'Sương Hồng',no:'№ 03',liq:['#ffe1d6','#f0a493','#b85a52'],metal:'rose',stone:['#f1ebe6','#b79a8f',53],box:'#ead9d0',boxIn:'#d79b8b',ink:'#9a5a4c',print:'#5e2a24',glow:'rgba(255,170,150,.42)',bg:['#0c0707','#24130f','#341c17','#0e0808']},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3}=L;
 /* ---- nhãn in trên thủy tinh ---- */
 const print=(v,dark)=>{const c=cv(900,1100),x=c.getContext('2d'),ink=dark||v.ink;
  txt(x,'Khuê Lam',450,470,'italic 400 150px Cormorant',ink);
  x.fillStyle=ink;x.fillRect(450-46,528,92,2.5);
  txt(x,'EXTRAIT DE PARFUM',450,606,'500 34px "Be Vietnam Pro"',ink,{ls:13});
  txt(x,v.no+'  ·  '+v.name.toUpperCase(),450,668,'400 30px "Be Vietnam Pro"',ink,{ls:9});
  return c};
 const boxFace=(v)=>{const c=cv(900,1800),x=c.getContext('2d'),ink=v.ink;x.strokeStyle=ink;x.lineWidth=2.5;x.strokeRect(70,70,760,1660);
  /* dấu hiệu: vòng trăng khuyết lồng nhau */
  x.lineWidth=3;x.beginPath();x.arc(450,520,92,0,7);x.stroke();x.beginPath();x.arc(450+34,520,58,0,7);x.stroke();
  txt(x,'Khuê Lam',450,880,'italic 400 168px Cormorant',ink);x.fillStyle=ink;x.fillRect(404,945,92,3);
  txt(x,'EXTRAIT DE PARFUM',450,1040,'500 36px "Be Vietnam Pro"',ink,{ls:14});
  txt(x,v.no+'  ·  '+v.name.toUpperCase(),450,1106,'400 32px "Be Vietnam Pro"',ink,{ls:10});
  txt(x,'75 ml  ·  2.5 fl. oz',450,1640,'400 28px "Be Vietnam Pro"',ink,{ls:6});return c};
 /* ---- chai ---- */
 function bottle(v){const g=new T.Group(),bw=.94,bh=1.22,bd=.62;
  /* chất lỏng: trụ bo trong khối thủy tinh, phát sáng giả xuyên sáng */
  const lc=cv(64,256),lx=lc.getContext('2d'),lg=lx.createLinearGradient(0,0,0,256);lg.addColorStop(0,v.liq[1]);lg.addColorStop(.55,v.liq[1]);lg.addColorStop(1,v.liq[0]);lx.fillStyle=lg;lx.fillRect(0,0,64,256);
  const liq=new T.MeshPhysicalMaterial({color:v.liq[2],roughness:.12,metalness:0,emissive:new T.Color('#ffffff'),emissiveMap:tex(lc),emissiveIntensity:.5,clearcoat:1});
  const lw=bw-.2,lh=bh-.3,ld=bd-.2;mesh(new L.RoundedBoxGeometry(lw,lh,ld,6,.1),liq,{p:[0,.17+lh/2,0],to:g,cast:false});
  /* mặt thoáng (không đầy) */
  /* khối thủy tinh */
  mesh(new L.RoundedBoxGeometry(bw,bh,bd,8,.07),M.glass({thick:.42,ior:1.52,tint:'#ffffff'}),{p:[0,bh/2,0],to:g});
  /* cổ + đai + nắp */
  const met=M.metal(v.metal,.16);
  mesh(new T.CylinderGeometry(.2,.2,.05,64),met,{p:[0,bh+.025,0],to:g});
  mesh(new T.CylinderGeometry(.155,.155,.1,64),met,{p:[0,bh+.09,0],to:g});
  mesh(L.lathe([[0,0],[.262,0],[.27,.008],[.27,.07],[.262,.078],[0,.078]],96),met,{p:[0,bh+.13,0],to:g});
  const stone=L.marble(1024,v.stone[0],v.stone[1],v.stone[2],14);
  mesh(L.lathe([[0,0],[.25,0],[.262,.012],[.262,.4],[.25,.42],[.236,.428],[0,.428]],96),M.stone(stone,{r:.2,cc:1}),{p:[0,bh+.208,0],to:g});
  /* ống hút */
  mesh(new T.CylinderGeometry(.012,.012,bh-.2,12),M.matte('#f4efe6',.5,{transparent:true,opacity:.5}),{p:[0,bh/2+.08,0],to:g,cast:false});
  /* chữ in mặt trước */
  const d=L.decal(print(v,v.print),.72,.88,{metal:.2,r:.4});d.position.set(0,bh*.5-.04,bd/2+.002);g.add(d);
  g.userData.h=bh+.64;return g}
 function box(v){const g=new T.Group(),w=1.04,h=1.92,d=.74,lid=.62,pm=M.paper(v.box,{rep:[5,9],bs:.5,r:.78});
  mesh(L.rbox(w-.018,h-lid-.02,d-.018,.008,2),M.paper(v.boxIn,{r:.6}),{p:[0,(h-lid-.02)/2,0],to:g});
  mesh(L.rbox(w,h-lid-.05,d,.01,2),pm,{p:[0,(h-lid-.05)/2,0],to:g});
  mesh(L.rbox(w,lid,d,.01,2),pm,{p:[0,h-lid/2,0],to:g});
  const f=L.decal(boxFace(v),w*.92,h*.96,{metal:.7,r:.34,emissive:v.ink,ei:.22});f.position.set(0,h/2,d/2+.002);g.add(f);return g}

 const one=VAR[shot];
 const mkbg=(v,gx=.42,gy=.5)=>L.backdrop({stops:[[0,v.bg[0]],[.5,v.bg[1]],[.66,v.bg[2]],[1,v.bg[3]]],glows:[{x:gx,y:gy,r:.36,color:v.glow,sy:.9},{x:gx,y:.72,r:.5,color:v.glow.replace(/[\d.]+\)$/,'.16)'),sy:.25}],vig:.5});
 const env=L.ENV.dark({keyI:11,fillI:6,rimI:5,topI:3,extra:[{size:[.7,12],pos:[-7,3,-9],i:14,soft:.3},{size:[.7,12],pos:[7.5,3,-8],i:10,soft:.3}]});
 let st,camera,focus,aperture=.0,reflect={y0:.6,y1:.97,k:.36,blur:2},post={bloom:.34,vig:.18};
 if(one){
  st=L.makeStage(renderer,{bg:mkbg(one),env,tone:'aces',exp:1.05,shadow:.5,lights:[{pos:[-4,6,5],i:1.4,soft:1},{pos:[1,9,-2],i:.8,soft:2.5}]});
  const b=bottle(one);b.position.set(-.52,0,.35);b.rotation.y=.2;st.stage.add(b);
  const bx=box(one);bx.position.set(.86,0,-.55);bx.rotation.y=-.42;st.stage.add(bx);
  camera=L.cam(23,[0,1.25,7.6]);focus=V3(.12,.93,0);aperture=.035;
 }else if(shot==='set'){
  const v=VAR.amber;st=L.makeStage(renderer,{bg:L.backdrop({stops:[[0,'#070606'],[.5,'#16110f'],[.66,'#221915'],[1,'#0a0808']],glows:[{x:.5,y:.5,r:.46,color:'rgba(255,200,150,.3)',sy:.7}],vig:.5}),env,tone:'aces',exp:1.05,shadow:.5});
  [['noir',-1.5,-.25,.28],['amber',0,.4,-.05],['rose',1.5,-.25,-.3]].forEach(([k,x,z,ry])=>{const b=bottle(VAR[k]);b.position.set(x,0,z);b.rotation.y=ry;st.stage.add(b)});
  camera=L.cam(24,[0,1.3,6.5]);focus=V3(0,.92,.2);aperture=.02;reflect.y0=.68;
 }else if(shot==='detail'){
  const v=VAR.amber;st=L.makeStage(renderer,{bg:mkbg(v,.5,.55),env,tone:'aces',exp:1.05,shadow:.5});
  const b=bottle(v);b.rotation.y=.5;st.stage.add(b);
  camera=L.cam(20,[1.1,2.1,3.3]);focus=V3(0,1.32,.1);aperture=.03;reflect=null;post={bloom:.3,vig:.2};
 }else if(shot==='box'){
  const v=VAR.rose;st=L.makeStage(renderer,{bg:mkbg(v,.5,.5),env,tone:'aces',exp:1.05,shadow:.5});
  ['rose','amber','noir'].forEach((k,i)=>{const bx=box(VAR[k]);bx.position.set([.0,1.2,-1.2][i],0,[.35,-.5,-.6][i]);bx.rotation.y=[.16,-.34,.46][i];st.stage.add(bx)});
  camera=L.cam(24,[0,1.45,7.4]);focus=V3(0,1,.2);aperture=.02;reflect.y0=.7;
 }
 return{st,camera,focus,aperture,samples:28,reflect,post}}
