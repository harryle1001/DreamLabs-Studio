/* Dream Labs — đa ngôn ngữ trang chủ (/en/, /ja/). Nạp ngay SAU kit.js, TRƯỚC core.js.
   build.js chèn window.DL_I18N (từ i18n/<lang>.json + tỷ giá FX trong build.js) vào trang /en/, /ja/. Bản tiếng Việt không có DL_I18N.
   API: DL.lang ('vi'|'en'|'ja') · DL.t('chuỗi tiếng Việt',{biến}) → bản dịch (thiếu thì trả lại nguyên chuỗi, {n} được thay)
        DL.fx(số VNĐ) → '≈ US$200' / '約30,000円' ('' ở bản tiếng Việt) · DL.vndx(n) → giá kèm quy đổi dạng chữ
        DL.i18nSamples(DL_SAMPLES) → dịch tên/ngành/mô tả/thẻ/mẫu mã/chú thích của Phòng mẫu (samples.js tự gọi). */
(()=>{
const D=window.DL;if(!D)return;
const L=window.DL_I18N,fill=(s,v)=>v?String(s).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:m):String(s);
/* nhớ ngôn ngữ khách tự chọn (trang chủ tiếng Việt đọc dl-lang để không tự chuyển sang /en/) */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[hreflang]');if(a)try{localStorage.setItem('dl-lang',a.getAttribute('hreflang'))}catch(_){}},true);
D.lang='vi';D.t=(s,v)=>fill(s,v);D.fx=()=>'';D.vndx=n=>D.vnd(n);D.i18nSamples=()=>{};
if(!L||!L.lang)return;
const M=L.t||{},tr=s=>typeof s==='string'&&M[s]!=null?M[s]:s;
D.lang=L.lang;D.t=(s,v)=>fill(tr(s),v);
const loc=L.lang==='ja'?'ja-JP':'en-US',F=L.fx||{};
D.vnd=n=>Math.round(n).toLocaleString(loc)+' VND';
/* quy đổi tham khảo, làm tròn đẹp: <100 → bội 5, <1.000 → 10, <10.000 → 100, <100.000 → 1.000, còn lại → 10.000 */
const nice=v=>{const s=v<100?5:v<1e3?10:v<1e4?100:v<1e5?1e3:1e4;return Math.max(s,Math.round(v/s)*s)};
D.fx=n=>F.rate?fill(F.fmt||'≈ {v}',{v:nice(n/F.rate).toLocaleString(loc)}):'';
D.vndx=n=>{const f=D.fx(n);return D.vnd(n)+(f?' ('+f+')':'')};
{const fx0=D.fx;D.fx=n=>D.ask&&D.ask(n)?'':fx0(n)}

/* dữ liệu giá: thay tên, mô tả, gói, tính năng; giữ tên gốc (name0, n0) để khớp trường pkg của mẫu */
const DATA=window.DL_DATA||{},C=L.cats||{};
(DATA.CATS||[]).forEach(c=>{const o=C[c.id];if(!o)return;c.name0=c.name;
  ['name','desc','tag'].forEach(k=>{if(o[k])c[k]=o[k]});
  (c.tiers||[]).forEach((t,i)=>{const x=(o.tiers||[])[i];if(!x)return;t.n0=t.n;
    ['g','n','t','r','u'].forEach(k=>{if(x[k]!=null)t[k]=x[k]});
    if(Array.isArray(x.f))t.f=t.f.map((f,j)=>x.f[j]==null?f:typeof f==='string'?x.f[j]:{x:x.f[j]})})});
if(L.cmp&&DATA.CMP)Object.keys(L.cmp).forEach(k=>{if(DATA.CMP[k])DATA.CMP[k]=L.cmp[k]});

/* Phòng mẫu: dịch theo bảng chuỗi chung; pkg "<hạng mục> — <gói>" đổi sang tên đã dịch */
const nk=s=>String(s||'').normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const PKG={};(DATA.CATS||[]).forEach(c=>(c.tiers||[]).forEach(t=>{PKG[nk((c.name0||c.name)+' '+(t.n0||t.n))]=c.name+' — '+t.n}));
const hs=a=>Array.isArray(a)&&a.forEach(h=>{if(h){h.t=tr(h.t);h.d=tr(h.d)}});
D.i18nSamples=S=>{if(!S||S.__i18n)return;S.__i18n=1;
  Object.keys(S).forEach(cat=>(Array.isArray(S[cat])?S[cat]:[]).forEach(r=>{if(!r||typeof r!=='object')return;
    ['title','industry','desc'].forEach(k=>{r[k]=tr(r[k])});
    if(Array.isArray(r.tags))r.tags=r.tags.map(tr);
    if(r.pkg&&PKG[nk(r.pkg)])r.pkg=PKG[nk(r.pkg)];
    (Array.isArray(r.variants)?r.variants:[]).forEach(v=>{if(!v)return;v.name=tr(v.name);v.spin&&hs(v.spin.hotspots)});
    r.spin&&hs(r.spin.hotspots)}))};
})();
