#!/usr/bin/env node
/* Đóng gói bản phát hành: node tools/dist.js [thư_mục_ra]  (mặc định ./dist)
   - Gộp + nén CSS và JS của trang chủ, bỏ chú thích, đổi tên biến CSS và tên hàm.
   - Nén từng demo (HTML + CSS + JS nội tuyến).
   - Chỉ chép tài nguyên cần để chạy; không kèm mã nguồn, công cụ, bản lệnh.
   Cần các gói terser, lightningcss, html-minifier-terser (NODE_PATH trỏ tới node_modules chứa chúng). */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(R,'dist'));
const {minify:terser}=require('terser'),{transform:lcss}=require('lightningcss'),{minify:htmlmin}=require('html-minifier-terser');
const rd=f=>fs.readFileSync(path.join(R,f),'utf8'),ex=f=>fs.existsSync(path.join(R,f));
const cp=(src,dst=src)=>{const s=path.join(R,src),d=path.join(OUT,dst);fs.mkdirSync(path.dirname(d),{recursive:true});fs.copyFileSync(s,d)};
const cpDir=(dir,filter=()=>true)=>{if(!ex(dir))return;for(const f of fs.readdirSync(path.join(R,dir),{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())cpDir(p,filter);else if(filter(p))cp(p)}};

(async()=>{
  execFileSync('node',[path.join(R,'build.js')],{stdio:'ignore'});
  fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
  let html=rd('index.html');
  const cssFiles=[...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map(m=>m[1].split("?")[0]);
  const ownJs=[...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m=>m[1].split("?")[0]);
  let css=cssFiles.map(rd).join('\n'),js=ownJs.map(f=>rd(f)).join(';\n');
  html=html.replace(/<!--[\s\S]*?-->/g,'');

  /* đổi tên biến CSS (--ten) thành mã ngắn ở CSS, JS và HTML */
  const names=[...new Set([...css.matchAll(/(?<![\w-])--([a-z][a-z0-9-]*)(?=\s*:)/gi)].map(m=>m[1]))].sort((a,b)=>b.length-a.length);
  const map=new Map(names.map((n,i)=>[n,'v'+i.toString(36)]));
  const ren=s=>s.replace(/(?<![\w-])--([a-z][a-z0-9-]*)(?![\w-])/gi,(m,n)=>map.has(n)?'--'+map.get(n):m);
  css=ren(css);js=ren(js);html=ren(html);
  /* đổi tên lớp gợi ý hệ thiết kế */
  const cls=s=>s.replace(/\bgolden\b/g,'gx').replace(/\bhero-phi\b/g,'hx').replace(/\bPHI\b/g,'Q9');
  css=cls(css);html=cls(html);js=cls(js);

  const c=lcss({filename:'a.css',code:Buffer.from(css),minify:true,errorRecovery:true});
  fs.writeFileSync(path.join(OUT,'a.css'),c.code);
  const t=await terser(js,{compress:{passes:2},mangle:true,format:{comments:false}});
  fs.writeFileSync(path.join(OUT,'a.js'),t.code);

  const linkRe=/<link rel="stylesheet" href="css\/[^"]+">\n?/g;let firstCss=true;
  html=html.replace(linkRe,()=>firstCss?(firstCss=false,'<link rel="stylesheet" href="a.css">\n'):'');
  let firstJs=true;
  html=html.replace(/<script src="js\/[^"]+"><\/script>\n?/g,()=>firstJs?(firstJs=false,'<script src="a.js"></script>\n'):'');
  html=await htmlmin(html,{collapseWhitespace:true,conservativeCollapse:true,removeComments:true,minifyCSS:true,minifyJS:true});
  fs.writeFileSync(path.join(OUT,'index.html'),html);
  /* /lab/, /en/, /ja/: cùng khung trang chủ, <base href="../"> nên a.css / a.js trỏ về gốc */
  for(const sub of ['lab','en','ja'])if(ex(sub+'/index.html')){let lh=cls(ren(rd(sub+'/index.html').replace(/<!--[\s\S]*?-->/g,'')));let fc=true,fj=true;
    lh=lh.replace(linkRe,()=>fc?(fc=false,'<link rel="stylesheet" href="a.css">\n'):'').replace(/<script src="js\/[^"]+"><\/script>\n?/g,()=>fj?(fj=false,'<script src="a.js"></script>\n'):'');
    lh=await htmlmin(lh,{collapseWhitespace:true,conservativeCollapse:true,removeComments:true,minifyCSS:true,minifyJS:true});
    fs.mkdirSync(path.join(OUT,sub),{recursive:true});fs.writeFileSync(path.join(OUT,sub,'index.html'),lh)}

  /* demo: nén từng trang */
  for(const f of fs.readdirSync(path.join(R,'demos')).filter(f=>f.endsWith('.html'))){
    const out=await htmlmin(rd('demos/'+f).replace(/(?<![\w-])--phi(?![\w-])/g,'--k9').replace(/\bPHI\b/g,'Q9'),{collapseWhitespace:true,conservativeCollapse:true,removeComments:true,minifyCSS:true,minifyJS:{mangle:true,format:{comments:false}}});
    fs.mkdirSync(path.join(OUT,'demos'),{recursive:true});fs.writeFileSync(path.join(OUT,'demos',f),out);
  }
  /* bài viết + trang dịch vụ: gộp CSS blog thành b.css (gốc), nén từng trang blog/.../index.html và <slug>/index.html, giữ nguyên đường dẫn */
  let blogPages=0,bcssLen=0;
  if(ex('blog')){
    const bFiles=['css/fonts.css','css/tokens.css','css/base.css','css/blog.css'].filter(ex);
    let bcss=bFiles.map(rd).join('\n');
    const bNames=[...new Set([...bcss.matchAll(/(?<![\w-])--([a-z][a-z0-9-]*)(?=\s*:)/gi)].map(m=>m[1]))].sort((a,b)=>b.length-a.length);
    const bMap=new Map(bNames.map((n,i)=>[n,'w'+i.toString(36)]));
    const bRen=s=>s.replace(/(?<![\w-])--([a-z][a-z0-9-]*)(?![\w-])/gi,(m,n)=>bMap.has(n)?'--'+bMap.get(n):m);
    const bc=lcss({filename:'b.css',code:Buffer.from(cls(bRen(bcss)).replaceAll('../fonts/','fonts/')),minify:true,errorRecovery:true});
    fs.writeFileSync(path.join(OUT,'b.css'),bc.code);bcssLen=bc.code.length;
    const walk=dir=>{for(const f of fs.readdirSync(path.join(R,dir),{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())walk(p);else if(f.name.endsWith('.html'))(blogQueue.push(p))}};
    const blogQueue=[];walk('blog');
    /* trang dịch vụ (src/pages → <slug>/index.html) dùng chung khung và b.css với blog */
    for(const p of require('./site.js').HUBS)if(ex(p.slug))walk(p.slug);   /* trang theo ngành nằm trong thư mục trang dịch vụ */
    if(ex('giai-phap-theo-nganh'))walk('giai-phap-theo-nganh');
    for(const p of [...require('./site.js').INDUSTRY,...require('./site.js').TOPICS])if(!blogQueue.includes(p.slug+'/index.html')&&ex(p.slug))walk(p.slug);
    for(const p of blogQueue){
      let h=rd(p);let first=true;
      h=h.replace(/<link rel="stylesheet" href="((?:\.\.\/)+)css\/[^"]+">\n?/g,(m,up)=>first?(first=false,`<link rel="stylesheet" href="${up}b.css">\n`):'');
      h=await htmlmin(bRen(h),{collapseWhitespace:true,conservativeCollapse:true,removeComments:true,minifyCSS:true,minifyJS:true});
      fs.mkdirSync(path.dirname(path.join(OUT,p)),{recursive:true});fs.writeFileSync(path.join(OUT,p),h);blogPages++;
    }
  }
  cpDir('demos/fonts');cpDir('fonts');cpDir('img');cpDir('media');
  const vendorUsed=new Set();for(const s of [html,t.code,...fs.readdirSync(path.join(OUT,'demos')).filter(f=>f.endsWith('.html')).map(f=>fs.readFileSync(path.join(OUT,'demos',f),'utf8'))])for(const m of s.matchAll(/vendor\/([A-Za-z.]+\.js)/g))vendorUsed.add(m[1]);
  if(vendorUsed.has('three.module.js'))vendorUsed.add('three.core.js');
  for(const v of vendorUsed)if(ex('vendor/'+v))cp('vendor/'+v);
  /* js/track.js (đo chuyển đổi) nạp riêng bằng <script defer> ở mọi trang, không nằm trong a.js */
  if(ex('js/track.js')){const tk=await terser(rd('js/track.js'),{format:{comments:false}});fs.mkdirSync(path.join(OUT,'js'),{recursive:true});fs.writeFileSync(path.join(OUT,'js/track.js'),tk.code)}
  for(const f of ['manifest.webmanifest','robots.txt','sitemap.xml','CNAME','.nojekyll'])if(ex(f))cp(f);
  /* CSS phông chữ được nạp từ a.css nên đường dẫn ../fonts phải đổi thành fonts/ */
  const a=path.join(OUT,'a.css');fs.writeFileSync(a,fs.readFileSync(a,'utf8').replaceAll('../fonts/','fonts/'));
  const size=d=>fs.readdirSync(d,{withFileTypes:true}).reduce((s,f)=>s+(f.isDirectory()?size(path.join(d,f.name)):fs.statSync(path.join(d,f.name)).size),0);
  console.log('dist:',OUT,(size(OUT)/1048576).toFixed(1)+'MB','· css',(c.code.length/1024).toFixed(0)+'KB · js',(t.code.length/1024).toFixed(0)+'KB · biến CSS',map.size,'· vendor',[...vendorUsed].join(','),'· blog + dịch vụ',blogPages,'trang, b.css',(bcssLen/1024).toFixed(0)+'KB');
})().catch(e=>{console.error(e);process.exit(1)});
