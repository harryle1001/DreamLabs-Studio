/* Đo chuyển đổi: đẩy sự kiện vào window.dataLayer (zalo_click, call_click, form_submit), kèm trang nguồn.
   Bật Google Analytics 4 hoặc Google Tag Manager: điền ĐÚNG MỘT mã vào TAG_ID bên dưới
     'G-XXXXXXXXXX'  -> nạp gtag.js (GA4), sự kiện gửi thẳng lên GA4
     'GTM-XXXXXXX'   -> nạp Google Tag Manager, sự kiện nằm trong dataLayer để GTM bắt
     ''              -> tắt: không nạp gì từ bên ngoài, chỉ ghi dataLayer
   Mã Google Ads (AW-...) nếu có thì thêm trong GTM, hoặc điền ADS_ID để gtag gửi kèm (chỉ dùng khi TAG_ID là G-...). */
(function(){
  var TAG_ID='';
  var ADS_ID='';
  /* Google tag (dạng GTM-..., snippet gtm.js + gtag('js')) do GA4 / Google Ads cấp: GA4 luồng "Dream Labs Web", Google Ads */
  var GOOGLE_TAGS=['GTM-KMHVQ5B9','GTM-MK2QCPNB'];
  var w=window,d=document;w.dataLayer=w.dataLayer||[];
  function gtag(){w.dataLayer.push(arguments)}
  if(GOOGLE_TAGS.length){
    w.gtag=gtag;gtag('js',new Date());
    for(var i=0;i<GOOGLE_TAGS.length;i++){var t=d.createElement('script');t.async=true;t.src='https://www.googletagmanager.com/gtm.js?id='+GOOGLE_TAGS[i];d.head.appendChild(t)}
  }
  if(/^G-/.test(TAG_ID)){
    w.gtag=gtag;gtag('js',new Date());gtag('config',TAG_ID);if(/^AW-/.test(ADS_ID))gtag('config',ADS_ID);
    var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+TAG_ID;d.head.appendChild(s);
  }else if(/^GTM-/.test(TAG_ID)){
    w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    var g=d.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtm.js?id='+TAG_ID;d.head.appendChild(g);
  }
  function send(ev,extra){
    var o={event:ev,page_path:location.pathname,page_title:d.title,page_location:location.href.split('#')[0]};
    for(var k in extra)o[k]=extra[k];
    w.dataLayer.push(o);
    if(w.gtag&&(/^G-/.test(TAG_ID)||GOOGLE_TAGS.length)){var p={};for(var j in o)if(j!=='event')p[j]=o[j];w.gtag('event',ev,p)}
  }
  d.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';
    var label=(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,80);
    if(/zalo\.me\//i.test(h))send('zalo_click',{link_url:h,link_text:label});
    else if(/^tel:/i.test(h))send('call_click',{link_url:h,link_text:label});
  },true);
  /* chạy sau trình xử lý của form (pha nổi): bỏ qua khi form còn ô báo lỗi */
  d.addEventListener('submit',function(e){
    var f=e.target;if(!f||f.tagName!=='FORM')return;
    if(f.querySelector('.bad,[aria-invalid="true"]'))return;
    send('form_submit',{form_id:f.id||f.getAttribute('name')||'',form_service:(f.querySelector('select')||{}).value||''});
  });
})();
