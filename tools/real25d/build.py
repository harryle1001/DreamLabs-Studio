#!/usr/bin/env python3
"""Ảnh chụp thật -> bộ 2.5D cho trình xem (js/spin.js, chế độ 'depth').
   python3 tools/real25d/build.py <thư mục ảnh gốc> <thư mục mô hình> [slug…]
   Mỗi góc chụp: tách nền (IS-Net), bản đồ độ sâu (Depth Anything v2 S), cắt vuông quanh vật.
   Ghi img/real/<slug>/NN.webp (1600px RGBA), NN-s.webp (800px), NN-d.webp (512px, độ sâu), NN-p.webp (1200px, ảnh tĩnh ghép nền), meta.json.
   Danh sách ảnh và nguồn: tools/real25d/sets.json (ghi công ở tools/real25d/CREDITS.md)."""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter
import onnxruntime as ort
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SRC, MOD = sys.argv[1], sys.argv[2]; ONLY = sys.argv[3:]
SETS = json.load(open(os.path.join(HERE, 'sets.json')))
so = ort.SessionOptions(); so.intra_op_num_threads = 4
seg = ort.InferenceSession(os.path.join(MOD, 'isnet-general-use.onnx'), so)
dep = ort.InferenceSession(os.path.join(MOD, 'depth_anything_v2_vits.onnx'), so)

def matte(im):
    x = np.asarray(im.resize((1024, 1024), Image.LANCZOS), np.float32) / 255 - .5
    y = seg.run(None, {seg.get_inputs()[0].name: x.transpose(2, 0, 1)[None]})[0][0, 0]
    y = (y - y.min()) / (y.max() - y.min() + 1e-6)
    return Image.fromarray((y * 255).astype(np.uint8)).resize(im.size, Image.LANCZOS)

def depth(im):
    x = (np.asarray(im.resize((518, 518), Image.BICUBIC), np.float32) / 255 - [.485, .456, .406]) / [.229, .224, .225]
    y = dep.run(None, {dep.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0].squeeze()
    return y

for slug, cfg in SETS.items():
    if ONLY and slug not in ONLY: continue
    out = os.path.join(ROOT, 'img/real', slug); os.makedirs(out, exist_ok=True)
    meta = {'shots': [], 'bg': None}
    for n, sh in enumerate(cfg['shots'], 1):
        im = Image.open(os.path.join(SRC, str(sh['id']) + '.jpg')).convert('RGB')
        if 'crop' in sh:                                  # [x0,y0,x1,y1] theo tỉ lệ ảnh gốc: khoanh riêng một vật
            W, H = im.size; c = sh['crop']; im = im.crop((int(c[0]*W), int(c[1]*H), int(c[2]*W), int(c[3]*H)))
        # lượt 1 (ảnh thu nhỏ): tìm khung vật; lượt 2: cắt vuông từ ảnh gốc rồi tách nền lại trên vùng cắt cho nét
        sm = im.copy(); sm.thumbnail((1400, 1400)); A0 = np.asarray(matte(sm)); k = im.size[0] / sm.size[0]
        ys, xs = np.where(A0 > 40); bx0, bx1, by0, by1 = xs.min()*k, xs.max()*k, ys.min()*k, ys.max()*k
        side = int(max(bx1 - bx0, by1 - by0) / cfg.get('fill', .72)); cx, cy = int((bx0 + bx1) / 2), int((by0 + by1) / 2)
        if n == 1 and not meta['bg']:
            px = np.asarray(sm)[A0 < 8]; meta['bg'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(px, 0))
        big = Image.new('RGB', (side, side), meta['bg'] or '#ffffff'); big.paste(im, (side // 2 - cx, side // 2 - cy)); src_px = side
        im = big.resize((min(side, 2000),) * 2, Image.LANCZOS)
        a = matte(im); A = np.asarray(a)
        ys, xs = np.where(A > 40); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        d = depth(im); d = np.asarray(Image.fromarray(d).resize(im.size, Image.BICUBIC))
        m = A > 128; lo, hi = np.percentile(d[m], 1), np.percentile(d[m], 99)
        d = np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)
        # ngoài viền vật: kéo dài độ sâu của mép vật ra (không để về 0) để khi nghiêng mép vật không bị kéo rách
        mk = (A > 128).astype(np.float32); acc = d * mk; wsum = mk.copy()
        for r in (4, 10, 24, 60, 140):
            sz = (max(2, acc.shape[1] // r), max(2, acc.shape[0] // r)); full = (acc.shape[1], acc.shape[0])
            pp = lambda x: np.asarray(Image.fromarray(x.astype(np.float32)).resize(sz, Image.BOX).resize(full, Image.BILINEAR)); fa = pp(acc * wsum); fw = pp(wsum)
            hole = wsum < 1e-3; ok = hole & (fw > 1e-3); acc = np.where(ok, fa / np.maximum(fw, 1e-6), acc); wsum = np.where(ok, 1, wsum)
        d = np.where(mk > 0, d, acc)
        D = Image.fromarray((d * 255).astype(np.uint8))
        side = im.size[0]; box = (0, 0, side, side); sq = im.copy(); sq.putalpha(a); dq = D
        nn = '%02d' % n; hiS = min(1600, side)
        sq.resize((hiS, hiS), Image.LANCZOS).save(os.path.join(out, nn + '.webp'), quality=86, alpha_quality=92, method=6)
        sq.resize((800, 800), Image.LANCZOS).save(os.path.join(out, nn + '-s.webp'), quality=80, alpha_quality=88, method=6)
        dq.resize((512, 512), Image.LANCZOS).filter(ImageFilter.GaussianBlur(cfg.get('soft', 4))).save(os.path.join(out, nn + '-d.webp'), quality=82, method=6)
        bgc = cfg.get('bg') or meta['bg']; still = Image.new('RGB', (1200, 1200), bgc)   # ảnh tĩnh ghép nền: dùng cho thư viện ảnh và ảnh bìa
        g = Image.radial_gradient('L').resize((1200, 1200)); still = Image.composite(Image.new('RGB', (1200, 1200), tuple(int(v * .82) for v in still.getpixel((0, 0)))), still, g.point(lambda v: max(0, v - 90)))
        cut = sq.resize((1200, 1200), Image.LANCZOS); still.paste(cut, (0, 0), cut); still.save(os.path.join(out, nn + '-p.webp'), quality=84, method=6)
        gy = (y1 - box[1]) / side * 100; gw = (x1 - x0) / side * 100
        meta['shots'].append({'name': sh['name'], 'ground': [round(gy, 1), round(gw, 1)], 'px': src_px})
        print(slug, nn, sh['id'], 'vật', x1 - x0, 'x', y1 - y0, '· vùng cắt gốc', src_px, 'px →', hiS)
    meta['bg'] = cfg.get('bg') or meta['bg']
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), ensure_ascii=False)
