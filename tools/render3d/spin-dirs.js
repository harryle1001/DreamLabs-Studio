#!/usr/bin/env node
/* Cập nhật trường spin.dirs trong js/samples-product.js theo các bộ khung mẫu mã đã có đủ trên đĩa (img/spin/<dòng>-<mẫu mã>/). node tools/render3d/spin-dirs.js */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'../..'),F=path.join(R,'js/samples-product.js');
const V={perfume:['amber','noir','rose'],bag:['noir','cognac','jade','ivory'],shoe:['noir','nude','mulberry'],watch:['blue','ivory','smoke','jade'],jewel:['emerald','sapphire','diamond','ruby'],whisky:['y12','y18','y25'],candle:['tram','tra','que'],skin:['pearl','celadon','blush']};
let s=fs.readFileSync(F,'utf8'),n=0;
for(const [line,vs] of Object.entries(V)){
  const re=new RegExp(`(spin: \\{dir: 'img/spin/${line}/',)(?: dirs: \\[[^\\]]*\\],)?( frames: (\\d+),)`);
  s=s.replace(re,(m,a,b,fr)=>{const dirs=vs.map((v,i)=>{const d=i?`img/spin/${line}-${v}/`:`img/spin/${line}/`;return fs.existsSync(path.join(R,d,String(fr).padStart(3,'0')+'.webp'))?d:''});n+=dirs.filter(Boolean).length;
    return dirs.filter(Boolean).length>1?`${a} dirs: [${dirs.map(d=>`'${d}'`).join(', ')}],${b}`:a+b});
}
fs.writeFileSync(F,s);console.log('bộ khung theo mẫu mã:',n);
