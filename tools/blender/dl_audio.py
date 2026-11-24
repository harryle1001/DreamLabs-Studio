"""Dream Labs — âm thanh cho video Blender: nhạc nền lấy từ tools/music/gen.py (tự tổng hợp, toàn quyền sử dụng)
cộng hiệu ứng tự tổng hợp (tiếng vút, tiếng nổ trầm, lấp lánh). Chỉ cần numpy (có sẵn trong Python của Blender)."""
import os, wave, importlib.util
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(os.path.dirname(HERE), 'music', 'gen.py')


def _gen():
    spec = importlib.util.spec_from_file_location('dl_music_gen', GEN)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


def bed(track, dur, fade_in=1.2, fade_out=2.5, seed_idx=None):
    """Lấy một bản trong gen.py (am / huyen / sang / sang-trong / tho), cắt đúng độ dài, fade đầu/cuối."""
    g = _gen()
    keys = list(g.TRACKS)
    i = keys.index(track) if seed_idx is None else seed_idx
    s = g.master(g.TRACKS[track](np.random.default_rng(432 + i)))
    n = int(dur * SR)
    s = s[:, :n].copy()
    t = np.arange(n) / SR
    env = np.clip(t / fade_in, 0, 1) * np.clip((dur - t) / fade_out, 0, 1)
    return s * env ** 1.5


def blank(dur):
    return np.zeros((2, int(dur * SR)))


def _place(buf, x, at, pan=0.0, gain=1.0):
    a = (pan + 1) * np.pi / 4
    i0 = int(at * SR)
    if i0 >= buf.shape[1]: return
    x = x[:buf.shape[1] - i0] * gain
    buf[0, i0:i0 + len(x)] += x * np.cos(a)
    buf[1, i0:i0 + len(x)] += x * np.sin(a)


def _bandsweep(noise, f0, f1, q=2.0, curve=2.0):
    """Nhiễu lọc dải có tần số giữa trượt dần (FFT theo khối, chồng lấp Hann)."""
    n = len(noise); B = 2048; H = B // 2
    win = np.hanning(B)
    out = np.zeros(n + B)
    fr = np.fft.rfftfreq(B, 1 / SR)
    for k in range(0, n, H):
        seg = np.zeros(B); m = min(B, n - k); seg[:m] = noise[k:k + m]
        x = (k / max(1, n)) ** curve
        fc = f0 * (f1 / f0) ** x
        bw = fc / q
        g = 1 / (1 + ((fr - fc) / bw) ** 2)
        out[k:k + B] += np.fft.irfft(np.fft.rfft(seg * win) * g, n=B)
    return out[:n]


def whoosh(dur, f0=300, f1=3000, q=1.6, rise=0.8, curve=1.5, seed=1):
    """Tiếng vút: nhiễu lọc dải trượt lên, to dần rồi tắt nhanh."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    x = _bandsweep(rng.standard_normal(n), f0, f1, q, curve)
    env = (np.clip(t / (dur * rise), 0, 1) ** 2) * np.clip((dur - t) / (dur * (1 - rise) + 1e-3), 0, 1) ** 0.7
    x *= env
    return x / (np.abs(x).max() + 1e-9)


def riser(dur, f0=55, f1=110, seed=2):
    """Nền trầm dâng: sóng sin trượt + nhiễu trầm, to dần."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .4 * np.sin(2 * ph + .5) + .15 * np.sin(3 * ph)
    x += .5 * _bandsweep(rng.standard_normal(n), 80, 400, 1.0, 2)
    x *= (t / dur) ** 2.2
    return np.tanh(1.4 * x) / 1.0


def boom(dur=6.0, seed=3):
    """Tiếng nổ trầm: cú đấm sub 70->26 Hz + nhiễu lọc thấp tan dần + đuôi ù dài."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    f = 26 + 44 * np.exp(-t / .18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.6)
    nz = rng.standard_normal(n)
    F = np.fft.rfft(nz); fr = np.fft.rfftfreq(n, 1 / SR)
    nz = np.fft.irfft(F / (1 + (fr / 260) ** 2) / np.sqrt(np.maximum(fr, 20)), n=n)
    nz /= np.abs(nz).max()
    crack = rng.standard_normal(n) * np.exp(-t / .05) * .35
    rum = nz * (1 - np.exp(-t / .01)) * np.exp(-t / 1.9)
    x = 1.0 * sub + .9 * rum + crack
    return np.tanh(1.6 * x) / np.tanh(1.6)


def shimmer(dur, f_lo=1400, f_hi=5200, count=60, seed=4):
    """Lấp lánh: nhiều nốt chuông nhỏ cao, mật độ tăng dần."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    for k in range(count):
        at = (rng.uniform() ** .6) * dur * .9
        f = rng.uniform(f_lo, f_hi)
        m = int(1.6 * SR); tt = np.arange(m) / SR
        x = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt / .35) * (1 - np.exp(-tt / .003))
        i0 = int(at * SR); e = min(n, i0 + m)
        out[i0:e] += x[:e - i0] * rng.uniform(.3, 1)
    return out / (np.abs(out).max() + 1e-9)


def chime(f=528, dur=5.0, ratios=(1, 2.76, 5.4), amps=(1, .25, .07), decays=(2.6, 1.1, .5), beat=.3):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = np.zeros(n)
    for r, a, d in zip(ratios, amps, decays):
        x += a * (np.sin(2 * np.pi * f * r * tt) + .8 * np.sin(2 * np.pi * (f * r + beat) * tt + 1)) * np.exp(-tt / d)
    return x * (1 - np.exp(-tt / .004)) / 1.8


def space_verb(s, rt=3.5, wet=.3, seed=7):
    rng = np.random.default_rng(seed)
    n = s.shape[1]; m = int(rt * SR); tt = np.arange(m) / SR
    out = np.empty_like(s)
    for c in range(2):
        ir = rng.standard_normal(m) * np.exp(-tt * 6.9 / rt) * (1 - np.exp(-tt / .015))
        ir /= np.sqrt((ir ** 2).sum())
        L = 1 << int(np.ceil(np.log2(n + m)))
        y = np.fft.irfft(np.fft.rfft(s[c], L) * np.fft.rfft(ir, L), L)[:n]
        out[c] = (1 - wet) * s[c] + wet * y * 1.4
    return out


def write(path, s, peak_db=-1.0):
    s = s / (np.abs(s).max() + 1e-9) * 10 ** (peak_db / 20)
    pcm = (np.clip(s.T, -1, 1) * 32767).astype('<i2')
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('  âm thanh ->', path)
    return path
