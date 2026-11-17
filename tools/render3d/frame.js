const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [w,h,th] of [[1440,900,'light'],[390,844,'dark']]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.addInitScript(t=>{try{localStorage.setItem('dl-theme',t)}catch(e){}},th);
 await p.goto('http://127.0.0.1:4204/_P.html');await p.waitForTimeout(2500);if(th==='dark')await p.evaluate(()=>document.documentElement.dataset.theme='dark');
 const n=await p.evaluate(()=>window.DL&&DL.samples?DL.samples.count('product'):-1);
 const ok1=await p.evaluate(()=>DL.samples.open('product'));await p.waitForTimeout(2200);await p.screenshot({path:`test/frame-${w}-list.png`});
 const ok2=await p.evaluate(()=>DL.samples.open('product','product-tinh-van'));await p.waitForTimeout(2200);await p.screenshot({path:`test/frame-${w}-item.png`});
 const bad=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth&&/sm-product/.test(i.src)).map(i=>i.src));
 console.log(w,th,'count',n,'open',ok1,ok2,'ảnh hỏng',bad.length,'lỗi',errs.length?errs.slice(0,4):0);await p.close()}
await b.close()})();
