/* Lam Kỳ — Trầm Sương · Reels 9:16 nước hoa, 8 giây. Cảnh quay thật (Pexels), dựng: cắt theo nhịp, speed ramp, flash/whip, grade teal – cam, phụ đề động, thẻ kết. */
R3.film({W:1080,H:1920,dur:8,poster:3.9,cover:[1.0,3.9,7.3],
  grade:{filter:'contrast(1.14) saturate(1.22) brightness(.97)',tint:['#063a46','#ffb27a'],tintA:.55,vig:.5,grain:.06},
  shots:[
    {clip:'a',in:0,out:1.6,cam:[[0,0,0,1.02],[1,0,-.01,1.1]]},
    {clip:'b',in:1.6,out:3.1,cam:[[0,0,.02,1.12],[1,0,0,1.02]],tr:{type:'flash',d:.3,color:'#ffe9c8'}},
    {clip:'c',in:3.1,out:4.7,seq:{t:[[0,0],[.5,1.1],[1.6,1.5]]},cam:[[0,0,0,1.0],[1,0,-.015,1.16]],tr:{type:'whip',d:.26}},
    {clip:'d',in:4.7,out:6.1,cam:[[0,.01,0,1.14],[1,-.01,0,1.04]],tr:{type:'flash',d:.3,color:'#ffe9c8'}},
    {clip:'e',in:6.1,out:8,rate:.7,cam:[[0,0,0,1.0],[1,0,-.01,1.08]],tr:{type:'fade',d:.4}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      .bars{left:54px;right:54px;top:54px;display:flex;gap:8px}.bars b{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden;position:relative}.bars u{position:absolute;inset:0;background:#fff;transform-origin:0 50%;transform:scaleX(0)}
      .brand{left:54px;top:88px;font-size:22px;letter-spacing:.34em;text-transform:uppercase;font-weight:500;display:flex;gap:18px;align-items:center}.brand i{width:34px;height:1px;background:#f1d6a4}.brand small{font-size:17px;letter-spacing:.2em;opacity:.75}
      .caps{top:1480px;height:200px}.cap{font-size:68px}
      .end{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:330px;background:linear-gradient(0deg,rgba(4,14,18,0) 45%,rgba(4,14,18,.78) 80%)}
      .end h1{font:500 132px/1 "Playfair Display",serif;letter-spacing:.02em}.end h2{font:italic 400 58px/1.3 "Playfair Display",serif;color:#f1d6a4;margin-top:18px}
      .end p{margin-top:44px;font-size:24px;letter-spacing:.3em;text-transform:uppercase}.end .pill{margin-top:40px;font-size:22px;color:#f1d6a4}`;document.head.appendChild(css);
    const bars=R.el(g,'bars','<b><u></u></b>'.repeat(5));[[0,1.6],[1.6,3.1],[3.1,4.7],[4.7,6.1],[6.1,8]].forEach(([a,b],i)=>tl.fromTo(bars.children[i].firstChild,{scaleX:0},{scaleX:1,duration:b-a,ease:'none'},a));
    R.show(tl,R.el(g,'brand sh','Lam Kỳ<i></i><small>Concept</small>'),.2,6.3,{y:-12});
    const caps=R.el(g,'caps');
    R.subs(tl,caps,[[.25,1.55,'Trầm hương ủ *mười* *năm*'],[1.7,3.05,'gặp sương *sớm* trên đá'],[3.2,4.65,'một giọt, *lưu* *đến* *tối*'],[4.8,6.05,'mát lạnh rồi *ấm* *dần*']]);
    const e=R.el(g,'end sh','<h1>Lam Kỳ</h1><h2>Trầm Sương</h2><p>Extrait de parfum · 50 ml</p><div class="pill">Mở bán 20 · 12</div>');
    R.show(tl,e,6.3,null,{},{d:.5});tl.from(e.children,{y:40,autoAlpha:0,stagger:.12,duration:.6,ease:'power3.out'},6.4);
  }});
