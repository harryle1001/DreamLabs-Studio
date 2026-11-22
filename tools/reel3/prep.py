#!/usr/bin/env python3
"""reel3 — chuẩn bị nguồn cho phim mẫu: cắt đoạn clip thành dãy khung JPEG, thu ảnh gốc về cỡ dựng.
   python3 tools/reel3/prep.py <thư mục chứa nguồn đã tải> [tên phim…]
   Đọc tools/reel3/assets.json, ghi tools/reel3/_assets/<phim>/<khóa>/f00001.jpg… (clip) và <khóa>.jpg (ảnh) + index.json
   (số khung, fps của từng clip). _assets không commit; nguồn và tác giả ghi ở tools/reel3/CREDITS.md."""
import sys, os, json, subprocess as sp, shutil
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = sys.argv[1]; ONLY = sys.argv[2:]
A = json.load(open(os.path.join(HERE, 'assets.json')))
for film, c in A.items():
    if ONLY and film not in ONLY: continue
    out = os.path.join(HERE, '_assets', film); os.makedirs(out, exist_ok=True); idx = {}
    for k, v in c.get('clips', {}).items():
        d = os.path.join(out, k); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        f = os.path.join(SRC, v['f']); m = c.get('m', 1.08)
        W, H = round(v.get('W', c['W']) * m / 2) * 2, round(v.get('H', c['H']) * m / 2) * 2
        fps = sp.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip().split('/')
        fps = float(fps[0]) / float(fps[1] if len(fps) > 1 else 1)
        vf = (('crop=%d:%d:%d:%d,' % (v['crop'][2], v['crop'][3], v['crop'][0], v['crop'][1])) if 'crop' in v else '') + 'scale=%d:%d:force_original_aspect_ratio=increase:flags=lanczos' % (W, H)
        sp.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(v['ss']), '-t', str(v['t']), '-i', f, '-vf', vf, '-q:v', '2', os.path.join(d, 'f%05d.jpg')], check=True)
        idx[k] = {'n': len(os.listdir(d)), 'fps': round(fps, 3)}; print(film, k, idx[k])
    for k, v in c.get('photos', {}).items():
        im = Image.open(os.path.join(SRC, v)).convert('RGB'); im.thumbnail((3840, 3840), Image.LANCZOS); im.save(os.path.join(out, k + '.jpg'), quality=92); print(film, k, im.size)
    json.dump(idx, open(os.path.join(out, 'index.json'), 'w'))
