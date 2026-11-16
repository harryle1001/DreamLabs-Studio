/* Phòng mẫu — Edit Video (Session M). Không có footage thật nên "cảnh quay" được dựng bằng code (Three.js / Canvas, nguồn ở tools/reel2/video-*.html),
   rồi mới qua lớp dựng: cắt cảnh theo nhịp, speed ramp, chuyển cảnh, color grading, phụ đề và đồ họa. `before` là cùng khung hình với `poster`
   nhưng ở dạng màu phẳng (log), chưa có đồ họa, để khung phòng mẫu làm thanh so sánh trước/sau. Thương hiệu đều là concept của Dream Labs. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).video = [
  {
    id: 'video-lamky', title: 'Lam Kỳ — Trầm Sương', industry: 'Nước hoa',
    desc: 'Reels 9:16 giới thiệu nước hoa, xem không cần bật tiếng: phụ đề động bật từng từ, năm cảnh cắt theo nhịp, speed ramp ở cận cảnh, whip-pan và flash chuyển cảnh, grade teal – cam, thẻ kết có ngày mở bán. Cảnh quay 3D dựng bằng code.',
    tags: ['Reels 9:16', 'Phụ đề động', 'Color grading'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-lamky.webp', kind: 'video',
    src: 'media/sm-video-lamky.mp4', poster: 'media/sm-video-lamky.webp', ratio: '9:16', duration: 8,
    before: 'img/sm-video-lamky-before.webp'
  },
  {
    id: 'video-belmora', title: 'Belmora — Sienna', industry: 'Túi xách',
    desc: 'TVC 16:9 cho túi da, bản cắt 8 giây: cận cảnh đường khâu và khóa, chi tiết quai, cú lia whip-pan vào toàn cảnh, tiêu đề hiện từng chữ, khung letterbox, grade ấm kiểu nắng chiều và thẻ thương hiệu kết phim. Cảnh quay 3D dựng bằng code.',
    tags: ['TVC 16:9', 'Chuyển cảnh', 'Color grading'],
    pkg: 'Edit Video — Cao cấp',
    cover: 'img/sm-video-belmora.webp', kind: 'video',
    src: 'media/sm-video-belmora.mp4', poster: 'media/sm-video-belmora.webp', ratio: '16:9', duration: 8,
    before: 'img/sm-video-belmora-before.webp'
  },
  {
    id: 'video-nere', title: 'Nère — Lookbook Thu Đông', industry: 'Giày',
    desc: 'Video lookbook dọc 8 giây: dáng người mẫu ngược sáng bước đi, speed ramp nhanh – chậm – nhanh, cận cảnh sản phẩm, màn chia ba cho ba sắc da, slow-motion bước chân, khung chữ và thẻ kết. Cảnh quay dựng bằng code.',
    tags: ['Lookbook 9:16', 'Speed ramp', 'Split screen'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-nere.webp', kind: 'video',
    src: 'media/sm-video-nere.mp4', poster: 'media/sm-video-nere.webp', ratio: '9:16', duration: 8,
    before: 'img/sm-video-nere-before.webp'
  },
  {
    id: 'video-halden', title: 'Halden — Unboxing Réserve 39', industry: 'Đồng hồ',
    desc: 'Video unboxing vuông 7,5 giây: hộp sơn mài mở nắp với speed ramp chậm dần, cận cảnh mặt số và dây da, phụ đề động có ô nhấn từng từ, thanh tiến trình bốn bước, flash theo nhịp và thẻ kết đánh số. Cảnh quay 3D dựng bằng code.',
    tags: ['Unboxing 1:1', 'Phụ đề động', 'Speed ramp'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-halden.webp', kind: 'video',
    src: 'media/sm-video-halden.mp4', poster: 'media/sm-video-halden.webp', ratio: '1:1', duration: 7.5,
    before: 'img/sm-video-halden-before.webp'
  },
  {
    id: 'video-vandinh', title: 'Vân Đỉnh — Penthouse 68', industry: 'Bất động sản',
    desc: 'Video tour penthouse 9 giây: bốn cảnh máy trượt qua phòng khách, góc nghỉ, bàn tiệc rồi lao ra tầm nhìn thành phố, whip-pan nối cảnh, lower-third từng khu, sơ đồ mặt bằng chạy theo máy quay, grade teal – cam lúc chạng vạng. Cảnh quay 3D dựng bằng code.',
    tags: ['Tour bất động sản', 'Lower-third', 'Color grading'],
    pkg: 'Edit Video — Cao cấp',
    cover: 'img/sm-video-vandinh.webp', kind: 'video',
    src: 'media/sm-video-vandinh.mp4', poster: 'media/sm-video-vandinh.webp', ratio: '16:9', duration: 9,
    before: 'img/sm-video-vandinh-before.webp'
  },
  {
    id: 'video-serac', title: 'Maison Sérac — Đêm ra mắt', industry: 'Rượu & ẩm thực',
    desc: 'Recap sự kiện 8 giây: 9 nhát cắt theo nhịp, rack focus vào bảng hiệu, slow-motion khoảnh khắc chạm ly, montage flash, pháo giấy, lower-third theo mốc giờ, grade xanh – vàng điện ảnh và logo kết. Cảnh quay dựng bằng code.',
    tags: ['Recap sự kiện', 'Cắt theo nhịp', 'Lower-third'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-serac.webp', kind: 'video',
    src: 'media/sm-video-serac.mp4', poster: 'media/sm-video-serac.webp', ratio: '16:9', duration: 8,
    before: 'img/sm-video-serac-before.webp'
  }
];
