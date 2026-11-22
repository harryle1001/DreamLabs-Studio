#!/usr/bin/env python3
"""Ghi các mẫu ảnh thật 2.5D vào js/samples-product.js từ img/real/<slug>/meta.json (chạy sau build.py; chạy lại sẽ thay các mẫu product-real-* cũ)."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SUF = ' Ảnh chụp sản phẩm thật từ thư viện Pexels; tách nền, dựng độ sâu và trình xem do Dream Labs làm: di chuột hoặc kéo để nghiêng sản phẩm, đổi góc chụp, soi chi tiết bằng kính phóng.'
# slug: (tên, ngành, mô tả[, id, tiêu đề đầy đủ])  — tên thương hiệu đều là concept
INFO = {
 'perfume-amber': ('Khuê Lam', 'Nước hoa', 'Chai nước hoa thủy tinh khối đáy dày, nước màu hổ phách, nắp trụ kim loại bóng. Hai góc chụp: dựng đứng và nằm nghiêng.', 'product-khue-lam', 'Khuê Lam — Nước hoa hổ phách'),
 'bag-noir': ('Tịnh Vân', 'Túi xách', 'Túi xách dáng vòm bằng da dập vân, hai quai tròn, khóa kéo mạ vàng; bản đen và bản đỏ rượu vang. Năm góc chụp trên nền trắng.', 'product-tinh-van', 'Tịnh Vân — Túi vòm da vân'),
 'shoe-tan': ('Vũ Hạc', 'Giày', 'Giày slingback mũi vuông, gót khối, quai cổ chân mảnh, da màu nâu bò. Năm góc chụp của cùng một đôi.', 'product-vu-hac', 'Vũ Hạc — Giày slingback da bò'),
 'watch-leather': ('Thiên Trục', 'Đồng hồ', 'Đồng hồ vỏ thép mỏng, mặt số trắng tối giản, dây da nâu. Ba góc chụp; chữ trên mặt số và trên gáy sách trong ảnh đã được xóa.', 'product-thien-truc', 'Thiên Trục — Đồng hồ dây da'),
 'ring-rose': ('Ánh Triêu', 'Trang sức', 'Bộ nhẫn vàng hồng đính kim cương: nhẫn chủ, nhẫn halo và cặp nhẫn cưới, chụp trên nền xám với nắng xiên. Ba mẫu trong cùng một buổi chụp.', 'product-anh-trieu', 'Ánh Triêu — Nhẫn vàng hồng'),
 'decanter': ('Vân Sơn', 'Rượu & ẩm thực', 'Bình decanter thủy tinh vuông không nhãn, rượu màu hổ phách, ly cognac bầu, chụp trên nền đen. Hai góc 2.5D và ba ảnh cận cảnh.', 'product-van-son', 'Vân Sơn — Bình decanter pha lê'),
 'candle-green': ('Tĩnh Dạ', 'Khác', 'Nến thơm trong cốc thủy tinh xanh rêu, nắp gỗ, nhãn trắng để trống. Bốn bối cảnh: bàn gỗ, gạch men, nền giấy và nhìn từ trên xuống.', 'product-tinh-da', 'Tĩnh Dạ — Nến thơm cốc xanh'),
 'skin-white': ('Bạch Liên Privé', 'Khác', 'Bộ chai vòi nhấn vuông màu trắng mờ, hai cỡ, kèm hộp vuông; bao bì để trống chưa in nhãn. Năm cách sắp đặt.', 'product-bach-lien', 'Bạch Liên Privé — Bộ dưỡng da'),
 'perfume-pink': ('Hồng Sương', 'Nước hoa', 'Chai nước hoa thủy tinh cắt giác, nước màu hồng đào, vòi xịt kim loại. Năm góc chụp của cùng một chai.'),
 'headphone-white': ('Vân Bạch', 'Thiết bị âm thanh', 'Tai nghe chụp tai không dây màu trắng nhám, đệm tai mềm, gọng gập được. Bốn góc chụp: chính diện, nghiêng, mặt bên và khi gập gọn.'),
 'headphone-black': ('Huyền Âm', 'Thiết bị âm thanh', 'Tai nghe chụp tai không dây màu đen nhám, chụp tai bầu, gọng mảnh. Hai góc chụp.'),
 'bottle-frost': ('Lam Tuyết', 'Mỹ phẩm', 'Chai thủy tinh mờ vai vuông, nắp pha lê, cổ kim loại. Hai góc chụp.'),
 'vase-white': ('Bạch Sứ', 'Gốm & trang trí', 'Bộ ba bình gốm men trắng mờ: bình vai tròn, bình cổ cao và bình bầu thấp. Hai góc chụp.'),
 'vase-blue': ('Thanh Lam', 'Gốm & trang trí', 'Bình gốm cổ cao và tách cắt giác men lam xám. Ba góc chụp.'),
}
OLD3D = ['product-khue-lam', 'product-tinh-van', 'product-vu-hac', 'product-thien-truc', 'product-anh-trieu', 'product-van-son', 'product-tinh-da', 'product-bach-lien']
sets = json.load(open(os.path.join(HERE, 'sets.json')))
lum = lambda h: sum(int(h[i:i+2], 16) * w for i, w in ((1, .299), (3, .587), (5, .114))) / 255
q = lambda s: "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"
out = []
for slug in sets:
    m = json.load(open(os.path.join(ROOT, 'img/real', slug, 'meta.json'))); I = INFO[slug]; name, ind, d = I[:3]; sid = I[3] if len(I) > 3 else 'product-real-' + slug; ttl = I[4] if len(I) > 4 else name + ' — Ảnh chụp thật'; gal = ['%sg%02d-p.webp' % ('img/real/%s/' % slug, i + 1) for i in range(len(m.get('extras', [])))]; n = len(m['shots']); dr = 'img/real/%s/' % slug
    shots = ', '.join("{name: %s, ground: [%s, %s]}" % (q(s['name']), s['ground'][0], s['ground'][1]) for s in m['shots'])
    vs = ',\n'.join("   {name: %s, swatch: %s, img: '%s%02d-p.webp'}" % (q(s['name']), q(m['bg']), dr, i + 1) for i, s in enumerate(m['shots']))
    out.append(""" {
  id: '%s',
  title: %s,
  industry: %s,
  desc: %s,
  tags: ['Ảnh chụp thật', 'Hiệu ứng 2.5D', 'Nhiều góc chụp'],
  pkg: 'Thiết kế sản phẩm — Chuyên nghiệp',
  cover: '%s01-p.webp',
  kind: 'product',
  spin: {dir: '%s', depth: true, frames: %d, loop: false, tone: '%s', bg: '%s',%s shots: [%s]},
  variants: [
%s
  ]%s
 }""" % (sid, q(ttl), q(ind), q(d + SUF), dr, dr, n, 'light' if lum(m['bg']) > .5 else 'dark', m['bg'], (' amp: %s,' % sets[slug]['amp']) if 'amp' in sets[slug] else '', shots, vs, (',\n  gallery: [' + ', '.join(q(x) for x in gal) + ']') if gal else ''))
p = os.path.join(ROOT, 'js/samples-product.js'); s = open(p, encoding='utf8').read()
head, body = s.split(".product = [\n", 1); body = body.rstrip(); assert body.endswith('];')
ents = re.split(r",\n(?= \{\n  id: ')", body[:-2].rstrip())
keep = [e for e in ents if not re.search(r"id: '(product-real-[^']*|%s)'" % '|'.join(OLD3D), e)]
new = [o for o in out if "'product-real-" not in o.split('\n')[1]]; old = [o for o in out if "'product-real-" in o.split('\n')[1]]
open(p, 'w', encoding='utf8').write(head + ".product = [\n" + ',\n'.join(new + keep + old) + '\n];\n'); print('ghi', len(new), 'mẫu thay bản dựng 3D +', len(old), 'mẫu ảnh thật;', len(keep), 'mẫu khác giữ nguyên')
