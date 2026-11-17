#!/usr/bin/env node
/* Ghép src/head.html + css + src/partials/*.html (theo thứ tự tên file) + js thành trang.
   node build.js        -> index.html (bản đầy đủ để host) + artifact.html (bản Claude Artifact, không doctype)
   node build.js A      -> _A.html (bản đầy đủ, để từng session test riêng, không ghi đè của nhau) */
const fs=require('fs'),path=require('path'),R=__dirname,ex=f=>fs.existsSync(path.join(R,f));
const css=['css/fonts.css','css/tokens.css','css/base.css','css/core.css','css/work.css','css/lab.css','css/samples.css'].filter(ex);
const js=['vendor/gsap.min.js','vendor/ScrollTrigger.min.js','vendor/SplitText.min.js','vendor/lenis.min.js','js/data.js','js/kit.js','js/core.js','js/work.js','js/lab.js'].filter(ex).concat(fs.readdirSync(path.join(R,'js')).filter(f=>/^samples-.+\.js$/.test(f)).sort().map(f=>'js/'+f),['js/samples.js'].filter(ex));
const pdir=path.join(R,'src/partials');
const parts=fs.readdirSync(pdir).filter(f=>f.endsWith('.html')).sort().map(f=>`<!-- ${f} -->\n`+fs.readFileSync(path.join(pdir,f),'utf8').trim());
const head=fs.readFileSync(path.join(R,'src/head.html'),'utf8').trim();
const v=Date.now().toString(36);
const frag=[head,...css.map(c=>`<link rel="stylesheet" href="${c}">`),...parts,...js.map(s=>`<script src="${s}"></script>`)].join('\n')+'\n';

/* Dữ liệu có cấu trúc cho Google (chỉ bản host) */
const ld=(()=>{try{
  const w={};new Function('window',fs.readFileSync(path.join(R,'js/data.js'),'utf8'))(w);const D=w.DL_DATA;
  const strip=t=>t.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  const faqSrc=fs.readFileSync(path.join(R,'src/partials/80-faq.html'),'utf8');
  const faq=[...faqSrc.matchAll(/<span class="q">([\s\S]*?)<\/span>[\s\S]*?<div class="a">([\s\S]*?)<\/div>/g)].map(m=>({'@type':'Question',name:strip(m[1]),acceptedAnswer:{'@type':'Answer',text:strip(m[2])}}));
  const site='https://dreamlabs.vn/';
  const org={'@type':'ProfessionalService','@id':site+'#org',name:'Dream Labs',url:site,image:site+'img/og.webp',logo:site+'img/icon-512.png',
    description:'Dream Labs triển khai AI tự động hóa quy trình doanh nghiệp (bán hàng, chăm sóc khách hàng, kế toán, báo cáo) và thiết kế website, landing page, video, bao bì cho doanh nghiệp Việt Nam.',
    telephone:'+84934246420',areaServed:{'@type':'Country',name:'Việt Nam'},
    address:{'@type':'PostalAddress',addressLocality:'Hồ Chí Minh',addressCountry:'VN'},
    knowsAbout:['Tự động hóa quy trình doanh nghiệp','AI agent','Tự động hóa bán hàng','n8n','Thiết kế website','Landing page','Motion graphic'],
    hasOfferCatalog:{'@type':'OfferCatalog',name:'Dịch vụ Dream Labs',itemListElement:D.CATS.map(c=>({'@type':'OfferCatalog',name:c.name,description:c.desc,
      itemListElement:c.tiers.map(t=>({'@type':'Offer',name:c.name+' — '+t.n,price:t.p,priceCurrency:'VND',itemOffered:{'@type':'Service',name:c.name+' — '+t.n,description:(t.f||[]).filter(x=>typeof x==='string').join('; ')}}))}))}};
  const graph=[{'@type':'WebSite','@id':site+'#web',url:site,name:'Dream Labs',inLanguage:'vi',publisher:{'@id':site+'#org'}},org];
  if(faq.length)graph.push({'@type':'FAQPage',mainEntity:faq});
  return '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>\n';
}catch(e){console.warn('JSON-LD lỗi:',e.message);return ''}})();
const full=`<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#F4EFE6" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#15121C" media="(prefers-color-scheme: dark)">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="apple-mobile-web-app-title" content="Dream Labs">\n<meta name="format-detection" content="telephone=no">\n<link rel="apple-touch-icon" href="img/icon-180.png">\n<link rel="icon" type="image/png" href="img/icon-192.png">\n<link rel="manifest" href="manifest.webmanifest">\n<meta property="og:title" content="Dream Labs — Tự động hóa quy trình doanh nghiệp bằng AI">\n<meta property="og:description" content="Hệ thống AI tự động hóa bán hàng, chăm sóc khách hàng, kế toán và báo cáo cho doanh nghiệp Việt Nam. Thiết kế website, landing page, video.">\n<meta property="og:site_name" content="Dream Labs">\n<link rel="canonical" href="https://dreamlabs.vn/">\n<meta property="og:url" content="https://dreamlabs.vn/">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="vi_VN">\n${ld}<meta property="og:image" content="https://dreamlabs.vn/img/og.webp">\n<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n</head>\n<body>\n${frag}</body>\n</html>\n`;
const tag=process.argv[2];
if(tag){fs.writeFileSync(path.join(R,`_${tag}.html`),full);console.log(`_${tag}.html`,parts.length,'partials')}
else{fs.writeFileSync(path.join(R,'index.html'),full);fs.writeFileSync(path.join(R,'artifact.html'),frag);console.log('index.html (bản host) + artifact.html (bản Claude Artifact)',parts.length,'partials',css.length,'css',js.length,'js')}
