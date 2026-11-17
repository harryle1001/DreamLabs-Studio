// node gen.js → ghi /home/user/dreamlab/js/samples-product.js, chỉ gồm những dòng đã có ĐỦ ảnh trên đĩa (dòng thiếu ảnh bị bỏ qua, in cảnh báo).
const fs=require('fs'),R='/home/user/dreamlab/',P=(l,s)=>`img/sm-product-${l}-${s}.webp`;
const PRO='Thiết kế sản phẩm — Chuyên nghiệp',LUX='Thiết kế sản phẩm — Cao cấp';
const LINES=[
 {line:'perfume',id:'product-khue-lam',title:'Khuê Lam — Extrait de Parfum',industry:'Nước hoa',pkg:LUX,tags:['Dáng chai','Bao bì','Render 3D'],
  desc:'DreamLab thiết kế trọn dòng nước hoa: dáng chai khối thủy tinh dày với khoang chứa bo tròn, nắp đá mài và đai kim loại, chữ in trên kính, hộp giấy vân nắp rời dập nhũ, kèm bộ ảnh 3D cho ba mùi hương.',
  variants:[['amber','Hổ Phách','#d98a1e'],['noir','Dạ Lan','#2d1d6e'],['rose','Sương Hồng','#f0a493']],gallery:['set','detail','box']},
 {line:'bag',id:'product-tinh-van',title:'Tịnh Vân — Túi hộp Vòm',industry:'Túi xách',pkg:LUX,tags:['Dáng túi','Phụ kiện kim loại','Bao bì'],
  desc:'DreamLab thiết kế dáng túi hộp vai vòm với nắp lượn, khóa đĩa tròn, quai cuộn khâu tay và khoen kim loại, phối bốn màu da, cùng hộp cứng, túi vải chống bụi và logo dập nhũ.',
  variants:[['noir','Đen huyền','#161516'],['cognac','Nâu cognac','#8b4a21'],['jade','Lục bảo','#12463a'],['ivory','Kem ngà','#e6dccb']],gallery:['set','detail','box']},
 {line:'shoe',id:'product-vu-hac',title:'Vũ Hạc — Giày cao gót Hạc 95',industry:'Giày',pkg:LUX,tags:['Phom giày','Chất liệu','Hộp giày'],
  desc:'DreamLab thiết kế phom giày mũi nhọn gót 9,5 cm, đường miệng giày khoét thấp, đế da viền mảnh và khâu gót mạ vàng, thể hiện trên ba chất liệu da, kèm hộp giày và logo lót trong.',
  variants:[['noir','Da bóng đen','#0d0d0f'],['nude','Da bê nude','#d3a98c'],['mulberry','Da lộn mận chín','#5a1830']],gallery:['set','detail','box']},
 {line:'watch',id:'product-thien-truc',title:'Thiên Trục — Calibre TT·01',industry:'Đồng hồ',pkg:LUX,tags:['Mặt số','Vỏ & dây','Hộp trưng bày'],
  desc:'DreamLab thiết kế mặt số tia mặt trời với kim giây nhỏ ở 6 giờ, cọc số và kim nổi, vỏ tròn 40 mm, dây da khâu tay, logo và hộp sơn mài lót nhung cho bốn phiên bản.',
  variants:[['blue','Xanh đêm · thép','#16306a'],['ivory','Ngà · vàng hồng','#eadfc8'],['smoke','Khói · titan đen','#3a3b40'],['jade','Lục thẫm · vàng','#14503c']],gallery:['set','detail','box']},
 {line:'jewel',id:'product-anh-trieu',title:'Ánh Triêu — Nhẫn Triêu Dương',industry:'Trang sức',pkg:LUX,tags:['Trang sức','Hộp nhung','Nhận diện'],
  desc:'DreamLab thiết kế mẫu nhẫn đá chủ bốn chấu với hàng đá tấm trên vai nhẫn, hộp vỏ sò bọc da viền kim loại lót nhung, và dấu hiệu mặt trời mọc dập nhũ trong nắp hộp.',
  variants:[['emerald','Lục bảo · vàng 18K','#18a070'],['sapphire','Lam ngọc · bạch kim','#2f55d8'],['diamond','Kim cương · vàng hồng','#f2e3dc'],['ruby','Hồng ngọc · vàng 18K','#c8183e']],gallery:['set','detail','box']},
 {line:'whisky',id:'product-van-son',title:'Vân Sơn — Mạch nha đơn cất',industry:'Rượu & ẩm thực',pkg:LUX,tags:['Dáng chai','Nhãn in nổi','Hộp gỗ'],
  desc:'DreamLab thiết kế dáng chai vai rộng đáy dày, nhãn giấy theo ba độ tuổi ủ, màng co cổ chai, dấu hiệu núi mây và hộp gỗ khắc logo cho dòng rượu mạch nha ủ thùng sồi.',
  variants:[['y12','12 năm · Sồi Mỹ','#d98a1c'],['y18','18 năm · Sherry','#14110f'],['y25','25 năm · Bản giới hạn','#1c2b24']],gallery:['set','detail','box']},
 {line:'candle',id:'product-tinh-da',title:'Tĩnh Dạ — Nến thơm thủ công',industry:'Khác',pkg:PRO,tags:['Nhãn','Hộp quà','Bộ sưu tập'],
  desc:'DreamLab thiết kế cốc nến, nắp kim loại, nhãn chữ và hộp quà nắp rời cho ba mùi hương, mỗi mùi một chất liệu cốc riêng: sứ đen bóng, sứ ngà mờ và thủy tinh hổ phách.',
  variants:[['tram','Trầm hương · sứ đen','#17151a'],['tra','Trà trắng · sứ ngà','#e9e1d2'],['que','Quế cam · thủy tinh','#b5651d']],gallery:['set','detail','box']},
 {line:'skin',id:'product-bach-lien',title:'Bạch Liên Privé — Bộ dưỡng da',industry:'Khác',pkg:LUX,tags:['Bộ bao bì','Thủy tinh mờ','Nhận diện'],
  desc:'DreamLab thiết kế bộ ba bao bì dưỡng da: chai tinh chất ống nhỏ giọt, hũ kem và chai sữa dưỡng vòi nhấn bằng thủy tinh mờ nắp kim loại, nhãn in trực tiếp và hộp bộ quà, phối ba tông màu.',
  variants:[['pearl','Ngọc trai · vàng','#efe9df'],['celadon','Thanh thiên · bạc','#a9c7b8'],['blush','Hoàng hôn · vàng hồng','#e9b9a6']],gallery:['set','detail','box']},
];
const ok=f=>fs.existsSync(R+f),out=[];let total=0,n=0;
for(const L of LINES){const need=[...L.variants.map(v=>P(L.line,v[0])),...L.gallery.map(s=>P(L.line,s))],miss=need.filter(f=>!ok(f));
 if(miss.length){console.log('BỎ QUA',L.line,'thiếu',miss.length,'ảnh:',miss.map(m=>m.replace('img/sm-product-','')).join(' '));continue}
 need.forEach(f=>{total+=fs.statSync(R+f).size;n++});
 out.push({id:L.id,title:L.title,industry:L.industry,desc:L.desc,tags:L.tags,pkg:L.pkg,cover:P(L.line,L.gallery[0]),kind:'product',
  variants:L.variants.map(([k,name,swatch])=>({name,swatch,img:P(L.line,k)})),gallery:L.gallery.map(s=>P(L.line,s))})}
const js=`/* DreamLab — Phòng mẫu, hạng mục Thiết kế sản phẩm (Session P, v3).
   Mẫu concept do DreamLab tự thiết kế và render 3D bằng Three.js; thương hiệu không có thật. Sinh bởi công cụ gen.js của Session P. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).product = ${JSON.stringify(out,null,1).replace(/"([a-zA-Z]+)":/g,'$1:').replace(/"/g,"'")};
`;
fs.writeFileSync(R+'js/samples-product.js',js);console.log('GHI',out.length,'dòng ·',n,'ảnh ·',(total/1024).toFixed(0)+'KB');
