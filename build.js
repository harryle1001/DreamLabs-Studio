#!/usr/bin/env node
/* Ghép src/head.html + css + src/partials/*.html (theo thứ tự tên file) + js thành trang.
   node build.js        -> index.html (bản đầy đủ để host) + artifact.html (bản Claude Artifact, không doctype)
   node build.js A      -> _A.html (bản đầy đủ, để từng session test riêng, không ghi đè của nhau) */
const fs=require('fs'),path=require('path'),R=__dirname,ex=f=>fs.existsSync(path.join(R,f));
const css=['css/fonts.css','css/tokens.css','css/base.css','css/core.css','css/work.css','css/lab.css','css/samples.css','css/showroom.css'].filter(ex);
const js=['vendor/gsap.min.js','vendor/ScrollTrigger.min.js','vendor/SplitText.min.js','vendor/lenis.min.js','js/data.js','js/kit.js','js/core.js','js/work.js','js/lab.js'].filter(ex).concat(fs.readdirSync(path.join(R,'js')).filter(f=>/^samples-.+\.js$/.test(f)).sort().map(f=>'js/'+f),['js/spin.js','js/samples.js','js/showroom.js'].filter(ex));
/* mục Bài viết: dựng blog/, khối "Bài viết mới" (src/partials/70-blog.html) và sitemap.xml trước khi ghép trang */
try{require('./tools/blog.js')}catch(e){console.warn('Blog lỗi:',e.message)}
/* trang dịch vụ: <slug>/index.html từ src/pages/ (tools/pages.js) */
try{require('./tools/pages.js')}catch(e){console.warn('Trang dịch vụ lỗi:',e.message)}
const pdir=path.join(R,'src/partials');
const part=f=>`<!-- ${path.basename(f)} -->\n`+fs.readFileSync(path.join(R,f),'utf8').trim();
const parts=fs.readdirSync(pdir).filter(f=>f.endsWith('.html')).sort().map(f=>part('src/partials/'+f));
const head=fs.readFileSync(path.join(R,'src/head.html'),'utf8').trim();
const VER=f=>require('crypto').createHash('md5').update(fs.readFileSync(path.join(R,f))).digest('hex').slice(0,8);
const assets=body=>[...css.map(c=>`<link rel="stylesheet" href="${c}?v=${VER(c)}">`),...body,...js.map(s=>`<script src="${s}?v=${VER(s)}"></script>`)].join('\n')+'\n';
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
const full=`<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#F4EFE6" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#15121C" media="(prefers-color-scheme: dark)">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="apple-mobile-web-app-title" content="Dream Labs">\n<meta name="format-detection" content="telephone=no">\n<link rel="apple-touch-icon" href="img/icon-180.png">\n<link rel="icon" type="image/png" href="img/icon-192.png">\n<link rel="manifest" href="manifest.webmanifest">\n<meta property="og:title" content="Dream Labs — Tự động hóa quy trình doanh nghiệp bằng AI">\n<meta property="og:description" content="Hệ thống AI tự động hóa bán hàng, chăm sóc khách hàng, kế toán và báo cáo cho doanh nghiệp Việt Nam. Thiết kế website, landing page, video.">\n<meta property="og:site_name" content="Dream Labs">\n<link rel="canonical" href="https://dreamlabs.vn/">\n<meta property="og:url" content="https://dreamlabs.vn/">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="vi_VN">\n${ld}<meta property="og:image" content="https://dreamlabs.vn/img/og.webp">\n${require('./tools/site.js').verifyTag}<script src="js/track.js?v=${VER('js/track.js')}" defer></script>\n<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n</head>\n<body>\n${frag}</body>\n</html>\n`;
/* trang /lab/: cùng khung, CSS, JS với trang chủ; <base href="../"> để mọi đường dẫn tương đối (css, js, ảnh, #lien-he…) trỏ về gốc */
const labBody=[part('src/partials/00-chrome.html'),part('src/lab/lab.html').replace('<h2 data-split>','<h1 class="lab-h1" data-split>').replace(/(<h1 class="lab-h1"[\s\S]*?)<\/h2>/,'$1</h1>'),part('src/partials/95-footer.html')];
const LT='Lab: 5 demo tương tác của Dream Labs',LD='Tự tay thử 5 demo của Dream Labs: trợ lý AI bán hàng, quy trình tự động, motion logo, chỉnh màu video, dựng landing page ngay trên trình duyệt.';
const labHead=head.replace(/<title>[\s\S]*?<\/title>/,`<title>${LT}</title>`).replace(/(<meta name="description" content=")[^"]*/,'$1'+LD).replace(/<meta name="keywords"[^>]*>\n?/,'');
const labLd={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':'https://dreamlabs.vn/lab/#trang',url:'https://dreamlabs.vn/lab/',name:LT,description:LD,inLanguage:'vi',isPartOf:{'@type':'WebSite','@id':'https://dreamlabs.vn/#web'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:'https://dreamlabs.vn/'},{'@type':'ListItem',position:2,name:'Lab',item:'https://dreamlabs.vn/lab/'}]}]};
const lab=full.replace(frag,()=>labHead+'\n'+assets(labBody)).replace('<head>\n','<head>\n<base href="../">\n')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n/,()=>'<script type="application/ld+json">'+JSON.stringify(labLd).replace(/</g,'\\u003c')+'</script>\n')
  .replace(/(<link rel="canonical" href=")[^"]*/,'$1https://dreamlabs.vn/lab/').replace(/(<meta property="og:url" content=")[^"]*/,'$1https://dreamlabs.vn/lab/')
  .replace(/(<meta property="og:title" content=")[^"]*/,'$1'+LT).replace(/(<meta property="og:description" content=")[^"]*/,'$1'+LD).replace('<body>','<body class="pg-lab">');
const tag=process.argv[2];
if(tag){fs.writeFileSync(path.join(R,`_${tag}.html`),full);console.log(`_${tag}.html`,parts.length,'partials')}
else{fs.writeFileSync(path.join(R,'index.html'),full);fs.mkdirSync(path.join(R,'lab'),{recursive:true});fs.writeFileSync(path.join(R,'lab/index.html'),lab);fs.writeFileSync(path.join(R,'artifact.html'),frag);console.log('index.html (bản host) + artifact.html (bản Claude Artifact)',parts.length,'partials',css.length,'css',js.length,'js')}
