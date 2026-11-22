/* Phòng mẫu — Motion Graphic. Sáu phim đầu dựng từ ảnh / cảnh quay thật (Pexels) + đồ họa chuyển động bằng code (GSAP, nguồn ở tools/reel3/films/motion-*.js,
   xuất từng khung hình qua Playwright + ffmpeg: H.264 yuv420p, 30fps, nhạc nền tự tổng hợp). Nguồn hình ghi ở tools/reel3/CREDITS.md. Thương hiệu đều là concept của Dream Labs. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).motion = [
  {
    id: 'motion-orvele', title: 'Maison Orvèle — Ambre Minuit', industry: 'Nước hoa',
    desc: 'Quảng cáo nước hoa 8 giây dựng từ ảnh chụp thật: cận cảnh thủy tinh hổ phách, chai nước hoa trong nắng, lớp khói thật phủ lên, máy quay ảo lướt chậm, chữ serif hiện từng ký tự, lặp mượt về đen. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm.',
    tags: ['Quảng cáo sản phẩm', 'Ảnh thật 4K', 'Loop'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-orvele.webp', kind: 'video',
    src: 'media/sm-motion-orvele.mp4?v=r1', poster: 'media/sm-motion-orvele.webp', ratio: '16:9', duration: 8
  },
  {
    id: 'motion-talvere', title: 'Talvère — Arc 28', industry: 'Túi xách',
    desc: 'Phim ra mắt túi cho Reels/TikTok dựng từ cảnh quay và ảnh chụp thật: ba cảnh túi da cam trên nền xám, chữ lớn bật theo nhịp, chuyển cảnh whip và flash, kết bằng tiêu đề và ngày mở bán. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm.',
    tags: ['Ra mắt sản phẩm', 'Reels / TikTok', 'Cảnh quay thật'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-talvere.webp', kind: 'video',
    src: 'media/sm-motion-talvere.mp4?v=r1', poster: 'media/sm-motion-talvere.webp', ratio: '9:16', duration: 8
  },
  {
    id: 'motion-valmere', title: 'Valmère — Logo animation', industry: 'Đồng hồ',
    desc: 'Logo animation 7 giây trên nền bộ máy đồng hồ thật đang chạy: cận cảnh bánh răng và chân kính, vòng logo tự vẽ, mười hai vạch giờ hiện lần lượt, chữ V vẽ bằng nét, chữ thương hiệu có vệt sáng lướt. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm.',
    tags: ['Logo animation', 'Cảnh quay thật', 'Intro thương hiệu'],
    pkg: 'Motion Graphic — Cơ bản',
    cover: 'img/sm-motion-valmere.webp', kind: 'video',
    src: 'media/sm-motion-valmere.mp4?v=r1', poster: 'media/sm-motion-valmere.webp', ratio: '1:1', duration: 7
  },
  {
    id: 'motion-calvente', title: 'Calvente — Đi chậm. Đến xa.', industry: 'Giày',
    desc: 'Kinetic typography 7 giây cho giày thủ công trên ảnh và cảnh quay thật ở xưởng: chữ lớn cắt theo nhịp, chữ "chậm" hiện từng ký tự, "xa" lao vào để lại vệt mờ, số 212 mũi khâu đếm lên, kết bằng đôi giày hoàn thiện. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm. Số liệu minh họa.',
    tags: ['Kinetic typography', 'Reels / TikTok', 'Tiếng Việt đủ dấu'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-calvente.webp', kind: 'video',
    src: 'media/sm-motion-calvente.mp4?v=r1', poster: 'media/sm-motion-calvente.webp', ratio: '9:16', duration: 7
  },
  {
    id: 'motion-thaverine', title: 'Thavérine — Hành trình một viên đá', industry: 'Trang sức',
    desc: 'Infographic 4 chặng chế tác trên ảnh và cảnh quay thật: đá thô, đá đã cắt giác, thợ đính đá trên bàn nghề, chiếc nhẫn hoàn thiện. Số liệu đếm lên, thanh tiến trình chạy theo từng bước. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm. Số liệu minh họa.',
    tags: ['Infographic', 'Explainer', 'Số liệu động'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-thaverine.webp', kind: 'video',
    src: 'media/sm-motion-thaverine.mp4?v=r1', poster: 'media/sm-motion-thaverine.webp', ratio: '16:9', duration: 9.6
  },
  {
    id: 'motion-navelia', title: 'Navélia 62 — Lễ hạ thủy', industry: 'Du thuyền',
    desc: 'Teaser sự kiện 8 giây từ cảnh quay flycam thật: du thuyền giữa vịnh lúc hoàng hôn, thông số đếm lên, la bàn quay về hướng đích rồi nhường chỗ cho tiêu đề và thư mời. Hình từ thư viện Pexels; đồ họa, dựng và màu do Dream Labs làm. Thông số minh họa.',
    tags: ['Teaser sự kiện', 'Thông số động', 'Loop'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-navelia.webp', kind: 'video',
    src: 'media/sm-motion-navelia.mp4?v=r1', poster: 'media/sm-motion-navelia.webp', ratio: '16:9', duration: 8
  },
  {
    id: 'motion-studio3d', title: 'Dream Labs 3D Studio — Sáu vật thật', industry: 'Nội thất',
    desc: 'Phim sản phẩm 3D 17 giây: sáu món đồ quét 3D từ vật thật (Poly Haven, CC0) đặt trên bệ đá viền đồng, máy quay lượn và đẩy sát, ánh sáng lướt qua bề mặt đồng, gốm, sứ, gỗ; chữ tên sản phẩm hiện theo nhịp. Toàn bộ dựng bằng Three.js trong trình duyệt.',
    tags: ['Phim sản phẩm 3D', 'Quét 3D vật thật', 'Ánh sáng studio'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-studio3d.webp', kind: 'video',
    src: 'media/sm-motion-studio3d.mp4?v=a1', poster: 'media/sm-motion-studio3d.webp', ratio: '16:9', duration: 17
  }
];
