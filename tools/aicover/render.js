#!/usr/bin/env node
/* Dựng ảnh bìa minh họa (trước → sau) cho 6 mẫu Tự động hóa AI: img/sm-ai-<id>-c.webp. Cần ffmpeg. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'../..'),MAP={'suong-tram':'chat','thien-do':'book','lam-khue':'care','hai-mien':'quote','vong-nguyet':'lead','ngoc-yen':'report'};
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1280,height:791}});
for(const [id,k] of Object.entries(MAP)){await p.goto('file://'+path.join(__dirname,'cover.html')+'?k='+k);await p.waitForTimeout(150);
  const png=path.join(R,'img','_tmp.png'),out=path.join(R,'img','sm-ai-'+id+'-c.webp');await p.screenshot({path:png});
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',png,'-c:v','libwebp','-quality','82',out]);fs.unlinkSync(png);console.log(out,fs.statSync(out).size)}
await b.close()})();
