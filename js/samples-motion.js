/* Phòng mẫu — Motion Graphic (Session M). Mỗi phim dựng 100% bằng code (GSAP timeline, nguồn ở tools/reel2/motion-*.html),
   xuất từng khung hình qua Playwright + ffmpeg (H.264 yuv420p, 30fps, không tiếng). Thương hiệu đều là concept của DreamLab. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).motion = [
  {
    id: 'motion-orvele', title: 'Maison Orvèle — Ambre Minuit', industry: 'Nước hoa',
    desc: 'Quảng cáo nước hoa 8 giây: chai thủy tinh dạng vòm vẽ bằng SVG, ánh sáng lướt qua thân chai, 377 hạt hương bung theo phyllotaxis (góc vàng 137,5°), chữ serif hiện từng ký tự. Lặp mượt về đen.',
    tags: ['Quảng cáo sản phẩm', 'Phyllotaxis', 'Loop'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-orvele.webp', kind: 'video',
    src: 'media/sm-motion-orvele.mp4', poster: 'media/sm-motion-orvele.webp', ratio: '16:9', duration: 8
  },
  {
    id: 'motion-talvere', title: 'Talvère — Arc 28', industry: 'Túi xách',
    desc: 'Phim ra mắt túi cho Reels/TikTok: hình tròn + chữ nhật dựng thành thân túi, đường khâu và quai tự vẽ, khóa kim loại lóe sáng, chuyển ba màu da, kết bằng tiêu đề và ngày mở bán.',
    tags: ['Ra mắt sản phẩm', 'Reels / TikTok', 'Đổi màu'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-talvere.webp', kind: 'video',
    src: 'media/sm-motion-talvere.mp4', poster: 'media/sm-motion-talvere.webp', ratio: '9:16', duration: 8
  },
  {
    id: 'motion-valmere', title: 'Valmère — Logo animation', industry: 'Đồng hồ',
    desc: 'Logo animation 7 giây: vành phút bung từ một điểm, năm bánh răng ăn khớp đúng tỷ số truyền, kim chạy tua nhanh dừng ở 10:10 rồi morph thành chữ V trong vòng logo, chữ thương hiệu có vệt sáng lướt.',
    tags: ['Logo animation', 'Morph', 'Intro thương hiệu'],
    pkg: 'Motion Graphic — Cơ bản',
    cover: 'img/sm-motion-valmere.webp', kind: 'video',
    src: 'media/sm-motion-valmere.mp4', poster: 'media/sm-motion-valmere.webp', ratio: '1:1', duration: 7
  },
  {
    id: 'motion-calvente', title: 'Calvente — Đi chậm. Đến xa.', industry: 'Giày',
    desc: 'Kinetic typography 7 giây cho giày thủ công: năm cảnh chữ lớn cắt theo nhịp, chữ "chậm" hiện từng ký tự, "xa" để lại vệt, số 212 mũi khâu đếm lên, dáng giày derby tự vẽ bằng nét.',
    tags: ['Kinetic typography', 'Reels / TikTok', 'Tiếng Việt đủ dấu'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-calvente.webp', kind: 'video',
    src: 'media/sm-motion-calvente.mp4', poster: 'media/sm-motion-calvente.webp', ratio: '9:16', duration: 7
  },
  {
    id: 'motion-thaverine', title: 'Thavérine — Hành trình một viên đá', industry: 'Trang sức',
    desc: 'Infographic giải thích 4 chặng chế tác: tuyển đá, cắt 57 giác, đính tay 38 giờ, hoàn thiện. Viên đá thô biến hình thành giác cắt, số liệu đếm lên, thanh tiến trình chạy theo từng bước. Số liệu minh họa.',
    tags: ['Infographic', 'Explainer', 'Số liệu động'],
    pkg: 'Motion Graphic — Cao cấp',
    cover: 'img/sm-motion-thaverine.webp', kind: 'video',
    src: 'media/sm-motion-thaverine.mp4', poster: 'media/sm-motion-thaverine.webp', ratio: '16:9', duration: 9.6
  },
  {
    id: 'motion-navelia', title: 'Navélia 62 — Lễ hạ thủy', industry: 'Du thuyền',
    desc: 'Teaser sự kiện 8 giây: hoàng hôn trên vịnh, du thuyền lướt ngang, mặt nước lấp lánh theo phối cảnh, la bàn quay về góc 137,5°, thông số đếm lên rồi nhường chỗ cho tiêu đề và thư mời.',
    tags: ['Teaser sự kiện', 'Thông số động', 'Loop'],
    pkg: 'Motion Graphic — Chuyên nghiệp',
    cover: 'img/sm-motion-navelia.webp', kind: 'video',
    src: 'media/sm-motion-navelia.mp4', poster: 'media/sm-motion-navelia.webp', ratio: '16:9', duration: 8
  }
];
