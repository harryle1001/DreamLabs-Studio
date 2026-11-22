/* Dream Labs — dữ liệu dùng chung (giá, dịch vụ, quy trình). Sửa giá tại đây. Owner: Session B. Giữ nguyên id. */
(()=>{
const ICONS={
 web:'<path d="M3 6.5h20v13H3z"/><path d="M3 10h20M7 8.2h.01M9.5 8.2h.01"/><path d="M9 21.5h8"/>',
 landing:'<path d="M5 3.5h16v19H5z"/><path d="M8 7.5h10M8 11h6"/><rect x="8" y="14.5" width="10" height="4" rx="2"/>',
 video:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M17 11l6-3.5v11L17 15"/>',
 product:'<path d="M13 3l9 5v10l-9 5-9-5V8z"/><path d="M4 8l9 5 9-5M13 13v10"/>',
 motion:'<circle cx="8" cy="13" r="4.5"/><path d="M14 8.5a6.5 6.5 0 0 1 0 9M18 6a10 10 0 0 1 0 14"/>',
 ai:'<rect x="6" y="6" width="14" height="14" rx="3"/><path d="M10 10h6v6h-6zM10 2.5V6M16 2.5V6M10 20v3.5M16 20v3.5M2.5 10H6M2.5 16H6M20 10h3.5M20 16h3.5"/>'
};
const CATS=[
 {id:'ai',name:'Tự động hóa quy trình doanh nghiệp',desc:'Tự động hóa bán hàng, chăm sóc khách hàng, sổ sách kế toán, viết báo cáo và lập kế hoạch bằng AI: doanh nghiệp tăng trưởng nhanh hơn, ít sai sót, tiết kiệm nhân sự.',tag:'AI agent · n8n · CRM',
  tiers:[
   {g:'Không bỏ lỡ khách nhắn ngoài giờ, nhân viên thôi trả lời lặp lại, mọi khách mới nằm gọn trong một bảng.',n:'Khởi động',p:5000000,t:'5–7 ngày',r:'Hỗ trợ 1 tháng',f:['1 quy trình tự động: tiếp nhận và phân loại khách hàng','Trợ lý AI trả lời khách trên Zalo OA / Messenger 24/7','Đồng bộ dữ liệu về Google Sheets',{x:'Kết nối CRM / phần mềm bán hàng'}]},
   {g:'Đơn hàng, chăm sóc khách và báo cáo tự chạy: dữ liệu nhập một lần, đội ngũ dành giờ cho tư vấn và chốt đơn.',n:'Tăng trưởng',p:15000000,t:'14 ngày',r:'Hỗ trợ 3 tháng',hot:1,f:['3 quy trình tự động: đơn hàng, chăm sóc khách hàng, sổ sách và báo cáo','AI tự viết báo cáo tuần, tháng','Kết nối CRM, phần mềm bán hàng, kế toán','Trợ lý AI đa kênh, chuyển nhân viên khi cần','Đào tạo đội ngũ vận hành']},
   {g:'Một hệ thống vận hành riêng: xem số liệu theo thời gian thực, mở rộng quy mô mà không phải tăng người tương ứng.',n:'Doanh nghiệp',p:40000000,plus:1,t:'30+ ngày',r:'Hỗ trợ 12 tháng',f:['AI agent riêng theo nghiệp vụ','Không giới hạn quy trình','Tự động hóa toàn bộ sổ sách công ty','AI viết báo cáo và lập kế hoạch kinh doanh','Dashboard điều hành thời gian thực','Bảo mật dữ liệu nội bộ']}]},
 {id:'web',name:'Website',desc:'Website thương hiệu cao cấp, tải nhanh, chuẩn SEO, tự quản trị nội dung.',tag:'Next.js · CMS · SEO',
  tiers:[
   {g:'Có mặt chuyên nghiệp trên Google và điện thoại trong khoảng 10 ngày, khách tìm thấy và liên hệ được ngay.',n:'Cơ bản',p:8000000,t:'7–10 ngày',r:'4 vòng sửa',f:['5 trang, giao diện theo mẫu tinh chỉnh','Responsive mọi thiết bị','Form liên hệ + nút Zalo','SEO cơ bản, Google Analytics',{x:'Hiệu ứng motion tùy biến'}]},
   {g:'Website riêng đúng tầm thương hiệu, tự đăng bài để có khách từ Google lâu dài, không phụ thuộc người làm.',n:'Chuyên nghiệp',p:18000000,t:'14–21 ngày',r:'9 vòng sửa',hot:1,f:['Đến 10 trang, thiết kế riêng 100%','Motion & chuyển cảnh mượt','CMS tự sửa nội dung, blog','Viết nội dung chuẩn SEO','Tốc độ Lighthouse ≥ 90']},
   {g:'Trải nghiệm đủ khác biệt để định vị cao cấp, bán hàng và tiếp khách trực tuyến, phục vụ cả khách nước ngoài.',n:'Cao cấp',p:35000000,plus:1,t:'30–45 ngày',r:'Không giới hạn trong phạm vi',f:['Không giới hạn trang, đa ngôn ngữ','3D / WebGL, nhận diện thương hiệu số','Tích hợp thanh toán, CRM','Trợ lý AI tiếp khách trên website','Bảo trì 12 tháng']}]},
 {id:'landing',name:'Landing Page',desc:'Một trang duy nhất, tối ưu chuyển đổi cho chiến dịch quảng cáo.',tag:'Ads · A/B test · Pixel',
  tiers:[
   {g:'Có ngay trang đích để chạy quảng cáo và biết mỗi khách tiềm năng đến từ đâu.',n:'Cơ bản',p:3000000,t:'3–5 ngày',r:'4 vòng sửa',f:['1 trang, 6–8 khối nội dung','Form thu lead về Google Sheets','Gắn Facebook Pixel, GA4',{x:'Viết nội dung bán hàng'}]},
   {g:'Nội dung bán hàng viết sẵn, khách để lại số được báo về Zalo để gọi lại khi còn nóng: tận dụng tốt hơn từng đồng quảng cáo.',n:'Chuyên nghiệp',p:6000000,t:'5–7 ngày',r:'9 vòng sửa',hot:1,f:['Thiết kế riêng, 10–12 khối','Viết nội dung bán hàng','Hiệu ứng cuộn, đếm ngược ưu đãi','Thông báo lead qua Zalo/Email']},
   {g:'Quyết định bằng số liệu thật: thử hai phiên bản, theo dõi hằng tuần, tối ưu lại sau 30 ngày.',n:'Cao cấp',p:12000000,t:'7–10 ngày',r:'18 vòng sửa',f:['2 phiên bản để A/B test','Motion graphic trên trang','Báo cáo chuyển đổi hằng tuần','Tối ưu lại sau 30 ngày']}]},
 {id:'video',name:'Edit Video',desc:'Dựng video quảng cáo, TikTok, Reels, YouTube từ footage của bạn.',tag:'Reels · TikTok · YouTube',
  tiers:[
   {g:'Video gọn gàng, có phụ đề để đăng đều đặn mà không mất thời gian tự dựng.',n:'Cơ bản',p:800000,u:'/video',t:'2 ngày',r:'4 vòng sửa',f:['Video ngắn ≤ 60 giây','Cắt ghép, nhạc nền, phụ đề','Chỉnh màu cơ bản',{x:'Motion text & hiệu ứng'}]},
   {g:'Video giữ người xem tới cuối, dựng một lần dùng được cho TikTok, Reels và YouTube.',n:'Chuyên nghiệp',p:2000000,u:'/video',t:'3–4 ngày',r:'9 vòng sửa',hot:1,f:['Video ≤ 3 phút','Phụ đề động, motion text','Color grading điện ảnh','Xuất 3 tỷ lệ 9:16, 1:1, 16:9']},
   {g:'Video quảng cáo chỉn chu kèm 5 clip ngắn: đủ nội dung cho cả một chiến dịch.',n:'Cao cấp',p:5000000,u:'/video',t:'5–7 ngày',r:'18 vòng sửa',f:['Video ≤ 10 phút hoặc TVC','Kịch bản dựng + sound design','VFX, chèn đồ họa 3D','Bộ 5 clip cắt ngắn đi kèm']}]},
 {id:'product',name:'Thiết kế sản phẩm',desc:'Bao bì, nhãn mác, nhận diện và mockup 3D sẵn sàng in ấn.',tag:'Bao bì · Logo · 3D mockup',
  tiers:[
   {g:'Nhãn, bao bì đủ chuẩn để in ngay, sản phẩm trông đáng tin hơn trên kệ và trên ảnh.',n:'Cơ bản',p:2000000,t:'3–5 ngày',r:'4 vòng sửa',f:['1 mẫu nhãn hoặc bao bì','2 phương án ý tưởng','File in ấn chuẩn CMYK',{x:'Mockup 3D'}]},
   {g:'Bộ bao bì đồng bộ kèm mockup 3D: có ảnh quảng cáo trước cả khi in, làm việc với nhà in suôn sẻ.',n:'Chuyên nghiệp',p:5000000,t:'7 ngày',r:'9 vòng sửa',hot:1,f:['Bộ bao bì đến 3 kích thước','3 phương án ý tưởng','Mockup 3D cho quảng cáo','Hỗ trợ làm việc với nhà in']}]},
 {id:'motion',name:'Motion Graphic',desc:'Video hoạt họa giải thích sản phẩm, logo animation, intro thương hiệu.',tag:'2D · 3D · Logo animation',
  tiers:[
   {g:'Một video logo chuyển động hoặc intro ngắn giúp mọi video của thương hiệu trông chuyên nghiệp.',n:'Cơ bản',p:2000000,u:'/video',t:'4–5 ngày',r:'4 vòng sửa',f:['1 video: logo animation hoặc ≤ 15 giây','Nhạc nền bản quyền','Xuất 2 tỷ lệ',{x:'Lồng tiếng'}]},
   {g:'Bộ 3 video ngắn cho quảng cáo và mạng xã hội, cùng phong cách, khách nắm được giá trị sản phẩm trong vài giây.',n:'Chuyên nghiệp',p:5000000,u:'/3 video',t:'7–10 ngày',r:'9 vòng sửa',hot:1,f:['3 video, mỗi video ≤ 30 giây','Kịch bản + storyboard','Nhạc nền bản quyền','Lồng tiếng AI','Xuất 3 tỷ lệ (9:16, 1:1, 16:9)']}]}
];
// gói Cao cấp cho Thiết kế sản phẩm
CATS.find(c=>c.id==='product').tiers.push({g:'Cả dòng sản phẩm chung một nhận diện, có brand guideline để mọi ấn phẩm sau này nhất quán.',n:'Cao cấp',p:12000000,t:'14 ngày',r:'18 vòng sửa',f:['Nhận diện thương hiệu đầy đủ + logo','Bộ bao bì cả dòng sản phẩm','Render 3D quảng cáo chất lượng cao','Brand guideline PDF']});
const STEPS=[
 ['Khám phá','Gọi 30 phút để hiểu thương hiệu, khách hàng và mục tiêu. Bạn nhận bản brief tóm tắt.','1–2 ngày'],
 ['Ý tưởng & moodboard','Hai đến ba hướng thẩm mỹ để bạn chọn trước khi bắt tay thiết kế chi tiết.','2–4 ngày'],
 ['Thiết kế & dựng','Thiết kế giao diện, dựng video hoặc xây quy trình AI. Cập nhật tiến độ mỗi 3 ngày.','Theo gói'],
 ['Tinh chỉnh','Chỉnh sửa theo góp ý trong số vòng của gói. Kiểm thử trên điện thoại thật.','2–5 ngày'],
 ['Bàn giao & đồng hành','Bàn giao mã nguồn, file gốc, hướng dẫn sử dụng. Bảo hành và hỗ trợ sau dự án.','Từ 6 tháng']
];
/* g: doanh nghiệp được gì từ gói (hiện ở thẻ giá) */
window.DL_DATA={ICONS,CATS,STEPS};
})();
/* Bảng so sánh chi tiết từng hạng mục (Session A thêm; dùng ở phần Báo giá). Mỗi dòng: [nhãn, gói 1, gói 2, gói 3]; 1 = có, 0 = không, chuỗi = ghi chú. */
(()=>{
window.DL_DATA.CMP={
 web:[['Số trang','5 trang','Đến 10 trang','Không giới hạn'],['Thiết kế giao diện','Theo mẫu tinh chỉnh','Riêng 100%','Riêng 100% + nhận diện số'],['Responsive mọi thiết bị',1,1,1],['SEO cơ bản, Google Analytics',1,1,1],['Motion & chuyển cảnh',0,1,'3D / WebGL'],['CMS tự sửa nội dung, blog',0,1,1],['Viết nội dung chuẩn SEO',0,1,1],['Tốc độ Lighthouse ≥ 90',0,1,1],['Đa ngôn ngữ',0,0,1],['Thanh toán online, CRM',0,0,1],['Trợ lý AI tiếp khách trên website',0,0,1],['Bảo hành / bảo trì','6 tháng','6 tháng','12 tháng']],
 landing:[['Số khối nội dung','6–8 khối','10–12 khối','Theo chiến dịch'],['Thiết kế','Theo mẫu tinh chỉnh','Riêng 100%','Riêng 100%, 2 phiên bản'],['Form thu lead về Google Sheets',1,1,1],['Facebook Pixel, GA4',1,1,1],['Viết nội dung bán hàng',0,1,1],['Hiệu ứng cuộn, đếm ngược ưu đãi',0,1,1],['Thông báo lead qua Zalo / Email',0,1,1],['A/B test',0,0,1],['Motion graphic trên trang',0,0,1],['Báo cáo chuyển đổi hằng tuần',0,0,1],['Tối ưu lại sau 30 ngày',0,0,1]],
 video:[['Độ dài video','≤ 60 giây','≤ 3 phút','≤ 10 phút hoặc TVC'],['Cắt ghép, nhạc nền, phụ đề',1,1,1],['Chỉnh màu','Cơ bản','Color grading điện ảnh','Color grading điện ảnh'],['Phụ đề động, motion text',0,1,1],['Xuất nhiều tỷ lệ','1 tỷ lệ','9:16, 1:1, 16:9','9:16, 1:1, 16:9'],['Kịch bản dựng',0,0,1],['Sound design',0,0,1],['VFX, đồ họa 3D',0,0,1],['Clip cắt ngắn đi kèm',0,0,'5 clip']],
 product:[['Phạm vi','1 mẫu nhãn hoặc bao bì','Bộ bao bì đến 3 kích thước','Cả dòng sản phẩm'],['Phương án ý tưởng','2 phương án','3 phương án','3 phương án'],['File in ấn chuẩn CMYK',1,1,1],['Mockup 3D',0,'Cho quảng cáo','Render chất lượng cao'],['Hỗ trợ làm việc với nhà in',0,1,1],['Logo + nhận diện thương hiệu',0,0,1],['Brand guideline PDF',0,0,1]],
 motion:[['Số video','1','3'],['Độ dài','Logo animation hoặc ≤ 15 giây','≤ 30 giây mỗi video'],['Phong cách','2D','2D, minh họa'],['Nhạc nền bản quyền',1,1],['Kịch bản + storyboard',0,1],['Lồng tiếng',0,'AI'],['Xuất nhiều tỷ lệ','2 tỷ lệ','3 tỷ lệ']],
 ai:[['Trợ lý AI tiếp nhận khách','1 kênh Zalo / Messenger','Đa kênh + chuyển nhân viên','AI agent riêng theo nghiệp vụ'],['Huấn luyện theo dữ liệu sản phẩm',1,1,1],['Đẩy lead về Google Sheets',1,1,1],['Quy trình tự động',0,'3 quy trình','Không giới hạn'],['Tích hợp CRM / phần mềm bán hàng',0,1,1],['Đào tạo đội ngũ sử dụng',0,1,1],['Dashboard số liệu thời gian thực',0,0,1],['Bảo mật dữ liệu nội bộ',0,0,1]]
};
})();
