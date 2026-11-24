"""Dream Labs — âm thanh cho video Blender: nhạc nền tự tổng hợp (tools/music/gen.py) + hiệu ứng tự tổng hợp.
Không dùng mẫu âm thanh hay nhạc có bản quyền. Chỉ cần numpy (có sẵn trong Blender).

  python tools/blender/audio.py logo out.wav 11
  python tools/blender/audio.py collision out.wav 16
"""
import os, sys, wave
sys.dont_write_bytecode = True        # không để lại __pycache__ trong tools/music
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'music'))
SR = 48000


def music(name, dur, offset=0.0):
    import gen
    i = list(gen.TRACKS).index(name)
    s = gen.master(gen.TRACKS[name](np.random.default_rng(432 + i)))
    a = int(offset * SR)
    n = int(dur * SR)
    return np.roll(s, -a, axis=1)[:, :n].copy()


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def env(t, a, b, c=None, d=None):
    """Hình bao: lên từ a->b, giữ, xuống c->d."""
    e = np.clip((t - a) / max(b - a, 1e-6), 0, 1)
    if c is not None:
        e *= 1 - np.clip((t - c) / max(d - c, 1e-6), 0, 1)
    return e


def svf(x, fc, q=.7):
    """Lọc thông dải biến thiên theo thời gian (state-variable filter). fc: mảng tần số cắt theo mẫu."""
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    lp = bp = 0.0
    out = np.empty_like(x)
    damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp
    return out


def lowpass(x, fc):
    F = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(F / np.sqrt(1 + (fr / fc) ** 4), n=len(x))


def pan(x, p):
    p = np.broadcast_to(p, x.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def whoosh(t, a, b, f0, f1, gain, p0=-.6, p1=.6, rng=None, shape=2.0):
    """Tiếng vút: nhiễu lọc dải quét f0 -> f1, to dần rồi tắt nhanh, chạy từ trái sang phải."""
    rng = rng or np.random.default_rng(1)
    m = (t >= a - .05) & (t <= b + .6)
    idx = np.where(m)[0]
    tl = t[idx]
    k = np.clip((tl - a) / (b - a), 0, 1)
    fc = f0 * (f1 / f0) ** (k ** shape)
    x = svf(rng.standard_normal(len(idx)), fc, q=1.6)
    e = k ** 2.2 * np.exp(-np.clip(tl - b, 0, None) / .12)
    out = np.zeros((2, len(t)))
    out[:, idx] = pan(x * e * gain, p0 + (p1 - p0) * k)
    return out


def tone(t, at, f, dec, gain, att=.01, partials=((1, 1), (2, .3), (3, .12)), beat=.4, p=0.0):
    x = np.zeros(len(t))
    tl = np.clip(t - at, 0, None)
    on = t >= at
    for r, g in partials:
        x += g * (np.sin(2 * np.pi * f * r * tl) + .7 * np.sin(2 * np.pi * (f * r + beat) * tl + 1))
    x *= np.exp(-tl / dec) * (1 - np.exp(-tl / att)) * on * gain
    return pan(x, p)


def boom(t, at, gain, rng):
    """Tiếng nổ trầm: sub 34–60 Hz trượt xuống + bùng nhiễu lọc thấp + tiếng rền dài."""
    tl = np.clip(t - at, 0, None); on = t >= at
    f = 30 + 34 * np.exp(-tl / .35)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-tl / 1.6) * (1 - np.exp(-tl / .004)) * on
    nz = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-tl / .22) * on
    crack = lowpass(rng.standard_normal(len(t)), 5000) * np.exp(-tl / .035) * on * .5
    rumble = lowpass(rng.standard_normal(len(t)), 140) * np.exp(-tl / 2.6) * (1 - np.exp(-tl / .25)) * on * 2.2
    m = sub * 1.0 + nz * .55 + crack + rumble
    return np.stack([m, np.roll(m, 37)]) * gain


def swell(t, a, b, gain, freqs, p=0.0):
    """Âm dâng ngược (như băng quay ngược): chuỗi hòa âm to dần rồi tắt mềm."""
    k = np.clip((t - a) / (b - a), 0, 1)
    e = k ** 3 * np.exp(-np.clip(t - b, 0, None) / .5) * (t >= a)
    x = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) for i, f in enumerate(freqs))
    return pan(x * e * gain, p)


def write(path, s, fade_in=.25, fade_out=1.4, peak=-1.0):
    n = s.shape[1]
    t = np.arange(n) / SR
    s = s * np.clip(t / fade_in, 0, 1) * np.clip((t[-1] - t) / fade_out, 0, 1)
    s = np.tanh(s / np.abs(s).max() * 1.15) / np.tanh(1.15) * 10 ** (peak / 20)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(s.T, -1, 1) * 32767).astype('<i2').tobytes())
    print('AUDIO:', path)
    return path


# ------------------------------------------------------------------ video 1: logo
def logo_track(path, dur=11.0):
    rng = np.random.default_rng(11)
    t = tt(dur)
    m = music('sang-trong', dur, offset=1.5) * .85
    m *= .6 + .4 * env(t, 2.8, 3.6)                         # nhạc mở hẳn khi logo hình thành
    fx = whoosh(t, .3, 3.0, 180, 5200, .22, -.7, .2, rng, 1.6)
    fx += whoosh(t, 1.2, 3.02, 300, 7000, .14, .7, -.1, rng, 2.2)
    fx += tone(t, 3.05, 43.2, 1.6, .22, att=.02, partials=((1, 1), (2, .25)), beat=.0)     # nhịp trầm khi logo xuất hiện
    fx += tone(t, 3.05, 172.8, 5.0, .16, att=.03, partials=((1, 1), (2.71, .42), (5.15, .2)), beat=.6)  # bát hát
    for i, f in enumerate((864, 1036.8, 1296, 1728)):                                     # lấp lánh
        fx += tone(t, 3.1 + i * .09, f, 1.4, .05, att=.004, partials=((1, 1), (2.76, .2)), beat=.3, p=-.5 + i * .33)
    fx += whoosh(t, 4.9, 6.7, 2000, 9000, .05, -.6, .6, rng, 1.0)                         # vệt sáng lướt
    for i, f in enumerate((648, 777.6, 972, 1296, 1555.2)):                              # chữ hiện
        fx += tone(t, 5.9 + i * .32, f, 1.8, .04, att=.005, partials=((1, 1), (2, .15)), beat=.2, p=-.6 + i * .3)
    fx += tone(t, 8.4, 129.6, 4.5, .1, att=.04, partials=((1, 1), (2.71, .4), (5.15, .15)), beat=.5)
    return write(path, m + fx)


# ------------------------------------------------------------------ video 2: hai ngôi sao va chạm
def collision_track(path, dur=16.0, bang=6.6):
    rng = np.random.default_rng(16)
    t = tt(dur)
    m = music('huyen', dur, offset=4.0) * .85
    m *= 1 - .75 * env(t, bang - .5, bang - .05, bang + .3, bang + 2.2)    # nén nhạc quanh tiếng nổ
    m *= .7 + .3 * env(t, bang + 1, bang + 4)
    fx = whoosh(t, .2, 3.4, 120, 1400, .2, -.8, .1, rng, 1.4)
    fx += whoosh(t, .8, 4.3, 150, 2200, .2, .8, -.1, rng, 1.6)
    # vòng xoáy tăng tốc: tiếng "vù vù" nhịp quay nhanh dần + âm cao trượt lên
    k = np.clip((t - 4.2) / (bang - 4.2), 0, 1)
    rot = 2 * np.pi * np.cumsum(1.2 + 18 * k ** 2.4) / SR
    nz = svf(rng.standard_normal(len(t)), 300 + 3000 * k ** 2, q=.8)
    whirl = nz * (.5 + .5 * np.sin(rot)) * k ** 1.6 * (t < bang) * .5
    fx += np.stack([whirl * (.6 + .4 * np.sin(rot)), whirl * (.6 - .4 * np.sin(rot))])
    f_rise = 70 + 380 * k ** 2.5
    riser = np.sin(2 * np.pi * np.cumsum(f_rise) / SR) * k ** 2 * (t < bang) * .12
    fx += np.stack([riser, riser])
    fx += boom(t, bang, .5, rng)
    fx += tone(t, bang, 86.4, 6, .22, att=.01, partials=((1, 1), (2, .4), (3, .2)), beat=.3)
    for i in range(14):                                                    # mảnh sao bay vút
        a0 = bang + .1 + rng.uniform(0, 1.2)
        fx += whoosh(t, a0, a0 + rng.uniform(.25, .6), 3000, 600, .03, rng.uniform(-1, 1), rng.uniform(-1, 1), rng, .7)
    fx += swell(t, bang + 1.6, bang + 4.6, .07, (259.2, 388.8, 518.4, 648, 777.6), 0)   # thiên hà tụ lại
    for i, f in enumerate((518.4, 648, 777.6, 1036.8, 1296)):
        fx += tone(t, bang + 4.6 + i * .21, f, 2.4, .045, att=.004, partials=((1, 1), (2.76, .2)), beat=.3, p=-.6 + i * .3)
    fx += tone(t, bang + 4.6, 144, 7, .16, att=.05, partials=((1, 1), (2.71, .42), (5.15, .2)), beat=.9)
    return write(path, m + fx)


if __name__ == '__main__':
    which, out = sys.argv[1], sys.argv[2]
    d = float(sys.argv[3]) if len(sys.argv) > 3 else None
    if which == 'logo':
        logo_track(out, d or 11.0)
    else:
        collision_track(out, d or 16.0)
