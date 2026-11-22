/* Vân Đỉnh — Penthouse 68 · video tour 16:9, 9 giây. Cảnh quay thật bằng gimbal (Pexels); dựng: whip-pan nối cảnh, lower-third từng khu, thanh hành trình, grade teal – cam lúc chạng vạng, thẻ kết. */
R3.film({W:1920,H:1080,dur:9,poster:1.0,
  grade:{filter:'contrast(1.1) saturate(1.18) brightness(.99)',tint:['#07303c','#ffc38a'],tintA:.42,vig:.36,grain:.05},
  shots:[
    {clip:'a',in:0,out:1.7,cam:[[0,0,0,1.02],[1,0,0,1.06]]},
    {clip:'b',in:1.7,out:3.2,cam:[[0,0,0,1.02],[1,0,0,1.06]],tr:{type:'whip',d:.26}},
    {clip:'c',in:3.2,out:4.7,cam:[[0,0,0,1.02],[1,0,0,1.06]],tr:{type:'whip',d:.26,dir:-1}},
    {clip:'d',in:4.7,out:5.9,cam:[[0,0,0,1.02],[1,0,0,1.05]],tr:{type:'whip',d:.26}},
    {clip:'e',in:5.9,out:7.1,cam:[[0,0,0,1.02],[1,0,0,1.05]],tr:{type:'whip',d:.26,dir:-1}},
    {clip:'f',in:7.1,out:9,seq:{t:[[0,0],[1.9,2.9]]},cam:[[0,0,0,1.0],[1,0,0,1.08]],tr:{type:'flash',d:.3,color:'#ffdcb0',a:.7}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .hd{left:80px;right:80px;top:64px;display:flex;justify-content:space-between;font-size:17px;letter-spacing:.34em;text-transform:uppercase}
      .l3{left:80px;bottom:150px;font:500 62px/1.1 "Playfair Display",serif}.l3 small{font:500 18px "Be Vietnam Pro"}.l3 p{font:400 22px "Be Vietnam Pro";opacity:.9;margin-top:6px}
      .rt{left:80px;right:80px;bottom:72px;display:flex;gap:12px}.rt div{flex:1;font-size:14px;letter-spacing:.24em;text-transform:uppercase;padding-top:12px;border-top:2px solid rgba(255,255,255,.3);opacity:.5;position:relative}
      .rt u{position:absolute;left:0;right:0;top:-2px;height:2px;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(4,16,22,.25),rgba(4,16,22,.7))}
      .end h1{font:500 132px/1 "Playfair Display",serif}.end h1 em{color:#f3d3a0;font-style:italic}.end p{margin-top:26px;font-size:20px;letter-spacing:.42em;text-transform:uppercase}.end .pill{margin-top:36px;font-size:17px}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd sh','<span>Vân Đỉnh</span><span>Penthouse 68 · Concept</span>'),.25,7.3,{y:-10});
    const names=['Bếp mở','Phòng khách','Bàn tiệc','Hiên','Phòng ngủ','Tầm nhìn'],cuts=[0,1.7,3.2,4.7,5.9,7.1,9];
    const rt=R.el(g,'rt sh',names.map(n=>'<div><u></u>'+n+'</div>').join(''));R.show(tl,rt,.25,7.5);
    names.forEach((n,i)=>tl.fromTo(rt.children[i].firstChild,{scaleX:0},{scaleX:1,duration:cuts[i+1]-cuts[i],ease:'none'},cuts[i]).to(rt.children[i],{opacity:1,duration:.2},cuts[i]));
    [['Bếp mở','Đảo bếp đá liền khối','01'],['Phòng khách','Trần cao, kính suốt ba mặt','02'],['Bàn tiệc','Mười hai chỗ dưới đèn chùm','03'],['Hiên','Nối liền không gian trong – ngoài','04'],['Phòng ngủ chính','Đón nắng cuối ngày','05']].forEach(([t,s,n],i)=>{
      R.show(tl,R.el(g,'l3 sh','<small>'+n+' / 06</small><span>'+t+'</span><p>'+s+'</p>'),cuts[i]+.3,cuts[i+1]-.05,{x:-40},{d:.4,dOut:.16})});
    const e=R.el(g,'end sh','<h1>Tầng <em>sáu mươi tám</em></h1><p>Vân Đỉnh · Penthouse</p><div class="pill">Đặt lịch xem riêng</div>');R.show(tl,e,7.5,null,{},{d:.5});tl.from(e.children,{y:36,autoAlpha:0,stagger:.14,duration:.6,ease:'power3.out'},7.55);
  }});
