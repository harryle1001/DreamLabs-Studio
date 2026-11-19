#!/usr/bin/env node
/* Cập nhật trường spin của 8 dòng 3D trong js/samples-product.js theo các bộ khung đã có đủ trên đĩa. node tools/render3d/spin-dirs.js
   - Mẫu mã gốc đã có bộ v2 (img/spin/<dòng>/meta.json): bật v2, lấy frames + ground từ meta, dirs chỉ gồm mẫu mã cũng đã có v2.
   - Chưa có v2: giữ kiểu cũ (NNN.webp), dirs gồm mẫu mã có đủ khung kiểu cũ. */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'../..'),F=path.join(R,'js/samples-product.js');
const V={perfume:['amber','noir','rose'],bag:['noir','cognac','jade','ivory'],shoe:['noir','nude','mulberry'],watch:['blue','ivory','smoke','jade'],jewel:['emerald','sapphire','diamond','ruby'],whisky:['y12','y18','y25'],candle:['tram','tra','que'],skin:['pearl','celadon','blush']};
const meta=d=>{try{const m=JSON.parse(fs.readFileSync(path.join(R,d,'meta.json'),'utf8'));return m.frames===144&&fs.existsSync(path.join(R,d,'l',String(m.frames).padStart(3,'0')+'.webp'))&&fs.existsSync(path.join(R,d,'bg.webp'))?m:null}catch(e){return null}};
let s=fs.readFileSync(F,'utf8'),n=0,n2=0;
for(const [line,vs] of Object.entries(V)){
  const re=new RegExp(`(spin: \\{dir: 'img/spin/${line}/',)(?: v2: true, ground: \\[[^\\]]*\\], hiStep: \\d+,)?(?: dirs: \\[[^\\]]*\\],)? frames: (\\d+),`);
  s=s.replace(re,(m,a,fr)=>{const dirOf=(v,i)=>i?`img/spin/${line}-${v}/`:`img/spin/${line}/`,m0=meta(dirOf(vs[0],0));
    const dirs=vs.map((v,i)=>{const d=dirOf(v,i);return(m0?meta(d):fs.existsSync(path.join(R,d,(m0?'048':String(Math.min(48,fr)).padStart(3,'0'))+'.webp')))?d:''});
    const k=dirs.filter(Boolean).length;n+=k;if(m0)n2+=k;
    return a+(m0?` v2: true, ground: [${m0.ground.join(', ')}], hiStep: ${m0.hiStep||2},`:'')+(k>1?` dirs: [${dirs.map(d=>`'${d}'`).join(', ')}],`:'')+` frames: ${m0?m0.frames:48},`});
}
fs.writeFileSync(F,s);console.log('bộ khung theo mẫu mã:',n,'· trong đó v2:',n2);
