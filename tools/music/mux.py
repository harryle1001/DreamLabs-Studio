#!/usr/bin/env python3
"""Ghép nhạc nền (tools/music/out/*.wav do gen.py tạo) vào MỌI video trong media/.

  python3 tools/music/mux.py            -> thay luồng audio của media/*.mp4 (AAC 128k) và media/*.webm (Opus 96k)
  python3 tools/music/mux.py --social   -> thêm bản mp4 có nhạc (AAC 160k) vào export-social/ (không commit)

Giữ nguyên luồng hình (copy), chạy lại bao nhiêu lần cũng được (luôn lấy hình gốc 0:v:0, bỏ audio cũ).
Clip mới không có trong MAP thì chọn bản theo tiền tố tên file (PREFIX). Mỗi clip bắt đầu ở một đoạn khác nhau của bản
nhạc (theo tên file) nên các clip dùng chung một bản vẫn không giống hệt nhau.
"""
import os, re, sys, json, zlib, subprocess as sp

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(R, 'tools/music/out')
MEDIA = os.path.join(R, 'media')
LUFS = -16.0
FADE_IN, FADE_OUT = 0.3, 1.2

# tâm trạng từng clip: sang (sáng) · am (ấm) · huyen (huyền ảo) · sang-trong (sang trọng) · tho (thở, nhẹ nhất)
MAP = {
    'showreel': 'sang-trong', 'dreamlab-ad-9x16': 'sang',
    'sm-motion-orvele': 'huyen', 'sm-motion-talvere': 'sang-trong', 'sm-motion-valmere': 'sang-trong',
    'sm-motion-calvente': 'am', 'sm-motion-thaverine': 'huyen', 'sm-motion-navelia': 'am', 'sm-motion-studio3d': 'am',
    'sm-video-lamky': 'huyen', 'sm-video-belmora': 'sang-trong', 'sm-video-nere': 'am', 'sm-video-halden': 'sang-trong',
    'sm-video-vandinh': 'am', 'sm-video-serac': 'huyen',
}
PREFIX = [('ai-', 'tho'), ('sm-ai-', 'tho'), ('sm-motion-', 'sang-trong'), ('sm-video-', 'am'), ('', 'sang')]


def run(*a):
    return sp.run(a, check=True, capture_output=True, text=True)


def probe(f):
    j = json.loads(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', f).stdout)
    return float(j['format']['duration'])


def lufs(f):
    e = sp.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', e)[-1])


def track(stem):
    if stem in MAP:
        return MAP[stem]
    return next(k for p, k in PREFIX if stem.startswith(p))


def norm(k, cache={}):
    """Bản gốc chuẩn về -16 LUFS bằng một hệ số khuếch đại tuyến tính (không nén, không méo)."""
    if k not in cache:
        src, dst = os.path.join(OUT, k + '.wav'), os.path.join(OUT, k + '.norm.wav')
        g = LUFS - lufs(src)
        run('ffmpeg', '-y', '-v', 'error', '-i', src, '-af', f'volume={g:.2f}dB', '-c:a', 'pcm_s16le', dst)
        cache[k] = dst
    return cache[k]


def mux(src, dst, k, codec):
    d = probe(src)
    stem = os.path.splitext(os.path.basename(src))[0]
    off = (zlib.crc32(stem.encode()) % 997) / 997 * max(0.0, 47.0 - d)      # điểm bắt đầu riêng của clip
    af = f'afade=t=in:st=0:d={FADE_IN},afade=t=out:st={max(0, d - FADE_OUT):.3f}:d={FADE_OUT}'
    tmp = dst + '.tmp' + os.path.splitext(dst)[1]
    run('ffmpeg', '-y', '-v', 'error', '-i', src, '-ss', f'{off:.3f}', '-t', f'{d:.3f}', '-i', norm(k),
        '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-af', af, *codec, '-ar', '48000', '-t', f'{d:.3f}',
        *(['-movflags', '+faststart'] if dst.endswith('.mp4') else []), tmp)
    os.replace(tmp, dst)
    return d, off


if __name__ == '__main__':
    social = '--social' in sys.argv
    files = sorted(f for f in os.listdir(MEDIA) if f.endswith(('.mp4', '.webm')) and '.tmp' not in f)
    if social:
        os.makedirs(os.path.join(R, 'export-social'), exist_ok=True)
        files = [f for f in files if f.endswith('.mp4')]
    for f in files:
        stem = os.path.splitext(f)[0]
        k = track(stem)
        src = os.path.join(MEDIA, f)
        if social:
            dst = os.path.join(R, 'export-social', f)
            codec = ['-c:a', 'aac', '-b:a', '160k']
        else:
            dst = src
            codec = ['-c:a', 'libopus', '-b:a', '96k'] if f.endswith('.webm') else ['-c:a', 'aac', '-b:a', '128k']
        b0 = os.path.getsize(src)
        d, off = mux(src, dst, k, codec)
        print(f'{f:28s} {k:11s} {d:5.1f}s  từ {off:4.1f}s  {b0 // 1024:5d}KB -> {os.path.getsize(dst) // 1024:5d}KB')
