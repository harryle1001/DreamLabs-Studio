#!/usr/bin/env node
/* node tools/check.js http://127.0.0.1:4101/_A.html outPrefix  -> chụp desktop+mobile (light+dark), báo lỗi console & tràn ngang */
const {chromium}=require('playwright');
(async()=>{const [url,out='shot']=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [w,h,n,scheme] of [[1440,900,'d','light'],[390,844,'m','light'],[1440,900,'dk','dark']]){
  const p=await b.newPage({viewport:{width:w,height:h},colorScheme:scheme});const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(2600);await p.screenshot({path:`${out}-${n}-top.png`});
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=h*.8){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(260)}
  await p.waitForTimeout(600);
  const ow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(400);
  if(n!=='dk')await p.screenshot({path:`${out}-${n}-full.png`,fullPage:true});
  console.log(n,scheme,'height',H,'overflowX',ow,'errors',errs.length?errs:'none');await p.close()}
await b.close()})();
