#!/usr/bin/env node
/* Ghép src/head.html + css + src/partials/*.html (theo thứ tự tên file) + js thành trang.
   node build.js        -> index.html (bản đầy đủ để host) + artifact.html (bản Claude Artifact, không doctype)
   node build.js A      -> _A.html (bản đầy đủ, để từng session test riêng, không ghi đè của nhau) */
const fs=require('fs'),path=require('path'),R=__dirname,ex=f=>fs.existsSync(path.join(R,f));
/* Tỷ giá tham khảo cho bản /en/ và /ja/ (VNĐ cho 1 đơn vị ngoại tệ). Sửa số ở đây rồi chạy lại node build.js. */
const FX_RATE={USD:25400,JPY:165};
const css=['css/fonts.css','css/tokens.css','css/base.css','css/core.css','css/work.css','css/lab.css','css/samples.css','css/showroom.css','css/sound.css'].filter(ex);
const js=['vendor/gsap.min.js','vendor/ScrollTrigger.min.js','vendor/SplitText.min.js','vendor/lenis.min.js','js/data.js','js/kit.js','js/i18n.js','js/core.js','js/work.js','js/lab.js'].filter(ex).concat(fs.readdirSync(path.join(R,'js')).filter(f=>/^samples-.+\.js$/.test(f)).sort().map(f=>'js/'+f),['js/real.js','js/spin.js','js/samples.js','js/showroom.js','js/sound.js'].filter(ex));
/* mục Bài viết: dựng blog/, khối "Bài viết mới" (src/partials/70-blog.html) và sitemap.xml trước khi ghép trang */
try{require('./tools/blog.js')}catch(e){console.warn('Blog lỗi:',e.message)}
/* trang dịch vụ: <slug>/index.html từ src/pages/ (tools/pages.js) */
try{require('./tools/pages.js')}catch(e){console.warn('Trang dịch vụ lỗi:',e.message)}
const pdir=path.join(R,'src/partials');
const part=f=>`<!-- ${path.basename(f)} -->\n`+fs.readFileSync(path.join(R,f),'utf8').trim();
const parts=fs.readdirSync(pdir).filter(f=>f.endsWith('.html')).sort().map(f=>part('src/partials/'+f));
const head=fs.readFileSync(path.join(R,'src/head.html'),'utf8').trim();
const VER=f=>require('crypto').createHash('md5').update(fs.readFileSync(path.join(R,f))).digest('hex').slice(0,8);
/* Gộp + nén toàn bộ CSS thành css/app.min.css và toàn bộ JS thành js/app.min.js (2 file thay cho ~30) để trang tải nhanh.
   Mã nguồn vẫn sửa ở các file gốc; node build.js tự dựng lại 2 file gộp. Thiếu terser/lightningcss (chưa npm install)
   hoặc đặt DL_NOBUNDLE=1 thì trang nạp từng file gốc như cũ. */
const BUNDLE=(()=>{if(process.env.DL_NOBUNDLE)return null;try{
  const {minify_sync}=require('terser'),{transform}=require('lightningcss'),rd=f=>fs.readFileSync(path.join(R,f),'utf8');
  const cssOut=transform({filename:'app.css',code:Buffer.from(css.map(rd).join('\n')),minify:true,errorRecovery:true}).code;
  const jsOut=js.map(f=>f.startsWith('vendor/')?rd(f):minify_sync(rd(f),{compress:{passes:2},mangle:true,format:{comments:false}}).code).join('\n;\n');
  const wr=(f,c)=>{const q=path.join(R,f);if(!fs.existsSync(q)||fs.readFileSync(q,'utf8')!==String(c))fs.writeFileSync(q,c)};
  wr('css/app.min.css',cssOut);wr('js/app.min.js',jsOut);return{css:'css/app.min.css',js:'js/app.min.js'};
}catch(e){console.warn('Không gộp được CSS/JS (dùng file gốc):',e.message);return null}})();
const assets=body=>BUNDLE?[`<link rel="stylesheet" href="${BUNDLE.css}?v=${VER(BUNDLE.css)}">`,...body,`<script src="${BUNDLE.js}?v=${VER(BUNDLE.js)}"></script>`].join('\n')+'\n'
  :[...css.map(c=>`<link rel="stylesheet" href="${c}?v=${VER(c)}">`),...body,...js.map(s=>`<script src="${s}?v=${VER(s)}"></script>`)].join('\n')+'\n';
const frag=head+'\n'+assets(parts);

/* Dữ liệu có cấu trúc cho Google (chỉ bản host) */
const ld=(()=>{try{
  const w={};new Function('window',fs.readFileSync(path.join(R,'js/data.js'),'utf8'))(w);const D=w.DL_DATA;
  const strip=t=>t.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  const site='https://dreamlabs.vn/';
  const org={'@type':['Organization','ProfessionalService'],'@id':site+'#org',name:'Dream Labs',url:site,image:site+'img/og.webp',logo:site+'img/icon-512.png',
    description:'Dream Labs triển khai AI tự động hóa quy trình doanh nghiệp (bán hàng, chăm sóc khách hàng, kế toán, báo cáo) và thiết kế website, landing page, video, bao bì cho doanh nghiệp Việt Nam.',
    telephone:'+84934246420',areaServed:{'@type':'Country',name:'Việt Nam'},
    address:{'@type':'PostalAddress',addressLocality:'Hồ Chí Minh',addressCountry:'VN'},
    openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],opens:'08:30',closes:'18:00'},
    contactPoint:{'@type':'ContactPoint',telephone:'+84934246420',contactType:'customer service',areaServed:'VN',availableLanguage:['vi']},
    knowsAbout:['Tự động hóa quy trình doanh nghiệp','AI agent','Tự động hóa bán hàng','n8n','Thiết kế website','Landing page','Motion graphic'],
    hasOfferCatalog:{'@type':'OfferCatalog',name:'Dịch vụ Dream Labs',itemListElement:D.CATS.map(c=>({'@type':'OfferCatalog',name:c.name,description:c.desc,
      itemListElement:c.tiers.map(t=>({'@type':'Offer',name:c.name+' — '+t.n,price:t.p,priceCurrency:'VND',itemOffered:{'@type':'Service',name:c.name+' — '+t.n,description:(t.f||[]).filter(x=>typeof x==='string').join('; ')}}))}))}};
  const graph=[{'@type':'WebSite','@id':site+'#web',url:site,name:'Dream Labs',inLanguage:'vi',publisher:{'@id':site+'#org'}},org];
  return '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>\n';
}catch(e){console.warn('JSON-LD lỗi:',e.message);return ''}})();
const HREFLANG=[['vi',''],['en','en/'],['ja','ja/'],['x-default','en/']].map(([l,p])=>`<link rel="alternate" hreflang="${l}" href="https://dreamlabs.vn/${p}">`).join('\n')+'\n';
/* Trang chủ tiếng Việt: khách nước ngoài (trình duyệt không có tiếng Việt và không ở múi giờ Việt Nam) tự chuyển sang /en/.
   Bỏ qua bot tìm kiếm; khách đã tự chọn ngôn ngữ (localStorage dl-lang, ghi khi bấm VI · EN · JA) thì theo lựa chọn đó. */
const LANG_REDIRECT='<script>(function(){try{var c=localStorage.getItem("dl-lang"),n=navigator,u=n.userAgent||"";if(c==="vi"||/bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(u))return;var go=c==="en"||c==="ja"?c:null;if(!go){var l=(n.languages&&n.languages.length?n.languages:[n.language||""]).join(","),z="";try{z=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}if(/(^|,)vi\\b/i.test(l)||/Ho_Chi_Minh|Saigon/.test(z))return;go="en"}location.replace(go+"/"+location.search+location.hash)}catch(e){}})()</script>\n';
const full=`<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#F4EFE6" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#15121C" media="(prefers-color-scheme: dark)">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="apple-mobile-web-app-title" content="Dream Labs">\n<meta name="format-detection" content="telephone=no">\n<link rel="apple-touch-icon" href="img/icon-180.png">\n<link rel="icon" type="image/png" href="img/icon-192.png">\n<link rel="manifest" href="manifest.webmanifest">\n<meta property="og:title" content="Dream Labs — Tự động hóa quy trình doanh nghiệp bằng AI">\n<meta property="og:description" content="Hệ thống AI tự động hóa bán hàng, chăm sóc khách hàng, kế toán và báo cáo cho doanh nghiệp Việt Nam. Thiết kế website, landing page, video.">\n<meta property="og:site_name" content="Dream Labs">\n<link rel="canonical" href="https://dreamlabs.vn/">\n${HREFLANG}<meta property="og:url" content="https://dreamlabs.vn/">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="vi_VN">\n${ld}<meta property="og:image" content="https://dreamlabs.vn/img/og.webp">\n${require('./tools/site.js').verifyTag}<script src="js/track.js?v=${VER('js/track.js')}" defer></script>\n<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n</head>\n<body>\n${frag}</body>\n</html>\n`;
/* trang /lab/: cùng khung, CSS, JS với trang chủ; <base href="../"> để mọi đường dẫn tương đối (css, js, ảnh, #lien-he…) trỏ về gốc */
const labBody=[part('src/partials/00-chrome.html'),part('src/lab/lab.html').replace('<h2 data-split>','<h1 class="lab-h1" data-split>').replace(/(<h1 class="lab-h1"[\s\S]*?)<\/h2>/,'$1</h1>'),part('src/partials/95-footer.html')];
const LT='Lab: 5 demo tương tác của Dream Labs',LD='Tự tay thử 5 demo của Dream Labs: trợ lý AI bán hàng, quy trình tự động, motion logo, chỉnh màu video, dựng landing page ngay trên trình duyệt.';
const labHead=head.replace(/<title>[\s\S]*?<\/title>/,`<title>${LT}</title>`).replace(/(<meta name="description" content=")[^"]*/,'$1'+LD).replace(/<meta name="keywords"[^>]*>\n?/,'');
const labLd={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':'https://dreamlabs.vn/lab/#trang',url:'https://dreamlabs.vn/lab/',name:LT,description:LD,inLanguage:'vi',isPartOf:{'@type':'WebSite','@id':'https://dreamlabs.vn/#web'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:'https://dreamlabs.vn/'},{'@type':'ListItem',position:2,name:'Lab',item:'https://dreamlabs.vn/lab/'}]}]};
const lab=full.replace(frag,()=>labHead+'\n'+assets(labBody)).replace('<head>\n','<head>\n<base href="../">\n')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n/,()=>'<script type="application/ld+json">'+JSON.stringify(labLd).replace(/</g,'\\u003c')+'</script>\n')
  .replace(/(<link rel="canonical" href=")[^"]*/,'$1https://dreamlabs.vn/lab/').replace(/(<meta property="og:url" content=")[^"]*/,'$1https://dreamlabs.vn/lab/')
  .replace(/(<meta property="og:title" content=")[^"]*/,'$1'+LT).replace(/(<meta property="og:description" content=")[^"]*/,'$1'+LD).replace('<body>','<body class="pg-lab">').replace(HREFLANG,'');
/* ── bản tiếng Anh /en/ và tiếng Nhật /ja/: chỉ trang chủ. Chữ tĩnh dịch bằng cặp thay thế trong i18n/<lang>.json (html), chữ do JS dựng
   dịch lúc chạy qua window.DL_I18N (t, cats, cmp) — xem js/i18n.js. Dùng chung CSS/JS/ảnh với bản tiếng Việt qua <base href="../">.
   Khác bản tiếng Việt: thêm Bảng giá đầy đủ, FAQ (các trang riêng chưa dịch). */
const LANG_PARTS=['00-chrome.html','10-hero.html','15-showroom.html','12-pricing.html.off','55-steps.html','80-faq.html.off','90-contact.html','95-footer.html'];
const langMiss=[];
function langPage(L){
  const J=JSON.parse(fs.readFileSync(path.join(R,'i18n',L+'.json'),'utf8')),url='https://dreamlabs.vn/'+L+'/';
  const cur=J.fx.cur,rate=FX_RATE[cur],loc=L==='ja'?'ja-JP':'en-US',rateS=rate.toLocaleString(loc);
  const nice=v=>{const s=v<100?5:v<1e3?10:v<1e4?100:v<1e5?1e3:1e4;return Math.max(s,Math.round(v/s)*s)};
  const sub=s=>String(s).replace(/\{rate\}/g,rateS).replace(/\{fx:(\d+)\}/g,(m,n)=>J.fx.fmt.replace('{v}',nice(+n/rate).toLocaleString(loc)));
  let body=head+'\n'+LANG_PARTS.map(f=>part('src/partials/'+f)).join('\n');
  for(const [a,b] of J.html){if(!body.includes(a)){langMiss.push(L+': '+a.slice(0,80));continue}body=body.split(a).join(sub(b))}
  const ld=(()=>{const w={};new Function('window',fs.readFileSync(path.join(R,'js/data.js'),'utf8'))(w);const D=w.DL_DATA,site='https://dreamlabs.vn/';
    const cats=D.CATS.map(c=>{const o=J.cats[c.id]||{};return{name:o.name||c.name,desc:o.desc||c.desc,tiers:c.tiers.map((t,i)=>{const x=(o.tiers||[])[i]||{};return{n:x.n||t.n,p:t.p,f:(x.f||t.f).filter(f=>typeof f==='string')}})}});
    const m=J.meta;
    return{'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':url+'#page',url,name:m.title,description:m.description,inLanguage:L,isPartOf:{'@id':site+'#web'},about:{'@id':site+'#org'}},
      {'@type':['Organization','ProfessionalService'],'@id':site+'#org',name:'Dream Labs',url:site,image:site+'img/og.webp',logo:site+'img/icon-512.png',description:m.orgDescription,telephone:'+84934246420',
       address:{'@type':'PostalAddress',addressLocality:'Ho Chi Minh City',addressCountry:'VN'},
       contactPoint:{'@type':'ContactPoint',telephone:'+84934246420',contactType:'customer service',availableLanguage:['vi','en','ja']},
       knowsAbout:m.knowsAbout,hasOfferCatalog:{'@type':'OfferCatalog',name:m.catalog,itemListElement:cats.map(c=>({'@type':'OfferCatalog',name:c.name,description:c.desc,
         itemListElement:c.tiers.map(t=>({'@type':'Offer',name:c.name+' — '+t.n,price:t.p,priceCurrency:'VND',itemOffered:{'@type':'Service',name:c.name+' — '+t.n,description:t.f.join('; ')}}))}))}}]}})();
  const I={lang:L,fx:{cur,rate,fmt:J.fx.fmt},t:J.t,cats:J.cats,cmp:J.cmp};
  const m=J.meta,esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  return full.replace(frag,()=>body+'\n'+assets([]).trimEnd()+'\n')
    .replace('<html lang="vi">',`<html lang="${L}">`).replace('<head>\n',`<head>\n<base href="../">\n`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n/,()=>'<script type="application/ld+json">'+JSON.stringify(ld).replace(/</g,'\\u003c')+'</script>\n')
    .replace(/(<link rel="canonical" href=")[^"]*/,'$1'+url).replace(/(<meta property="og:url" content=")[^"]*/,'$1'+url)
    .replace(/(<meta property="og:title" content=")[^"]*/,'$1'+esc(m.ogTitle)).replace(/(<meta property="og:description" content=")[^"]*/,'$1'+esc(m.ogDescription))
    .replace('<meta property="og:locale" content="vi_VN">',`<meta property="og:locale" content="${L==='ja'?'ja_JP':'en_US'}">\n<meta property="og:locale:alternate" content="vi_VN">`)
    .replace('</head>',()=>'<script>window.DL_I18N='+JSON.stringify(I).replace(/</g,'\\u003c')+'</script>\n</head>');
}
const tag=process.argv[2];
if(tag){fs.writeFileSync(path.join(R,`_${tag}.html`),full);console.log(`_${tag}.html`,parts.length,'partials')}
else{fs.writeFileSync(path.join(R,'index.html'),full.replace('<head>\n','<head>\n'+LANG_REDIRECT));fs.mkdirSync(path.join(R,'lab'),{recursive:true});fs.writeFileSync(path.join(R,'lab/index.html'),lab);fs.writeFileSync(path.join(R,'artifact.html'),frag);for(const L of ['en','ja']){fs.mkdirSync(path.join(R,L),{recursive:true});fs.writeFileSync(path.join(R,L,'index.html'),langPage(L))}if(langMiss.length){console.warn('Bản dịch: chuỗi gốc không còn khớp (sửa i18n/*.json):\n  '+langMiss.join('\n  '));process.exitCode=1}console.log('index.html (bản host) + artifact.html (bản Claude Artifact)',parts.length,'partials',css.length,'css',js.length,'js')}
