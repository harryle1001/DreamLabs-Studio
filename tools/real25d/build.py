#!/usr/bin/env python3
"""Ảnh chụp thật -> bộ 2.5D cho trình xem (js/spin.js, chế độ 'depth').
   python3 tools/real25d/build.py <thư mục ảnh gốc> <thư mục mô hình> [slug…]
   Mỗi góc chụp: tách nền (IS-Net), bản đồ độ sâu (Depth Anything v2 S), cắt vuông quanh vật.
   Ghi img/real/<slug>/NN.webp (1600px RGBA), NN-s.webp (800px), NN-d.webp (512px, độ sâu), meta.json và ảnh tĩnh nhiều cỡ:
   NN-p-640.webp, NN-p.webp (1280), NN-p-1920.webp, NN-4k.webp (tới 3840px, chỉ tải khi phóng to).
   "still": "photo" trong sets.json: ảnh tĩnh là chính ảnh chụp (giữ nền và bóng thật) thay vì vật tách nền ghép lên nền phẳng.
   "extras": [{id,name}] ảnh chụp thêm (cận cảnh, bối cảnh) chỉ xuất ảnh tĩnh gNN-*.webp cho dải ảnh.
   "fix" ở từng ảnh: [{box:[x0,y0,x1,y1], mode:"inpaint"|"blur"}] xóa chữ / logo hãng thật trên ảnh gốc trước khi xử lý.
   Danh sách ảnh và nguồn: tools/real25d/sets.json (ghi công ở tools/real25d/CREDITS.md)."""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter
import onnxruntime as ort
import cv2
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

def fixes(im, sh):
    """Xóa chữ / logo hãng thật: inpaint (vùng nhỏ trên bề mặt đều) hoặc làm mờ mép mềm."""
    if not sh.get('fix'): return im
    a = np.asarray(im).copy(); H, W = a.shape[:2]
    for f in sh['fix']:
        x0, y0, x1, y1 = int(f['box'][0]*W), int(f['box'][1]*H), int(f['box'][2]*W), int(f['box'][3]*H)
        if f.get('mode', 'inpaint') == 'inpaint':
            pad = int(max(x1-x0, y1-y0) * .8) + 20; X0, Y0, X1, Y1 = max(0, x0-pad), max(0, y0-pad), min(W, x1+pad), min(H, y1+pad)
            reg = a[Y0:Y1, X0:X1]; k = max(1, max(reg.shape[:2]) / 700); sm = cv2.resize(reg, None, fx=1/k, fy=1/k, interpolation=cv2.INTER_AREA)
            m = np.zeros(sm.shape[:2], np.uint8); cv2.rectangle(m, (int((x0-X0)/k), int((y0-Y0)/k)), (int((x1-X0)/k), int((y1-Y0)/k)), 255, -1)
            out = cv2.resize(cv2.inpaint(sm, m, 5, cv2.INPAINT_TELEA), (reg.shape[1], reg.shape[0]), interpolation=cv2.INTER_CUBIC)
            mk = cv2.GaussianBlur(cv2.resize(m, (reg.shape[1], reg.shape[0])).astype(np.float32) / 255, (0, 0), 3 * k)[..., None]
            noise = np.random.default_rng(7).normal(0, 2.2, reg.shape)                       # trả lại chút hạt ảnh cho vùng vừa xóa
            a[Y0:Y1, X0:X1] = np.clip(reg * (1 - mk) + (out + noise) * mk, 0, 255).astype(np.uint8)
        else:
            reg = a[y0:y1, x0:x1]; r = max(reg.shape[:2]) / f.get('r', 9); bl = cv2.GaussianBlur(reg, (0, 0), r)
            mk = np.zeros(reg.shape[:2], np.float32); e = max(2, int(min(reg.shape[:2]) * .18)); mk[e:-e, e:-e] = 1; mk = cv2.GaussianBlur(mk, (0, 0), e / 2)[..., None]
            a[y0:y1, x0:x1] = (reg * (1 - mk) + bl * mk).astype(np.uint8)
    return Image.fromarray(a)

def sizes(im, base):
    """Ảnh tĩnh nhiều cỡ: -p-640, -p (1280), -p-1920, -4k (tới 3840, không phóng quá ảnh gốc)."""
    L = max(im.size)
    for suf, px, q in (('-p-640', 640, 78), ('-p', 1280, 82), ('-p-1920', 1920, 82), ('-4k', 3840, 84)):
        k = min(1, px / L); im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS).save(base + suf + '.webp', quality=q, method=6)

for slug, cfg in SETS.items():
    if ONLY and slug not in ONLY: continue
    out = os.path.join(ROOT, 'img/real', slug); os.makedirs(out, exist_ok=True)
    meta = {'shots': [], 'bg': None}
    for n, sh in enumerate(cfg['shots'], 1):
        im = fixes(Image.open(os.path.join(SRC, str(sh['id']) + '.jpg')).convert('RGB'), sh)
        if 'crop' in sh:                                  # [x0,y0,x1,y1] theo tỉ lệ ảnh gốc: khoanh riêng một vật
            W, H = im.size; c = sh['crop']; im = im.crop((int(c[0]*W), int(c[1]*H), int(c[2]*W), int(c[3]*H)))
        # lượt 1 (ảnh thu nhỏ): tìm khung vật; lượt 2: cắt vuông từ ảnh gốc rồi tách nền lại trên vùng cắt cho nét
        sm = im.copy(); sm.thumbnail((1400, 1400)); A0 = np.asarray(matte(sm)); k = im.size[0] / sm.size[0]
        ys, xs = np.where(A0 > 40); bx0, bx1, by0, by1 = xs.min()*k, xs.max()*k, ys.min()*k, ys.max()*k
        side = int(max(bx1 - bx0, by1 - by0) / cfg.get('fill', .72)); cx, cy = int((bx0 + bx1) / 2), int((by0 + by1) / 2)
        if 'full' in sh: side = int(min(im.size) * sh['full'][2]); cx, cy = int(im.size[0] * sh['full'][0]), int(im.size[1] * sh['full'][1])   # full:[cx,cy,k]: lấy nguyên khung vuông của ảnh, không tách nền (vật trong suốt trên nền tối)
        if n == 1 and not meta['bg']:
            px = np.asarray(sm)[A0 < 8]; meta['bg'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(px, 0))
        # vùng cắt vuông vượt ra ngoài ảnh: kéo dài mép ảnh rồi làm mờ phần kéo dài (không lộ đường nối)
        l, t = side // 2 - cx, side // 2 - cy; pl, pt = max(0, l), max(0, t); pr, pb = max(0, side - l - im.size[0]), max(0, side - t - im.size[1])
        arr = np.asarray(im)[max(0, -t):max(0, -t) + side - pt - pb, max(0, -l):max(0, -l) + side - pl - pr]
        if pl or pt or pr or pb:
            ext = cv2.copyMakeBorder(arr, pt, pb, pl, pr, cv2.BORDER_REPLICATE); bl = cv2.GaussianBlur(ext, (0, 0), side / 40)
            mk = np.zeros(ext.shape[:2], np.float32); mk[pt:ext.shape[0] - pb, pl:ext.shape[1] - pr] = 1; mk = np.minimum(mk, cv2.GaussianBlur(mk, (0, 0), side / 120) * 2 - 1).clip(0, 1)[..., None]
            arr = (ext * mk + bl * (1 - mk)).astype(np.uint8)
        big = Image.fromarray(arr); src_px = side; native = big
        im = big.resize((min(side, 2000),) * 2, Image.LANCZOS)
        a = matte(im)
        if 'full' in sh: a = Image.new('L', im.size, 255)
        A = np.asarray(a)
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
        if cfg.get('still') == 'photo': sizes(native, os.path.join(out, nn))
        else:
            K = min(3840, src_px); still = still.resize((K, K), Image.LANCZOS); cut = Image.composite(native.resize((K, K), Image.LANCZOS), still, a.resize((K, K), Image.LANCZOS)); sizes(cut, os.path.join(out, nn))
        gy = (y1 - box[1]) / side * 100; gw = (x1 - x0) / side * 100
        meta['shots'].append({'name': sh['name'], 'ground': [round(gy, 1), round(gw, 1)], 'px': src_px})
        print(slug, nn, sh['id'], 'vật', x1 - x0, 'x', y1 - y0, '· vùng cắt gốc', src_px, 'px →', hiS)
    for n, ex in enumerate(cfg.get('extras', []), 1):
        im = fixes(Image.open(os.path.join(SRC, str(ex['id']) + '.jpg')).convert('RGB'), ex)
        if 'crop' in ex: W, H = im.size; c = ex['crop']; im = im.crop((int(c[0]*W), int(c[1]*H), int(c[2]*W), int(c[3]*H)))
        sizes(im, os.path.join(out, 'g%02d' % n)); print(slug, 'g%02d' % n, ex['id'], im.size)
    meta['extras'] = [e['name'] for e in cfg.get('extras', [])]
    meta['bg'] = cfg.get('bg') or meta['bg']
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), ensure_ascii=False)
