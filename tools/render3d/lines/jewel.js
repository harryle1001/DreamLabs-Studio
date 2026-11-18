// Ánh Triêu — nhẫn đính đá "Triêu Dương" trong hộp nhung (concept). Đá cắt giác tự dựng, chấu, đai, hộp vỏ sò lót nhung.
export const VAR={
 emerald:{name:'Lục bảo · vàng 18K',gem:'#18c987',deep:'#03402a',metal:'yellow',box:'#0e2a22',vel:'#123a2e',satin:'#e8e0cf',glow:'rgba(60,170,120,.26)'},
 sapphire:{name:'Lam ngọc · bạch kim',gem:'#3f6dff',deep:'#0a1a66',metal:'silver',box:'#0d1a44',vel:'#14235a',satin:'#e6e6ea',glow:'rgba(90,120,230,.26)'},
 diamond:{name:'Kim cương · vàng hồng',gem:'#ffffff',deep:'#cfd6e0',metal:'#f7c6b0',box:'#3a1420',vel:'#4a1a2a',satin:'#efe2da',glow:'rgba(255,190,170,.24)'},
 ruby:{name:'Hồng ngọc · vàng 18K',gem:'#ff2a55',deep:'#560212',metal:'yellow',box:'#1a1414',vel:'#231a1a',satin:'#eadfcf',glow:'rgba(220,70,90,.24)'},
};
export default async function(shot,renderer,L){
 const {T,M,mesh,cv,tex,txt,V3,V2}=L;
 /* đá cắt giác tròn: các vòng đỉnh lệch pha, khâu kiểu khóa kéo, tô phẳng từng mặt */
 function gemGeo(g,o={}){const rings=[[.0,.33,1,0],[.55,.33,8,0],[.8,.17,8,.5],[1,.03,16,0],[1,-.03,16,0],[.52,-.46,8,.5],[0,-.86,1,0]],pos=[],idx=[],start=[];
  for(const [r,y,n,ph] of rings){start.push(pos.length/3);for(let i=0;i<n;i++){const a=(i+ph)/n*6.2832;pos.push(r*g*Math.cos(a),y*g,r*g*Math.sin(a))}}
  for(let k=0;k<rings.length-1;k++){const [,,nA,pA]=rings[k],[,,nB,pB]=rings[k+1],sA=start[k],sB=start[k+1];
   if(nA===1){for(let j=0;j<nB;j++)idx.push(sA,sB+(j+1)%nB,sB+j);continue}if(nB===1){for(let j=0;j<nA;j++)idx.push(sA+j,sA+(j+1)%nA,sB);continue}
   let i=0,j=0;const aA=i=>(i+pA)/nA,aB=j=>(j+pB)/nB;while(i<nA||j<nB){const nextA=aA(i+1),nextB=aB(j+1);if(i<nA&&(j>=nB||nextA<=nextB)){idx.push(sA+i%nA,sA+(i+1)%nA,sB+j%nB);i++}else{idx.push(sA+i%nA,sB+(j+1)%nB,sB+j%nB);j++}}}
  let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo=geo.toNonIndexed();geo.computeVertexNormals();return geo}
 function ring(v,o={}){const g=new T.Group(),met=M.metal(v.metal,.07,{envMapIntensity:1.5}),R=.5,gr=o.gr||.235;
  const band=new T.TorusGeometry(R,.042,24,160);band.scale(1,1,1.5);mesh(band,met,{to:g});
  /* vai nhẫn thuôn lên ổ đá */
  const hy=R+.02;mesh(L.lathe([[.04,0],[.06,.03],[.105,.1],[.125,.13],[.115,.136],[.05,.045]],48),met,{p:[0,hy,0],to:g});
  /* đá */
  const white=v.gem==='#ffffff',gy=hy+.24+gr*.03,gm=new T.MeshPhysicalMaterial({color:'#ffffff',metalness:0,roughness:0,transmission:1,ior:1.9,thickness:gr*.5,attenuationColor:new T.Color(v.gem),attenuationDistance:white?20:.55,dispersion:white?8:2,flatShading:true,envMapIntensity:2.4,specularIntensity:1});
  const geo=gemGeo(gr);mesh(geo,gm,{p:[0,gy,0],to:g});
  const inner=new T.MeshPhysicalMaterial({color:white?'#f4f8ff':v.gem,metalness:1,roughness:.02,flatShading:true,envMapIntensity:white?3:3.4,emissive:new T.Color(white?'#8090a8':v.gem),emissiveIntensity:white?.12:.22});
  const ig=gemGeo(gr*.9);mesh(ig,inner,{p:[0,gy-.006,0],r:[0,.39,0],to:g,cast:false});
  /* 4 chấu */
  for(let i=0;i<4;i++){const a=(i+.5)/4*6.2832,c=Math.cos(a),s=Math.sin(a);const pc=L.curve3([[c*.13,hy+.1,s*.13],[c*gr*.7,hy+.19,s*gr*.7],[c*gr*1.0,gy-.02,s*gr*1.0],[c*gr*.99,gy+gr*.07,s*gr*.99],[c*gr*.9,gy+gr*.15,s*gr*.9]],false,.5);
   mesh(L.sweep(pc,L.circSection(.018,8),20,{up:V3(0,0,1).applyAxisAngle(V3(0,1,0),-a+1.57)}),met,{to:g});mesh(new T.SphereGeometry(.026,12,10),met,{p:[c*gr*.88,gy+gr*.16,s*gr*.88],to:g})}
  /* hàng đá nhỏ trên vai */
  if(o.pave!==false)for(const sx of[-1,1])for(let k=0;k<7;k++){const a=Math.PI/2-sx*(.4+k*.105),px=Math.cos(a)*(R+.03),py=Math.sin(a)*(R+.03);const s=mesh(gemGeo(.03-k*.0015),new T.MeshPhysicalMaterial({color:'#ffffff',metalness:1,roughness:.02,flatShading:true,envMapIntensity:2.6}),{to:g,cast:false});s.position.set(px,py,0);s.rotation.z=a-Math.PI/2}
  g.userData.top=gy+gr*.33;return g}
 const logoC=(ink,sub=true)=>{const c=cv(1024,400),x=c.getContext('2d');
  /* dấu hiệu: nửa mặt trời mọc trên đường chân trời */
  x.strokeStyle=ink;x.lineWidth=4;x.beginPath();x.arc(512,150,54,Math.PI,0);x.stroke();x.beginPath();x.moveTo(420,150);x.lineTo(604,150);x.stroke();for(let i=1;i<6;i++){const a=Math.PI+i/6*Math.PI;x.beginPath();x.moveTo(512+Math.cos(a)*70,150+Math.sin(a)*70);x.lineTo(512+Math.cos(a)*92,150+Math.sin(a)*92);x.stroke()}
  txt(x,'Ánh Triêu',512,280,'italic 400 108px Playfair',ink);if(sub)txt(x,'HAUTE JOAILLERIE',512,345,'500 26px "Be Vietnam Pro"',ink,{ls:16});return c};
 function box(v,o={}){const g=new T.Group(),w=2.1,d=2.0,bh=.82,lh=.62,out=M.leather(v.box,{fine:true,rep:[6,6],bs:.5,cc:.35,ccr:.3,r:.5}),gold=M.metal('yellow',.14,{envMapIntensity:1.4});
  mesh(L.rbox(w,bh,d,.11,6),out,{p:[0,bh/2,0],to:g});mesh(L.rbox(w+.012,.03,d+.012,.012,2),gold,{p:[0,bh-.05,0],to:g});
  const open=o.open!==false;
  if(open){const vel=M.velvet(v.vel,{rep:[9,9],sk:2});mesh(L.rbox(w-.2,.12,d-.2,.05,4),vel,{p:[0,bh-.03,0],to:g});
   /* hai gối kẹp nhẫn */
   for(const sz of[-1,1])mesh(L.rbox(w-.5,.24,.5,.11,6),vel,{p:[0,bh+.08,sz*.31-.02],to:g})}
  const lid=new T.Group();mesh(L.rbox(w,lh,d,.11,6),out,{p:[0,lh/2,d/2],to:lid});
  if(open){mesh(L.rbox(w-.2,.05,d-.2,.03,3),M.velvet(v.satin,{rep:[9,9],sk:1.2,sr:.3}),{p:[0,.012,d/2],to:lid});
   const dc=L.decal(logoC(v.satin==='#e6e6ea'?'#8f95a8':'#b08a45'),1.05,.41,{metal:.5,r:.4,emissive:v.satin==='#e6e6ea'?'#6f7588':'#8a6a30',ei:.35,side:T.DoubleSide});dc.rotation.set(Math.PI/2,0,0);dc.position.set(0,-.016,d*.7);lid.add(dc);
   lid.position.set(0,bh,-d/2);lid.rotation.x=-1.82}else{lid.position.set(0,bh+.012,-d/2);const dc=L.decal(logoC('#d9b56c',false),1.3,.51,{metal:.6,r:.35,emissive:'#b8904c',ei:.45});dc.rotation.x=-Math.PI/2;dc.position.set(0,lh+.002,d/2);lid.add(dc)}
  g.add(lid);
  if(open&&o.ring!==false){const r=ring(v);r.position.set(0,bh+.24,-.02);r.rotation.x=-.3;g.add(r)}
  return g}

 const bg=(v,gx=.5,gy=.44)=>L.backdrop({stops:[[0,'#0a0707'],[.5,'#1a1011'],[.66,'#261819'],[1,'#0b0808']],glows:[{x:gx,y:gy,r:.4,color:(v&&v.glow)||'rgba(255,200,170,.22)',sy:.85},{x:gx,y:.42,r:.6,color:'rgba(255,220,200,.07)',sy:.6}],vig:.5});
 const env=L.ENV.dark({room:['#3a3436','#171314','#060505'],key:'#fff6ee',keyI:12,fill:'#e6ecff',fillI:7,topI:5,rimI:6,frontI:3,extra:[{size:[14,7],pos:[0,5,14],i:1.1,soft:.6},{size:[.7,12],pos:[-7,3,-9],i:14,soft:.3},{size:[.7,12],pos:[7.5,3,-8],i:12,soft:.3},{size:[3,3],pos:[-3,12,5],i:14,soft:.4},{size:[1.5,1.5],pos:[4,9,7],i:20,soft:.3}]});
 const lights=[{pos:[-3.5,8,5],i:1.8,soft:.9,color:'#fff5ea',ext:5},{pos:[1,9,-1.5],i:1,soft:2.6,ext:5}];
 let st,camera,focus,aperture=.03,reflect={y0:.7,y1:1,k:.3,blur:2.5},post={bloom:.34,vig:.18,bloomCut:.5};
 if(VAR[shot]){const v=VAR[shot];st=L.makeStage(renderer,{bg:bg(v),env,tone:'aces',exp:1.1,shadow:.5,lights});
  const b=box(v);b.rotation.y=-.36;b.position.set(.25,0,0);st.stage.add(b);
  camera=L.cam(22,[0,3.5,9.0]);focus=V3(0,1.12,.1);reflect.y0=.76;
 }else if(shot==='set'){st=L.makeStage(renderer,{bg:bg(null,.5,.5),env,tone:'aces',exp:1.1,shadow:.5,lights});
  [['sapphire',-1.3,-.3,.5],['emerald',0,.35,.0],['diamond',1.3,-.3,-.5]].forEach(([k,x,z,ry])=>{const r=ring(VAR[k]);r.position.set(x,.5+.04,z);r.rotation.y=ry;st.stage.add(r)});
  camera=L.cam(18,[0,1.2,8.6]);focus=V3(0,.7,.35);aperture=.02;reflect={y0:.72,y1:1,k:.42,blur:2};
 }else if(shot==='detail'){const v=VAR[globalThis.__spinVar]||VAR.emerald;st=L.makeStage(renderer,{bg:bg(v,.5,.5),env,tone:'aces',exp:1.1,shadow:.5,lights});
  const r=ring(v);r.position.set(0,.54,0);r.rotation.y=.45;st.stage.add(r);
  camera=L.cam(15,[.4,1.75,4.0]);focus=V3(0,1.08,.05);aperture=.016;reflect={y0:.8,y1:1,k:.4,blur:2};
 }else if(shot==='box'){st=L.makeStage(renderer,{bg:bg(null,.5,.5),env,tone:'aces',exp:1.1,shadow:.5,lights:lights.map(l=>({...l,ext:7}))});
  const a=box(VAR.diamond,{open:false});a.position.set(-1.9,0,-.5);a.rotation.y=.5;st.stage.add(a);
  const b2=box(VAR.sapphire,{open:false});b2.position.set(-1.75,1.46,-.45);b2.rotation.y=.2;b2.scale.setScalar(.78);st.stage.add(b2);
  const c=box(VAR.emerald);c.position.set(1.1,0,.2);c.rotation.y=-.4;st.stage.add(c);
  camera=L.cam(24,[0,3.4,11]);focus=V3(.4,1.15,.3);aperture=.03;reflect.y0=.72;
 }
 return{st,camera,focus,aperture,samples:28,reflect,post}}
