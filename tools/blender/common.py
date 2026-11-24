"""Dream Labs — phần dùng chung cho các kịch bản Blender (logo.py, collision.py).

Chạy được 2 cách:
  blender -b -P tools/blender/<tên>.py -- --preview|--4k [--vertical] [--frames 1-50] [--stills 1,40,90]
  python  tools/blender/<tên>.py -- --preview            (khi đã cài module bpy: pip install bpy)

Mọi thời gian trong cảnh tính bằng GIÂY (không theo số khung) nên bản 24 fps và 30 fps chuyển động giống hệt nhau.
"""
import os, sys, math, time, shutil, subprocess, argparse
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FONTS = os.path.join(HERE, 'fonts')


# ------------------------------------------------------------------ tham số dòng lệnh
def args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--preview', action='store_true', help='960x540 (hoặc 540x960), 24 fps, ít sample — để duyệt')
    p.add_argument('--4k', dest='uhd', action='store_true', help='3840x2160 (hoặc 2160x3840), 30 fps, Cycles GPU')
    p.add_argument('--vertical', action='store_true', help='bản dọc 9:16')
    p.add_argument('--frames', default='', help='chỉ render đoạn khung, ví dụ 1-60')
    p.add_argument('--stills', default='', help='chỉ render vài khung lẻ, ví dụ 1,40,120 (để xem nhanh)')
    p.add_argument('--samples', type=int, default=0, help='ghi đè số sample')
    p.add_argument('--scale', type=float, default=1.0, help='nhân độ phân giải (vd 0.5 để thử nhanh)')
    p.add_argument('--out', default='', help='thư mục xuất (mặc định tools/blender/out)')
    p.add_argument('--no-encode', action='store_true', help='chỉ render khung hình, không ghép video')
    p.add_argument('--cpu', action='store_true', help='ép dùng CPU')
    a = p.parse_args(argv)
    if not a.uhd:
        a.preview = True
    a.mode = '4k' if a.uhd else 'preview'
    a.fps = 30 if a.uhd else 24
    return a


def smooth(x):            # 0..1 -> 0..1, mềm hai đầu (số thực vào -> số thực ra)
    x = np.clip(x, 0, 1); y = x * x * (3 - 2 * x)
    return float(y) if np.ndim(y) == 0 else y


def ease_io(x, p=2.618):  # ease in-out mạnh hơn
    x = np.clip(x, 0, 1)
    y = np.where(x < .5, .5 * (2 * x) ** p, 1 - .5 * (2 - 2 * x) ** p)
    return float(y) if np.ndim(y) == 0 else y


def ease_out(x, p=3.0):
    x = np.clip(x, 0, 1); y = 1 - (1 - x) ** p
    return float(y) if np.ndim(y) == 0 else y


def ease_in(x, p=2.0):
    x = np.clip(x, 0, 1); return x ** p


def win(t, a, b):         # tiến độ 0..1 của t trong [a, b]
    return float(np.clip((t - a) / (b - a), 0, 1))


def hexc(h, a=1.0):
    """#RRGGBB (sRGB) -> RGBA tuyến tính cho Blender."""
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return (*lin, a)


# ------------------------------------------------------------------ cảnh & render
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    return sc


def pick_device(sc, force_cpu=False):
    """GPU: OPTIX -> CUDA -> HIP -> ONEAPI -> METAL; không có thì CPU. Trả về tên thiết bị đã chọn."""
    sc.cycles.device = 'CPU'
    if force_cpu:
        return 'CPU'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
    except Exception:
        return 'CPU'
    for kind in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI', 'METAL'):
        try:
            prefs.compute_device_type = kind
            prefs.refresh_devices() if hasattr(prefs, 'refresh_devices') else prefs.get_devices()
            devs = [d for d in prefs.devices if d.type == kind]
        except Exception:
            continue
        if devs:
            for d in prefs.devices:
                d.use = d.type == kind
            sc.cycles.device = 'GPU'
            return kind + ': ' + ', '.join(d.name for d in devs)
    return 'CPU'


def setup_render(sc, a, name, samples_preview=32, samples_4k=256, duration=10.0):
    r = sc.render
    w, h = (3840, 2160) if a.uhd else (960, 540)
    if a.vertical:
        w, h = h, w
    r.resolution_x, r.resolution_y = int(w * a.scale), int(h * a.scale)
    r.resolution_percentage = 100
    r.fps = a.fps
    sc.frame_start = 1
    sc.frame_end = int(round(duration * a.fps))
    r.engine = 'CYCLES'
    dev = pick_device(sc, a.cpu)
    cy = sc.cycles
    cy.samples = a.samples or (samples_4k if a.uhd else samples_preview)
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = .01 if a.uhd else .05
    cy.use_denoising = True
    cy.denoiser = 'OPTIX' if dev.startswith('OPTIX') else 'OPENIMAGEDENOISE'
    try:
        cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
        cy.denoising_prefilter = 'ACCURATE' if a.uhd else 'FAST'
    except Exception:
        pass
    cy.max_bounces = 8 if a.uhd else 5
    cy.glossy_bounces = 4 if a.uhd else 3
    cy.transmission_bounces = 6 if a.uhd else 4
    cy.diffuse_bounces = 2
    cy.volume_bounces = 0
    cy.caustics_reflective = cy.caustics_refractive = False
    cy.transparent_max_bounces = 128           # nhiều hạt chồng nhau vẫn trong suốt (không bị đốm đen)
    cy.blur_glossy = 1.0
    cy.sample_clamp_indirect = 6.0
    cy.use_light_tree = True
    try:
        cy.use_auto_tile = True; cy.tile_size = 2048
    except Exception:
        pass
    r.use_persistent_data = True          # giữ BVH giữa các khung -> nhanh hơn trên GPU
    r.film_transparent = False
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.color_depth = '16' if a.uhd else '8'
    r.image_settings.compression = 15
    vs = sc.view_settings
    vs.view_transform = 'AgX'
    try:
        vs.look = 'AgX - Medium High Contrast'
    except Exception:
        pass
    r.threads_mode = 'AUTO'
    out = a.out or os.path.join(HERE, 'out')
    tag = name + '_' + a.mode + ('_9x16' if a.vertical else '_16x9')
    a.tag = tag
    a.frames_dir = os.path.join(out, tag, 'frames')
    a.video = os.path.join(out, tag + '.mp4')
    os.makedirs(a.frames_dir, exist_ok=True)
    print(f'[{name}] {r.resolution_x}x{r.resolution_y} {a.fps}fps, {sc.frame_end} khung, '
          f'{cy.samples} sample, thiết bị: {dev}, denoise: {cy.denoiser}', flush=True)
    return dev


def world_nodes(w):
    if bpy.app.version < (5, 0, 0) or w.node_tree is None:
        w.use_nodes = True


def compositor_v4(sc, bloom, threshold, size, vignette):
    """Blender 4.2–4.5: cây compositor kiểu cũ (scene.node_tree + Composite)."""
    sc.use_nodes = True
    nt = sc.node_tree; N, L = nt.nodes, nt.links
    N.clear()
    rl = N.new('CompositorNodeRLayers'); comp = N.new('CompositorNodeComposite')
    g = N.new('CompositorNodeGlare')
    try:
        g.glare_type = 'BLOOM'
    except TypeError:
        g.glare_type = 'FOG_GLOW'
    g.quality = 'HIGH'; g.threshold = threshold; g.mix = -1 + min(1.0, bloom * 1.4); g.size = 8 if size > .5 else 7
    L.new(rl.outputs['Image'], g.inputs['Image'])
    ex = N.new('CompositorNodeExposure'); L.new(g.outputs['Image'], ex.inputs['Image'])
    cur = ex.outputs['Image']
    if vignette > 0:
        em = N.new('CompositorNodeEllipseMask'); em.width = em.height = 1.25
        bl = N.new('CompositorNodeBlur'); bl.size_x = bl.size_y = 300
        L.new(em.outputs[0], bl.inputs['Image'])
        mr = N.new('CompositorNodeMapRange'); mr.inputs['To Min'].default_value = 1 - vignette
        L.new(bl.outputs[0], mr.inputs['Value'])
        mx = N.new('CompositorNodeMixRGB'); mx.blend_type = 'MULTIPLY'
        L.new(cur, mx.inputs[1]); L.new(mr.outputs[0], mx.inputs[2]); cur = mx.outputs[0]
    L.new(cur, comp.inputs['Image'])
    return ex


def compositor(sc, bloom=0.6, threshold=1.0, size=0.6, fog=0.0, vignette=0.25, flash_socket=False):
    """Bloom (quầng sáng mềm) + Fog Glow nhẹ + vignette. Trả về node Exposure (keyframe được để chớp sáng)."""
    if not hasattr(sc, 'compositing_node_group'):
        return compositor_v4(sc, bloom, threshold, size, vignette)
    ng = bpy.data.node_groups.new('DL_Comp', 'CompositorNodeTree')
    sc.compositing_node_group = ng
    ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
    N, L = ng.nodes, ng.links
    rl = N.new('CompositorNodeRLayers')
    out = N.new('NodeGroupOutput')
    cur = rl.outputs['Image']
    g = N.new('CompositorNodeGlare')
    g.inputs['Type'].default_value = 'Bloom'
    g.inputs['Quality'].default_value = 'High'
    g.inputs['Threshold'].default_value = threshold
    g.inputs['Strength'].default_value = bloom
    g.inputs['Size'].default_value = size
    L.new(cur, g.inputs['Image']); cur = g.outputs['Image']
    if fog > 0:
        f = N.new('CompositorNodeGlare')
        f.inputs['Type'].default_value = 'Fog Glow'
        f.inputs['Quality'].default_value = 'Medium'
        f.inputs['Threshold'].default_value = threshold * 2
        f.inputs['Strength'].default_value = fog
        f.inputs['Size'].default_value = .5
        L.new(cur, f.inputs['Image']); cur = f.outputs['Image']
    ex = N.new('CompositorNodeExposure')
    L.new(cur, ex.inputs['Image']); cur = ex.outputs['Image']
    if vignette > 0:
        em = N.new('CompositorNodeEllipseMask')
        try:
            em.inputs['Size'].default_value = (1.25, 1.25)
        except Exception:
            pass
        bl = N.new('CompositorNodeBlur')
        try:
            bl.inputs['Size'].default_value = (300, 300)
        except Exception:
            pass
        try:
            L.new(em.outputs[0], bl.inputs['Image'])
        except Exception:
            pass
        mr = N.new('ShaderNodeMapRange')
        mr.inputs['To Min'].default_value = 1 - vignette
        L.new(bl.outputs[0], mr.inputs['Value'])
        mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'
        mul.inputs['A'].default_value = (0, 0, 0, 1)
        L.new(cur, mul.inputs['B'])
        L.new(mr.outputs[0], mul.inputs['Factor'])
        cur = mul.outputs['Result']
    L.new(cur, out.inputs[0])
    return ex


# ------------------------------------------------------------------ vật liệu
def mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    return m, m.node_tree.nodes, m.node_tree.links


def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def emission_attr_material(name='DL_Glow', col_attr='col', k_attr='k'):
    """Vật liệu phát sáng đọc màu/độ sáng theo từng đỉnh (cho hệ hạt tự dựng)."""
    m, N, L = mat(name)
    N.clear()
    o = N.new('ShaderNodeOutputMaterial')
    e = N.new('ShaderNodeEmission')
    ac = N.new('ShaderNodeAttribute'); ac.attribute_name = col_attr
    ak = N.new('ShaderNodeAttribute'); ak.attribute_name = k_attr
    L.new(ac.outputs['Color'], e.inputs['Color'])
    L.new(ak.outputs['Fac'], e.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); ad = N.new('ShaderNodeAddShader')   # cộng sáng: hạt tối không che nền
    L.new(e.outputs[0], ad.inputs[0]); L.new(tr.outputs[0], ad.inputs[1])
    L.new(ad.outputs[0], o.inputs['Surface'])
    try:
        m.cycles.emission_sampling = 'NONE'    # hàng nghìn đốm nhỏ: không dùng làm nguồn sáng (đỡ nhiễu, nhanh hơn)
    except Exception:
        pass
    return m


def link_obj(o, col=None):
    (col or bpy.context.scene.collection).objects.link(o)
    return o


def ray_vis(o, camera=True, diffuse=False, glossy=True, transmission=False, shadow=False, volume=False):
    o.visible_camera = camera; o.visible_diffuse = diffuse; o.visible_glossy = glossy
    o.visible_transmission = transmission; o.visible_shadow = shadow; o.visible_volume_scatter = volume


# ------------------------------------------------------------------ hệ hạt tự dựng (numpy -> lưới bát diện)
class Cloud:
    """N hạt, mỗi hạt là 1 bát diện (6 đỉnh, 8 mặt) kéo dài theo vận tốc thành vệt sáng.
    update(pos[N,3], vel[N,3], size[N], col[N,3], k[N]) — gọi mỗi khung; hạt ẩn: k=0, size=0."""

    OCT = np.array([[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]])

    def __init__(self, name, n, material=None, streak=1.0):
        self.n, self.streak = n, streak
        me = bpy.data.meshes.new(name)
        v = np.zeros((n * 6, 3), np.float32)
        f = (self.OCT[None, :, :] + (np.arange(n) * 6)[:, None, None]).reshape(-1, 3)
        me.vertices.add(n * 6)
        me.vertices.foreach_set('co', v.ravel())
        me.loops.add(len(f) * 3)
        me.polygons.add(len(f))
        me.loops.foreach_set('vertex_index', f.ravel().astype(np.int32))
        me.polygons.foreach_set('loop_start', (np.arange(len(f)) * 3).astype(np.int32))
        me.polygons.foreach_set('loop_total', np.full(len(f), 3, np.int32))
        me.update(calc_edges=True)
        me.attributes.new('col', 'FLOAT_COLOR', 'POINT')
        me.attributes.new('k', 'FLOAT', 'POINT')
        self.me = me
        self.ob = link_obj(bpy.data.objects.new(name, me))
        self.ob.data.materials.append(material or emission_attr_material(name + '_m'))
        ray_vis(self.ob, glossy=True)

    def update(self, pos, vel, size, col, k, dt=1 / 24):
        n = self.n
        pos = np.asarray(pos, np.float64); vel = np.asarray(vel, np.float64)
        size = np.asarray(size, np.float64)[:, None]
        sp = np.linalg.norm(vel, axis=1)[:, None]
        d = np.where(sp > 1e-9, vel / np.maximum(sp, 1e-9), np.array([[0, 0, 1.0]]))
        ref = np.where(np.abs(d[:, 2:3]) < .9, np.array([[0, 0, 1.0]]), np.array([[1.0, 0, 0]]))
        u = np.cross(d, ref); u /= np.linalg.norm(u, axis=1)[:, None]
        w = np.cross(d, u)
        tail = size + sp * dt * self.streak          # vệt kéo về phía sau
        v = np.empty((n, 6, 3))
        v[:, 0] = pos + u * size; v[:, 1] = pos - u * size
        v[:, 2] = pos + w * size; v[:, 3] = pos - w * size
        v[:, 4] = pos + d * size; v[:, 5] = pos - d * tail
        self.me.vertices.foreach_set('co', v.astype(np.float32).ravel())
        # vệt dài thì mờ đi theo tỉ lệ (giữ tổng năng lượng ~ không đổi)
        kk = np.asarray(k, np.float64) * (size[:, 0] / np.maximum(size[:, 0], (tail[:, 0] + size[:, 0]) * .5)) ** .5
        c = np.ones((n, 4)); c[:, :3] = col
        self.me.attributes['col'].data.foreach_set('color', np.repeat(c, 6, axis=0).astype(np.float32).ravel())
        self.me.attributes['k'].data.foreach_set('value', np.repeat(kk, 6).astype(np.float32))
        self.me.update()


def star_dust(name, n, rmin, rmax, seed, size_px=1.0, bright=(0.4, 2.0), cam_dist=10.0, hfov=0.6, res=960,
              cols=('#FFF4E0', '#BCA8E6', '#F2C0A8', '#AACBE0'), center=(0, 0, 0), flat=0.0, back_only=True):
    """Bụi sao tĩnh: các đốm trên vỏ cầu [rmin, rmax]; kích thước chọn để ~size_px điểm ảnh ở xa."""
    rng = np.random.default_rng(seed)
    d = rng.standard_normal((n, 3)); d /= np.linalg.norm(d, axis=1)[:, None]
    if back_only:
        d[:, 1] = np.abs(d[:, 1])                      # phía sau vật thể (camera nhìn theo +Y)
    if flat:
        d[:, 2] *= (1 - flat); d /= np.linalg.norm(d, axis=1)[:, None]
    r = rng.uniform(rmin, rmax, n)
    p = d * r[:, None] + np.array(center)
    pix = 2 * math.tan(hfov / 2) / res                  # radian / điểm ảnh
    s = (r + cam_dist) * pix * size_px * rng.uniform(.6, 1.4, n)
    pal = np.array([hexc(c)[:3] for c in cols])
    w = rng.random(n)
    ci = np.where(w < .62, 0, rng.integers(1, len(cols), n))
    k = rng.uniform(*bright, n) * (rng.random(n) ** 3 * 4 + .4)
    cl = Cloud(name, n, streak=0)
    cl.update(p, np.zeros_like(p), s, pal[ci], k)
    ray_vis(cl.ob, glossy=False)
    return cl


# ------------------------------------------------------------------ vòng render khung + ghép video
def parse_frames(a, sc):
    if a.stills:
        return [int(x) for x in a.stills.split(',') if x.strip()]
    if a.frames:
        s, e = a.frames.split('-'); return list(range(int(s), int(e) + 1))
    return list(range(sc.frame_start, sc.frame_end + 1))


def render_loop(sc, a, update):
    """update(t_giây, frame) dựng trạng thái cảnh; bỏ qua khung đã có file (chạy lại để render tiếp)."""
    frames = parse_frames(a, sc)
    t0 = time.time(); done = 0
    for f in frames:
        path = os.path.join(a.frames_dir, f'{f:05d}.png')
        if os.path.exists(path) and not a.stills:
            continue
        sc.frame_set(f)
        update((f - 1) / a.fps, f)
        sc.render.filepath = path
        ts = time.time()
        bpy.ops.render.render(write_still=True)
        done += 1
        el = time.time() - t0
        left = sum(1 for g in frames if g > f and not os.path.exists(os.path.join(a.frames_dir, f'{g:05d}.png')))
        print(f'  khung {f}/{frames[-1]}  {time.time() - ts:.1f}s  — còn ~{el / done * left / 60:.0f} phút', flush=True)
    print(f'Render xong {done} khung trong {(time.time() - t0) / 60:.1f} phút', flush=True)
    return frames


def ffmpeg_bin():
    for c in ('ffmpeg', os.path.join(HERE, 'ffmpeg.exe'), os.path.join(HERE, 'ffmpeg', 'bin', 'ffmpeg.exe')):
        p = shutil.which(c) or (c if os.path.exists(c) else None)
        if p:
            return p
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def encode(sc, a, wav=None):
    """Ghép chuỗi PNG -> mp4. Có ffmpeg: H.264 (+ H.265 ở bản 4K) kèm nhạc AAC. Không có: dùng chính Blender."""
    ff = ffmpeg_bin()
    pat = os.path.join(a.frames_dir, '%05d.png')
    outs = []
    if ff:
        base = [ff, '-y', '-framerate', str(a.fps), '-i', pat]
        if wav:
            base += ['-i', wav]
        vf = ['-pix_fmt', 'yuv420p', '-movflags', '+faststart']
        au = ['-c:a', 'aac', '-b:a', '192k', '-shortest'] if wav else []
        if a.uhd:
            outs.append(a.video)
            subprocess.run(base + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high'] + vf + au + [a.video], check=True)
            h265 = a.video.replace('.mp4', '_h265.mp4')
            r = subprocess.run(base + ['-c:v', 'libx265', '-preset', 'medium', '-crf', '18', '-tag:v', 'hvc1'] + vf + au + [h265])
            if r.returncode == 0:
                outs.append(h265)
        else:
            subprocess.run(base + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-maxrate', '2.4M', '-bufsize', '4M']
                           + vf + au + [a.video], check=True)
            outs.append(a.video)
    else:
        outs.append(encode_blender(sc, a, wav))
    for o in outs:
        print('VIDEO:', o, flush=True)
    return outs


def encode_blender(sc, a, wav):
    """Dự phòng khi máy không có ffmpeg: dựng cảnh VSE mới trong Blender rồi xuất H.264 + AAC."""
    files = sorted(x for x in os.listdir(a.frames_dir) if x.endswith('.png'))
    s2 = bpy.data.scenes.new('DL_Encode')
    s2.render.resolution_x, s2.render.resolution_y = sc.render.resolution_x, sc.render.resolution_y
    s2.render.fps = a.fps
    se = s2.sequence_editor_create()
    strips = se.strips if hasattr(se, 'strips') else se.sequences
    im = strips.new_image('img', os.path.join(a.frames_dir, files[0]), 1, 1)
    for fn in files[1:]:
        im.elements.append(fn)
    if wav:
        strips.new_sound('snd', wav, 2, 1)
    s2.frame_start, s2.frame_end = 1, len(files)
    r = s2.render
    if hasattr(r.image_settings, 'media_type'):      # Blender 5.x
        r.image_settings.media_type = 'VIDEO'
    r.image_settings.file_format = 'FFMPEG'
    r.ffmpeg.format = 'MPEG4'; r.ffmpeg.codec = 'H264'
    r.ffmpeg.constant_rate_factor = 'HIGH' if a.uhd else 'MEDIUM'
    r.ffmpeg.audio_codec = 'AAC' if wav else 'NONE'
    r.ffmpeg.audio_bitrate = 192
    s2.view_settings.view_transform = 'Standard'
    r.filepath = a.video
    with bpy.context.temp_override(scene=s2):
        bpy.ops.render.render(animation=True, scene=s2.name)
    return a.video


def finish(sc, a, audio_fn, duration):
    """Sau khi render: tổng hợp nhạc (wav) rồi ghép video."""
    if a.stills or a.no_encode:
        return
    wav = None
    try:
        sys.path.insert(0, HERE)
        import audio
        wav = os.path.join(os.path.dirname(a.frames_dir), 'audio.wav')
        audio_fn(audio, wav, duration)
    except Exception as e:
        print('Không tạo được nhạc:', e)
        wav = None
    encode(sc, a, wav)
