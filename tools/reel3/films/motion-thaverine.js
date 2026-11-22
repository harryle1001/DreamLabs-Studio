/* Thavérine — Hành trình một viên đá · infographic 16:9, 9,6 giây. Ảnh và cảnh quay thật (Pexels); bốn chặng chế tác, số liệu đếm lên (minh họa), thanh tiến trình. */
R3.film({W:1920,H:1080,dur:9.6,poster:3.4,
  grade:{filter:'contrast(1.1) saturate(1.05) brightness(.8)',tint:['#06201a','#fff0d0'],tintA:.4,vig:.55,grain:.06},
  shots:[
    {photo:'p1',in:0,out:2.3,focus:[.5,.5],cam:[[0,-.05,0,1.12],[1,-.02,0,1.2]],ease:'lin'},
    {photo:'p2',in:2.3,out:4.6,focus:[.5,.5],cam:[[0,-.05,0,1.2],[1,-.03,0,1.1]],ease:'lin',tr:{type:'fade',d:.5}},
    {clip:'a',in:4.6,out:6.9,cam:[[0,-.03,0,1.04],[1,-.03,0,1.1]],tr:{type:'fade',d:.5}},
    {photo:'p4',in:6.9,out:9.6,focus:[.5,.5],cam:[[0,-.06,0,1.1],[1,-.03,0,1.22]],ease:'lin',tr:{type:'fade',d:.5}}],
  build(tl,g,R){
    const css=document.createElement('style');css.textContent=`
      #gfx:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,18,14,0) 35%,rgba(4,18,14,.78) 68%)}
      .hd{left:90px;right:90px;top:70px;display:flex;justify-content:space-between;font-size:16px;letter-spacing:.38em;text-transform:uppercase;color:#e7d3a6}
      .P{left:1120px;top:250px;width:700px}.P small{font-size:17px;letter-spacing:.4em;text-transform:uppercase;color:#e7d3a6}.P h2{font:400 84px/1.05 "Playfair Display",serif;margin-top:14px}
      .P .v{display:flex;align-items:baseline;gap:18px;margin-top:34px}.P .v b{font:400 170px/1 "Playfair Display",serif;color:#e7d3a6}.P .v span{font:italic 400 38px "Playfair Display",serif}
      .P p{margin-top:22px;font-size:23px;line-height:1.55;opacity:.9;max-width:560px}
      .bar{left:90px;right:90px;bottom:84px;display:flex;gap:16px}.bar div{flex:1;padding-top:14px;border-top:2px solid rgba(255,255,255,.25);font-size:14px;letter-spacing:.3em;text-transform:uppercase;opacity:.5;position:relative}
      .bar u{position:absolute;left:0;right:0;top:-2px;height:2px;background:#e7d3a6;transform-origin:0 50%;transform:scaleX(0)}
      .nt{right:90px;bottom:40px;font-size:13px;letter-spacing:.2em;opacity:.6;text-transform:uppercase}`;document.head.appendChild(css);
    R.show(tl,R.el(g,'hd sh','<span>Thavérine · Haute joaillerie</span><span>Concept</span>'),.2,null,{y:-8});R.show(tl,R.el(g,'nt','Số liệu minh họa'),.4,null);
    const steps=[['Bước 01','Tuyển đá',3,'trên 100 viên được giữ lại','Chỉ những viên đá thô trong, đều màu mới đi tiếp.'],['Bước 02','Cắt giác',57,'giác cắt tay','Mỗi giác được mài rồi soi dưới kính lúp.'],['Bước 03','Đính tay',38,'giờ trên bàn thợ','Chấu được nắn từng chút quanh viên đá.'],['Bước 04','Hoàn thiện',1,'chiếc nhẫn, một chủ nhân','Đánh bóng, khắc số và đặt vào hộp.']],cuts=[0,2.3,4.6,6.9,9.6];
    const bar=R.el(g,'bar sh',steps.map((s,i)=>'<div><u></u>0'+(i+1)+' · '+s[1]+'</div>').join(''));R.show(tl,bar,.2,null);
    steps.forEach((s,i)=>{const a=cuts[i]+.25,b=cuts[i+1]-(i<3?.05:.5);const P=R.el(g,'P sh','<small>'+s[0]+'</small><h2>'+s[1]+'</h2><div class="v"><b>0</b><span>'+s[3]+'</span></div><p>'+s[4]+'</p>');
      R.show(tl,P,a,b,{x:40},{d:.5,dOut:.2});tl.from(P.children,{autoAlpha:0,y:24,stagger:.09,duration:.5,ease:'power3.out'},a+.05);R.count(tl,P.querySelector('b'),0,s[2],a+.2,1.1);
      tl.fromTo(bar.children[i].firstChild,{scaleX:0},{scaleX:1,duration:cuts[i+1]-cuts[i],ease:'none'},cuts[i]).to(bar.children[i],{opacity:1,duration:.2},cuts[i])});
  }});
