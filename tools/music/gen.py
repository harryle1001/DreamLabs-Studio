#!/usr/bin/env python3
"""Dream Labs — nhạc nền ambient tự tổng hợp bằng numpy (toàn quyền sử dụng, không dùng mẫu âm thanh ngoài).

  python3 tools/music/gen.py          -> tools/music/out/<bản>.wav (48 kHz stereo, 48 s, vòng lặp liền)
  bash tools/music/mux.sh             -> chuẩn hóa -16 LUFS rồi ghép vào mọi video trong media/

Mỗi bản: pad/drone sóng sin chồng hòa âm (lên dây theo 432 Hz hoặc 528 Hz), chuông pha lê, bát hát (singing bowl),
tiếng gió rất nhỏ, vang không gian (convolution vòng) và nhịp "thở" chậm. Mọi tần số và chu kỳ được làm tròn để
lặp đúng số chu kỳ trong 48 s, vang tính vòng nên bản gốc nối đuôi không có tiếng tách.
Cùng hạt giống ngẫu nhiên -> chạy lại ra đúng file cũ.
"""
import os, wave, numpy as np

SR = 48000
L = 48.0                      # giây; mọi clip trên web <= 21 s
N = int(SR * L)
t = np.arange(N) / SR
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

q = lambda f: round(f * L) / L                       # tần số khớp vòng lặp
lfo = lambda cyc, ph=0.0: np.sin(2 * np.pi * (cyc / L) * t + ph)   # cyc: số chu kỳ trong 48 s


def pan(x, p):                # p: -1 trái .. 1 phải, giữ công suất
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def pad(freqs, amps, warm=0.1, det=0.5, breath=8, depth=0.3, rng=None):
    """Drone: mỗi nốt 3 giọng lệch nhẹ (chorus), hòa âm bậc 2–3 nhỏ cho ấm, biên độ "thở" chậm."""
    s = np.zeros((2, N))
    for i, (f, a) in enumerate(zip(freqs, amps)):
        for j, d in enumerate((-det, 0.0, det)):
            fq = q(f + d)
            ph = rng.uniform(0, 2 * np.pi)
            x = np.sin(2 * np.pi * fq * t + ph)
            if warm:
                x = x + warm * np.sin(4 * np.pi * fq * t + ph) + warm * .35 * np.sin(6 * np.pi * fq * t + ph)
            env = 1 - depth + depth * (0.5 + 0.5 * lfo(breath + (i % 2), rng.uniform(0, 6.283)))
            s += pan(x * env * a / 3, (j - 1) * 0.55 + rng.uniform(-.15, .15))
    return s


def strike(s, at, f, ratios, amps, decays, att=0.02, beat=0.6, p=0.0, gain=1.0):
    """Một tiếng bát hát / chuông: các hòa âm không điều hòa, mỗi hòa âm là cặp tần số sát nhau tạo tiếng ngân rung."""
    n = int(max(decays) * 5 * SR)
    tt = np.arange(n) / SR
    x = np.zeros(n)
    for r, a, d in zip(ratios, amps, decays):
        fr = f * r
        x += a * (np.sin(2 * np.pi * fr * tt) + 0.8 * np.sin(2 * np.pi * (fr + beat) * tt + 1.0)) * np.exp(-tt / d)
    x *= (1 - np.exp(-tt / att)) * gain
    i0 = int(at * SR) % N
    idx = (np.arange(n) + i0) % N           # quấn vòng: đuôi ngân nối sang đầu bản
    st = pan(x, p)
    np.add.at(s[0], idx, st[0]); np.add.at(s[1], idx, st[1])


BOWL = ([1, 2.71, 5.15, 8.2], [1, .42, .2, .08], [9, 6, 3.5, 2])
CHIME = ([1, 2.76, 5.4], [1, .22, .06], [2.6, 1.1, .5])


def air(rng, lvl):
    """Gió/không khí: nhiễu hồng lọc thấp, phồng xẹp rất chậm."""
    w = rng.standard_normal((2, N))
    F = np.fft.rfft(w, axis=1)
    fr = np.fft.rfftfreq(N, 1 / SR)
    shape = 1 / np.sqrt(np.maximum(fr, 20)) / (1 + (fr / 1800) ** 2)
    x = np.fft.irfft(F * shape, n=N, axis=1)
    x /= np.abs(x).max()
    return x * lvl * (0.6 + 0.4 * (0.5 + 0.5 * lfo(3)))


def reverb(s, rng, rt=4.5, wet=0.35, damp=2600):
    """Vang không gian: IR nhiễu suy giảm mũ, tách trái/phải, cắt bớt cao tần; convolution vòng qua FFT."""
    n = int(rt * SR)
    tt = np.arange(n) / SR
    out = np.empty_like(s)
    fr = np.fft.rfftfreq(N, 1 / SR)
    lp = 1 / (1 + (fr / damp) ** 2)
    for c in range(2):
        ir = np.zeros(N)
        ir[:n] = rng.standard_normal(n) * np.exp(-tt * 6.9 / rt) * (1 - np.exp(-tt / .012))
        ir /= np.sqrt((ir ** 2).sum())
        y = np.fft.irfft(np.fft.rfft(s[c]) * np.fft.rfft(ir) * lp, n=N)
        out[c] = (1 - wet) * s[c] + wet * y * 1.6
    return out


def master(s, hp=38, lp=7000):
    """Lọc thấp/cao mềm (không chói, không ù), chuẩn đỉnh -3 dBFS. Độ to -16 LUFS do mux.sh (loudnorm) đảm nhận."""
    fr = np.fft.rfftfreq(N, 1 / SR)
    h = (fr / hp) ** 2 / (1 + (fr / hp) ** 2) / np.sqrt(1 + (fr / lp) ** 4)
    s = np.fft.irfft(np.fft.rfft(s, axis=1) * h, n=N, axis=1)
    return s / np.abs(s).max() * 10 ** (-3 / 20)


def write(name, s):
    os.makedirs(OUT, exist_ok=True)
    pcm = (np.clip(s.T, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('  ', name, f'{L:.0f}s')


# ---------------------------------------------------------------- các bản nhạc
def sang(rng):
    """Sáng — 528 Hz: Đô trưởng thêm quãng 9, chuông pha lê lấp lánh, nhịp thở 8 s."""
    s = pad([132, 198, 264, 330, 396, 528, 594], [.9, .5, .7, .38, .3, .22, .12], warm=.06, det=.45, breath=6, depth=.3, rng=rng)
    notes = [528, 594, 660, 792, 891, 1056]
    for k in range(24):
        strike(s, k * 2.0 + rng.uniform(0, .5), notes[rng.integers(len(notes))], *CHIME, att=.004, beat=.3, p=rng.uniform(-.7, .7), gain=.10)
    for k in range(4):
        strike(s, 1.2 + k * 12, 264, *BOWL, att=.03, p=(-.3, .3)[k % 2], gain=.22)
    s += air(rng, .03)
    return reverb(s, rng, rt=4.2, wet=.38, damp=3200)


def am(rng):
    """Ấm — 432 Hz: La trưởng ấm, hòa âm bậc chẵn, bát hát trầm, gió nhẹ."""
    s = pad([108, 162, 216, 270, 324, 432], [1, .55, .7, .35, .25, .14], warm=.16, det=.4, breath=5, depth=.35, rng=rng)
    for k in range(6):
        strike(s, .6 + k * 8, (216, 162)[k % 2], *BOWL, att=.04, beat=.5, p=(-.35, .35)[k % 2], gain=.32)
    for k in range(10):
        strike(s, 3 + k * 4.8 + rng.uniform(0, .6), (432, 486, 540, 648)[rng.integers(4)], *CHIME, att=.006, beat=.25, p=rng.uniform(-.6, .6), gain=.06)
    s += air(rng, .045)
    return reverb(s, rng, rt=5, wet=.34, damp=2200)


def huyen(rng):
    """Huyền ảo — 432 Hz: Rê thứ thêm quãng 6, giọng trái/phải lệch nhau (chập chờn), chuông thưa, vang dài."""
    s = pad([144, 216, 288, 345.6, 432, 486], [.9, .6, .6, .32, .25, .12], warm=.08, det=.7, breath=4, depth=.4, rng=rng)
    s[0] += .18 * np.sin(2 * np.pi * q(72) * t); s[1] += .18 * np.sin(2 * np.pi * q(75) * t)   # nền sâu, hai tai lệch 3 Hz
    for k in range(5):
        strike(s, 1.5 + k * 9.6, 288, *BOWL, att=.05, beat=.9, p=(-.5, .5)[k % 2], gain=.3)
    for k in range(9):
        strike(s, 4 + k * 5.3 + rng.uniform(0, 1), (864, 1036.8, 1152, 1296)[rng.integers(4)], *CHIME, att=.008, beat=.4, p=rng.uniform(-.8, .8), gain=.07)
    s += air(rng, .05)
    return reverb(s, rng, rt=6.5, wet=.45, damp=2400)


def sangtrong(rng):
    """Sang trọng — 432 Hz: Fa trưởng 7 trầm lắng, chuỗi nốt chuông mềm (tiếng như đàn điện cổ) theo nhịp chậm."""
    s = pad([86.4, 172.8, 259.2, 324, 388.8, 432], [.8, .75, .5, .3, .2, .12], warm=.12, det=.35, breath=6, depth=.28, rng=rng)
    arp = [345.6, 432, 518.4, 648, 518.4, 432, 388.8, 518.4]
    for k in range(int(L / 1.5)):
        strike(s, k * 1.5, arp[k % len(arp)], [1, 2.0, 3.0], [1, .18, .05], [2.2, .9, .4], att=.006, beat=.2, p=(-.35, .35)[k % 2], gain=.075 if k % 4 else .1)
    for k in range(3):
        strike(s, 3 + k * 16, 172.8, *BOWL, att=.05, p=0, gain=.22)
    s += air(rng, .025)
    return reverb(s, rng, rt=4.8, wet=.36, damp=2800)


def tho(rng):
    """Thở — 528 Hz: drone tinh khiết ít nốt, biên độ phồng xẹp như hơi thở 6 s, chuông rất thưa (cho màn hình phần mềm)."""
    s = pad([132, 264, 396, 528, 792], [.9, .7, .35, .2, .07], warm=.03, det=.3, breath=8, depth=.45, rng=rng)
    for k in range(8):
        strike(s, .8 + k * 6, (528, 660, 792)[k % 3], *CHIME, att=.006, beat=.2, p=(-.5, 0, .5)[k % 3], gain=.06)
    strike(s, .3, 264, *BOWL, att=.04, p=0, gain=.2)
    strike(s, 24.3, 264, *BOWL, att=.04, p=0, gain=.2)
    s += air(rng, .035)
    return reverb(s, rng, rt=4, wet=.33, damp=3000)


TRACKS = {'sang': sang, 'am': am, 'huyen': huyen, 'sang-trong': sangtrong, 'tho': tho}

if __name__ == '__main__':
    import sys
    pick = sys.argv[1:] or list(TRACKS)
    for i, k in enumerate(TRACKS):
        if k in pick:
            write(k, master(TRACKS[k](np.random.default_rng(432 + i))))
