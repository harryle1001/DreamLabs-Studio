#!/usr/bin/env python3
"""Ghi các mẫu ảnh thật 2.5D vào js/samples-product.js từ img/real/<slug>/meta.json (chạy sau build.py; chạy lại sẽ thay các mẫu product-real-* cũ)."""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
INFO = {
 'perfume-pink': ('Hồng Sương', 'Nước hoa', 'Chai nước hoa thủy tinh cắt giác, nước màu hồng đào, vòi xịt kim loại. Năm góc chụp của cùng một chai.'),
 'headphone-white': ('Vân Bạch', 'Thiết bị âm thanh', 'Tai nghe chụp tai không dây màu trắng nhám, đệm tai mềm, gọng gập được. Bốn góc chụp: chính diện, nghiêng, mặt bên và khi gập gọn.'),
 'headphone-black': ('Huyền Âm', 'Thiết bị âm thanh', 'Tai nghe chụp tai không dây màu đen nhám, chụp tai bầu, gọng mảnh. Hai góc chụp.'),
 'bottle-frost': ('Lam Tuyết', 'Mỹ phẩm', 'Chai thủy tinh mờ vai vuông, nắp pha lê, cổ kim loại. Hai góc chụp.'),
 'vase-white': ('Bạch Sứ', 'Gốm & trang trí', 'Bộ ba bình gốm men trắng mờ: bình vai tròn, bình cổ cao và bình bầu thấp. Hai góc chụp.'),
 'vase-blue': ('Thanh Lam', 'Gốm & trang trí', 'Bình gốm cổ cao và tách cắt giác men lam xám. Ba góc chụp.'),
}
sets = json.load(open(os.path.join(HERE, 'sets.json')))
lum = lambda h: sum(int(h[i:i+2], 16) * w for i, w in ((1, .299), (3, .587), (5, .114))) / 255
q = lambda s: "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"
out = []
for slug in sets:
    m = json.load(open(os.path.join(ROOT, 'img/real', slug, 'meta.json'))); name, ind, d = INFO[slug]; n = len(m['shots']); dr = 'img/real/%s/' % slug
    shots = ', '.join("{name: %s, ground: [%s, %s]}" % (q(s['name']), s['ground'][0], s['ground'][1]) for s in m['shots'])
    vs = ',\n'.join("   {name: %s, swatch: %s, img: '%s%02d-p.webp'}" % (q(s['name']), q(m['bg']), dr, i + 1) for i, s in enumerate(m['shots']))
    out.append(""" {
  id: 'product-real-%s',
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
  ]
 }""" % (slug, q(name + ' — Ảnh chụp thật'), q(ind), q(d + ' Ảnh chụp sản phẩm thật từ thư viện Pexels; tách nền, dựng độ sâu và trình xem do Dream Labs làm: di chuột hoặc kéo để nghiêng sản phẩm, đổi góc chụp, soi chi tiết bằng kính phóng.'), dr, dr, n, 'light' if lum(m['bg']) > .5 else 'dark', m['bg'], (' amp: %s,' % sets[slug]['amp']) if 'amp' in sets[slug] else '', shots, vs))
p = os.path.join(ROOT, 'js/samples-product.js'); s = open(p, encoding='utf8').read()
s = re.sub(r",\n \{\n  id: 'product-real-.*?\n \}(?=,\n \{|\n\];)", '', s, flags=re.S)
t = s.rstrip(); assert t.endswith('];')
open(p, 'w', encoding='utf8').write(t[:-2].rstrip() + ',\n' + ',\n'.join(out) + '\n];\n'); print('ghi', len(out), 'mẫu ảnh thật')
