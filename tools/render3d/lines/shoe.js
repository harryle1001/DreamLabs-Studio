// Vũ Hạc — giày cao gót mũi nhọn "Hạc 95" (concept). Dựng bằng mặt tham số: phom giày, lót, đế, gót nhọn.
export const VAR={
 noir:{name:'Đen bóng',kind:'patent',col:'#0d0d0f',lining:'#d9c3a5',sole:'#b89870',heel:'#0d0d0f'},
 nude:{name:'Da bê nude',kind:'calf',col:'#d3a98c',lining:'#ead9c4',sole:'#b89870',heel:'#d3a98c'},
 mulberry:{name:'Da lộn mận chín',kind:'suede',col:'#5a1830',lining:'#d9c3a5',sole:'#b89870',heel:'#5a1830'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3,V2,spline1}=L;
 const LEN=2.46,HH=.93,UC=.745,EZ=.6,PY=1.5;
 const sy=spline1([[0,HH+.03],[.08,HH+.005],[.18,HH-.045],[.3,HH-.22],[.44,.44],[.56,.16],[.66,.05],[.78,.028],[.9,.04],[1,.085]]);
 const w=spline1([[0,0],[.008,.085],[.03,.17],[.08,.24],[.17,.268],[.3,.25],[.44,.262],[.57,.345],[.67,.4],[.76,.375],[.86,.275],[.93,.17],[.975,.085],[.995,.03],[1,0]]);
 const hu=spline1([[0,1.2],[.2,1.15],[.4,.86],[.55,.58],[.66,.44],[.745,.365],[.84,.27],[.92,.19],[.97,.12],[1,.045]]);
 const ht=spline1([[0,.47],[.04,.47],[.1,.445],[.18,.375],[.28,.285],[.4,.215],[.5,.19],[.6,.19],[.67,.225],[.715,.29],[.745,.365]]);
 const PHI=u=>{if(u>=UC)return Math.PI;const f=Math.min(1,ht(u)/hu(u)),c=1-2*Math.pow(f,1/PY);return Math.acos(Math.max(-1,Math.min(1,c)))};
 const secPt=(u,phi,p,off=0)=>{const s=Math.sin(Math.abs(phi)),ww=w(u)+off,z=Math.sign(phi)*ww*Math.pow(Math.max(0,s),EZ),y=sy(u)+(hu(u)+off)*Math.pow((1-Math.cos(phi))/2,PY),yr=Math.min(1,(y-sy(u))/.47),k=1-L.smooth(0,.24,u);return p.set(u*LEN+k*(-.05*Math.sin(Math.PI*yr)+.075*yr*yr),y,z)};
 const um=t=>.5-.5*Math.cos(Math.PI*t);            // dày điểm ở hai đầu
 const logo=(ink)=>{const c=cv(1024,256),x=c.getContext('2d');txt(x,'Vũ Hạc',512,150,'italic 400 120px Playfair',ink);txt(x,'SAIGON · ATELIER',512,214,'500 28px "Be Vietnam Pro"',ink,{ls:14});return c};
 function shoe(v){const g=new T.Group();
  const outer=v.kind==='patent'?M.patent(v.col,{r:.25}):v.kind==='suede'?M.velvet(v.col,{sr:.5,sk:2.2,rep:[10,10]}):M.leather(v.col,{fine:true,rep:[9,5],bs:.35,cc:.5,ccr:.3,r:.42,sheen:.2});
  const geo=L.paramSurface((a,b,p)=>{const u=um(a),P=PHI(u);secPt(u,(b*2-1)*P,p)},150,64,{uvU:3,uvV:2,weld:a=>um(a)>=UC-1e-6});
  outer.side=T.FrontSide;mesh(geo,outer,{to:g});
  const lin=M.leather(v.lining,{fine:true,rep:[8,4],bs:.3,cc:.1,r:.6});lin.side=T.BackSide;mesh(geo,lin,{to:g,cast:false});
  /* viền miệng giày */
  const top=[],p=V3();const N=70;for(let i=0;i<=N;i++){const u=UC-(UC-.0005)*um(i/N)*1;secPt(Math.max(.0005,u),PHI(Math.max(.0005,u)),p);top.push(p.clone())}
  const loop=[...top,...top.slice(0,-1).reverse().map(q=>V3(q.x,q.y,-q.z))];loop.pop();
  mesh(L.sweep(L.curve3(loop,true,.5),L.circSection(.0125,8),260,{closed:true,up:V3(0,1,0)}),v.kind==='suede'?M.leather(v.col,{fine:true,r:.5,cc:.3}):outer,{to:g,cast:false});
  /* lót trong (mặt đế trong) */
  const ins=L.paramSurface((a,b,p)=>{const u=.004+um(a)*.75,k=b*2-1,ww=w(u)*.86;p.set(u*LEN,sy(u)+.02+.035*k*k*k*k,k*ww)},90,14,{uvU:1,uvV:1});
  const ic=cv(1024,256),ix=ic.getContext('2d');ix.fillStyle=v.lining;ix.fillRect(0,0,1024,256);ix.save();ix.translate(190,128);const lg=logo('#a8853f');ix.drawImage(lg,-150,-38,300,75);ix.restore();
  const im=new T.MeshPhysicalMaterial({map:tex(ic),roughness:.55,side:T.DoubleSide});mesh(ins,im,{to:g,cast:false});
  /* đế ngoài */
  const sole=L.paramSurface((a,b,p)=>{const u=.01+um(a)*.985,th=b*6.2832,ww=w(u)*.95,cz=Math.cos(th),sz=Math.sin(th);p.set(u*LEN,sy(u)-.012+.011*sz,ww*Math.sign(cz)*Math.pow(Math.abs(cz),.25))},120,16,{uvU:4,uvV:1});
  mesh(sole,M.leather(v.sole,{fine:true,rep:[6,1],bs:.2,cc:.25,r:.5}),{to:g});
  /* gót nhọn */
  const X0=.262,A0=.245,B0=.262,gT=t=>1-Math.pow(1-t,3.4);
  const heel=L.paramSurface((a,b,p)=>{const t=a,th=b*6.2832,g2=gT(t),x0=X0+A0*Math.cos(th),u0=Math.max(.004,x0/LEN),yt=sy(u0)-.02,zm=w(u0)*.9,z0=Math.sign(Math.sin(th))*Math.min(Math.abs(B0*Math.sin(th)),zm);
   const tx=.215+.047*Math.cos(th),tz=.047*Math.sin(th);p.set(x0+(tx-x0)*g2+.03*Math.sin(Math.PI*t)*(1-g2*.5),yt*(1-t)+.03*t,z0+(tz-z0)*g2)},80,40,{uvU:3,uvV:1,weld:()=>true});
  const hm=v.kind==='patent'?M.patent(v.heel):v.kind==='suede'?M.velvet(v.heel,{sr:.5,sk:2.2,rep:[4,8]}):M.leather(v.heel,{fine:true,rep:[2,5],bs:.3,cc:.5,ccr:.3,r:.42});
  mesh(heel,hm,{to:g});
  mesh(L.lathe([[0,0],[.045,0],[.05,.006],[.05,.032],[0,.032]],28),M.matte('#141414',.5),{p:[.215,0,0],to:g});
  mesh(L.lathe([[.049,0],[.053,.004],[.053,.022],[.049,.026]],28),M.metal('yellow',.12,{envMapIntensity:2}),{p:[.215,.032,0],to:g});
  g.userData.len=LEN;return g}

 const bg=()=>L.backdrop({stops:[[0,'#b7aaa6'],[.46,'#d5cac6'],[.62,'#cdc1bc'],[1,'#a99c98']],glows:[{x:.56,y:.38,r:.48,color:'rgba(255,246,240,.5)',sy:.8}],vig:.3});
 const env={room:['#c9c5c2','#6a6765','#1f1e1e'],roomI:.75,size:512,panels:[{size:[4,9],pos:[-9,6,6],i:9,soft:.55,color:'#fff5ea'},{size:[2.2,10],pos:[10,4,-2],i:6,soft:.4,color:'#f0f3ff'},{size:[10,5],pos:[0,13,0],i:3.4,soft:.6},{size:[12,1.4],pos:[0,2.5,-13],i:4,soft:.35},{size:[1.2,7],pos:[4,3,11],i:3.5,soft:.5},{size:[18,9],pos:[0,3,15],i:.9,soft:.6}]};
 const plaster=M.matte('#cfc3be',.92);plaster.bumpMap=tex(L.noiseCanvas(256,100,156,5),{srgb:false,repeat:[6,6]});plaster.bumpScale=.25;
 const lights=[{pos:[-5,7,6],i:3,soft:1,color:'#fff1e2',ext:5},{pos:[2,9,-1.5],i:1.2,soft:3,ext:5}];
 let st,camera,focus,aperture=.02,post={bloom:.12,vig:.1};
 const pair=(v,st,y=0)=>{const a=shoe(v);a.position.set(1.8,y,.5);a.rotation.y=Math.PI;st.stage.add(a);                  // mũi quay sang trái, nhìn nghiêng
  const b=shoe(v);b.position.set(-.2,y,-.95);b.rotation.y=Math.PI+.78;st.stage.add(b);return[a,b]};
 if(VAR[shot]){const v=VAR[shot];st=L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.4,shadowColor:'#33241f',lights});
  const h=.22;mesh(L.rbox(4.7,h,2.5,.012,2),plaster,{p:[-.05,h/2,-.1],to:st.stage});pair(v,st,h);
  camera=L.cam(22,[-.1,1.5,8.9]);focus=V3(.2,.74,.4);
 }else if(shot==='set'){st=L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.4,shadowColor:'#33241f',lights:lights.map(l=>({...l,ext:6}))});
  const h=.22;mesh(L.rbox(6.8,h,2.9,.012,2),plaster,{p:[.35,h/2,.1],to:st.stage});
  [['nude',-.6],['noir',1.2],['mulberry',3.0]].forEach(([k,x])=>{const a=shoe(VAR[k]);a.position.set(x,h,-.75);a.rotation.y=Math.PI+.95;st.stage.add(a)});
  camera=L.cam(23,[.35,2.0,10.6]);focus=V3(.35,.62,.3);aperture=.02;
 }else if(shot==='detail'){const v=VAR[globalThis.__spinVar]||VAR.noir;st=L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.4,shadowColor:'#33241f',lights});
  const a=shoe(v);a.position.set(.86,0,-.9);a.rotation.y=Math.PI+.95;st.stage.add(a);
  camera=L.cam(16,[0,1.75,7.6]);focus=V3(0,.52,0);aperture=.02;
 }else if(shot==='box'){const v=VAR.noir;st=L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.4,shadowColor:'#33241f',lights:lights.map(l=>({...l,ext:6}))});
  const pm=M.paper('#2a1620',{rep:[9,9],bs:.5,r:.8}),bw=3.2,bh=1.12,bd=1.95,bx=new T.Group();
  mesh(L.rbox(bw,bh,bd,.012,2),pm,{p:[0,bh/2,0],to:bx});
  /* giấy lụa trong hộp */
  const tis=M.paper('#efe6dc',{linen:false,r:.9,bs:.6,rep:[3,3]});mesh(L.rbox(bw-.06,.08,bd-.06,.03,3),tis,{p:[0,bh+.0,0],to:bx});
  const f=L.decal(logo('#d9b56c'),1.5,.375,{metal:.6,r:.32,emissive:'#b8904c',ei:.5});f.position.set(0,bh*.5,bd/2+.002);bx.add(f);bx.position.set(-.75,0,-.7);bx.rotation.y=.36;st.stage.add(bx);
  const lid=new T.Group();mesh(L.rbox(bw+.05,.3,bd+.05,.012,2),pm,{p:[0,.15,0],to:lid});const f2=L.decal(logo('#d9b56c'),1.6,.4,{metal:.6,r:.32,emissive:'#b8904c',ei:.5});f2.rotation.x=-Math.PI/2;f2.position.set(0,.302,0);lid.add(f2);
  lid.position.set(-2.15,.0,-.15);lid.rotation.set(0,.36,0);lid.rotation.z=0;lid.position.set(-1.05,1.02,-1.65);lid.rotation.set(-1.25,.36,0,'YXZ');st.stage.add(lid);
  const a=shoe(v);a.position.set(.45,bh+.045,-.62);a.rotation.y=Math.PI+.36;bx.remove();st.stage.add(a);
  const b=shoe(v);b.position.set(2.75,0,.95);b.rotation.y=Math.PI+.25;st.stage.add(b);
  camera=L.cam(24,[0,2.6,10.6]);focus=V3(.2,.9,0);aperture=.025;
 }else if(shot==='test'){const v=VAR.nude;st=L.makeStage(renderer,{bg:bg(),env,tone:'neutral',exp:1,envI:.85,shadow:.4,lights});
  const a=shoe(v);a.position.set(1.2,0,0);a.rotation.y=Math.PI;st.stage.add(a);const b=shoe(VAR.noir);b.position.set(-1.6,0,1.2);b.rotation.y=Math.PI-1.2;st.stage.add(b);const c=shoe(VAR.mulberry);c.position.set(1.6,0,1.6);c.rotation.y=-.5;st.stage.add(c);
  camera=L.cam(26,[0,3.2,8]);focus=V3(0,.4,.5);aperture=0;
 }
 return{st,camera,focus,aperture,samples:28,post}}
