// Tịnh Vân — túi hộp "Vòm" (concept). Thân vòm cứng, nắp ôm trọn phần trên, khóa đĩa tròn, quai cầm một nhịp.
export const VAR={
 noir:{name:'Đen huyền',col:'#161516',metal:'yellow',stitch:'#2a2826',bg:['#cfc6ba','#e2dace','#d6cdc0','#bfb5a7']},
 cognac:{name:'Nâu cognac',col:'#8b4a21',metal:'yellow',stitch:'#e3c9a0',bg:['#cfc6ba','#e2dace','#d6cdc0','#bfb5a7']},
 jade:{name:'Lục bảo',col:'#12463a',metal:'yellow',stitch:'#0c2e26',bg:['#cfc6ba','#e2dace','#d6cdc0','#bfb5a7']},
 ivory:{name:'Kem ngà',col:'#e6dccb',metal:'champagne',stitch:'#cbbfa9',bg:['#cfc6ba','#e2dace','#d6cdc0','#bfb5a7']},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3,V2}=L;
 const BW=2.16,BH=1.4,BD=.64,RB=.1,RT=.34,YC=.74,DIP=.17;
 const arch=(w,h,rb,rt,y0=0)=>{const s=new T.Shape(),x=w/2;s.moveTo(-x+rb,y0);s.lineTo(x-rb,y0);s.absarc(x-rb,y0+rb,rb,-Math.PI/2,0);s.lineTo(x,h-rt);s.absarc(x-rt,h-rt,rt,0,Math.PI/2);s.lineTo(-x+rt,h);s.absarc(-x+rt,h-rt,rt,Math.PI/2,Math.PI);s.lineTo(-x,y0+rb);s.absarc(-x+rb,y0+rb,rb,Math.PI,Math.PI*1.5);return s};
 const ext=(shape,d,bev=.035,o={})=>{const g=new T.ExtrudeGeometry(shape,{depth:d-bev*2,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:6,curveSegments:48,...o});g.translate(0,0,-(d-bev*2)/2);return g};
 const logoC=(ink)=>{const c=cv(1024,256),x=c.getContext('2d');txt(x,'TỊNH VÂN',512,150,'400 96px Cormorant',ink,{ls:34});txt(x,'MAROQUINERIE',512,214,'500 26px "Be Vietnam Pro"',ink,{ls:16});return c};
 function bag(v,o={}){const g=new T.Group(),lea=M.leather(v.col,{rep:[2.8,2.8],bs:v.col==='#161516'?.6:1.1,cc:.42,ccr:.28,r:.44,sheen:.15}),met=M.metal(v.metal,.08,{envMapIntensity:1.5}),lift=.03;if(v.col!=='#e6dccb')lea.map=tex(L.mottle(512,.022,23),{repeat:[.9,.9]});
  const b=new T.Group();b.position.y=lift;g.add(b);
  const BV=.05;mesh(ext(arch(BW-BV*2,BH-BV*2,RB,RT-BV),BD,BV),lea,{p:[0,BV,0],to:b});
  /* nắp trước: tấm da mỏng ôm mặt trước, mép dưới lượn mềm về giữa */
  const fx=BW/2-.012,fb=.014,ft=.034,fy=p=>{const t=Math.abs(p);return YC-DIP*(1-t*t)*(1-.35*t*t)};
  const s=new T.Shape(),h=BH-.012;s.moveTo(-fx,fy(1));for(let i=1;i<=48;i++){const t=-1+i/24;s.lineTo(fx*t,fy(t))}s.lineTo(fx,h-RT);s.absarc(fx-RT+.012,h-RT,RT-.012,0,Math.PI/2);s.lineTo(-fx+RT-.012,h);s.absarc(-fx+RT-.012,h-RT,RT-.012,Math.PI/2,Math.PI);s.lineTo(-fx,fy(1));
  const zf=BD/2+ft;mesh(ext(s,ft+.04,fb),lea,{p:[0,0,BD/2+ft/2-.02],to:b});
  /* dải viền nắp vắt qua đỉnh túi */
  mesh(ext(arch(BW-.024-BV*0,BH-.012,RB,RT-.012,BH-.012-RT-.1),BD+.03,.012),lea,{p:[0,0,0],to:b,s:[1,1,1]}).visible=false;
  /* đường chỉ */
  const sm=new T.MeshPhysicalMaterial({color:v.stitch,roughness:.7}),so={mat:sm,len:.024,gap:.017,w:.0065,lift:.001};
  const lidPath=[];for(let i=0;i<=60;i++){const t=-1+i/30,k=1-.05/fx;lidPath.push(V3(fx*t*k,fy(t)+.048+.012*t*t,zf))}
  b.add(L.stitches(L.curve3(lidPath,false,.5),V3(0,0,1),so));
  const bx=BW/2-.085,zb=BD/2,body=[V3(-bx,fy(1)-.03,zb),V3(-bx,.3,zb),V3(-bx,.17,zb),V3(-bx+.035,.115,zb),V3(-bx+.09,.095,zb),V3(0,.095,zb),V3(bx-.09,.095,zb),V3(bx-.035,.115,zb),V3(bx,.17,zb),V3(bx,.3,zb),V3(bx,fy(1)-.03,zb)];
  b.add(L.stitches(L.curve3(body,false,.2),V3(0,0,1),so));
  /* khóa: vòng tròn + thanh gài */
  const ky=fy(0)+.135,k=new T.Group();k.position.set(0,ky,zf);b.add(k);
  mesh(L.lathe([[0,0],[.118,0],[.126,.006],[.126,.02],[.118,.028],[.1,.03],[.092,.022],[0,.022]],80),met,{r:[Math.PI/2,0,0],to:k});
  mesh(new T.TorusGeometry(.064,.012,16,64),met,{p:[0,0,.03],to:k});
  mesh(L.rbox(.2,.034,.03,.011,3),met,{p:[0,0,.04],to:k});
  /* logo dập nhũ */
  const lg=L.decal(logoC(o.ink||(v.metal==='champagne'?'#a8905e':'#f2d593')),.6,.15,{metal:.4,r:.4,emissive:v.metal==='champagne'?'#5a4a2a':'#c9a25c',ei:v.metal==='champagne'?.2:.55});lg.position.set(0,.36,BD/2+.0015);b.add(lg);
  /* quai tròn cuộn + khoen + đai da */
  const hy=BH,hx=.5,hc=L.curve3([[-hx,hy+.17,0],[-hx-.01,hy+.36,0],[-hx+.16,hy+.66,0],[0,hy+.78,0],[hx-.16,hy+.66,0],[hx+.01,hy+.36,0],[hx,hy+.17,0]],false,.5);
  mesh(L.sweep(hc,L.circSection(.052,18,1.12),96,{uvLen:7}),M.leather(v.col,{rep:[7,1],bs:.6,cc:.42,ccr:.28,r:.44,fine:true}),{to:b});
  b.add(L.stitches(hc,(t,P)=>V3(0,0,1),{...so,lift:.057}));
  for(const sx of[-1,1]){const x=sx*hx;
   mesh(new T.CylinderGeometry(.06,.06,.075,32),met,{p:[x,hy+.185,0],to:b});
   mesh(new T.TorusGeometry(.082,.017,16,48),met,{p:[x,hy+.085,0],to:b});
   /* đai da ôm khoen */
   mesh(L.sweep(L.curve3([[x,hy-.005,.1],[x,hy+.045,.075],[x,hy+.075,0],[x,hy+.045,-.075],[x,hy-.005,-.1]],false,.5),L.rrSection(.022,.1,.01,3),24,{up:V3(1,0,0)}),lea,{to:b})}
  /* chân đế */
  for(const sx of[-1,1])for(const sz of[-1,1])mesh(L.lathe([[0,0],[.026,0],[.036,.012],[.036,.034],[0,.034]],24),met,{p:[sx*(BW/2-.26),0,sz*(BD/2-.14)],to:g});
  return g}
 const bgc=(v)=>L.backdrop({stops:[[0,'#b3a696'],[.45,'#cfc3b3'],[.62,'#c9bdac'],[1,'#a99c8b']],glows:[{x:.4,y:.36,r:.5,color:'rgba(255,244,226,.5)',sy:.8}],vig:.3});
 const env={room:['#cfcbc5','#8a8782','#4a4846'],roomI:.8,size:512,panels:[{size:[5,7],pos:[-9,7.5,6],i:9,soft:.6,color:'#fff4e4'},{size:[3,9],pos:[11,3,2],i:2.2,soft:.5,color:'#eaf0ff'},{size:[9,5],pos:[1,13,1],i:3.2,soft:.6},{size:[12,1.6],pos:[0,3,-13],i:3,soft:.35},{size:[1.4,8],pos:[5.5,4,10],i:4,soft:.5},{size:[18,9],pos:[0,3,15],i:1.1,soft:.6,color:'#fff2dc'},{size:[10,8],pos:[-10,1,7],i:3.6,soft:.4,color:'#fff2dc'}]};
 const ped=(st,r=1.9,h=.16)=>{const m=M.stone(L.marble(1024,'#cbbda8','#8f7d63',77,24),{r:.72,cc:.05});mesh(L.planarUV(L.lathe([[0,0],[r-.012,0],[r,.012],[r,h-.012],[r-.012,h],[0,h]],128),.22),m,{to:st.stage});return h};
 let st,camera,focus,aperture=.02,post={bloom:.12,vig:.1};
 const lights=[{pos:[-5,7,6],i:3.2,soft:1.0,color:'#fff1de'},{pos:[2,9,-1],i:1.2,soft:3}];
 if(VAR[shot]){const v=VAR[shot];st=L.makeStage(renderer,{bg:bgc(v),env,tone:'neutral',exp:1,envI:.8,shadow:.4,shadowColor:'#3a2c1e',lights});
  const h=ped(st),b=bag(v);b.position.set(.05,h,0);b.rotation.y=-.5;st.stage.add(b);const bl=L.blob(1.5,.75,.5,'#2a1c10');bl.position.y=h+.004;bl.rotation.z=-.5;st.stage.add(bl);
  camera=L.cam(23,[0,2.0,8.7]);focus=V3(0,1.12,.3);
 }else if(shot==='set'){st=L.makeStage(renderer,{bg:bgc(),env,tone:'neutral',exp:1,envI:.8,shadow:.4,shadowColor:'#3a2c1e',lights:[{pos:[-5,7,6],i:3.2,soft:1.0,color:'#fff1de',ext:6.5},{pos:[2,9,-1],i:1.2,soft:3,ext:6.5}]});
  [['jade',-2.7,-.7,.42,.9],['noir',-.95,.4,.2,1],['cognac',1.05,.1,-.38,.94],['ivory',2.75,-.9,-.6,.86]].forEach(([k,x,z,ry,s])=>{const b=bag(VAR[k]);b.position.set(x,0,z);b.rotation.y=ry;b.scale.setScalar(s);st.stage.add(b)});
  camera=L.cam(24,[0,1.8,12.2]);focus=V3(0,1.0,0);aperture=.02;
 }else if(shot==='detail'){const v=VAR.cognac;st=L.makeStage(renderer,{bg:bgc(v),env,tone:'neutral',exp:1,envI:.8,shadow:.4,lights});
  const b=bag(v);b.rotation.y=-.42;st.stage.add(b);
  camera=L.cam(18,[.9,1.55,4.6]);focus=V3(.05,.95,.4);aperture=.03;
 }else if(shot==='box'){const v=VAR.noir;st=L.makeStage(renderer,{bg:bgc(v),env,tone:'neutral',exp:1,envI:.8,shadow:.4,shadowColor:'#3a2c1e',lights:[{pos:[-5,7,6],i:3.2,soft:1.0,color:'#fff1de',ext:6.5},{pos:[2,9,-1],i:1.2,soft:3,ext:6.5}]});
  /* hộp cứng + nắp tựa + túi vải */
  const pm=M.paper('#1d2a26',{rep:[8,8],bs:.5,r:.8}),bw=2.7,bh=1.25,bd=2.0;
  const bx=new T.Group();mesh(L.rbox(bw,bh,bd,.012,2),pm,{p:[0,bh/2,0],to:bx});mesh(L.rbox(bw-.05,.06,bd-.05,.01,2),M.paper('#efe6d6',{r:.9}),{p:[0,bh+.005,0],to:bx});
  const f=L.decal(logoC('#d9b56c'),1.5,.375,{metal:.9,r:.3});f.position.set(0,bh*.5,bd/2+.002);bx.add(f);bx.position.set(-1.25,0,-.9);bx.rotation.y=.42;st.stage.add(bx);
  const lid=new T.Group();mesh(L.rbox(bw+.04,.34,bd+.04,.012,2),pm,{p:[0,.17,0],to:lid});const f2=L.decal(logoC('#d9b56c'),1.5,.375,{metal:.9,r:.3});f2.rotation.x=-Math.PI/2;f2.position.set(0,.342,0);lid.add(f2);
  lid.position.set(-2.1,0,.9);lid.rotation.set(0,.42,0);st.stage.add(lid);
  /* túi vải chống bụi: tấm vải gấp phẳng */
  const cloth=M.paper('#e9e1d2',{rep:[14,14],bs:.7,r:.95});const db=new T.Group();mesh(L.rbox(1.9,.07,1.5,.035,4),cloth,{p:[0,.035,0],to:db});mesh(L.rbox(1.86,.05,.7,.025,4),cloth,{p:[0,.085,-.38],to:db});
  const f3=L.decal(logoC('#3a332b'),1.0,.25,{metal:0,r:.9});f3.rotation.x=-Math.PI/2;f3.position.set(0,.072,.32);db.add(f3);db.position.set(1.75,0,1.25);db.rotation.y=-.25;st.stage.add(db);
  const b=bag(v);b.position.set(1.25,0,-.25);b.rotation.y=-.42;st.stage.add(b);
  camera=L.cam(24,[-.15,2.9,12.6]);focus=V3(-.15,.75,.2);aperture=.025;
 }
 return{st,camera,focus,aperture,samples:28,post}}
