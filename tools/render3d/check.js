// node check.js → kiểm tra hợp đồng dữ liệu + file ảnh; node check.js shots → chụp trang thử 1440/390 sáng/tối
const fs=require('fs'),R='/home/user/dreamlab/',sharp=require('/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/npm/node_modules/sharp');
(async()=>{global.window={};require(R+'js/data.js');delete require.cache[require.resolve(R+'js/samples-product.js')];require(R+'js/samples-product.js');const A=window.DL_SAMPLES.product,D=window.DL_DATA;
const IND=['Nước hoa','Túi xách','Giày','Đồng hồ','Trang sức','Du thuyền','Phi cơ riêng','Bất động sản','Siêu xe','Rượu & ẩm thực','Thời trang','Nghỉ dưỡng','Khác'];
const cat=D.CATS.find(c=>c.id==='product'),pk=JSON.stringify(cat).match(/"name":"[^"]+"/g);let err=0,total=0;const seen=new Set(),ids=new Set();
const E=m=>{err++;console.log('LỖI',m)};
for(const it of A){if(ids.has(it.id))E('trùng id '+it.id);ids.add(it.id);if(!it.id.startsWith('product-'))E('id '+it.id);if(!IND.includes(it.industry))E('industry '+it.industry);if(it.kind!=='product')E('kind');if(it.tags.length>3)E('tags>3');if(!(it.variants.length>=3))E('variants<3 '+it.id);
 if(!/^Thiết kế sản phẩm — (Chuyên nghiệp|Cao cấp)$/.test(it.pkg))E('pkg '+it.pkg);
 for(const [f,max] of [[it.cover,70e3],...it.variants.map(v=>[v.img,60e3]),...it.gallery.map(g=>[g,60e3])]){if(!fs.existsSync(R+f)){E('thiếu '+f);continue}const s=fs.statSync(R+f).size,m=await sharp(R+f).metadata();if(m.width!==1280||m.height!==791)E(f+' '+m.width+'x'+m.height);if(s>max)E(f+' '+s+'B');if(!seen.has(f)){seen.add(f);total+=s}}
 for(const v of it.variants)if(!/^#[0-9a-f]{3,6}$/i.test(v.swatch))E('swatch '+v.swatch)}
console.log(A.length,'dòng ·',seen.size,'ảnh ·',(total/1024).toFixed(0),'KB · lỗi:',err,'· gói trong DL_DATA:',(JSON.stringify(cat).match(/Chuyên nghiệp|Cao cấp/g)||[]).join(','));
const onDisk=fs.readdirSync(R+'img').filter(f=>f.startsWith('sm-product-'));const orphan=onDisk.filter(f=>!seen.has('img/'+f));console.log('ảnh sm-product trên đĩa:',onDisk.length,'· không dùng:',orphan.join(' ')||'không',' · tổng trên đĩa',(onDisk.reduce((n,f)=>n+fs.statSync(R+'img/'+f).size,0)/1024).toFixed(0)+'KB');
if(process.argv[2]==='shots'){const {chromium}=require('playwright'),b=await chromium.launch();
 for(const [w,h,th] of [[1440,900,'light'],[1440,900,'dark'],[390,844,'light'],[390,844,'dark']]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('requestfailed',r=>errs.push('FAIL '+r.url()));
  await p.route('**/__p/**',rt=>rt.fulfill({path:__dirname+'/'+new URL(rt.request().url()).pathname.replace('/__p/',''),contentType:'text/html'}));
  await p.goto('http://127.0.0.1:4204/__p/test/index.html#'+th);await p.waitForLoadState('networkidle');
  /* bấm từng mẫu mã của mục đầu, kiểm tra ảnh đổi */
  const n=await p.locator('.item').count();let sw=0;for(let i=0;i<n;i++){const bs=p.locator('.item').nth(i).locator('.sw button');const c=await bs.count();for(let j=0;j<c;j++){await bs.nth(j).click();sw++}await bs.nth(0).click()}
  await p.evaluate(async()=>{for(const i of document.images){i.loading='eager';if(!i.complete)await new Promise(r=>{i.onload=i.onerror=r})}});
  const bad=await p.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src));const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  await p.screenshot({path:`${__dirname}/test/shot-${w}-${th}.png`,fullPage:true});console.log(w,th,'mục:',n,'lần đổi mẫu:',sw,'ảnh hỏng:',bad.length,'tràn ngang:',ov,'lỗi:',errs.length?errs.slice(0,3):0);await p.close()}
 await b.close()}})();
