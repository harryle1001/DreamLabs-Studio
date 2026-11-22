/* Nère — Lookbook Thu Đông · video dọc 9:16, 8 giây. Cảnh quay thật 50 khung/giây (Pexels); dựng: speed ramp nhanh – chậm – nhanh, slow-motion bước chân, cận cảnh, khung chữ, thẻ kết. */
R3.film({W:1080,H:1920,dur:8,poster:2.8,cover:[.9,2.8,7.3],
  grade:{filter:'contrast(1.1) saturate(1.08) brightness(1.0)',tint:['#1d2a22','#ffd7a8'],tintA:.45,vig:.4,grain:.07},
  shots:[
    {clip:'a',in:0,out:1.7,seq:{t:[[0,0],[.5,1.2],[1.3,1.5],[1.7,2.3]],blend:true},cam:[[0,0,0,1.0],[1,0,.01,1.06]]},
    {clip:'b',in:1.7,out:3.3,rate:.4,cam:[[0,0,0,1.0],[1,0,.02,1.08]],tr:{type:'zoom',d:.3}},
    {clip:'c',in:3.3,out:4.6,seq:{t:[[0,0],[.4,1.1],[1.3,1.5]],blend:true},cam:[[0,0,0,1.04],[1,0,0,1.0]],tr:{type:'flash',d:.2,a:.5}},
    {clip:'d',in:4.6,out:6.1,rate:.45,cam:[[0,0,0,1.0],[1,0,0,1.07]],tr:{type:'whip',d:.24}},
    {clip:'e',in:6.1,out:8,seq:{t:[[0,0],[.5,1.3],[1.9,2.1]],blend:true},cam:[[0,0,0,1.06],[1,0,0,1.0]],tr:{type:'fade',d:.3}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .fr{inset:44px;border:1px solid rgba(255,255,255,.55)}
      .tp{left:84px;right:84px;top:88px;display:flex;justify-content:space-between;font-size:20px;letter-spacing:.3em;text-transform:uppercase}
      .no{right:84px;bottom:330px;font:italic 400 210px/1 "Playfair Display",serif;opacity:.9}
      .l3{left:84px;bottom:150px;font:500 60px/1.1 "Playfair Display",serif}.l3 small{font:500 20px "Be Vietnam Pro"}
      .sp{left:84px;top:150px;font-size:19px;letter-spacing:.3em;text-transform:uppercase;display:flex;gap:14px;align-items:center}.sp i{display:block;width:120px;height:3px;background:rgba(255,255,255,.3);position:relative}.sp i u{position:absolute;inset:0;background:#fff;transform-origin:0 50%}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(14,16,12,.42)}
      .end h1{font:500 190px/1 "Playfair Display",serif;letter-spacing:.06em}.end p{margin-top:26px;font-size:24px;letter-spacing:.4em;text-transform:uppercase}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'fr'),.2,null,{scale:1.03});
    R.show(tl,R.el(g,'tp sh','<span>Nère</span><span>Lookbook · Concept</span>'),.3,6.4,{y:-10});
    [[.3,1.65,'01','Bốt cao cổ','Da bê đen'],[1.85,3.25,'02','Từng bước','Slow-motion 40%'],[3.45,4.55,'03','Dáng đứng','Gót vuông 4 cm'],[4.8,6.05,'04','Da lộn nâu','Đi giữa cỏ thu']].forEach(([a,b,n,t,s])=>{
      R.show(tl,R.el(g,'no serif sh',n),a,b,{y:60},{d:.5});R.show(tl,R.el(g,'l3 sh','<small>'+s+'</small><span>'+t+'</span>'),a+.1,b,{x:-30})});
    const sp=R.el(g,'sp sh','<span>Tốc độ</span><i><u></u></i><b></b>');const u=sp.querySelector('u'),lab=sp.querySelector('b');R.show(tl,sp,.3,6.2);
    [[0,1],[.5,.35],[1.3,1],[1.7,.4],[3.3,1],[3.7,.45],[4.6,.45],[6.1,1]].forEach(([t,v])=>tl.to(u,{scaleX:v,duration:.25,ease:'power2.out',onStart:()=>{lab.textContent=Math.round(v*100)+'%'}},t));
    const e=R.el(g,'end sh','<h1>Nère</h1><p>Thu Đông · Bộ sưu tập mới</p>');R.show(tl,e,6.5,null,{},{d:.5});tl.from(e.children,{y:40,autoAlpha:0,stagger:.14,duration:.6,ease:'power3.out'},6.55);
  }});
