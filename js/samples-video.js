/* Phòng mẫu — Edit Video. Cảnh quay thật từ thư viện Pexels (nguồn ở tools/reel3/CREDITS.md), qua lớp dựng của Dream Labs (tools/reel3/films/video-*.js):
   cắt cảnh theo nhịp, speed ramp, chuyển cảnh, color grading, phụ đề và đồ họa. `before` là cùng khung hình với `poster` ở dạng màu phẳng (log),
   chưa có đồ họa, để khung phòng mẫu làm thanh so sánh trước/sau. Thương hiệu đều là concept của Dream Labs. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).video = [
  {
    id: 'video-lamky', title: 'Lam Kỳ — Trầm Sương', industry: 'Nước hoa',
    desc: 'Reels 9:16 giới thiệu nước hoa từ cảnh quay thật, xem không cần bật tiếng: phụ đề động bật từng từ, năm cảnh cắt theo nhịp, speed ramp ở cận cảnh, whip-pan và flash chuyển cảnh, grade teal – cam, thẻ kết có ngày mở bán. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['Reels 9:16', 'Phụ đề động', 'Color grading'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-lamky.webp', kind: 'video',
    src: 'media/sm-video-lamky.mp4?v=r1', poster: 'media/sm-video-lamky.webp', ratio: '9:16', duration: 8,
    before: 'img/sm-video-lamky-before.webp'
  },
  {
    id: 'video-belmora', title: 'Belmora — Sienna', industry: 'Túi xách',
    desc: 'TVC 16:9 cho túi da, bản cắt 8 giây từ cảnh quay thật ở xưởng: trải da, cắt, khâu chỉ sáp, miết cạnh, cài khóa đồng rồi tới chiếc túi hoàn thiện; lower-third từng công đoạn, whip-pan, tiêu đề hiện từng chữ, khung letterbox, grade ấm kiểu nắng chiều và thẻ thương hiệu kết phim. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['TVC 16:9', 'Chuyển cảnh', 'Color grading'],
    pkg: 'Edit Video — Cao cấp',
    cover: 'img/sm-video-belmora.webp', kind: 'video',
    src: 'media/sm-video-belmora.mp4?v=r1', poster: 'media/sm-video-belmora.webp', ratio: '16:9', duration: 8,
    before: 'img/sm-video-belmora-before.webp'
  },
  {
    id: 'video-nere', title: 'Nère — Lookbook Thu Đông', industry: 'Giày',
    desc: 'Video lookbook dọc 8 giây từ cảnh quay thật 50 khung/giây: người mẫu đi bốt cao cổ giữa công viên mùa thu, speed ramp nhanh – chậm – nhanh, slow-motion bước chân, cận cảnh, thanh tốc độ chạy theo, khung chữ và thẻ kết. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['Lookbook 9:16', 'Speed ramp', 'Slow-motion'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-nere.webp', kind: 'video',
    src: 'media/sm-video-nere.mp4?v=r1', poster: 'media/sm-video-nere.webp', ratio: '9:16', duration: 8,
    before: 'img/sm-video-nere-before.webp'
  },
  {
    id: 'video-halden', title: 'Halden — Unboxing Réserve 39', industry: 'Đồng hồ',
    desc: 'Video unboxing vuông 7,5 giây từ cảnh quay thật: hộp gỗ mở nắp với speed ramp chậm dần, đồng hồ lên tay, cận cảnh mặt số và dây da, phụ đề động có ô nhấn từng từ, thanh tiến trình bốn bước, flash theo nhịp và thẻ kết. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['Unboxing 1:1', 'Phụ đề động', 'Speed ramp'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-halden.webp', kind: 'video',
    src: 'media/sm-video-halden.mp4?v=r1', poster: 'media/sm-video-halden.webp', ratio: '1:1', duration: 7.5,
    before: 'img/sm-video-halden-before.webp'
  },
  {
    id: 'video-vandinh', title: 'Vân Đỉnh — Penthouse 68', industry: 'Bất động sản',
    desc: 'Video tour căn hộ 9 giây từ cảnh quay gimbal thật: máy trượt qua bếp mở, phòng khách, bàn tiệc, hiên, phòng ngủ rồi ra tầm nhìn thành phố lúc chạng vạng; whip-pan nối cảnh, lower-third từng khu, thanh hành trình sáu chặng, grade teal – cam. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['Tour bất động sản', 'Lower-third', 'Color grading'],
    pkg: 'Edit Video — Cao cấp',
    cover: 'img/sm-video-vandinh.webp', kind: 'video',
    src: 'media/sm-video-vandinh.mp4?v=r1', poster: 'media/sm-video-vandinh.webp', ratio: '16:9', duration: 9,
    before: 'img/sm-video-vandinh-before.webp'
  },
  {
    id: 'video-serac', title: 'Maison Sérac — Đêm ra mắt', industry: 'Rượu & ẩm thực',
    desc: 'Recap sự kiện 8 giây từ cảnh quay thật: bảy nhát cắt theo nhịp, slow-motion khoảnh khắc chạm ly và pháo giấy, flash chuyển cảnh, lower-third theo mốc giờ, khung letterbox, grade xanh – vàng điện ảnh và logo kết. Cảnh quay từ thư viện Pexels; dựng, chỉnh màu và đồ họa do Dream Labs làm.',
    tags: ['Recap sự kiện', 'Cắt theo nhịp', 'Lower-third'],
    pkg: 'Edit Video — Chuyên nghiệp',
    cover: 'img/sm-video-serac.webp', kind: 'video',
    src: 'media/sm-video-serac.mp4?v=r1', poster: 'media/sm-video-serac.webp', ratio: '16:9', duration: 8,
    before: 'img/sm-video-serac-before.webp'
  }
];
