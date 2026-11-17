/* Dream Labs — Session B "Showroom": phần Dự án (#du-an), trình xem bao bì 3D, thanh trượt trước/sau, case study.
   Phần 1: WK3D — bộ dựng bao bì 3D bằng Three.js (dùng chung cho trình xem trên trang và công cụ render ảnh tĩnh).
   Phần 2: giao diện #du-an (xem cuối file). */
window.WK3D=(()=>{
const PHI=1.61803,GA=137.508*Math.PI/180;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const phy=(x,cx,cy,n,c,r0,r1)=>{for(let i=1;i<=n;i++){const r=c*Math.sqrt(i),t=i*GA;x.beginPath();x.arc(cx+r*Math.cos(t),cy+r*Math.sin(t),r0+(r1-r0)*i/n,0,7);x.fill()}};
/* chữ canh giữa, tự co cho vừa bề ngang mw (tính cả giãn chữ) */
const txt=(x,s,px,py,font,fill,ls=0,mw=0)=>{const m=/(\d+(?:\.\d+)?)px/.exec(font),ok='letterSpacing' in x;x.font=font;if(ok)x.letterSpacing=ls+'px';
 if(mw){const w=x.measureText(s).width;if(w>mw){const k=mw/w;x.font=font.replace(m[0],(+m[1]*k).toFixed(1)+'px');if(ok)x.letterSpacing=(ls*k)+'px'}}
 x.fillStyle=fill;x.textAlign='center';x.fillText(s,px,py);if(ok)x.letterSpacing='0px'};
/* ---- nhãn (vẽ bằng canvas 2D) ---- */
const L={
 /* Miên Thảo: nhãn chai / hũ (flat) / mặt hộp. Bố cục tính theo đơn vị u để không méo khi nhãn quấn rộng. */
 mt(o){const W=o.w||768,H=o.h||768,c=cv(W,H),x=c.getContext('2d'),cx=W/2,bg=o.bg||'#F6F2E9',ink=o.ink||'#2E3A2C',acc=o.accent||'#B9785A',u=Math.min(H,W*1.3),mw=Math.min(W*.82,u*1.25);
  x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=acc;
  if(o.flat){phy(x,cx-u*1.5,H*.5,34,u*.045,u*.01,u*.026);
   txt(x,'Miên Thảo',cx,H*.56,`italic 400 ${u*.42}px Cormorant,Fraunces,serif`,ink);
   txt(x,o.sub||'KEM ĐÊM CÁM GẠO',cx,H*.82,`500 ${u*.1}px "Be Vietnam Pro",sans-serif`,'#6B7466',u*.04);return c}
  if(o.v){x.fillRect(0,0,W,H*.382);x.fillStyle=bg;phy(x,cx,H*.191,34,u*.024,u*.004,u*.014)}else phy(x,cx,H*.27,55,u*.021,u*.004,u*.013);
  txt(x,'Miên Thảo',cx,H*.62,`italic 400 ${u*.16}px Cormorant,Fraunces,serif`,ink,0,mw);
  x.fillStyle=ink;x.fillRect(cx-u*.1,H*.675,u*.2,Math.max(1.5,u*.004));
  txt(x,o.sub||'TINH CHẤT RAU MÁ',cx,H*.77,`500 ${u*.042}px "Be Vietnam Pro",sans-serif`,'#6B7466',u*.014,mw);
  txt(x,o.vol||'30 ml',cx,H*.89,`500 ${u*.038}px "Be Vietnam Pro",sans-serif`,'#6B7466',u*.01);
  if(o.frame){x.strokeStyle=acc;x.lineWidth=Math.max(2,W*.004);x.strokeRect(W*.07,W*.07,W*.86,H-W*.14)}
  return c},
 /* Gác Khói: toàn bộ mặt trước túi */
 gk(o){const W=1024,H=1600,c=cv(W,H),x=c.getContext('2d'),bag=o.color||'#1F1612',acc=o.accent||'#E4572E',pp='#F1E9DA',dark='#1F1612';
  x.fillStyle=bag;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,255,255,.07)';x.fillRect(0,0,W,170);x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=3;for(let i=0;i<7;i++){x.beginPath();x.moveTo(0,18+i*22);x.lineTo(W,18+i*22);x.stroke()}
  x.setLineDash([14,14]);x.strokeStyle=pp;x.lineWidth=4;x.beginPath();x.moveTo(40,196);x.lineTo(W-40,196);x.stroke();x.setLineDash([]);
  if(o.v){ /* biến thể B: chữ lớn in thẳng lên túi */
   txt(x,'GÁC',W/2,650,`400 380px Anton,Impact,sans-serif`,pp,0,W-240);txt(x,'KHÓI',W/2,1030,`400 380px Anton,Impact,sans-serif`,acc===bag?pp:acc,0,W-240);
   x.fillStyle=pp;x.fillRect(120,1100,W-240,6);
   txt(x,o.name||'CẦU ĐẤT · ARABICA',W/2,1190,`400 54px "Space Mono",monospace`,pp,4,W-260);
   txt(x,'RANG TƯƠI MỖI THỨ BA · 250G',W/2,1266,`400 38px "Space Mono",monospace`,pp,3,W-260)
  }else{
   x.fillStyle=pp;x.fillRect(150,400,W-300,860);
   txt(x,'GÁC KHÓI',W/2,650,`400 230px Anton,Impact,sans-serif`,dark,0,W-420);
   x.fillStyle=dark;x.fillRect(220,700,W-440,7);
   txt(x,o.name||'CẦU ĐẤT · ARABICA',W/2,790,`400 46px "Space Mono",monospace`,dark,3,W-440);
   x.fillStyle=acc===pp?bag:acc;x.fillRect(220,860,W-440,180);
   txt(x,'MẺ SỐ 21',W/2,996,`400 124px Anton,Impact,sans-serif`,pp);
   txt(x,'RANG: THỨ BA 05:00',W/2,1130,`400 38px "Space Mono",monospace`,dark,3,W-440);
   txt(x,'250G · HẠT NGUYÊN',W/2,1196,`400 38px "Space Mono",monospace`,dark,3,W-440)}
  x.strokeStyle='#C9A27A';x.lineWidth=8;x.beginPath();x.arc(W-190,300,34,0,7);x.stroke();
  return c},
 /* túi "trước khi thiết kế lại" */
 gkOld(){const W=1024,H=1600,c=cv(W,H),x=c.getContext('2d');x.fillStyle='#B88E60';x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,255,255,.08)';x.fillRect(0,0,W,170);x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=3;for(let i=0;i<7;i++){x.beginPath();x.moveTo(0,18+i*22);x.lineTo(W,18+i*22);x.stroke()}
  x.fillStyle='#fff';x.fillRect(190,470,W-380,640);x.strokeStyle='#8a1f1f';x.lineWidth=8;x.strokeRect(210,490,W-420,600);
  txt(x,'CÀ PHÊ',W/2,640,'700 120px Arial,sans-serif','#8a1f1f');txt(x,'RANG XAY',W/2,760,'700 96px Arial,sans-serif','#3a2a1a');
  x.fillStyle='#3a2a1a';x.beginPath();x.ellipse(W/2,880,70,46,-.5,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=7;x.beginPath();x.moveTo(W/2-50,905);x.quadraticCurveTo(W/2,880,W/2+50,855);x.stroke();
  txt(x,'NGUYÊN CHẤT 100%',W/2,1010,'700 46px Arial,sans-serif','#8a1f1f');txt(x,'Khối lượng tịnh: 500g',W/2,1066,'400 34px Arial,sans-serif','#3a2a1a');
  return c},
 /* VƯƠN: nhãn quấn quanh hũ (2 mặt lặp lại) */
 vu(o){const W=o.w||2048,H=o.h||640,c=cv(W,H),x=c.getContext('2d'),bg=o.color||'#C8FF2E',ink=o.ink||'#0A0A0B',mw=Math.min(W*.4,H*1.5);
  x.fillStyle=o.v?ink:bg;x.fillRect(0,0,W,H);const fg=o.v?bg:ink;
  for(let k=0;k<3;k++){const cx=W*k*.5;
   txt(x,'VƯƠN',cx,H*.6,`900 ${H*.36}px Unbounded,"Arial Black",sans-serif`,fg,-H*.012,mw);
   txt(x,o.sub||'WHEY PROTEIN · VỊ CA CAO',cx,H*.75,`700 ${H*.056}px Unbounded,"Arial Black",sans-serif`,fg,2,mw);
   txt(x,o.vol||'908 G · 34 LẦN DÙNG',cx,H*.86,`500 ${H*.044}px "Be Vietnam Pro",sans-serif`,fg,H*.01,mw);
   x.fillStyle=o.v?bg:'#FF5A1F';x.beginPath();x.arc(cx+mw*.36,H*.21,H*.095,0,7);x.fill();txt(x,'21G',cx+mw*.36,H*.222,`900 ${H*.058}px Unbounded,"Arial Black",sans-serif`,ink);txt(x,'ĐẠM',cx+mw*.36,H*.268,`700 ${H*.03}px Unbounded,"Arial Black",sans-serif`,ink)}
  x.save();x.beginPath();x.rect(0,0,W,H*.075);x.clip();x.fillStyle=fg;for(let i=-2;i<W/40+2;i++){x.beginPath();x.moveTo(i*40,H*.075);x.lineTo(i*40+20,H*.075);x.lineTo(i*40+50,0);x.lineTo(i*40+30,0);x.fill()}x.restore();
  return c},
 plain(col,w=64,h=64){const c=cv(w,h),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,w,h);return c}
};
/* ---- hình khối ---- */
function build(T,kind,o={}){
 const g=new T.Group(),V=(a,b)=>new T.Vector2(a,b);
 const tex=c=>{const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t};
 const mat=p=>new T.MeshStandardMaterial(p),gloss=(col,r=.2)=>new T.MeshPhysicalMaterial({color:col,roughness:r,metalness:0,clearcoat:1,clearcoatRoughness:.1});
 const add=(geo,m,y=0)=>{const me=new T.Mesh(geo,m);me.position.y=y;g.add(me);return me};
 const wrap=(r,h,y,canvas,frac=1/PHI,r2=r)=>{const len=Math.PI*2*frac;return add(new T.CylinderGeometry(r,r2,h,96,1,true,-len/2,len),mat({map:tex(canvas),roughness:.72}),y)};
 if(kind==='bottle'){
  add(new T.LatheGeometry([[0,0],[.44,0],[.5,.02],[.52,.07],[.52,1.12],[.5,1.2],[.44,1.28],[.33,1.36],[.24,1.41],[.2,1.45],[.2,1.52]].map(p=>V(p[0],p[1])),72),gloss(o.color||'#C98F73',.16));
  wrap(.524,.64,.62,o.label);
  const dk=mat({color:o.cap||'#2A3328',roughness:.42});
  add(new T.CylinderGeometry(.215,.215,.13,48),dk,1.57);add(new T.CylinderGeometry(.235,.235,.035,48),dk,1.5);
  add(new T.LatheGeometry([[0,0],[.165,0],[.17,.02],[.17,.32],...Array.from({length:9},(_,i)=>{const t=i/8*Math.PI/2;return [.17*Math.cos(t),.32+.17*Math.sin(t)]})].map(p=>V(p[0],p[1])),48),mat({color:o.cap||'#2A3328',roughness:.6}),1.635);
  g.userData.h=2.14}
 else if(kind==='jar'){
  add(new T.LatheGeometry([[0,0],[.56,0],[.62,.03],[.64,.09],[.64,.5],[.6,.54]].map(p=>V(p[0],p[1])),72),gloss(o.color||'#E9DFC8',.2));
  wrap(.644,.3,.3,o.label);
  add(new T.LatheGeometry([[.6,0],[.65,0],[.67,.02],[.67,.25],[.63,.28],[0,.28]].map(p=>V(p[0],p[1])),72),mat({color:o.cap||'#2A3328',roughness:.38,side:T.DoubleSide}),.54);
  g.userData.h=.82}
 else if(kind==='box'){
  const w=o.w||.84,h=o.h||1.6,d=o.d||.84,side=mat({map:tex(o.side||L.plain(o.color||'#F6F2E9')),roughness:.8}),top=mat({color:o.top||o.color||'#F6F2E9',roughness:.8});
  add(new T.BoxGeometry(w,h,d),[side,side,top,top,mat({map:tex(o.label),roughness:.8}),side],h/2);g.userData.h=h}
 else if(kind==='tub'||kind==='can'){
  const can=kind==='can',r=can?.34:.6,h=can?1.22:1.3;
  add(new T.CylinderGeometry(r-.004,r-.02,h,96),mat({color:o.body||'#0E0E10',roughness:.35}),h/2);
  wrap(r,h*.9,h/2,o.label,1,r-.012);
  if(can){const al=mat({color:'#c9ccd1',roughness:.25,metalness:.9});add(new T.CylinderGeometry(r*.82,r,.07,64),al,h+.035);add(new T.CylinderGeometry(r*.84,r*.84,.02,64),al,h+.075);g.userData.h=h+.09}
  else{const lid=mat({color:o.cap||'#0E0E10',roughness:.3});add(new T.CylinderGeometry(r+.035,r+.035,.24,96),lid,h+.11);add(new T.CylinderGeometry(r+.02,r+.035,.03,96),lid,h+.245);g.userData.h=h+.27}}
 else if(kind==='bag'){
  const W=1.24,H=1.92,D=.34,nx=28,ny=44,pos=[],uv=[],idx=[];
  const dep=v=>{if(v>=.9)return .006;const t=v/.9;return D*Math.pow(1-t,.62)*(.8+.36*Math.sin(Math.PI*Math.pow(t,.6)))+.006};
  const th=u=>Math.pow(Math.max(0,1-Math.pow(Math.abs(u),3.2)),.5);
  for(let s=0;s<2;s++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx*2-1,v=j/ny,z=dep(v)*th(u)*(s?-1:1),wv=1-.045*Math.pow(1-v,6);
   pos.push(u*W/2*wv,v*H,z);uv.push(s?1-i/nx:i/nx,v)}
  const row=nx+1,off=(ny+1)*row;
  for(let s=0;s<2;s++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=s*off+j*row+i,b=a+1,c2=a+row,d2=c2+1;s?idx.push(a,c2,b,b,c2,d2):idx.push(a,b,c2,b,d2,c2)}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setIndex(idx);geo.addGroup(0,nx*ny*6,0);geo.addGroup(nx*ny*6,nx*ny*6,1);geo.computeVertexNormals();
  g.add(new T.Mesh(geo,[mat({map:tex(o.label),roughness:.5,metalness:.08}),mat({color:o.color||'#1F1612',roughness:.5,metalness:.08})]));
  /* đáy túi */
  const bp=[],bi=[];for(let i=0;i<=nx;i++){const u=i/nx*2-1,z=dep(0)*th(u),xw=u*W/2*.955;bp.push(xw,0,z,xw,0,-z)}for(let i=0;i<nx;i++){const a=i*2;bi.push(a,a+1,a+2,a+1,a+3,a+2)}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(bp,3));bg.setIndex(bi);bg.computeVertexNormals();g.add(new T.Mesh(bg,mat({color:o.color||'#1F1612',roughness:.6})));
  g.userData.h=H}
 return g}
/* ---- ánh sáng studio: môi trường PMREM tự dựng + 1 đèn chính + bóng tiếp xúc ---- */
function studio(T,renderer,scene,o={}){
 const env=new T.Scene(),bm=(col,i=1)=>{const m=new T.MeshBasicMaterial({color:col,side:T.DoubleSide});m.color.multiplyScalar(i);return m};
 env.add(new T.Mesh(new T.BoxGeometry(30,30,30),new T.MeshBasicMaterial({color:o.room||'#8f8a94',side:T.BackSide})));
 const pan=(w,h,x,y,z,col,i)=>{const p=new T.Mesh(new T.PlaneGeometry(w,h),bm(col,i));p.position.set(x,y,z);p.lookAt(0,0,0);env.add(p)};
 pan(10,10,0,12,2,'#ffffff',o.top||3.2);pan(5,12,-11,3,5,o.key||'#fff4e6',o.keyI||6.2);pan(4,10,11,2,3,o.fill||'#e6ecff',o.fillI||2.6);pan(12,3,0,3,-12,o.rim||'#ffffff',o.rimI||3.4);pan(14,6,0,-9,6,'#ffffff',.9);
 const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.03).texture;pm.dispose();
 const d=new T.DirectionalLight(o.sun||'#fff1e0',o.sunI!=null?o.sunI:1.1);d.position.set(-3,5,4);scene.add(d);
 renderer.toneMapping=T.NeutralToneMapping||T.ACESFilmicToneMapping;renderer.toneMappingExposure=o.exp||1}
function shadow(T,r=1.2,op=.5,col='#1b1612'){const c=cv(256,256),x=c.getContext('2d'),gr=x.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,col);gr.addColorStop(.45,col+'88');gr.addColorStop(1,col+'00');x.fillStyle=gr;x.fillRect(0,0,256,256);
 const m=new T.Mesh(new T.PlaneGeometry(r*2,r*2),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:op,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.002;m.renderOrder=-1;return m}
function dispose(obj){obj.traverse(n=>{if(n.geometry)n.geometry.dispose();const ms=n.material?(Array.isArray(n.material)?n.material:[n.material]):[];ms.forEach(m=>{m.map&&m.map.dispose();m.dispose()})})}
return{PHI,L,build,studio,shadow,dispose}})();

/* ═════════ Phần 2: giao diện #du-an ═════════ */
(()=>{DL.ready(()=>{
const root=document.getElementById('du-an');if(!root)return;
const g=DL.gsap,RM=DL.RM,$=(s,r=root)=>r.querySelector(s),$$=(s,r=root)=>[...r.querySelectorAll(s)];
const url=p=>new URL(p,document.baseURI).href,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=(window.DL_DATA&&window.DL_DATA.CATS)||[];
const ARROW='<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 13h14M14 7l6 6-6 6"/></svg>';

/* ── phông của các thương hiệu concept: nạp khi cần (nhãn 3D, mẫu chữ trong case study) ── */
const UR={latin:'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD',vietnamese:'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB'};
const FONT={Anton:['anton-$-400-normal',{}],'Space Mono':['space-mono-$-400-normal',{}],Cormorant:['cormorant-garamond-$-400-italic',{style:'italic'}],Playfair:['playfair-display-$-wght-normal',{weight:'400 900'}],Unbounded:['unbounded-$-wght-normal',{weight:'200 900'}]};
const fontP={};
const loadFont=f=>fontP[f]||(fontP[f]=(FONT[f]&&window.FontFace?Promise.all(Object.keys(UR).map(k=>{const ff=new FontFace(f,`url(${url('demos/fonts/'+FONT[f][0].replace('$',k)+'.woff2')})`,{unicodeRange:UR[k],display:'swap',...FONT[f][1]});document.fonts.add(ff);return ff.load()})):Promise.resolve()).catch(()=>{}));

/* ── dữ liệu dự án (thương hiệu concept do Dream Labs tự nghĩ) ── */
const P={
 'gac-khoi':{name:'Gác Khói Roastery',cat:'web',catName:'Website',tier:'Chuyên nghiệp',ind:'Cà phê rang xay',img:'img/wk-gac-khoi.webp',demo:'gac-khoi',
  lead:'Website bán hàng cho một xưởng rang nhỏ: kể chuyện mẻ rang mỗi tuần và để khách đặt túi tiếp theo trong vài chạm.',
  ctx:'Gác Khói chỉ rang một mẻ mỗi tuần. Khách cần hiểu vì sao cà phê tươi đáng chờ, biết tuần này rang gì và đặt hàng ngay trên điện thoại. Chúng tôi chọn giọng nói thẳng, chữ lớn, màu than hồng của lò rang.',
  did:['Nhận diện số: chữ Anton khổ hẹp, nền giấy kraft, cam than hồng.','Trang chủ đi theo nhịp mẻ rang: tuần này rang gì, khi nào giao.','Thẻ sản phẩm có mức rang, ghi chú vị, thêm vào giỏ ngay.','Biểu đồ đường cong rang tương tác với 3 mức rang.','Hướng dẫn pha 3 kiểu, menu quán và form đăng ký gói định kỳ.'],
  pal:['#F1E9DA','#1F1612','#E4572E','#C9A27A','#7F8E93'],fonts:[['Anton','Tiêu đề'],['Space Mono','Nhãn, số liệu'],['Be Vietnam Pro','Nội dung']]},
 'mien-thao':{name:'Miên Thảo Botanics',cat:'web',catName:'Website',tier:'Chuyên nghiệp',ind:'Mỹ phẩm thiên nhiên',img:'img/wk-mien-thao.webp',demo:'mien-thao',
  lead:'Website thương hiệu cho dòng dưỡng da thuần thực vật: ít chữ, nhiều khoảng thở, thành phần minh bạch.',
  ctx:'Miên Thảo chỉ có bốn sản phẩm và mười ba thành phần. Website phải cho thấy đúng sự tinh gọn đó, đồng thời giúp người mới biết nên bắt đầu từ đâu. Hình vòm, màu xô thơm và đất nung gợi một hiệu thuốc nam thời nay.',
  did:['Nhận diện số: chữ Cormorant mảnh, khung vòm, bảng màu xô thơm và đất nung.','Minh họa sản phẩm và hình thực vật vẽ hoàn toàn bằng code, nhẹ và sắc nét.','Mục thành phần: bấm từng nguyên liệu, hình vẽ tự hiện từng nét.','Liệu trình sáng và tối đổi qua lại trong một chạm.','Gợi ý bộ dưỡng theo loại da, kèm form nhận mẫu thử.'],
  pal:['#F6F2E9','#2E3A2C','#93A88D','#EBCFC2','#B9785A'],fonts:[['Cormorant','Tiêu đề'],['Be Vietnam Pro','Nội dung']]},
 'doi-lang':{name:'Đồi Lặng Villas',cat:'landing',catName:'Landing Page',tier:'Cao cấp',ind:'Bất động sản nghỉ dưỡng',img:'img/wk-doi-lang.webp',demo:'doi-lang',
  lead:'Landing page thu khách quan tâm cho dự án biệt thự bên vịnh: một trang, một mục tiêu là để lại số điện thoại.',
  ctx:'Người mua biệt thự nghỉ dưỡng quyết định bằng cảm xúc trước, con số sau. Trang mở bằng cảnh hoàng hôn dựng từ nhiều lớp SVG, rồi trả lời lần lượt: ở đâu, căn nào, giá bao nhiêu, trả thế nào. Nút đăng ký có mặt ở mọi chặng.',
  did:['Cảnh hoàng hôn nhiều lớp có chiều sâu khi cuộn, cửa sổ biệt thự sáng đèn.','Sơ đồ vị trí tự vẽ tuyến đường, kèm thời gian di chuyển.','Mặt bằng 3 loại biệt thự vẽ tương tác, bấm để xem từng phòng.','Tiến độ thanh toán 6 đợt và bảng giá rõ ràng.','Form đăng ký tự chọn sẵn loại biệt thự khách vừa xem.'],
  pal:['#0C1B22','#12303A','#1E5560','#C9A66B','#E8D9BC'],fonts:[['Playfair','Tiêu đề'],['Be Vietnam Pro','Nội dung']]},
 'vuon-club':{name:'VƯƠN Club',cat:'landing',catName:'Landing Page',tier:'Chuyên nghiệp',ind:'Phòng tập',img:'img/wk-vuon-club.webp',demo:'vuon-club',
  lead:'Landing page cho chiến dịch tập thử 7 ngày: năng lượng cao, đọc nhanh, đăng ký trong một màn hình.',
  ctx:'Khách xem quảng cáo trên điện thoại và quyết định trong vài giây. Trang dùng chữ khổ rộng, nền đen, vàng chanh neon và những công cụ nhỏ để khách tự thử: đồng hồ tập ngắt quãng, lịch lớp, tính vùng nhịp tim.',
  did:['Tiêu đề chữ Unbounded cỡ lớn, đường nhịp tim chạy liên tục.','Đồng hồ tập ngắt quãng chạy thật ngay trong màn hình đầu.','Lịch lớp cả tuần, lọc theo kiểu lớp, vuốt ngang trên điện thoại.','Công cụ tính vùng nhịp tim theo tuổi.','Bảng giá đổi tháng và năm, form giữ chỗ tập thử.'],
  pal:['#0A0A0B','#F3F3EC','#C8FF2E','#FF5A1F','#7C6CF2'],fonts:[['Unbounded','Tiêu đề'],['Be Vietnam Pro','Nội dung']]},
 'mt-pack':{name:'Miên Thảo · bộ bao bì',cat:'product',catName:'Bao bì & 3D',tier:'Chuyên nghiệp',ind:'Mỹ phẩm thiên nhiên',img:'img/wk-3d-mt.webp',view:'bottle',
  lead:'Bộ nhãn cho chai tinh chất, hũ kem và hộp giấy, dựng mockup 3D để duyệt trước khi in.',
  ctx:'Sản phẩm đứng trên kệ cạnh rất nhiều nhãn hàng nhiều màu. Chúng tôi đi hướng ngược lại: nền ngà, một họa tiết hoa văn lấy cảm hứng từ hoa hướng dương, tên thương hiệu viết nghiêng. Màu chai phân biệt từng dòng sản phẩm.',
  did:['Họa tiết thương hiệu vẽ bằng thuật toán, dùng lại được ở mọi kích thước.','Nhãn quấn vừa đủ quanh chai để chữ luôn nằm gọn trong tầm mắt.','Ba cỡ bao bì: chai 30 ml, hũ 50 g, hộp giấy.','Mockup 3D chiếu sáng kiểu studio, xuất ảnh cho quảng cáo.','File in tách màu, có đường bế và vùng an toàn.'],
  pal:['#F6F2E9','#C98F73','#93A88D','#E9DFC8','#2A3328'],fonts:[['Cormorant','Tên thương hiệu'],['Be Vietnam Pro','Thông tin']]},
 'gk-pack':{name:'Gác Khói · túi cà phê',cat:'product',catName:'Bao bì & 3D',tier:'Chuyên nghiệp',ind:'Cà phê rang xay',img:'img/wk-3d-gk.webp',view:'bag',
  lead:'Thiết kế lại túi cà phê 250g: từ nhãn dán chung chung sang một hệ bao bì nhận ra ngay từ xa.',
  ctx:'Túi cũ dùng giấy kraft và nhãn dán giống mọi xưởng rang khác. Bản mới giữ đúng ba thứ khách cần đọc: tên xưởng, vùng trồng, số mẻ rang. Mỗi loại hạt một màu túi để nhân viên và khách đều lấy đúng.',
  did:['Hệ màu theo loại hạt: đen cho Arabica, xanh rêu cho Robusta, cam cho blend.','Nhãn chính in số mẻ và ngày rang, đổi mỗi tuần mà không cần in lại túi.','Phiên bản chữ lớn in thẳng lên túi cho dòng blend.','Dựng túi 3D từ lưới tự tính, có độ phồng và đường hàn miệng.','So sánh trước và sau để chủ xưởng dễ quyết định.'],
  pal:['#1F1612','#F1E9DA','#E4572E','#3E4A3C','#C9A27A'],fonts:[['Anton','Tên, số mẻ'],['Space Mono','Vùng trồng, ngày rang']]},
 'vu-pack':{name:'VƯƠN · hũ và lon',cat:'product',catName:'Bao bì & 3D',tier:'Chuyên nghiệp',ind:'Thể thao',img:'img/wk-3d-vu.webp',view:'tub',
  lead:'Dòng sản phẩm bán tại quầy phòng tập: hũ protein và lon nước điện giải cùng một ngôn ngữ thiết kế.',
  ctx:'Sản phẩm bán ngay tại quầy lễ tân nên phải hút mắt trong vài giây giữa hai hiệp tập. Chúng tôi kéo nguyên tinh thần của landing page vào bao bì: chữ VƯƠN khổ rộng, sọc cảnh báo, vàng chanh trên nền đen.',
  did:['Logo chữ lặp quanh thân để nhìn từ hướng nào cũng đọc được.','Dải sọc chéo làm dấu nhận diện chung cho cả dòng.','Đổi màu nền theo hương vị, giữ nguyên bố cục.','Con dấu tròn nêu lượng đạm, đọc được từ xa.','Mockup 3D hũ và lon dùng cho bảng giá tại quầy.'],
  pal:['#0A0A0B','#C8FF2E','#FF5A1F','#F3F3EC','#7C6CF2'],fonts:[['Unbounded','Logo, tiêu đề'],['Be Vietnam Pro','Thông tin']]}
};
const lum=h=>{const n=parseInt(h.slice(1),16);return(.299*(n>>16&255)+.587*(n>>8&255)+.114*(n&255))/255};
const tierOf=p=>{const c=CATS.find(c=>c.id===p.cat);if(!c)return null;return{c,t:c.tiers.find(t=>t.n===p.tier)||c.tiers.find(t=>t.hot)||c.tiers[0]}};

/* ── lọc dự án (Flip) ── */
const grid=$('#wk-grid'),cards=$$('.wk-card',grid),chips=$$('.wk-chip');
let filter='all',flipBusy=false;
const setFilter=k=>{
  filter=k;chips.forEach(c=>{const on=c.dataset.f===k;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
  const run=()=>{const f=k!=='all';grid.classList.toggle('is-filtered',f);let n=0;cards.forEach(c=>{const hide=f&&c.dataset.cat!==k;c.classList.toggle('is-hidden',hide);if(!hide&&f)n++});grid.dataset.n=f?n:''};
  const F=window.Flip;
  if(RM||!F||!g||matchMedia('(max-width:860px)').matches){run();DL.refresh();return}
  g.registerPlugin(F);const h0=grid.offsetHeight,st=F.getState(cards);run();const h1=grid.offsetHeight;flipBusy=true;
  g.fromTo(grid,{height:h0},{height:h1,duration:.686,ease:'power3.inOut',clearProps:'height'});
  F.from(st,{duration:.686,ease:'power3.inOut',absolute:true,stagger:.038,
    onEnter:els=>g.fromTo(els,{opacity:0,scale:.9},{opacity:1,scale:1,duration:.424,ease:'power2.out',clearProps:'opacity,scale'}),
    onLeave:els=>g.to(els,{opacity:0,scale:.9,duration:.262}),
    onComplete:()=>{flipBusy=false;g.set(cards,{clearProps:'opacity,scale'});DL.refresh()}});
};
const flipLoad=()=>DL.load('vendor/Flip.min.js').catch(()=>{});
$('.wk-chips').addEventListener('click',e=>{const b=e.target.closest('.wk-chip');if(!b||b.dataset.f===filter||flipBusy)return;const k=b.dataset.f;flipLoad().then(()=>setFilter(k))});
$('.wk-chips').addEventListener('pointerenter',flipLoad,{once:true});

/* ── thẻ dự án: parallax ảnh theo con trỏ, mở case study ── */
if(g&&DL.fine&&!RM)cards.forEach(c=>{const im=$('.wk-par img',c);if(!im)return;const qx=g.quickTo(im,'x',{duration:.686,ease:'power3'}),qy=g.quickTo(im,'y',{duration:.686,ease:'power3'});
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();qx(((e.clientX-r.left)/r.width-.5)*-26);qy(((e.clientY-r.top)/r.height-.5)*-16)});
  c.addEventListener('pointerleave',()=>{qx(0);qy(0)})});
grid.addEventListener('click',e=>{const b=e.target.closest('.wk-open');if(!b)return;const id=b.closest('.wk-card').dataset.id;P[id]&&openCase(id)});
{const s=$('.wk-cta-phy');if(s){const GA=137.508*Math.PI/180;let h='';for(let i=1;i<=144;i++){const r=7.6*Math.sqrt(i),t=i*GA;h+=`<circle cx="${(r*Math.cos(t)).toFixed(1)}" cy="${(r*Math.sin(t)).toFixed(1)}" r="${(.8+i/144*2.4).toFixed(1)}"/>`}s.innerHTML=h}}

/* ── case study ── */
let liveOff=null;
function caseNode(id){
  const p=P[id],tt=tierOf(p),pick=tt?`${tt.c.name} — ${tt.t.n}`:'',el=document.createElement('div');el.className='wk-cs';
  const price=tt?`<div class="wk-price card"><p class="eyebrow">Gói tương ứng</p><b>${esc(pick)}</b><p class="wk-amt">${DL.vnd(tt.t.p)}<small>${tt.t.u||''}${tt.t.plus?' trở lên':''}</small></p><span class="wk-fbnote" style="text-align:left">${esc(tt.t.t)} · ${esc(tt.t.r)}</span><ul>${tt.t.f.filter(f=>typeof f==='string').map(f=>`<li>${esc(f)}</li>`).join('')}</ul><a class="btn primary" href="#lien-he" data-pick="${esc(pick)}">Làm dự án tương tự ${ARROW}</a><a class="btn sm" href="#p-${tt.c.id}">Xem các gói ${esc(tt.c.name)}</a></div>`:'';
  el.innerHTML=`
  <div class="wk-cs-top">
    <div>
      <div class="wk-cs-tags"><span class="tag-concept">Concept</span><span class="chip">${esc(p.catName)}</span><span class="chip">${esc(p.ind)}</span></div>
      <h3>${esc(p.name)}</h3><p class="lead">${esc(p.lead)}</p>
      <ul class="wk-cs-meta"><li><small>Ngành</small><b>${esc(p.ind)}</b></li><li><small>Dịch vụ</small><b>${esc(p.catName)}</b></li>${tt?`<li><small>Thời gian</small><b>${esc(tt.t.t)}</b></li><li><small>Gói giá</small><b>${esc(tt.t.n)} · ${DL.vnd(tt.t.p)}</b></li>`:''}</ul>
      <div class="wk-cs-act">${p.demo?`<button class="btn primary" type="button" data-live>Mở demo trực tiếp ${ARROW}</button><a class="btn" href="demos/${p.demo}.html">Mở trang demo riêng</a>`:`<button class="btn primary" type="button" data-view>Xoay thử bản 3D ${ARROW}</button>`}</div>
    </div>
    <div class="wk-cs-img"><img src="${p.img}" width="1280" height="791" alt="${esc(p.name)}"></div>
  </div>
  <div class="wk-cs-main">
    <div><h4>Bối cảnh</h4><p>${esc(p.ctx)}</p><h4 style="margin-top:var(--s5)">Việc đã làm</h4><ol class="wk-did">${p.did.map(d=>`<li>${esc(d)}</li>`).join('')}</ol></div>
    <div class="wk-side">
      <div><h4>Bảng màu</h4><div class="wk-pal">${p.pal.map(c=>`<span style="--c:${c};color:${lum(c)>.55?'#1F1612':'#F6F2E9'}">${c.slice(1)}</span>`).join('')}</div></div>
      <div><h4>Phông chữ</h4><div class="wk-fonts">${p.fonts.map(f=>`<div class="wk-font"><span style="font-family:'${f[0]}',var(--f-display);${f[0]==='Cormorant'?'font-style:italic;':''}${f[0]==='Unbounded'?'font-weight:800;font-size:var(--t2h);':''}">Aa</span><div><b>${f[0]==='Cormorant'?'Cormorant Garamond':f[0]==='Playfair'?'Playfair Display':f[0]}</b><small>${esc(f[1])}</small></div></div>`).join('')}</div></div>
      ${price}
    </div>
  </div>
  ${p.demo?`<div><h4>Toàn bộ trang</h4><div class="wk-shot" data-shot><div class="wk-shot-bar"><span class="wk-dots"><i></i><i></i><i></i></span><div class="wk-seg sm" role="group" aria-label="Chọn ảnh chụp"><button type="button" class="on" data-m="d" aria-pressed="true">Máy tính</button><button type="button" data-m="m" aria-pressed="false">Điện thoại</button></div></div><div class="wk-shot-scroll" tabindex="0" aria-label="Ảnh chụp toàn trang, cuộn để xem"><img src="img/wk-${p.demo}-long.webp" loading="lazy" alt="Ảnh chụp toàn bộ trang ${esc(p.name)}"></div></div></div>`:''}
  ${id==='gk-pack'?`<div><h4>Trước và sau</h4><div class="wk-pal" style="grid-template-columns:1fr 1fr;gap:var(--s3)"><div class="wk-cs-img"><img src="img/wk-3d-old.webp" width="1280" height="791" loading="lazy" alt="Túi cà phê trước khi thiết kế lại"></div><div class="wk-cs-img"><img src="img/wk-3d-new.webp" width="1280" height="791" loading="lazy" alt="Túi cà phê sau khi thiết kế lại"></div></div></div>`:''}`;
  p.fonts.forEach(f=>loadFont(f[0]));
  const shot=el.querySelector('[data-shot]');
  if(shot)shot.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;const m=b.dataset.m==='m';shot.classList.toggle('is-m',m);shot.querySelectorAll('[data-m]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});const im=shot.querySelector('img');im.src=`img/wk-${p.demo}-long${m?'-m':''}.webp`;shot.querySelector('.wk-shot-scroll').scrollTop=0});
  el.addEventListener('click',e=>{
    if(e.target.closest('[data-live]')){const body=el.parentElement;if(!body)return;const lv=liveNode(p,()=>{liveOff&&liveOff();body.replaceChildren(el);top(body)});body.replaceChildren(lv.el);top(body);lv.start()}
    else if(e.target.closest('[data-view]')){DL.modal.close();selectProduct(p.view);DL.scrollTo('#wk-studio')}});
  return el}
const top=body=>{const pn=body.closest('.panel');if(pn)pn.scrollTop=0};
function openCase(id){DL.modal.open({title:P[id].name,node:caseNode(id),onClose:()=>{liveOff&&liveOff()}})}

/* ── demo trực tiếp trong iframe, có ảnh cuộn dài thay thế khi iframe bị chặn ── */
function liveNode(p,back){
  const el=document.createElement('div');el.className='wk-live';let mode=innerWidth<=860?'m':'d',ok=false,timer=0,ro=null;
  el.innerHTML=`<div class="wk-livebar"><button class="btn sm" type="button" data-back>← Về case study</button><div class="wk-seg sm" role="group" aria-label="Chọn khung xem"><button type="button" data-m="d">Máy tính</button><button type="button" data-m="m">Điện thoại</button></div><a class="btn sm" href="demos/${p.demo}.html">Mở trang demo riêng</a></div>
  <div class="wk-frame"><div class="wk-load">Đang tải demo…</div></div><p class="wk-fbnote" hidden>Khung xem trực tiếp không tải được ở môi trường này nên đang hiện ảnh chụp toàn trang. Bạn vẫn có thể mở trang demo bằng liên kết phía trên.</p>`;
  const frame=el.querySelector('.wk-frame'),note=el.querySelector('.wk-fbnote'),ifr=document.createElement('iframe');
  ifr.title='Demo '+p.name;ifr.setAttribute('loading','eager');
  const fit=()=>{const cw=el.clientWidth;if(!cw)return;const vh=innerHeight*.68,m=mode==='m';frame.classList.toggle('is-m',m);
    el.querySelectorAll('[data-m]').forEach(b=>{const on=b.dataset.m===mode;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    const iw=m?390:1440,w=m?Math.min(390,cw-12):cw-2,k=w/iw,h=m?Math.min(760,Math.max(377,vh)):Math.min(w/1.618,Math.max(377,vh));
    frame.style.width=w+'px';frame.style.height=h+'px';ifr.style.width=iw+'px';ifr.style.height=(h/k)+'px';ifr.style.transform=`scale(${k})`;
    const fb=frame.querySelector('.wk-fb img');if(fb)fb.src=`img/wk-${p.demo}-long${m?'-m':''}.webp`};
  const setOk=()=>{if(ok)return;ok=true;clearTimeout(timer);frame.classList.add('is-ok');const fb=frame.querySelector('.wk-fb');fb&&fb.remove();note.hidden=true};
  const fail=()=>{if(ok||frame.querySelector('.wk-fb'))return;const d=document.createElement('div');d.className='wk-fb';d.tabIndex=0;d.innerHTML=`<img src="img/wk-${p.demo}-long${mode==='m'?'-m':''}.webp" alt="Ảnh chụp toàn bộ trang ${esc(p.name)}">`;frame.append(d);frame.classList.add('is-ok');note.hidden=false};
  const onMsg=e=>{if(e.data&&e.data.wkDemo===p.demo)setOk()};
  ifr.addEventListener('load',()=>{try{const d=ifr.contentDocument;if(d&&d.querySelector('main'))setOk()}catch(e){}});
  ifr.addEventListener('error',fail);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b){mode=b.dataset.m;fit();return}if(e.target.closest('[data-back]'))back()});
  liveOff=()=>{removeEventListener('message',onMsg);clearTimeout(timer);ro&&ro.disconnect();ifr.src='about:blank';liveOff=null};
  return{el,start(){addEventListener('message',onMsg);frame.append(ifr);fit();ifr.src=url('demos/'+p.demo+'.html');timer=setTimeout(fail,4240);if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(el)}}}}

/* ── trình xem bao bì 3D ── */
const stage=$('#wk-stage'),poster=$('#wk-poster'),hint=$('#wk-hint'),swBox=$('#wk-sw');
const PROD={
 bottle:{poster:'img/wk-3d-mt.webp',fonts:['Cormorant'],colors:['#C98F73','#93A88D','#A893DD','#2E3A2C'],names:['Đất nung','Xô thơm','Oải hương','Rêu đậm'],sh:.5,
  make:(T,c,v)=>WK3D.build(T,'bottle',{color:c,label:WK3D.L.mt({w:1630,h:512,v,accent:v?c:'#B9785A',sub:'TINH CHẤT RAU MÁ',vol:'30 ml'})})},
 bag:{poster:'img/wk-3d-gk.webp',fonts:['Anton','Space Mono'],colors:['#1F1612','#E4572E','#3E4A3C','#8C4A2F'],names:['Đen than','Cam than hồng','Xanh rêu','Nâu đất'],sh:.55,
  make:(T,c,v)=>WK3D.build(T,'bag',{color:c,label:WK3D.L.gk({color:c,accent:c==='#E4572E'?'#1F1612':'#E4572E',v})})},
 tub:{poster:'img/wk-3d-vu.webp',fonts:['Unbounded'],colors:['#C8FF2E','#FF5A1F','#7C6CF2','#F3F3EC'],names:['Vàng chanh','Cam','Tím','Trắng ngà'],sh:.85,
  make:(T,c,v)=>WK3D.build(T,'tub',{label:WK3D.L.vu({color:c,v}),body:'#0E0E10',cap:v?c:'#0E0E10'})}};
const S={p:'bottle',c:0,v:0};let V=null,vBusy=false,vFail=false;
const paintUI=()=>{const d=PROD[S.p];stage.dataset.p=S.p;if(!V)poster.src=d.poster;
  $$('#wk-prod button').forEach(b=>{const on=b.dataset.p===S.p;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  $$('#wk-lab button').forEach(b=>{const on=+b.dataset.v===S.v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  swBox.innerHTML=d.colors.map((c,i)=>`<button type="button" data-c="${i}" class="${i===S.c?'on':''}" aria-pressed="${i===S.c}" aria-label="Màu ${d.names[i]}" style="--c:${c}"${vFail?' disabled':''}><i></i></button>`).join('')};
const kick=()=>{if(V&&!V.raf&&V.vis)V.raf=requestAnimationFrame(tick)};
function tick(){V.raf=0;if(!V.vis||document.hidden)return;
  if(!V.drag){if(!RM)V.ry+=.0042;V.ry+=V.vy;V.vy*=.92}
  V.piv.rotation.y=V.ry;V.piv.rotation.x=V.rx;V.r.render(V.sc,V.cam);
  if(!RM||V.drag||Math.abs(V.vy)>1e-4||V.tw)V.raf=requestAnimationFrame(tick)}
const size=()=>{if(!V)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;V.r.setSize(w,h,false);V.cam.aspect=w/h;V.cam.position.set(0,1.3,w/h<1.2?6.5:5.9);V.cam.lookAt(0,1,0);V.cam.updateProjectionMatrix();kick()};
async function rebuild(spin){if(!V)return;const d=PROD[S.p],T=V.T;await Promise.all(d.fonts.map(loadFont));
  const o=d.make(T,d.colors[S.c],S.v),k=2/o.userData.h;o.scale.setScalar(k);
  if(V.obj){V.piv.remove(V.obj);WK3D.dispose(V.obj)}V.piv.add(V.obj=o);V.shadow.material.opacity=d.sh;V.shadow.scale.setScalar(S.p==='bag'?1:1.06);
  const front=-.36+Math.PI*2*Math.round((V.ry+.36)/(Math.PI*2));V.vy=0;
  if(spin&&g&&!RM){V.tw=1;g.fromTo(V,{ry:front-Math.PI*.618},{ry:front,duration:1.11,ease:'expo.out',overwrite:true,onComplete:()=>{V.tw=0}});g.fromTo(o.scale,{x:k*.618,y:k*.618,z:k*.618},{x:k,y:k,z:k,duration:.686,ease:'back.out(1.6)'})}else if(spin)V.ry=front;
  kick()}
async function init3D(){if(V||vBusy||vFail)return;vBusy=true;
  try{const T=await import(url('vendor/three.module.js'));
    const r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(26,1.618,.1,60),piv=new T.Group(),sh=WK3D.shadow(T,1.3,.5);sc.add(piv,sh);WK3D.studio(T,r,sc,{});
    r.domElement.setAttribute('aria-hidden','true');stage.insertBefore(r.domElement,poster.nextSibling);
    r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('is-3d')});
    V={T,r,sc,cam,piv,shadow:sh,obj:null,ry:-.36,rx:.06,vy:0,drag:false,vis:true,raf:0,tw:0};
    size();await rebuild(true);stage.classList.add('is-3d');stage.tabIndex=0;stage.setAttribute('role','img');stage.setAttribute('aria-label','Mô hình bao bì 3D. Kéo hoặc dùng phím mũi tên trái phải để xoay.');
    if(window.ResizeObserver)new ResizeObserver(size).observe(stage)}
  catch(e){vFail=true;V=null;const f=$('#wk-fall');if(f)f.hidden=false;hint.classList.add('off');stage.style.cursor='default';$$('#wk-sw button,#wk-lab button').forEach(b=>b.disabled=true)}
  vBusy=false}
function selectProduct(k){if(!PROD[k]||(S.p===k&&V))return paintUI();S.p=k;S.c=0;S.v=0;paintUI();V?rebuild(true):init3D()}
paintUI();
$('#wk-prod').addEventListener('click',e=>{const b=e.target.closest('button');b&&b.dataset.p!==S.p&&selectProduct(b.dataset.p)});
swBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||vFail)return;S.c=+b.dataset.c;paintUI();rebuild(true)});
$('#wk-lab').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||vFail)return;S.v=+b.dataset.v;paintUI();rebuild(true)});
stage.addEventListener('pointerdown',e=>{if(!V)return;V.drag=true;V.px=e.clientX;V.py=e.clientY;V.vy=0;try{stage.setPointerCapture(e.pointerId)}catch(_){}stage.classList.add('is-drag');hint.classList.add('off');kick()});
stage.addEventListener('pointermove',e=>{if(!V||!V.drag)return;const dx=e.clientX-V.px,dy=e.clientY-V.py;V.px=e.clientX;V.py=e.clientY;V.ry+=dx*.0118;V.vy=dx*.0118;V.rx=Math.max(-.3,Math.min(.38,V.rx+dy*.004))});
const vUp=()=>{if(!V)return;V.drag=false;stage.classList.remove('is-drag');kick()};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>stage.addEventListener(n,vUp));
stage.addEventListener('keydown',e=>{if(!V)return;const d=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0;if(!d)return;e.preventDefault();V.vy=d*.062;hint.classList.add('off');kick()});
if('IntersectionObserver' in window)new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!V)init3D();if(V){V.vis=v;v&&kick()}},{rootMargin:'262px'}).observe(stage);else init3D();
document.addEventListener('visibilitychange',()=>{!document.hidden&&kick()});

/* ── thanh trượt trước / sau ── */
const ba=$('#wk-ba'),bin=$('#wk-ba-in');
if(ba){const setP=v=>{v=Math.max(0,Math.min(100,v));ba.style.setProperty('--p',v+'%');bin.value=Math.round(v)},fromE=e=>{const r=ba.getBoundingClientRect();setP((e.clientX-r.left)/r.width*100)};let bd=false;
  ba.addEventListener('pointerdown',e=>{bd=true;try{ba.setPointerCapture(e.pointerId)}catch(_){}fromE(e)});
  ba.addEventListener('pointermove',e=>{bd&&fromE(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>ba.addEventListener(n,()=>{bd=false}));
  bin.addEventListener('input',()=>setP(+bin.value));
  if(g&&window.ScrollTrigger&&!RM){const o={v:92};g.timeline({scrollTrigger:{trigger:ba,start:'top 76%',once:true}}).fromTo(o,{v:92},{v:27,duration:1.11,ease:'power2.inOut',onUpdate:()=>!bd&&setP(o.v)}).to(o,{v:50,duration:.686,ease:'power2.out',onUpdate:()=>!bd&&setP(o.v)})}}
})})();
