/* Dream Labs — Phòng mẫu, hạng mục Thiết kế sản phẩm (Session P, v3).
   Mẫu concept do Dream Labs tự thiết kế và render 3D bằng Three.js; thương hiệu không có thật. Sinh bởi công cụ gen.js của Session P. */
(window.DL_SAMPLES = window.DL_SAMPLES || {}).product = [
 {
  id: 'product-khue-lam',
  title: 'Khuê Lam — Extrait de Parfum',
  industry: 'Nước hoa',
  desc: 'Dream Labs thiết kế trọn dòng nước hoa: dáng chai khối thủy tinh dày với khoang chứa bo tròn, nắp đá mài và đai kim loại, chữ in trên kính, hộp giấy vân nắp rời dập nhũ, kèm bộ ảnh 3D cho ba mùi hương.',
  tags: [
   'Dáng chai',
   'Bao bì',
   'Render 3D'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-perfume-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/perfume/', v2: true, ground: [74.3, 32], hiStep: 4, dirs: ['img/spin/perfume/', 'img/spin/perfume-noir/', 'img/spin/perfume-rose/'], frames: 144, loop: true, tone: 'dark', hotspots: [
   {a: .97, w: .1, x: 59, y: 60, side: 'r', t: 'Chữ in trên kính', d: 'Tên dòng và số mùi in thẳng lên mặt chai'},
   {a: .27, w: .1, x: 50, y: 24, t: 'Nắp đá mài', d: 'Đá vân mài bóng trên đai kim loại'},
   {a: .55, w: .11, x: 50, y: 55, t: 'Khối thủy tinh dày', d: 'Khoang chứa bo tròn nằm giữa lòng kính'}
  ]},
  variants: [
   {
    name: 'Hổ Phách',
    swatch: '#d98a1e',
    img: 'img/sm-product-perfume-amber.webp'
   },
   {
    name: 'Dạ Lan',
    swatch: '#2d1d6e',
    img: 'img/sm-product-perfume-noir.webp'
   },
   {
    name: 'Sương Hồng',
    swatch: '#f0a493',
    img: 'img/sm-product-perfume-rose.webp'
   }
  ],
  gallery: [
   'img/sm-product-perfume-set.webp',
   'img/sm-product-perfume-detail.webp',
   'img/sm-product-perfume-box.webp'
  ]
 },
 {
  id: 'product-tinh-van',
  title: 'Tịnh Vân — Túi hộp Vòm',
  industry: 'Túi xách',
  desc: 'Dream Labs thiết kế dáng túi hộp vai vòm với nắp lượn, khóa đĩa tròn, quai cuộn khâu tay và khoen kim loại, phối bốn màu da, cùng hộp cứng, túi vải chống bụi và logo dập nhũ.',
  tags: [
   'Dáng túi',
   'Phụ kiện kim loại',
   'Bao bì'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-bag-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/bag/', v2: true, ground: [75.2, 57.6], hiStep: 4, frames: 144, loop: true, tone: 'light', hotspots: [
   {a: 0, w: .08, x: 44, y: 57, side: 'r', t: 'Khóa đĩa tròn'},
   {a: 0.25, w: .09, x: 50, y: 22, side: 'r', t: 'Quai cuộn khâu tay'},
   {a: 0.5, w: .1, x: 50, y: 55, side: 'r', t: 'Dáng hộp vai vòm'}
  ]},
  variants: [
   {
    name: 'Đen huyền',
    swatch: '#161516',
    img: 'img/sm-product-bag-noir.webp'
   },
   {
    name: 'Nâu cognac',
    swatch: '#8b4a21',
    img: 'img/sm-product-bag-cognac.webp'
   },
   {
    name: 'Lục bảo',
    swatch: '#12463a',
    img: 'img/sm-product-bag-jade.webp'
   },
   {
    name: 'Kem ngà',
    swatch: '#e6dccb',
    img: 'img/sm-product-bag-ivory.webp'
   }
  ],
  gallery: [
   'img/sm-product-bag-set.webp',
   'img/sm-product-bag-detail.webp',
   'img/sm-product-bag-box.webp'
  ]
 },
 {
  id: 'product-vu-hac',
  title: 'Vũ Hạc — Giày cao gót Hạc 95',
  industry: 'Giày',
  desc: 'Dream Labs thiết kế phom giày mũi nhọn gót 9,5 cm, đường miệng giày khoét thấp, đế da viền mảnh và khâu gót mạ vàng, thể hiện trên ba chất liệu da, kèm hộp giày và logo lót trong.',
  tags: [
   'Phom giày',
   'Chất liệu',
   'Hộp giày'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-shoe-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/shoe/', dirs: ['img/spin/shoe/', 'img/spin/shoe-nude/', 'img/spin/shoe-mulberry/'], frames: 48, loop: true, tone: 'light', hotspots: [
   {a: 0, w: .08, x: 34, y: 68, side: 'r', t: 'Mũi nhọn', d: 'Phom mũi thon, miệng giày khoét thấp'},
   {a: .25, w: .08, x: 29, y: 55, side: 'r', t: 'Gót 9,5 cm', d: 'Gót mảnh bọc cùng chất liệu thân giày'},
   {a: .5, w: .08, x: 33, y: 71, side: 'r', t: 'Khâu gót mạ vàng'},
   {a: .75, w: .08, x: 56, y: 59, side: 'r', t: 'Đế da viền mảnh'}
  ]},
  variants: [
   {
    name: 'Da bóng đen',
    swatch: '#0d0d0f',
    img: 'img/sm-product-shoe-noir.webp'
   },
   {
    name: 'Da bê nude',
    swatch: '#d3a98c',
    img: 'img/sm-product-shoe-nude.webp'
   },
   {
    name: 'Da lộn mận chín',
    swatch: '#5a1830',
    img: 'img/sm-product-shoe-mulberry.webp'
   }
  ],
  gallery: [
   'img/sm-product-shoe-set.webp',
   'img/sm-product-shoe-detail.webp',
   'img/sm-product-shoe-box.webp'
  ]
 },
 {
  id: 'product-thien-truc',
  title: 'Thiên Trục — Calibre TT·01',
  industry: 'Đồng hồ',
  desc: 'Dream Labs thiết kế mặt số tia mặt trời với kim giây nhỏ ở 6 giờ, cọc số và kim nổi, vỏ tròn 40 mm, dây da khâu tay, logo và hộp sơn mài lót nhung cho bốn phiên bản.',
  tags: [
   'Mặt số',
   'Vỏ & dây',
   'Hộp trưng bày'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-watch-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/watch/', dirs: ['img/spin/watch/', 'img/spin/watch-ivory/', 'img/spin/watch-smoke/', 'img/spin/watch-jade/'], frames: 48, loop: true, tone: 'dark', hotspots: [
   {a: 0, w: .07, x: 53, y: 53, side: 'r', t: 'Kim giây nhỏ ở 6 giờ', d: 'Mặt số tia mặt trời, cọc số nổi'},
   {a: .27, w: .08, x: 66, y: 45, side: 'l', t: 'Vỏ tròn 40 mm'},
   {a: .5, w: .09, x: 57, y: 27, side: 'r', t: 'Dây da khâu tay'}
  ]},
  variants: [
   {
    name: 'Xanh đêm · thép',
    swatch: '#16306a',
    img: 'img/sm-product-watch-blue.webp'
   },
   {
    name: 'Ngà · vàng hồng',
    swatch: '#eadfc8',
    img: 'img/sm-product-watch-ivory.webp'
   },
   {
    name: 'Khói · titan đen',
    swatch: '#3a3b40',
    img: 'img/sm-product-watch-smoke.webp'
   },
   {
    name: 'Lục thẫm · vàng',
    swatch: '#14503c',
    img: 'img/sm-product-watch-jade.webp'
   }
  ],
  gallery: [
   'img/sm-product-watch-set.webp',
   'img/sm-product-watch-detail.webp',
   'img/sm-product-watch-box.webp'
  ]
 },
 {
  id: 'product-anh-trieu',
  title: 'Ánh Triêu — Nhẫn Triêu Dương',
  industry: 'Trang sức',
  desc: 'Dream Labs thiết kế mẫu nhẫn đá chủ bốn chấu với hàng đá tấm trên vai nhẫn, hộp vỏ sò bọc da viền kim loại lót nhung, và dấu hiệu mặt trời mọc dập nhũ trong nắp hộp.',
  tags: [
   'Trang sức',
   'Hộp nhung',
   'Nhận diện'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-jewel-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/jewel/', v2: true, ground: [70.6, 37.2], hiStep: 4, dirs: ['img/spin/jewel/', 'img/spin/jewel-sapphire/', 'img/spin/jewel-diamond/', ''], frames: 144, loop: true, tone: 'dark', hotspots: [
   {a: 0, w: .09, x: 50, y: 27, side: 'r', t: 'Đá chủ bốn chấu'},
   {a: 0.25, w: .08, x: 51, y: 55, side: 'r', t: 'Đai nhẫn trơn bóng'},
   {a: 0.5, w: .09, x: 50, y: 27, side: 'r', t: 'Đá chủ giác cắt bậc', d: 'Soi được từ mọi phía'}
  ]},
  variants: [
   {
    name: 'Lục bảo · vàng 18K',
    swatch: '#18a070',
    img: 'img/sm-product-jewel-emerald.webp'
   },
   {
    name: 'Lam ngọc · bạch kim',
    swatch: '#2f55d8',
    img: 'img/sm-product-jewel-sapphire.webp'
   },
   {
    name: 'Kim cương · vàng hồng',
    swatch: '#f2e3dc',
    img: 'img/sm-product-jewel-diamond.webp'
   },
   {
    name: 'Hồng ngọc · vàng 18K',
    swatch: '#c8183e',
    img: 'img/sm-product-jewel-ruby.webp'
   }
  ],
  gallery: [
   'img/sm-product-jewel-set.webp',
   'img/sm-product-jewel-detail.webp',
   'img/sm-product-jewel-box.webp'
  ]
 },
 {
  id: 'product-van-son',
  title: 'Vân Sơn — Mạch nha đơn cất',
  industry: 'Rượu & ẩm thực',
  desc: 'Dream Labs thiết kế dáng chai vai rộng đáy dày, nhãn giấy theo ba độ tuổi ủ, màng co cổ chai, dấu hiệu núi mây và hộp gỗ khắc logo cho dòng rượu mạch nha ủ thùng sồi.',
  tags: [
   'Dáng chai',
   'Nhãn in nổi',
   'Hộp gỗ'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-whisky-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/whisky/', v2: true, ground: [74.8, 23.4], hiStep: 4, dirs: ['img/spin/whisky/', 'img/spin/whisky-y18/', ''], frames: 144, loop: true, tone: 'dark', hotspots: [
   {a: 0, w: .09, x: 60, y: 60, side: 'r', t: 'Nhãn giấy in nổi', d: 'Dấu hiệu núi mây và số năm ủ'},
   {a: 0.3, w: .1, x: 50, y: 27, side: 'r', t: 'Màng co cổ chai'},
   {a: 0.6, w: .1, x: 50, y: 73, side: 'r', t: 'Đáy chai dày'}
  ]},
  variants: [
   {
    name: '12 năm · Sồi Mỹ',
    swatch: '#d98a1c',
    img: 'img/sm-product-whisky-y12.webp'
   },
   {
    name: '18 năm · Sherry',
    swatch: '#14110f',
    img: 'img/sm-product-whisky-y18.webp'
   },
   {
    name: '25 năm · Bản giới hạn',
    swatch: '#1c2b24',
    img: 'img/sm-product-whisky-y25.webp'
   }
  ],
  gallery: [
   'img/sm-product-whisky-set.webp',
   'img/sm-product-whisky-detail.webp',
   'img/sm-product-whisky-box.webp'
  ]
 },
 {
  id: 'product-tinh-da',
  title: 'Tĩnh Dạ — Nến thơm thủ công',
  industry: 'Khác',
  desc: 'Dream Labs thiết kế cốc nến, nắp kim loại, nhãn chữ và hộp quà nắp rời cho ba mùi hương, mỗi mùi một chất liệu cốc riêng: sứ đen bóng, sứ ngà mờ và thủy tinh hổ phách.',
  tags: [
   'Nhãn',
   'Hộp quà',
   'Bộ sưu tập'
  ],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-candle-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/candle/', v2: true, ground: [69.9, 45.8], hiStep: 4, frames: 144, loop: true, tone: 'light', hotspots: [
   {a: 0, w: .08, x: 46, y: 56, side: 'r', t: 'Nhãn chữ nhũ'},
   {a: .5, w: .12, x: 50, y: 33, side: 'r', t: 'Cốc nến dáng trụ'}
  ]},
  variants: [
   {
    name: 'Trầm hương · sứ đen',
    swatch: '#17151a',
    img: 'img/sm-product-candle-tram.webp'
   },
   {
    name: 'Trà trắng · sứ ngà',
    swatch: '#e9e1d2',
    img: 'img/sm-product-candle-tra.webp'
   },
   {
    name: 'Quế cam · thủy tinh',
    swatch: '#b5651d',
    img: 'img/sm-product-candle-que.webp'
   }
  ],
  gallery: [
   'img/sm-product-candle-set.webp',
   'img/sm-product-candle-detail.webp',
   'img/sm-product-candle-box.webp'
  ]
 },
 {
  id: 'product-bach-lien',
  title: 'Bạch Liên Privé — Bộ dưỡng da',
  industry: 'Khác',
  desc: 'Dream Labs thiết kế bộ ba bao bì dưỡng da: chai tinh chất ống nhỏ giọt, hũ kem và chai sữa dưỡng vòi nhấn bằng thủy tinh mờ nắp kim loại, nhãn in trực tiếp và hộp bộ quà, phối ba tông màu.',
  tags: [
   'Bộ bao bì',
   'Thủy tinh mờ',
   'Nhận diện'
  ],
  pkg: 'Thiết kế sản phẩm — Cao cấp',
  cover: 'img/sm-product-skin-set.webp',
  kind: 'product',
  spin: {dir: 'img/spin/skin/', dirs: ['img/spin/skin/', 'img/spin/skin-celadon/', 'img/spin/skin-blush/'], frames: 48, loop: true, tone: 'light', hotspots: [
   {a: 0, w: .08, x: 35, y: 37, side: 'r', t: 'Vòi nhấn kim loại'},
   {a: .25, w: .08, x: 59, y: 44, side: 'r', t: 'Ống nhỏ giọt', d: 'Chai tinh chất thủy tinh mờ'},
   {a: .5, w: .09, x: 36, y: 53, side: 'r', t: 'Hũ kem nắp kim loại'}
  ]},
  variants: [
   {
    name: 'Ngọc trai · vàng',
    swatch: '#efe9df',
    img: 'img/sm-product-skin-pearl.webp'
   },
   {
    name: 'Thanh thiên · bạc',
    swatch: '#a9c7b8',
    img: 'img/sm-product-skin-celadon.webp'
   },
   {
    name: 'Hoàng hôn · vàng hồng',
    swatch: '#e9b9a6',
    img: 'img/sm-product-skin-blush.webp'
   }
  ],
  gallery: [
   'img/sm-product-skin-set.webp',
   'img/sm-product-skin-detail.webp',
   'img/sm-product-skin-box.webp'
  ]
 },
 {
  id: 'product-nhan-quay-that',
  title: 'Nhẫn đính hôn — Ảnh quay thật',
  industry: 'Trang sức',
  desc: 'Sản phẩm thật quay trên bàn xoay: nhẫn kim loại trắng, viên chủ tròn giữ bằng bốn chấu, hai vai nhẫn đính hàng đá tấm. Ảnh quay minh họa từ thư viện Pexels, trình xem 360 do Dream Labs dựng. Video gốc chỉ quay được khoảng 150 độ nên mẫu này xoay qua lại.',
  tags: [
   'Xoay đa góc',
   'Ảnh quay thật',
   'Điểm chú thích'
  ],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-spin-real-ring.webp',
  kind: 'product',
  spin: {dir: 'img/spin/real-ring/', frames: 60, loop: false, arc: 150, tone: 'dark', hotspots: [
   {a: .5, w: .22, p: [[0, 26, 42], [.32, 32, 62], [.66, 52, 62], [1, 70, 50]], side: 'r', t: 'Viên chủ bốn chấu'},
   {a: .05, w: .08, x: 86, y: 61, side: 'l', t: 'Đai trơn bóng'},
   {a: .94, w: .1, x: 30, y: 23, side: 'r', t: 'Mặt trong đai'}
  ]},
  variants: [
   {name: 'Chính diện', swatch: '#e9e9ee', img: 'img/spin/real-ring/040.webp'},
   {name: 'Nghiêng trái', swatch: '#b9bac4', img: 'img/spin/real-ring/012.webp'},
   {name: 'Nghiêng phải', swatch: '#8b8c98', img: 'img/spin/real-ring/058.webp'}
  ]
 },
 {
  id: 'product-scan-kim-lu',
  title: 'Bình đồng Kim Lư — Quét 3D vật thật',
  industry: 'Nội thất',
  desc: 'Bình đồng đúc chạm vân sóng ở cổ và chân. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-kim-lu.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-kim-lu/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-kim-lu/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-kim-lu/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-kim-lu/025.webp'}
  ]
 },
 {
  id: 'product-scan-hoang-yen',
  title: 'Cặp ly Hoàng Yến — Quét 3D vật thật',
  industry: 'Rượu & ẩm thực',
  desc: 'Ba ly đồng thau chân cao, viền chạm hoa văn, lòng ly bóng gương. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-hoang-yen.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-hoang-yen/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-hoang-yen/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-hoang-yen/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-hoang-yen/025.webp'}
  ]
 },
 {
  id: 'product-scan-lam-hoa',
  title: 'Bình gốm Lam Hoa — Quét 3D vật thật',
  industry: 'Nội thất',
  desc: 'Bình gốm men trắng vẽ lam kín thân, đế viền xanh. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-lam-hoa.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-lam-hoa/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-lam-hoa/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-lam-hoa/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-lam-hoa/025.webp'}
  ]
 },
 {
  id: 'product-scan-bach-ma',
  title: 'Tượng sứ Bạch Mã — Quét 3D vật thật',
  industry: 'Nội thất',
  desc: 'Tượng ngựa sứ trắng men bóng tung vó trên đế gỗ. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-bach-ma.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-bach-ma/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-bach-ma/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-bach-ma/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-bach-ma/025.webp'}
  ]
 },
 {
  id: 'product-scan-thu-phong',
  title: 'Đồng hồ Thư Phòng — Quét 3D vật thật',
  industry: 'Đồng hồ',
  desc: 'Đồng hồ để bàn vỏ gỗ sẫm, mặt số La Mã viền đồng. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-thu-phong.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-thu-phong/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-thu-phong/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-thu-phong/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-thu-phong/025.webp'}
  ]
 },
 {
  id: 'product-scan-hai-trinh',
  title: 'La bàn Hải Trình — Quét 3D vật thật',
  industry: 'Quà tặng',
  desc: 'La bàn đồng thau nắp lật, mặt kính, kim từ. Mô hình quét 3D từ vật thật (thư viện Poly Haven, giấy phép CC0); bệ trưng bày, ánh sáng studio và trình xem 360 do Dream Labs dựng. Kéo để xoay quanh sản phẩm, xem từng góc như cầm trên tay.',
  tags: ['Quét 3D vật thật', 'Xoay 360°', 'Ánh sáng studio'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: 'img/sm-product-scan-hai-trinh.webp',
  kind: 'product',
  spin: {dir: 'img/spin/scan-hai-trinh/', frames: 48, loop: true, tone: 'dark'},
  variants: [
   {name: 'Chính diện', swatch: '#c9a96a', img: 'img/spin/scan-hai-trinh/001.webp'},
   {name: 'Nghiêng phải', swatch: '#8a6f45', img: 'img/spin/scan-hai-trinh/007.webp'},
   {name: 'Phía sau', swatch: '#3b2d32', img: 'img/spin/scan-hai-trinh/025.webp'}
  ]
 }
];
