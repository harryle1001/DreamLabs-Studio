/* Dream Labs — Phòng mẫu · Tự động hóa quy trình doanh nghiệp. Session F (v3).
   6 kịch bản AI cho 6 thương hiệu xa xỉ concept (tên tự nghĩ, không trùng hãng thật). Tất cả là DEMO MÔ PHỎNG: hội thoại theo kịch bản,
   số liệu minh họa, không gọi API. mount(el, {snap:true}) dựng thẳng trạng thái cuối (dùng để chụp ảnh cover). CSS: css/samples.css, tiền tố smai-. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,r)=>r.querySelector(s),$$=(s,r)=>[...r.querySelectorAll(s)];
const vnd=n=>Math.round(n).toLocaleString('vi-VN')+'đ';
const num=n=>Math.round(n).toLocaleString('vi-VN');
const money=n=>n>=1e9?(Math.round(n/1e7)/100).toLocaleString('vi-VN')+' tỷ':(Math.round(n/1e5)/10).toLocaleString('vi-VN')+' triệu';
const CHECK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* bộ chạy cho mỗi lần mount: hẹn giờ, vòng lặp, đếm số, gõ chữ; off() dừng sạch mọi thứ */
function K(o){
  const snap=!!(o&&o.snap),timers=new Set(),loops=new Set();let dead=false,raf=0;
  const tick=t=>{raf=0;if(dead)return;if(!document.hidden)loops.forEach(f=>{try{f(t)}catch(e){}});if(loops.size)raf=requestAnimationFrame(tick)};
  const k={snap,get dead(){return dead},
    wait:ms=>new Promise(r=>{if(dead)return;if(snap)return r();const t=setTimeout(()=>{timers.delete(t);dead||r()},RM?Math.min(ms,100):ms);timers.add(t)}),
    every(fn,ms){if(snap||RM)return;const t=setInterval(()=>{dead||document.hidden||fn()},ms);timers.add(t)},
    loop(fn){loops.add(fn);if(!raf)raf=requestAnimationFrame(tick);return()=>loops.delete(fn)},
    tween:(dur,fn)=>new Promise(r=>{if(dead)return;if(snap||RM){fn(1);return r()}let t0=0;const stop=k.loop(t=>{t0=t0||t;const p=Math.min(1,(t-t0)/dur);fn(1-Math.pow(1-p,3));if(p>=1){stop();r()}})}),
    count(node,to,fmt){const from=+node.dataset.v||0;node.dataset.v=to;return k.tween(686,p=>{node.textContent=fmt(from+(to-from)*p)})},
    async type(node,text){const my=node._ty=(node._ty||0)+1;if(snap||RM){node.textContent=text;return}node.textContent='';for(let i=0;i<text.length;i+=3){if(dead||node._ty!==my)return;node.textContent=text.slice(0,i+3);await k.wait(16)}if(node._ty===my)node.textContent=text},
    off(){dead=true;timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers.clear();loops.clear();cancelAnimationFrame(raf)}};
  return k}
const head=(brand,sub)=>`<header class="smai-hd"><p class="smai-brand">${brand}</p><p class="smai-sub">${sub}</p><span class="smai-sim">Demo mô phỏng</span></header>`;
const chatHTML=(name,note)=>`<section class="smai-chat" aria-label="Hội thoại mô phỏng"><div class="smai-chat-h"><i></i><b>${name}</b><small>${note}</small></div><div class="smai-msgs" aria-live="polite"></div><div class="smai-quick" role="group" aria-label="Chọn câu trả lời"></div></section>`;
function chat(root,k){
  const msgs=$('.smai-msgs',root),quick=$('.smai-quick',root);
  const down=()=>{msgs.scrollTop=msgs.scrollHeight};
  const add=(who,html)=>{const b=document.createElement('div');b.className='smai-b '+who;b.innerHTML=html;msgs.append(b);down();return b};
  return{msgs,
    clear(){msgs.replaceChildren();quick.replaceChildren()},
    user:t=>add('me',t),
    async bot(html,ms){if(k.snap)return add('bot',html);const b=add('bot typing','<i></i><i></i><i></i>');await k.wait(ms||Math.min(1300,382+html.length*9));b.className='smai-b bot';b.innerHTML=html;down();return b},
    ask:(opts,auto=0)=>new Promise(res=>{if(k.dead)return;
      const pick=i=>{quick.onclick=null;quick.replaceChildren();add('me',opts[i]);res(i)};
      if(k.snap)return pick(auto);
      quick.innerHTML=opts.map((t,i)=>`<button type="button" data-i="${i}">${t}</button>`).join('');down();
      quick.onclick=e=>{const b=e.target.closest('button');if(b)pick(+b.dataset.i)}})}}
const logAdd=async(ul,lines,k)=>{for(const l of lines){const li=document.createElement('li');li.innerHTML=CHECK+'<span>'+l+'</span>';ul.append(li);await k.wait(262)}};

/* ═════════ 1 · Maison Sương Trầm — concierge hương: hỏi sở thích, gợi ý mùi, đặt lịch thử ═════════ */
function suongTram(el,o){
  const k=K(o),AX=['Gỗ','Hoa','Cam chanh','Xạ','Khói'];
  const SC=[
    {n:'Trầm Sớm N°3',v:[.92,.3,.2,.5,.72],top:'tiêu hồng, bạch đậu khấu',mid:'trầm hương, hoa mộc',base:'hổ phách, đàn hương'},
    {n:'Nguyệt Bạch N°7',v:[.3,.95,.42,.7,.14],top:'lê xanh, sương sớm',mid:'hoa nhài, ngọc lan',base:'xạ trắng, tuyết tùng'},
    {n:'Hải Phong N°5',v:[.36,.3,.95,.4,.2],top:'cam bergamot, muối biển',mid:'trà xanh, hoa cam',base:'rêu sồi, gỗ trôi'}];
  const CO=['Eau de Toilette','Eau de Parfum','Extrait de Parfum'];
  const pt=(i,r)=>{const a=(-90+i*72)*Math.PI/180;return[Math.cos(a)*r,Math.sin(a)*r]};
  const poly=v=>v.map((x,i)=>pt(i,8+x*36).map(n=>n.toFixed(1)).join(',')).join(' ');
  el.innerHTML=`<div class="smai smai-st">${head('Maison Sương Trầm','Concierge hương · trực Zalo và website 24/7')}
   <div class="smai-g">${chatHTML('Trợ lý hương','Phản hồi trong vài giây')}
    <aside class="smai-side">
     <div class="smai-card"><p class="smai-cap">Hồ sơ hương của khách</p>
      <svg class="smai-st-radar" viewBox="-66 -58 132 112" role="img" aria-label="Biểu đồ hồ sơ mùi hương">${[14,26,44].map(r=>`<polygon class="ring" points="${AX.map((_,i)=>pt(i,r).map(n=>n.toFixed(1)).join(',')).join(' ')}"/>`).join('')}${AX.map((a,i)=>{const p=pt(i,44),q=pt(i,53);return`<line class="ax" x1="0" y1="0" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}"/><text x="${q[0].toFixed(1)}" y="${(q[1]+2).toFixed(1)}" text-anchor="${Math.abs(q[0])<4?'middle':q[0]>0?'start':'end'}">${a}</text>`}).join('')}<polygon class="val" points=""/></svg></div>
     <div class="smai-card smai-st-rec" hidden><p class="smai-cap">Gợi ý của trợ lý</p><b class="smai-big"></b><span class="smai-st-co"></span><dl><div><dt>Đầu</dt><dd></dd></div><div><dt>Giữa</dt><dd></dd></div><div><dt>Cuối</dt><dd></dd></div></dl></div>
     <div class="smai-card smai-tk" hidden></div>
     <ul class="smai-log" aria-label="Việc AI vừa làm"></ul>
    </aside></div></div>`;
  const c=chat(el,k),val=$('.val',el),rec=$('.smai-st-rec',el),tk=$('.smai-tk',el),log=$('.smai-log',el);
  let cur=[.2,.2,.2,.2,.2];
  const morph=to=>{const from=cur.slice();cur=to;return k.tween(686,p=>val.setAttribute('points',poly(from.map((x,i)=>x+(to[i]-x)*p))))};
  async function run(){
    c.clear();rec.hidden=tk.hidden=true;log.replaceChildren();cur=[.2,.2,.2,.2,.2];val.setAttribute('points',poly(cur));
    await c.bot('Kính chào quý khách đến với Maison Sương Trầm. Tôi là trợ lý hương của nhà. Xin phép hỏi ba câu ngắn để tìm mùi hương hợp với quý khách nhất.');
    await c.bot('Buổi sáng lý tưởng của quý khách có mùi gì?',686);
    const a=await c.ask(['Gỗ ấm sau mưa','Hoa trắng còn sương','Vỏ cam và gió biển']),s=SC[a];
    morph(s.v.map(x=>x*.7));
    await c.bot('Quý khách muốn mùi hương ở lại trên da bao lâu?',686);
    const b=await c.ask(['Thoảng nhẹ, gần da','Rõ ràng suốt buổi tối','Đậm, để lại dấu ấn'],2);
    morph(s.v.map((x,i)=>Math.min(1,x*(.8+b*.1)+(i>2?b*.06:0))));
    await c.bot('Và dịp quý khách nghĩ tới nhiều nhất?',618);
    const d=await c.ask(['Dùng hằng ngày','Tiệc tối','Làm quà tặng'],1);
    morph(s.v.map((x,i)=>Math.min(1,x+(i===3&&d===1?.2:0))));
    $('.smai-big',rec).textContent=s.n;$('.smai-st-co',rec).textContent=CO[b]+(d===2?' · hộp quà khắc tên':' · 50 ml');
    $$('dd',rec).forEach((x,i)=>x.textContent=[s.top,s.mid,s.base][i]);rec.hidden=false;
    await c.bot(`Tôi xin gợi ý <b>${s.n}</b>, bản ${CO[b]}: mở bằng ${s.top}, giữa là ${s.mid}, lắng xuống ${s.base}.`);
    await c.bot('Quý khách muốn thử trực tiếp tại salon, hay nhận bộ mẫu thử tại nhà?',686);
    const w=await c.ask(['Đặt lịch thử tại salon','Gửi bộ mẫu thử về nhà']);
    if(w===0){
      await c.bot('Salon còn các khung giờ riêng tư, mỗi khung 45 phút:',686);
      const T=['Thứ Sáu · 16:00','Thứ Bảy · 10:30','Chủ nhật · 15:00'],t=await c.ask(T,1);
      tk.innerHTML=`<p class="smai-cap">Phiếu hẹn thử hương</p><b class="smai-big">${T[t]}</b><span>Salon riêng, tầng 2 · 45 phút</span><span>Chuẩn bị sẵn: ${s.n} và hai mùi cùng họ</span><i>Mã hẹn ST-0${618+t}</i>`;tk.hidden=false;
      await c.bot(`Đã giữ chỗ lúc <b>${T[t]}</b>. Tôi vừa gửi xác nhận qua Zalo và sẽ nhắc lại trước giờ hẹn hai tiếng.`);
      await logAdd(log,['Lưu hồ sơ hương vào CRM','Giữ khung giờ tại salon','Gửi xác nhận qua Zalo','Hẹn nhắc trước giờ hẹn 2 tiếng'],k);
    }else{
      tk.innerHTML=`<p class="smai-cap">Bộ khám phá tại nhà</p><b class="smai-big">3 lọ × 2 ml</b><span>${s.n} và hai mùi cùng họ</span><span>Giao trong 2 ngày, kèm thẻ hướng dẫn thử</span><i>Mã đơn ST-M0382</i>`;tk.hidden=false;
      await c.bot('Bộ khám phá ba lọ 2 ml sẽ đến trong hai ngày. Sau một tuần, tôi xin phép hỏi lại cảm nhận của quý khách.');
      await logAdd(log,['Lưu hồ sơ hương vào CRM','Tạo đơn bộ mẫu thử','Gửi xác nhận qua Zalo','Hẹn hỏi lại cảm nhận sau 7 ngày'],k);
    }
    if(k.snap)return;
    await c.ask(['Trò chuyện lại từ đầu']);run();
  }
  run();return k.off;
}

/* ═════════ 2 · Atelier Lam Khuê — chăm sóc khách VIP: nhắc bảo dưỡng, mời xem bộ sưu tập riêng ═════════ */
function lamKhue(el,o){
  const k=K(o);
  const R=[
   {id:'K-0142',n:'Chị Diệu Anh',it:'Túi Khuê 28 · da bê xanh rêu',due:'Mua 11 tháng trước',t:'care',st:'Đã nhắn Zalo',why:'Túi mua 11 tháng trước, chu kỳ dưỡng da là 12 tháng.',
    m:'Chào chị Diệu Anh, chiếc Khuê 28 của chị sắp tròn một năm. Atelier xin mời chị gửi túi về dưỡng da và đánh bóng khóa, miễn phí trong tuần này. Em đặt lịch nhận túi tại nhà chiều thứ Năm chị nhé?'},
   {id:'K-0087',n:'Anh Quốc Bảo',it:'Cặp Lam 40 · da bê nâu',due:'Khách thân thiết 2 năm',t:'invite',st:'Đã gửi thư mời',why:'Đã mua 3 món trong 2 năm, thuộc nhóm 30 khách được xem trước.',
    m:'Anh Quốc Bảo thân mến, bộ sưu tập Thu của Lam Khuê mở xem riêng cho 30 khách thân thiết vào tối thứ Sáu, trước ngày ra mắt một tuần. Atelier đã giữ một chỗ mang tên anh.'},
   {id:'K-0203',n:'Chị Hạ Vy',it:'Ví Khuê Mini · da dê đen',due:'Sinh nhật ngày mai',t:'gift',st:'Đã gửi lời chúc',why:'Sinh nhật ghi trong hồ sơ là ngày mai.',
    m:'Chúc mừng sinh nhật chị Hạ Vy. Atelier gửi tặng chị một lần dập tên lên món đồ chị chọn, có hiệu lực suốt tháng này.'},
   {id:'K-0019',n:'Cô Thanh Tâm',it:'Túi Khuê Đại · đặt làm riêng',due:'Hạng Kim · bảo dưỡng',t:'human',st:'Chuyển người thật',why:'Khách hạng Kim: quy tắc của Atelier là quản lý gọi trực tiếp.',
    m:'AI không tự nhắn. Đã tạo việc cho quản lý quan hệ khách hàng: gọi cô Thanh Tâm trước 11:00, kèm lịch sử bảo dưỡng và gợi ý lời mời.'},
   {id:'K-0311',n:'Chị Ngọc Hân',it:'Túi Khuê 24 · da bê be',due:'Mua 6 tháng trước',t:'skip',st:'Chưa đến hạn',why:'Chưa có việc nào đến hạn. AI không làm phiền khách.',m:'Hôm nay không gửi gì. Lần xét tiếp theo: sau 30 ngày.'}];
  const CT={care:'Nhắc bảo dưỡng',invite:'Thư mời xem riêng',gift:'Lời chúc',human:'Chuyển người thật'};
  el.innerHTML=`<div class="smai smai-lk">${head('Atelier Lam Khuê','Chăm sóc khách VIP · chạy tự động mỗi sáng')}
   <div class="smai-g">
    <section class="smai-card smai-lk-tb"><div class="smai-row-h"><p class="smai-cap">Sổ khách thân thiết · hôm nay</p><button class="smai-btn" type="button" data-run>Chạy lịch hôm nay</button></div>
     <div class="smai-lk-rows">${R.map((r,i)=>`<button class="smai-lk-r" type="button" data-i="${i}"><span class="id">${r.id}</span><span class="who"><b>${r.n}</b><small>${r.it}</small></span><span class="due">${r.due}</span><span class="st" data-t=""></span></button>`).join('')}</div>
     <div class="smai-kpis">${Object.keys(CT).map(t=>`<div><b data-k="${t}" data-v="0">0</b><span>${CT[t]}</span></div>`).join('')}</div></section>
    <aside class="smai-side"><div class="smai-phone"><div class="smai-phone-h"><i></i><b>Atelier Lam Khuê</b><small>Zalo Official</small></div><div class="smai-phone-b"><p class="smai-lk-to">Chọn một khách hoặc bấm "Chạy lịch hôm nay".</p><div class="smai-b bot" hidden></div></div></div>
     <div class="smai-card smai-lk-why" hidden><p class="smai-cap">Vì sao AI chọn việc này</p><p></p></div></aside></div></div>`;
  const rows=$$('.smai-lk-r',el),bub=$('.smai-phone-b .smai-b',el),to=$('.smai-lk-to',el),why=$('.smai-lk-why',el),btn=$('[data-run]',el);
  let busy=false,done=false;const cnt={care:0,invite:0,gift:0,human:0};
  const show=async(i,typing)=>{const r=R[i];rows.forEach((x,j)=>x.classList.toggle('on',j===i));
    to.textContent=r.t==='human'||r.t==='skip'?'Ghi chú nội bộ · '+r.n:'Gửi tới: '+r.n+' · '+r.id;bub.hidden=false;bub.classList.toggle('note',r.t==='human'||r.t==='skip');
    $('p:last-child',why).textContent=r.why;why.hidden=false;
    if(typing)await k.type(bub,r.m);else bub.textContent=r.m};
  const mark=i=>{const r=R[i],s=$('.st',rows[i]);s.textContent=r.st;s.dataset.t=r.t;if(cnt[r.t]!=null){cnt[r.t]++;const n=$(`[data-k="${r.t}"]`,el);n.textContent=cnt[r.t];n.dataset.v=cnt[r.t]}};
  async function run(){
    if(busy)return;busy=true;btn.disabled=true;btn.textContent='AI đang xét từng khách…';
    Object.keys(cnt).forEach(t=>{cnt[t]=0;$(`[data-k="${t}"]`,el).textContent='0'});rows.forEach(x=>{const s=$('.st',x);s.textContent='';s.dataset.t=''});
    for(let i=0;i<R.length;i++){rows[i].classList.add('scan');await k.wait(424);await show(i,true);rows[i].classList.remove('scan');mark(i);await k.wait(k.snap?0:686)}
    if(k.snap)await show(0,false);
    busy=false;done=true;btn.disabled=false;btn.textContent='Chạy lại';
  }
  el.addEventListener('click',e=>{if(e.target.closest('[data-run]')){run();return}const r=e.target.closest('.smai-lk-r');if(r&&!busy)show(+r.dataset.i,false)});
  k.wait(686).then(run);return k.off;
}

/* ═════════ 3 · Thiên Độ Horlogerie — đặt lịch xem đồng hồ tại boutique ═════════ */
function thienDo(el,o){
  const k=K(o);
  const M=[{n:'Nguyệt Tướng 39',d:'Lịch tuần trăng · vỏ 39 mm',c:'moon'},{n:'Hải Trình GMT 41',d:'Hai múi giờ · vỏ 41 mm',c:'gmt'},{n:'Tịnh 36',d:'Ba kim · vỏ 36 mm',c:'pure'}];
  const DAYS=['T2','T3','T4','T5','T6','T7','CN'],HRS=['10:00','14:00','16:30','19:00'],BUSY=[0,3,5,9,10,14,18,20,23,26],FREE=[[4,2],[5,0],[6,1]];
  const FREE_T=['Thứ Sáu · 16:30','Thứ Bảy · 10:00','Chủ nhật · 14:00'];
  el.innerHTML=`<div class="smai smai-td">${head('Thiên Độ Horlogerie','Đặt lịch xem đồng hồ · boutique riêng tư')}
   <div class="smai-g">${chatHTML('Lễ tân boutique','Trợ lý AI · có chuyên viên hỗ trợ')}
    <aside class="smai-side">
     <div class="smai-card smai-td-w" data-c="moon"><svg class="smai-td-dial" viewBox="-50 -50 100 100" role="img" aria-label="Mặt đồng hồ concept, kim chạy theo giờ thật"><circle class="case" r="48"/><circle class="face" r="43"/>
       ${Array.from({length:60},(_,i)=>`<line class="${i%5?'mi':'hr'}" x1="0" y1="${i%5?-40.5:-40}" x2="0" y2="${i%5?-38.5:-34}" transform="rotate(${i*6})"/>`).join('')}
       <g class="moon"><circle r="9" cy="17"/><circle class="m" r="5.2" cx="-2" cy="17"/><circle class="sh" r="5.2" cx="1.6" cy="15.6"/></g>
       <g class="gmt"><circle r="27" fill="none"/><path class="h4" d="M0 0V-31l-2.4 4.2M0-31l2.4 4.2"/></g>
       <path class="hh" d="M0 4V-22"/><path class="mh" d="M0 5V-33"/><g class="sh2"><path d="M0 9V-37"/><circle r="1.6"/></g><circle class="pin" r="1"/></svg>
      <div><b class="smai-big"></b><span></span></div></div>
     <div class="smai-card"><p class="smai-cap">Lịch chuyên viên · tuần này</p>
      <div class="smai-td-cal" role="img" aria-label="Lịch các khung giờ còn trống">${['',...DAYS].map(d=>`<i class="h">${d}</i>`).join('')}${HRS.map((h,r)=>`<i class="h">${h}</i>`+DAYS.map((_,c)=>{const n=r*7+c,f=FREE.findIndex(x=>x[0]===c&&x[1]===r);return`<i class="s${BUSY.includes(n)?' busy':''}${f>=0?' free':''}"${f>=0?` data-f="${f}"`:''}></i>`}).join('')).join('')}</div>
      <p class="smai-legend"><span><i class="s"></i>Trống</span><span><i class="s busy"></i>Đã có khách</span><span><i class="s free"></i>Khung riêng 45 phút</span></p></div>
     <div class="smai-card smai-tk" hidden></div><ul class="smai-log" aria-label="Việc AI vừa làm"></ul>
    </aside></div></div>`;
  const c=chat(el,k),w=$('.smai-td-w',el),tk=$('.smai-tk',el),log=$('.smai-log',el),hh=$('.hh',el),mh=$('.mh',el),sh=$('.sh2',el),h4=$('.h4',el);
  const setModel=i=>{w.dataset.c=M[i].c;$('.smai-big',w).textContent=M[i].n;$('span',w).textContent=M[i].d};
  const hands=()=>{const d=k.snap?new Date(2026,0,1,10,8,37):new Date(),s=d.getSeconds()+d.getMilliseconds()/1000,m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;
    hh.setAttribute('transform',`rotate(${(h*30).toFixed(2)})`);mh.setAttribute('transform',`rotate(${(m*6).toFixed(2)})`);sh.setAttribute('transform',`rotate(${(s*6).toFixed(2)})`);h4.setAttribute('transform',`rotate(${(((d.getHours()+7)%24+m/60)*15).toFixed(2)})`)};
  hands();if(!k.snap&&!RM)k.loop(hands);
  async function run(){
    c.clear();tk.hidden=true;log.replaceChildren();setModel(0);$$('.smai-td-cal .s',el).forEach(x=>x.classList.remove('hold','dim'));
    await c.bot('Thiên Độ xin chào quý khách. Quý khách muốn xem tận tay mẫu nào tại boutique?');
    const m=await c.ask(M.map(x=>x.n),1);setModel(m);
    await c.bot(`<b>${M[m].n}</b> hiện có tại hai boutique. Quý khách tiện ghé nơi nào hơn?`);
    const B=['Boutique Đồng Khởi, TP.HCM','Boutique Tràng Tiền, Hà Nội'],b=await c.ask(B);
    await c.bot('Tuần này chuyên viên còn ba khung riêng 45 phút, không tiếp khách khác cùng lúc:');
    const t=await c.ask(FREE_T,1);
    $$('.smai-td-cal .free',el).forEach(x=>{const on=+x.dataset.f===t;x.classList.toggle('hold',on);x.classList.toggle('dim',!on)});
    await c.bot('Quý khách có muốn chuẩn bị sẵn dây theo cỡ cổ tay để đeo thử không?',686);
    const S=['Cỡ 16 cm','Cỡ 17,5 cm','Nhờ chuyên viên đo tại chỗ'],s=await c.ask(S,1);
    tk.innerHTML=`<p class="smai-cap">Lịch hẹn riêng</p><b class="smai-big">${FREE_T[t]}</b><span>${B[b]}</span><span>${M[m].n} · ${s<2?'dây '+S[s].toLowerCase():'đo cổ tay tại chỗ'}</span><i>Mã hẹn TD-${2040+m*7+t}</i>`;tk.hidden=false;
    await c.bot(`Lịch đã được giữ: <b>${FREE_T[t]}</b> tại ${B[b].split(',')[0]}. Chuyên viên sẽ để sẵn ${M[m].n} trong khay riêng cho quý khách.`);
    await logAdd(log,['Giữ mẫu trong khay riêng tại boutique','Thêm lịch cho chuyên viên phụ trách','Gửi xác nhận kèm chỉ đường qua Zalo','Nhắc lịch trước một ngày'],k);
    if(k.snap)return;
    await c.ask(['Đặt một lịch khác']);run();
  }
  run();return k.off;
}

/* ═════════ 4 · Hải Miên Yachts — tiếp nhận yêu cầu thuê du thuyền, lập báo giá sơ bộ ═════════ */
function haiMien(el,o){
  const k=K(o);
  const ROUTE=[['nt','Vịnh Nha Trang',1],['pq','Phú Quốc · Nam Du',1.15],['hl','Hạ Long · Lan Hạ',1.08]];
  const BOAT=[{n:'Miên 62',max:8,p:85e6,d:'62 feet · 3 cabin · thủy thủ đoàn 4'},{n:'Miên 88',max:14,p:160e6,d:'88 feet · 5 cabin · thủy thủ đoàn 7'},{n:'Miên 120',max:24,p:320e6,d:'120 feet · 8 cabin · thủy thủ đoàn 12'}];
  const EX=[['chef','Bếp trưởng riêng',12e6,1],['dive','Lặn ngắm san hô',8e6,0],['party','Tiệc hoàng hôn trên boong',25e6,0],['car','Xe đón tận nơi',6e6,0]];
  const st={route:'nt',guests:6,days:1,ex:{}};
  el.innerHTML=`<div class="smai smai-hm">${head('Hải Miên Yachts','Tiếp nhận yêu cầu thuê tàu · báo giá sơ bộ trong vài giây')}
   <div class="smai-g">
    <section class="smai-card smai-hm-f">
     <div class="smai-hm-in"><p class="smai-cap">Tin nhắn của khách · Zalo</p><p class="smai-hm-msg"></p><p class="smai-hm-ai" hidden><i></i>AI đã đọc và điền yêu cầu bên dưới. Bạn chỉnh thử để xem báo giá đổi theo.</p></div>
     <div class="smai-f"><span class="smai-cap">Hải trình</span><div class="smai-opts" data-g="route">${ROUTE.map(r=>`<button type="button" data-v="${r[0]}" aria-pressed="false">${r[1]}</button>`).join('')}</div></div>
     <div class="smai-f two"><label><span class="smai-cap">Số khách <b data-o="guests">6</b></span><input type="range" min="2" max="24" value="6" data-r="guests" aria-label="Số khách"></label>
      <label><span class="smai-cap">Số ngày <b data-o="days">1</b></span><input type="range" min="1" max="7" value="1" data-r="days" aria-label="Số ngày"></label></div>
     <div class="smai-f"><span class="smai-cap">Dịch vụ thêm</span><div class="smai-opts" data-g="ex">${EX.map(x=>`<button type="button" data-v="${x[0]}" aria-pressed="false">${x[1]}</button>`).join('')}</div></div>
    </section>
    <aside class="smai-side"><div class="smai-card smai-hm-q"><p class="smai-cap">Báo giá sơ bộ</p>
      <svg class="smai-hm-boat" viewBox="0 0 200 62" aria-hidden="true"><path class="w" d="M0 54q12.5-6 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0"/><path class="hull" d="M14 40h150q14 0 24-9l-10 15q-4 5-12 5H34q-12 0-20-11z"/><path class="deck" d="M44 40l8-12h66l16 12zM62 28l5-9h40l9 9z"/><path class="mast" d="M88 19V6M88 8h14"/></svg>
      <b class="smai-big" data-o="boat"></b><span data-o="boatd"></span>
      <dl class="smai-hm-lines"></dl>
      <div class="smai-hm-tot"><span>Tổng dự kiến</span><b data-o="total" data-v="0">0đ</b></div>
      <button class="smai-btn" type="button" data-send>Gửi yêu cầu này</button>
      <p class="smai-fine">Giá minh họa cho thương hiệu concept. Chuyên viên xác nhận lịch tàu trước khi chốt.</p></div>
     <ul class="smai-log" aria-label="Việc AI vừa làm"></ul></aside></div></div>`;
  const out=n=>$(`[data-o="${n}"]`,el),lines=$('.smai-hm-lines',el),log=$('.smai-log',el),send=$('[data-send]',el);
  const paint=()=>{
    $$('[data-g="route"] button',el).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===st.route)));
    $$('[data-g="ex"] button',el).forEach(b=>b.setAttribute('aria-pressed',String(!!st.ex[b.dataset.v])));
    ['guests','days'].forEach(n=>{out(n).textContent=st[n];$(`[data-r="${n}"]`,el).value=st[n]});
    const boat=BOAT.find(b=>st.guests<=b.max)||BOAT[2],r=ROUTE.find(x=>x[0]===st.route),base=boat.p*r[2]*st.days;
    const L=[[`Thuê ${boat.n} · ${st.days} ngày · ${r[1]}`,base]];
    EX.forEach(x=>{if(st.ex[x[0]])L.push([x[1]+(x[3]?` · ${st.days} ngày`:''),x[2]*(x[3]?st.days:1)])});
    L.push(['Nhiên liệu, phí bến, bảo hiểm',Math.round(base*.08/1e5)*1e5]);
    out('boat').textContent=boat.n;out('boatd').textContent=boat.d+` · phù hợp ${st.guests} khách`;
    lines.innerHTML=L.map(x=>`<div><dt>${x[0]}</dt><dd>${vnd(x[1])}</dd></div>`).join('');
    k.count(out('total'),L.reduce((a,x)=>a+x[1],0),n=>vnd(Math.round(n/1e5)*1e5));
    $('.smai-hm-boat',el).dataset.s=BOAT.indexOf(boat);
  };
  const dirty=()=>{log.replaceChildren();send.disabled=false;send.textContent='Gửi yêu cầu này'};
  el.addEventListener('click',e=>{const b=e.target.closest('.smai-opts button');
    if(b){const gname=b.parentElement.dataset.g;if(gname==='route')st.route=b.dataset.v;else st.ex[b.dataset.v]=!st.ex[b.dataset.v];dirty();paint();return}
    if(e.target.closest('[data-send]')&&!send.disabled){send.disabled=true;send.textContent='Đã ghi nhận yêu cầu';logAdd(log,['Tạo cơ hội mới trong CRM','Kiểm tra lịch trống của tàu','Gửi báo giá PDF cho khách qua Zalo','Giao chuyên viên gọi lại trong 2 giờ'],k)}});
  el.addEventListener('input',e=>{const r=e.target.dataset&&e.target.dataset.r;if(r){st[r]=+e.target.value;dirty();paint()}});
  (async()=>{
    paint();const msg=$('.smai-hm-msg',el);
    await k.wait(424);await k.type(msg,'“Bên mình muốn thuê du thuyền cho 10 người, đi Phú Quốc 2 ngày cuối tuần sau, cần đầu bếp riêng và một bữa tiệc lúc hoàng hôn.”');
    await k.wait(424);
    for(const f of [()=>{st.route='pq'},()=>{st.guests=10},()=>{st.days=2},()=>{st.ex.chef=true},()=>{st.ex.party=true}]){f();paint();await k.wait(382)}
    $('.smai-hm-ai',el).hidden=false;
    if(k.snap)send.click();
  })();
  return k.off;
}

/* ═════════ 5 · Vọng Nguyệt Residences — phân loại khách tiềm năng mua penthouse, đẩy vào CRM ═════════ */
function vongNguyet(el,o){
  const k=K(o);
  const SRC=['Form website','Zalo','Hotline'],TIER=[['hot','Nóng','Giám đốc kinh doanh gọi trong 15 phút'],['warm','Ấm','Gửi brochure, mời xem căn mẫu'],['cold','Nuôi dưỡng','Chuỗi thư 30 ngày']];
  const LEADS=[
   {s:1,q:'Tìm penthouse 4 phòng ngủ, tài chính 45 đến 60 tỷ, muốn xem nhà trong tháng này.',v:[30,26,18,13]},
   {s:0,q:'Cho xin bảng giá và mặt bằng tầng. Dự định mua trong năm sau.',v:[18,10,14,9]},
   {s:2,q:'Tôi đang ở nước ngoài, cần căn duplex có hồ bơi riêng, thanh toán một lần.',v:[30,22,19,15]},
   {s:0,q:'Em tham khảo cho sếp, chưa rõ ngân sách.',v:[6,6,8,5]},
   {s:1,q:'Gia đình ba thế hệ, cần 5 phòng ngủ, đã xem dự án bên cạnh, muốn so sánh tuần này.',v:[26,27,17,12]},
   {s:2,q:'Quan tâm đầu tư cho thuê, hỏi tỷ suất và tiến độ bàn giao.',v:[20,14,11,10]}];
  const CR=['Ngân sách','Thời điểm','Nhu cầu rõ','Mức tương tác'],MAX=[30,30,20,20];
  el.innerHTML=`<div class="smai smai-vn">${head('Vọng Nguyệt Residences','Chấm điểm khách tiềm năng · tự đẩy vào CRM')}
   <div class="smai-vn-flow"><svg class="smai-vn-svg" aria-hidden="true"></svg>
     <div class="col">${SRC.map((s,i)=>`<div class="nd src" data-n="s${i}"><b>${s}</b></div>`).join('')}</div>
     <div class="col mid"><div class="nd ai" data-n="ai"><i></i><b>AI chấm điểm</b><small>4 tiêu chí · 100 điểm</small></div></div>
     <div class="col">${TIER.map(t=>`<div class="nd out ${t[0]}" data-n="${t[0]}"><b>${t[1]}<em data-c="${t[0]}">0</em></b><small>${t[2]}</small></div>`).join('')}</div></div>
   <div class="smai-g">
    <section class="smai-card smai-vn-lead"><div class="smai-row-h"><p class="smai-cap">Khách đang xét</p><button class="smai-btn" type="button" data-run>Cho một khách mới vào</button></div>
     <p class="smai-vn-q">Bấm nút để xem một khách đi qua luồng.</p>
     <div class="smai-vn-bars">${CR.map((c,i)=>`<div><span>${c}</span><i><u data-b="${i}"></u></i><b data-s="${i}">0/${MAX[i]}</b></div>`).join('')}</div>
     <div class="smai-vn-sc"><span>Điểm</span><b data-v="0">0</b><em></em></div></section>
    <aside class="smai-side"><div class="smai-card"><p class="smai-cap">CRM · khách vừa vào</p><div class="smai-vn-crm"><p class="smai-fine">Chưa có khách nào.</p></div></div></aside></div></div>`;
  const flow=$('.smai-vn-flow',el),svg=$('.smai-vn-svg',el),crm=$('.smai-vn-crm',el),btn=$('[data-run]',el),q=$('.smai-vn-q',el),sc=$('.smai-vn-sc b',el),tierEl=$('.smai-vn-sc em',el);
  const NS='http://www.w3.org/2000/svg',paths={};let n=0,busy=false,code=2046;const cnt={hot:0,warm:0,cold:0};
  const node=id=>$(`[data-n="${id}"]`,flow);
  const draw=()=>{const fr=flow.getBoundingClientRect();if(!fr.width)return;svg.setAttribute('viewBox',`0 0 ${fr.width} ${fr.height}`);svg.replaceChildren();
    const link=(a,b,key)=>{const ra=node(a).getBoundingClientRect(),rb=node(b).getBoundingClientRect(),x1=ra.right-fr.left,y1=ra.top+ra.height/2-fr.top,x2=rb.left-fr.left,y2=rb.top+rb.height/2-fr.top,dx=(x2-x1)*.5;
      const p=document.createElementNS(NS,'path');p.setAttribute('d',`M${x1} ${y1}C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`);svg.append(p);paths[key]=p};
    SRC.forEach((_,i)=>link('s'+i,'ai','s'+i));TIER.forEach(t=>link('ai',t[0],t[0]))};
  const fly=(key,cls)=>{const p=paths[key];if(!p)return Promise.resolve();const L=p.getTotalLength(),dot=document.createElementNS(NS,'circle');dot.setAttribute('r',5);dot.setAttribute('class','dot '+(cls||''));svg.append(dot);p.classList.add('on');
    return k.tween(686,t=>{const pt=p.getPointAtLength(L*t);dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y)}).then(()=>{dot.remove();p.classList.remove('on')})};
  async function lead(){
    if(busy)return;busy=true;btn.disabled=true;
    const l=LEADS[n++%LEADS.length],total=l.v.reduce((a,x)=>a+x,0),t=total>=75?0:total>=45?1:2,T=TIER[t],id='VN-'+(code++);
    $$('[data-b]',el).forEach(u=>u.style.transform='scaleX(0)');$$('[data-s]',el).forEach((b,i)=>b.textContent='0/'+MAX[i]);sc.textContent='0';sc.dataset.v=0;tierEl.textContent='';tierEl.className='';
    node('s'+l.s).classList.add('on');q.textContent='';await k.type(q,`${SRC[l.s]} · ${id}: “${l.q}”`);
    await fly('s'+l.s);node('s'+l.s).classList.remove('on');node('ai').classList.add('on');
    for(let i=0;i<4;i++){$(`[data-b="${i}"]`,el).style.transform=`scaleX(${l.v[i]/MAX[i]})`;$(`[data-s="${i}"]`,el).textContent=l.v[i]+'/'+MAX[i];k.count(sc,l.v.slice(0,i+1).reduce((a,x)=>a+x,0),x=>Math.round(x));await k.wait(382)}
    tierEl.textContent=T[1];tierEl.className=T[0];await k.wait(262);
    node('ai').classList.remove('on');await fly(T[0],T[0]);
    node(T[0]).classList.add('on');cnt[T[0]]++;$(`[data-c="${T[0]}"]`,el).textContent=cnt[T[0]];
    const row=document.createElement('div');row.className='r '+T[0];row.innerHTML=`<b>${id}</b><span>${SRC[l.s]}</span><span class="p">${total} điểm</span><em>${T[1]}</em><small>${T[2]}</small>`;
    const empty=$('.smai-fine',crm);empty&&empty.remove();crm.prepend(row);while(crm.children.length>4)crm.lastChild.remove();
    await k.wait(424);node(T[0]).classList.remove('on');busy=false;btn.disabled=false;
  }
  btn.addEventListener('click',lead);
  let ro=null;if(window.ResizeObserver){ro=new ResizeObserver(draw);ro.observe(flow)}
  (async()=>{await k.wait(262);draw();for(let i=0;i<(k.snap?3:2);i++){await lead();await k.wait(618)}})();
  return()=>{ro&&ro.disconnect();k.off()};
}

/* ═════════ 6 · Ngọc Yên Joaillerie — bảng điều khiển tự báo cáo doanh số cho chủ thương hiệu ═════════ */
function ngocYen(el,o){
  const k=K(o);
  const P={
   day:{l:'Hôm nay',x:['9h','11h','13h','15h','17h','19h','21h'],y:[120,310,280,640,520,910,760],rev:3540e6,orders:14,bespoke:3,back:42,
     b:[['Hà Nội · Tràng Tiền',1380e6],['TP.HCM · Đồng Khởi',1620e6],['Đà Nẵng · Bạch Đằng',540e6]],
     t:'Doanh thu hôm nay đạt 3,54 tỷ, cao hơn thứ Năm tuần trước 18%. Khung 19h đông nhất nhờ buổi xem riêng bộ Sương Mai tại Đồng Khởi. Có 3 đơn đặt chế tác riêng, cần xưởng xác nhận lịch đá trước thứ Hai.',
     a:['Bổ sung 6 nhẫn Sương Mai cỡ 9 cho Đồng Khởi','Nhắc xưởng xác nhận 3 đơn chế tác riêng']},
   week:{l:'7 ngày',x:['T2','T3','T4','T5','T6','T7','CN'],y:[1800,2100,1650,3540,2900,4600,4100],rev:20690e6,orders:83,bespoke:11,back:38,
     b:[['Hà Nội · Tràng Tiền',7240e6],['TP.HCM · Đồng Khởi',10150e6],['Đà Nẵng · Bạch Đằng',3300e6]],
     t:'Bảy ngày qua đạt 20,69 tỷ. Thứ Bảy là ngày cao nhất tuần. Bông tai Nguyệt Lộ bán chậm tại Đà Nẵng ba tuần liền, trong khi Hà Nội đang hết hàng.',
     a:['Điều 8 đôi Nguyệt Lộ từ Đà Nẵng ra Hà Nội','Gửi lời mời xem riêng cho 24 khách chưa quay lại 90 ngày']},
   month:{l:'30 ngày',x:['Tuần 1','Tuần 2','Tuần 3','Tuần 4'],y:[16200,18900,17400,20690],rev:73190e6,orders:301,bespoke:37,back:41,
     b:[['Hà Nội · Tràng Tiền',25600e6],['TP.HCM · Đồng Khởi',35900e6],['Đà Nẵng · Bạch Đằng',11690e6]],
     t:'Ba mươi ngày đạt 73,19 tỷ, tuần gần nhất cao nhất tháng. Đơn chế tác riêng chiếm 12% số đơn nhưng 31% doanh thu. Tỷ lệ khách quay lại giữ ở 41%.',
     a:['Mở thêm 2 buổi tư vấn chế tác riêng mỗi tuần','Lập danh sách 50 khách có giá trị vòng đời cao nhất']}};
  const FEED=[['Nhẫn Sương Mai · kim cương 1 ct',186e6,0],['Vòng tay Trúc Ngân',74e6,1],['Bông tai Nguyệt Lộ',128e6,1],['Dây chuyền Giọt Yên',96e6,2],['Nhẫn cưới đôi Tịnh Yên',142e6,0],['Trâm cài Hạc Sớm · đặt riêng',310e6,1]];
  el.innerHTML=`<div class="smai smai-ny">${head('Ngọc Yên Joaillerie','Bảng điều khiển của chủ thương hiệu · tự báo cáo lúc 7:00')}
   <div class="smai-ny-top"><div class="smai-opts" data-g="p">${Object.keys(P).map(p=>`<button type="button" data-v="${p}" aria-pressed="false">${P[p].l}</button>`).join('')}</div><span class="smai-ny-live"><i></i>Số liệu mô phỏng, tự cập nhật</span></div>
   <div class="smai-kpis big"><div><span>Doanh thu</span><b data-k="rev" data-v="0">0</b></div><div><span>Số đơn</span><b data-k="orders" data-v="0">0</b></div><div><span>Đơn chế tác riêng</span><b data-k="bespoke" data-v="0">0</b></div><div><span>Khách quay lại</span><b data-k="back" data-v="0">0%</b></div></div>
   <div class="smai-g">
    <section class="smai-side"><div class="smai-card"><p class="smai-cap">Doanh thu theo thời gian · triệu đồng</p><svg class="smai-ny-ch" viewBox="0 0 400 150" preserveAspectRatio="none" role="img" aria-label="Biểu đồ doanh thu"><path class="ar"/><path class="ln"/></svg><div class="smai-ny-x"></div></div>
     <div class="smai-card"><p class="smai-cap">Theo boutique</p><div class="smai-ny-b"></div></div></section>
    <aside class="smai-side"><div class="smai-card smai-ny-brief"><p class="smai-cap">Bản tin của trợ lý AI</p><p class="t"></p><p class="smai-cap">Đề xuất việc cần làm</p><ul class="smai-log"></ul></div>
     <div class="smai-card"><p class="smai-cap">Giao dịch mới</p><div class="smai-ny-feed"><p class="smai-fine">Đang chờ giao dịch…</p></div></div></aside></div></div>`;
  const kp=n=>$(`[data-k="${n}"]`,el),ln=$('.ln',el),ar=$('.ar',el),xs=$('.smai-ny-x',el),bs=$('.smai-ny-b',el),brief=$('.smai-ny-brief .t',el),acts=$('.smai-ny-brief .smai-log',el),feed=$('.smai-ny-feed',el);
  let per='day',ys=[],extra=0,ex=[0,0,0],job=0,fi=0;
  const chart=y=>{const mx=Math.max(1,...y)*1.12,pts=y.map((v,i)=>[i*(400/(y.length-1)),140-v/mx*128]);
    let d='M'+pts[0].join(' ');for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],cx=(a[0]+b[0])/2;d+=`C${cx.toFixed(1)} ${a[1].toFixed(1)} ${cx.toFixed(1)} ${b[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`}
    ln.setAttribute('d',d);ar.setAttribute('d',d+'L400 150L0 150Z')};
  const bars=()=>{const d=P[per],v=d.b.map((x,i)=>x[1]+(per==='day'?ex[i]:0)),mx=Math.max(...v);
    bs.innerHTML=d.b.map((x,i)=>`<div><span>${x[0]}</span><i><u style="transform:scaleX(${(v[i]/mx).toFixed(3)})"></u></i><b>${money(v[i])}</b></div>`).join('')};
  async function setPer(p){
    per=p;const d=P[p],my=++job;$$('[data-g="p"] button',el).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===p)));
    k.count(kp('rev'),d.rev+(p==='day'?extra:0),money);k.count(kp('orders'),d.orders+(p==='day'?fi:0),num);k.count(kp('bespoke'),d.bespoke,num);k.count(kp('back'),d.back,n=>Math.round(n)+'%');
    xs.innerHTML=d.x.map(x=>`<span>${x}</span>`).join('');bars();
    const from=ys.length===d.y.length?ys.slice():d.y.map(()=>0);ys=d.y.slice();k.tween(686,t=>chart(from.map((v,i)=>v+(ys[i]-v)*t)));
    acts.replaceChildren();await k.type(brief,d.t);if(my!==job)return;await logAdd(acts,d.a,k);
  }
  el.addEventListener('click',e=>{const b=e.target.closest('[data-g="p"] button');if(b&&b.dataset.v!==per)setPer(b.dataset.v)});
  const sale=()=>{const f=FEED[fi%FEED.length];fi++;extra+=f[1];ex[f[2]]+=f[1];
    const row=document.createElement('div');row.className='r';row.innerHTML=`<span>${f[0]}<small>${P.day.b[f[2]][0]}</small></span><b>+${money(f[1])}</b>`;
    const e0=$('.smai-fine',feed);e0&&e0.remove();feed.prepend(row);while(feed.children.length>3)feed.lastChild.remove();
    if(per==='day'){k.count(kp('rev'),P.day.rev+extra,money);k.count(kp('orders'),P.day.orders+fi,num);bars();
      const from=ys.slice();ys[ys.length-1]+=f[1]/1e6;const to=ys.slice();k.tween(686,t=>chart(from.map((v,i)=>v+(to[i]-v)*t)))}};
  setPer('day').then(()=>{if(k.snap){sale();sale()}});
  k.every(sale,4240);
  return k.off;
}

(window.DL_SAMPLES=window.DL_SAMPLES||{}).ai=[
 {id:'ai-suong-tram',title:'Maison Sương Trầm',industry:'Nước hoa',desc:'Trợ lý concierge hỏi ba câu về sở thích, gợi ý đúng mùi hương của nhà rồi đặt lịch thử tại salon riêng.',tags:['Tư vấn tự động','Đặt lịch','CRM'],pkg:'Tự động hóa quy trình doanh nghiệp — Khởi động',cover:'img/sm-ai-suong-tram.webp',kind:'interactive',mount:suongTram},
 {id:'ai-lam-khue',title:'Atelier Lam Khuê',industry:'Túi xách',desc:'Mỗi sáng AI rà sổ khách thân thiết: nhắc bảo dưỡng túi, mời xem bộ sưu tập riêng, việc nhạy cảm thì chuyển người thật.',tags:['Chăm sóc VIP','Zalo','Quy trình tự động'],pkg:'Tự động hóa quy trình doanh nghiệp — Tăng trưởng',cover:'img/sm-ai-lam-khue.webp',kind:'interactive',mount:lamKhue},
 {id:'ai-thien-do',title:'Thiên Độ Horlogerie',industry:'Đồng hồ',desc:'Lễ tân AI nhận lịch xem đồng hồ tại boutique: chọn mẫu, chọn khung giờ riêng, giữ sẵn mẫu trong khay.',tags:['Đặt lịch','Lịch chuyên viên','Nhắc hẹn'],pkg:'Tự động hóa quy trình doanh nghiệp — Tăng trưởng',cover:'img/sm-ai-thien-do.webp',kind:'interactive',mount:thienDo},
 {id:'ai-hai-mien',title:'Hải Miên Yachts',industry:'Du thuyền',desc:'AI đọc tin nhắn thuê du thuyền, tự điền yêu cầu, chọn tàu phù hợp và lập báo giá sơ bộ trong vài giây.',tags:['Tiếp nhận yêu cầu','Báo giá tự động','CRM'],pkg:'Tự động hóa quy trình doanh nghiệp — Tăng trưởng',cover:'img/sm-ai-hai-mien.webp',kind:'interactive',mount:haiMien},
 {id:'ai-vong-nguyet',title:'Vọng Nguyệt Residences',industry:'Bất động sản',desc:'Khách hỏi mua penthouse từ website, Zalo, hotline được AI chấm điểm, xếp hạng nóng ấm lạnh và đẩy thẳng vào CRM.',tags:['Chấm điểm lead','Luồng tự động','CRM'],pkg:'Tự động hóa quy trình doanh nghiệp — Doanh nghiệp',cover:'img/sm-ai-vong-nguyet.webp',kind:'interactive',mount:vongNguyet},
 {id:'ai-ngoc-yen',title:'Ngọc Yên Joaillerie',industry:'Trang sức',desc:'Bảng điều khiển gom doanh số ba boutique, AI tự viết bản tin mỗi sáng và đề xuất việc cần làm cho chủ thương hiệu.',tags:['Dashboard','Báo cáo tự động','AI agent'],pkg:'Tự động hóa quy trình doanh nghiệp — Doanh nghiệp',cover:'img/sm-ai-ngoc-yen.webp',kind:'interactive',mount:ngocYen}
];
})();
