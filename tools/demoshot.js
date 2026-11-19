#!/usr/bin/env node
/* Kiểm tra + chụp demo. Cần máy chủ: node serve.js 4100 (hoặc BASE=http://127.0.0.1:PORT).
   node tools/demoshot.js <slug-file-demo> [<tên ảnh>] [--shots] [--keep=thư-mục]
     slug-file-demo: tên file trong demos/ không có .html (vd lux-xs-aurel)
     tên ảnh: phần giữa của img/sm-<loại>-<tên>.webp, vd web-aurel hoặc landing-aurel (bắt buộc khi --shots)
   Kiểm tra ở 390 / 768 / 1440 px: lỗi console, request hỏng, tràn ngang, chữ cấm, có chữ "concept".
   --shots: xuất img/sm-<tên>.webp (bìa 1280×791), img/sm-<tên>-long.webp (toàn trang 1440 thu về 1104 ngang),
            img/sm-<tên>-long-m.webp (toàn trang 390 ngang). --keep: lưu thêm PNG 3 cỡ để tự xem. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..');
const args=process.argv.slice(2),flags=args.filter(a=>a.startsWith('--')),pos=args.filter(a=>!a.startsWith('--'));
const [slug,name]=pos,SHOTS=flags.includes('--shots'),KEEP=(flags.find(f=>f.startsWith('--keep='))||'').slice(7);
if(!slug||(SHOTS&&!name)){console.error('Cú pháp: node tools/demoshot.js <slug> [web-xxx|landing-xxx] [--shots] [--keep=dir]');process.exit(2)}
const BASE=process.env.BASE||'http://127.0.0.1:4100',URL=`${BASE}/demos/${slug}.html`;
const BAN=/tỷ lệ vàng|tỉ lệ vàng|góc vàng|xoắn ốc vàng|φ|1[.,]618|golden ratio|fibonacci/i;
async function walk(p,h){const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=Math.round(h*.7)){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(220)}
  await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(700);
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(600)}
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});let bad=0;
  if(KEEP)fs.mkdirSync(KEEP,{recursive:true});
  for(const [w,h] of [[390,844],[768,1024],[1440,900]]){
    const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];
    p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
    p.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));p.on('response',r=>{if(r.status()>=400)errs.push('HTTP '+r.status()+' '+r.url())});
    await p.goto(URL,{waitUntil:'load'});await p.waitForTimeout(2200);await walk(p,h);
    const info=await p.evaluate(()=>{const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.right>innerWidth+1&&cs.position!=='fixed'&&!e.closest('[data-allow-overflow]')}).slice(0,5).map(e=>e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' right='+Math.round(e.getBoundingClientRect().right));
      return{ow:document.documentElement.scrollWidth-innerWidth,over,text:document.body.innerText,title:document.title,imgs:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc||i.src)}});
    const ban=(info.text+' '+info.title).match(BAN),concept=/concept/i.test(info.text);
    const ok=!errs.length&&info.ow<=0&&!ban&&concept&&!info.imgs.length;if(!ok)bad++;
    console.log(`${ok?'✓':'✗'} ${slug} @${w}: tràn ngang ${info.ow}px${info.ow>0?' '+info.over.join(', '):''} · lỗi ${errs.length?errs.join(' | '):0} · ảnh hỏng ${info.imgs.length?info.imgs.join(', '):0} · chữ cấm ${ban?ban[0]:'không'} · concept ${concept?'có':'THIẾU'}`);
    if(KEEP)await p.screenshot({path:path.join(KEEP,`${slug}-${w}.png`),fullPage:true});
    if(SHOTS&&w===1440){
      await p.setViewportSize({width:1280,height:791});await p.waitForTimeout(900);await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(1600);
      const c=path.join(R,`img/sm-${name}-cover.png`);await p.screenshot({path:c});
      execFileSync('convert',[c,'-quality','80','-define','webp:method=6',path.join(R,`img/sm-${name}.webp`)]);fs.unlinkSync(c);
      await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(600);await walk(p,900);
      const l=path.join(R,`img/sm-${name}-long.png`);await p.screenshot({path:l,fullPage:true});
      execFileSync('convert',[l,'-resize','1104x','-crop','1104x16000+0+0','+repage','-quality','62','-define','webp:method=6',path.join(R,`img/sm-${name}-long.webp`)]);fs.unlinkSync(l);
    }
    if(SHOTS&&w===390){const l=path.join(R,`img/sm-${name}-long-m.png`);await p.screenshot({path:l,fullPage:true});
      execFileSync('convert',[l,'-crop','390x16000+0+0','+repage','-quality','64','-define','webp:method=6',path.join(R,`img/sm-${name}-long-m.webp`)]);fs.unlinkSync(l)}
    await p.close();
  }
  await b.close();if(SHOTS)console.log('ảnh:',['','-long','-long-m'].map(s=>`img/sm-${name}${s}.webp`).join(' '));process.exit(bad?1:0);
})();
