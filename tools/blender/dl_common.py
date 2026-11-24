"""Dream Labs — phần dùng chung cho các kịch bản Blender (tham số dòng lệnh, Cycles GPU, render từng khung, ffmpeg, nhạc).

Chạy được cả hai cách:
  blender -b -P tools/blender/<tên>.py -- --preview
  python tools/blender/<tên>.py -- --preview          (khi đã `pip install bpy`)

Tham số (sau dấu --):
  --preview            960x540, 24 fps, ít sample (mặc định)
  --4k                 3840x2160, 30 fps, sample cao, Cycles GPU (OPTIX -> CUDA -> HIP -> METAL -> CPU)
  --aspect A           16x9 | 9x16 | both   (preview mặc định 16x9, 4k mặc định both)
  --frames a-b         chỉ render khung a..b (đánh số theo fps của chế độ)
  --step n             render mỗi n khung (xem nhanh)
  --stills 1.5,6,11    chỉ render vài thời điểm (giây) ra ảnh PNG để duyệt
  --samples n          ghi đè số sample
  --device D           AUTO | OPTIX | CUDA | HIP | METAL | ONEAPI | CPU
  --exr                lưu khung EXR 16-bit (mặc định PNG 8-bit)
  --overwrite          render lại cả khung đã có (mặc định bỏ qua -> chạy tiếp được khi bị ngắt)
  --no-encode          không ghép mp4
  --out DIR            thư mục kết quả (mặc định tools/blender/out)
"""
import os, sys, time, math, shutil, subprocess, importlib.util

import bpy

for _s in (sys.stdout, sys.stderr):        # console Windows (cp1252) không in được tiếng Việt -> ép UTF-8
    try: _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
BV = bpy.app.version


# ------------------------------------------------------------------ tham số
def parse_args(defaults):
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    a = dict(mode='preview', aspect=None, frames=None, step=1, stills=None, samples=None,
             device='AUTO', exr=False, overwrite=False, encode=True, out=os.path.join(HERE, 'out'))
    i = 0
    while i < len(argv):
        k = argv[i]
        nxt = lambda: argv[i + 1]
        if k == '--preview': a['mode'] = 'preview'
        elif k in ('--4k', '--4K', '--final'): a['mode'] = '4k'
        elif k == '--aspect': a['aspect'] = nxt(); i += 1
        elif k == '--frames': a['frames'] = nxt(); i += 1
        elif k == '--step': a['step'] = max(1, int(nxt())); i += 1
        elif k == '--stills': a['stills'] = [float(x) for x in nxt().split(',') if x]; i += 1
        elif k == '--samples': a['samples'] = int(nxt()); i += 1
        elif k == '--device': a['device'] = nxt().upper(); i += 1
        elif k == '--exr': a['exr'] = True
        elif k == '--overwrite': a['overwrite'] = True
        elif k == '--no-encode': a['encode'] = False
        elif k == '--out': a['out'] = os.path.abspath(nxt()); i += 1
        else: print('  (bỏ qua tham số lạ:', k, ')')
        i += 1
    if a['aspect'] is None:
        a['aspect'] = 'both' if a['mode'] == '4k' else '16x9'
    a['aspects'] = ['16x9', '9x16'] if a['aspect'] == 'both' else [a['aspect'].replace(':', 'x')]
    if a['mode'] == '4k':
        a.update(w=3840, h=2160, fps=30, spp=defaults.get('spp_4k', 256))
    else:
        a.update(w=960, h=540, fps=24, spp=defaults.get('spp_preview', 32))
    if a['samples']:
        a['spp'] = a['samples']
    return a


# ------------------------------------------------------------------ cảnh / thiết bị
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    return sc


def setup_device(want='AUTO'):
    """Chọn GPU: OPTIX -> CUDA -> HIP -> METAL -> ONEAPI; không có thì CPU. Trả về tên backend."""
    sc = bpy.context.scene
    order = ['OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'] if want == 'AUTO' else [want]
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
    except Exception:
        prefs = None
    if prefs and want != 'CPU':
        for t in order:
            try:
                prefs.compute_device_type = t
            except Exception:
                continue
            try:
                prefs.refresh_devices()
            except Exception:
                prefs.get_devices()
            devs = [d for d in prefs.devices if d.type == t]
            if devs:
                for d in prefs.devices:
                    d.use = (d.type == t)
                sc.cycles.device = 'GPU'
                print('  GPU:', t, '·', ', '.join(d.name for d in devs))
                return t
    sc.cycles.device = 'CPU'
    print('  Không thấy GPU dùng được -> render bằng CPU')
    return 'CPU'


def setup_render(sc, a, backend, bounces=(4, 2, 4, 2), transparent=False):
    c = sc.cycles
    c.samples = a['spp']
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.02 if a['mode'] == 'preview' else 0.008
    c.use_denoising = True
    try:
        c.denoiser = 'OPTIX' if backend == 'OPTIX' else 'OPENIMAGEDENOISE'
    except Exception:
        pass
    for k, v in (('denoising_use_gpu', backend != 'CPU'), ('denoising_input_passes', 'RGB_ALBEDO_NORMAL'),
                 ('denoising_prefilter', 'ACCURATE')):
        try: setattr(c, k, v)
        except Exception: pass
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces = bounces[0], bounces[1], bounces[2], bounces[2]
    c.volume_bounces = 0
    c.transparent_max_bounces = 16
    c.caustics_reflective = c.caustics_refractive = False
    c.blur_glossy = 1.0
    try: c.use_light_tree = True
    except Exception: pass
    r = sc.render
    r.film_transparent = transparent
    r.use_persistent_data = True
    r.resolution_percentage = 100
    try:
        sc.view_settings.view_transform = 'Standard'
        sc.view_settings.look = 'None'
    except Exception:
        pass
    sc.view_settings.exposure = 0.0
    sc.view_settings.gamma = 1.0
    try: sc.display_settings.display_device = 'sRGB'
    except Exception: pass
    if a['exr']:
        r.image_settings.file_format = 'OPEN_EXR'
        r.image_settings.color_depth = '16'
        r.image_settings.exr_codec = 'DWAA'
    else:
        r.image_settings.file_format = 'PNG'
        r.image_settings.color_mode = 'RGB'
        r.image_settings.color_depth = '8'
        r.image_settings.compression = 15


def set_aspect(sc, a, aspect):
    w, h = a['w'], a['h']
    if aspect == '9x16':
        w, h = h, w
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.fps = a['fps']
    return w / h


# ------------------------------------------------------------------ vật liệu / node tiện ích
def srgb(hexstr, a=1.0):
    """'#RRGGBB' -> màu tuyến tính (Blender dùng không gian tuyến tính)."""
    hexstr = hexstr.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(hexstr[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, a)


def sock(node, *names):
    """Lấy socket đầu vào theo tên (tên đổi giữa các bản Blender)."""
    for n in names:
        if n in node.inputs:
            return node.inputs[n]
    return None


def setin(node, names, value):
    s = sock(node, *([names] if isinstance(names, str) else names))
    if s is not None:
        try: s.default_value = value
        except Exception: pass
    return s


def set_opt(node, attr, value, socket_names=()):
    """Thuộc tính node (Blender 4.x) hoặc socket (Blender 5.x)."""
    try:
        setattr(node, attr, value); return True
    except Exception:
        pass
    for n in socket_names:
        if n in node.inputs:
            try:
                node.inputs[n].default_value = value; return True
            except Exception:
                pass
    return False


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return m, nt, out


# ------------------------------------------------------------------ điểm / hạt (Geometry Nodes)
def points_object(name, n, mat, sphere_subdiv=2, coll=None):
    """Một mesh N điểm; Geometry Nodes đặt quả cầu nhỏ lên mỗi điểm. Thuộc tính điểm: size (bán kính),
    col (màu), emit (độ sáng) — shader đọc qua node Attribute kiểu Instancer. Cập nhật mỗi khung bằng update_points()."""
    me = bpy.data.meshes.new(name)
    me.vertices.add(n)
    me.attributes.new('size', 'FLOAT', 'POINT')
    me.attributes.new('col', 'FLOAT_VECTOR', 'POINT')
    me.attributes.new('emit', 'FLOAT', 'POINT')
    ob = bpy.data.objects.new(name, me)
    (coll or bpy.context.scene.collection).objects.link(ob)
    ng = bpy.data.node_groups.new(name + '_gn', 'GeometryNodeTree')
    if hasattr(ng, 'interface'):
        ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
        ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    else:
        ng.inputs.new('NodeSocketGeometry', 'Geometry'); ng.outputs.new('NodeSocketGeometry', 'Geometry')
    N = ng.nodes
    gi, go = N.new('NodeGroupInput'), N.new('NodeGroupOutput')
    ico = N.new('GeometryNodeMeshIcoSphere'); ico.inputs['Radius'].default_value = 1.0
    ico.inputs['Subdivisions'].default_value = sphere_subdiv
    sm = N.new('GeometryNodeSetShadeSmooth') if sphere_subdiv > 1 else None
    iop = N.new('GeometryNodeInstanceOnPoints')
    na = N.new('GeometryNodeInputNamedAttribute'); na.data_type = 'FLOAT'; na.inputs['Name'].default_value = 'size'
    setm = N.new('GeometryNodeSetMaterial'); setm.inputs['Material'].default_value = mat
    L = ng.links
    L.new(gi.outputs[0], iop.inputs['Points'])
    if sm:
        L.new(ico.outputs['Mesh'], sm.inputs['Geometry']); L.new(sm.outputs['Geometry'], iop.inputs['Instance'])
    else:
        L.new(ico.outputs['Mesh'], iop.inputs['Instance'])
    L.new(na.outputs['Attribute'], iop.inputs['Scale'])
    L.new(iop.outputs['Instances'], setm.inputs['Geometry'])
    L.new(setm.outputs['Geometry'], go.inputs[0])
    mod = ob.modifiers.new('pts', 'NODES'); mod.node_group = ng
    return ob


def update_points(ob, co, size, col, emit):
    import numpy as np
    me = ob.data
    me.vertices.foreach_set('co', np.ascontiguousarray(co, dtype=np.float32).ravel())
    me.attributes['size'].data.foreach_set('value', np.ascontiguousarray(size, dtype=np.float32).ravel())
    me.attributes['col'].data.foreach_set('vector', np.ascontiguousarray(col, dtype=np.float32).ravel())
    me.attributes['emit'].data.foreach_set('value', np.ascontiguousarray(emit, dtype=np.float32).ravel())
    me.update()


def emissive_points_mat(name, mult=1.0):
    """Shader cho hạt: phát sáng theo col * emit (thuộc tính từ Geometry Nodes)."""
    m, nt, out = new_mat(name)
    ac = nt.nodes.new('ShaderNodeAttribute'); ac.attribute_type = 'INSTANCER'; ac.attribute_name = 'col'
    ae = nt.nodes.new('ShaderNodeAttribute'); ae.attribute_type = 'INSTANCER'; ae.attribute_name = 'emit'
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = mult
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(ac.outputs['Vector'], em.inputs['Color'])
    nt.links.new(ae.outputs['Fac'], mul.inputs[0])
    nt.links.new(mul.outputs[0], em.inputs['Strength'])
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    for ob_vis in ('shadow',):
        pass
    return m


def no_shadow(ob):
    for k in ('visible_shadow', 'visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter'):
        if hasattr(ob, k):
            setattr(ob, k, False)


# ------------------------------------------------------------------ compositor: bloom nhẹ + vignette
def compositor_glow(sc, threshold=1.0, size=7, mix=-0.6, quality='HIGH', vignette=0.0):
    """Glare (Bloom/Fog Glow). Hỗ trợ Blender 4.x (scene.node_tree) và 5.x (compositing_node_group)."""
    try:
        if hasattr(sc, 'compositing_node_group'):               # Blender 5.x
            ng = bpy.data.node_groups.new('DL_comp', 'CompositorNodeTree')
            sc.compositing_node_group = ng
            ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
            nt = ng
            out = nt.nodes.new('NodeGroupOutput')
            outsock = out.inputs[0]
        else:                                                  # Blender 4.x
            sc.use_nodes = True
            nt = sc.node_tree
            for n in list(nt.nodes):
                nt.nodes.remove(n)
            out = nt.nodes.new('CompositorNodeComposite')
            outsock = out.inputs['Image']
        try: sc.render.use_compositing = True
        except Exception: pass
        rl = nt.nodes.new('CompositorNodeRLayers')
        g = nt.nodes.new('CompositorNodeGlare')
        ok = set_opt(g, 'glare_type', 'BLOOM', ('Type',)) or set_opt(g, 'glare_type', 'FOG_GLOW', ('Type',))
        if not ok:
            set_opt(g, 'glare_type', 'Bloom', ('Type',))
        set_opt(g, 'quality', quality, ('Quality',))
        set_opt(g, 'threshold', threshold, ('Threshold',))
        set_opt(g, 'size', size, ('Size',))
        set_opt(g, 'mix', mix, ())
        if 'Strength' in g.inputs:                             # 4.4+/5.x: độ mạnh thay cho mix
            g.inputs['Strength'].default_value = max(0.05, (mix + 1) * 0.6)
        if 'Size' in g.inputs and g.inputs['Size'].type == 'VALUE':
            g.inputs['Size'].default_value = min(1.0, size / 9.0)
        nt.links.new(rl.outputs['Image'], g.inputs['Image'])
        last = g.outputs['Image']
        if vignette > 0:
            # vignette: ảnh * (1 - v*r^2) qua Ellipse Mask + Blur sẽ khác nhau giữa các bản; dùng Lens Distortion? -> không. Bỏ qua cho đơn giản.
            pass
        nt.links.new(last, outsock)
        return True
    except Exception as e:
        print('  (compositor glow bỏ qua:', e, ')')
        return False


# ------------------------------------------------------------------ easing
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lin(t, t0, t1):
    return clamp((t - t0) / (t1 - t0)) if t1 != t0 else float(t >= t1)


def smooth(x):
    x = clamp(x); return x * x * (3 - 2 * x)


def smoother(x):
    x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10)


def ease_out(x, p=3):
    x = clamp(x); return 1 - (1 - x) ** p


def ease_in(x, p=3):
    x = clamp(x); return x ** p


def ease_io(x, p=3):
    x = clamp(x)
    return 0.5 * (2 * x) ** p if x < 0.5 else 1 - 0.5 * (2 - 2 * x) ** p


def mix(a, b, f):
    return a + (b - a) * f


# ------------------------------------------------------------------ render vòng lặp
def frame_list(a, duration):
    n = int(round(duration * a['fps']))
    if a['stills']:
        return [int(round(s * a['fps'])) + 1 for s in a['stills']]
    lo, hi = 1, n
    if a['frames']:
        p = a['frames'].split('-')
        lo = int(p[0]); hi = int(p[1]) if len(p) > 1 and p[1] else n
    return list(range(lo, min(hi, n) + 1, a['step']))


def is_black(path):
    """Khung lỗi (toàn đen) — có lần GPU trả ảnh đen khi vừa nạp kernel denoise hoặc thiếu VRAM."""
    try:
        import numpy as np
        im = bpy.data.images.load(path, check_existing=False)
        px = np.empty(len(im.pixels), dtype=np.float32); im.pixels.foreach_get(px)
        bpy.data.images.remove(im)
        return float(px.reshape(-1, 4)[::97, :3].max()) < 0.01
    except Exception:
        return False


def render_frames(sc, a, name, aspect, duration, update):
    """Render từng khung (bỏ qua khung đã có). update(t_giây) dựng trạng thái cảnh cho thời điểm t."""
    ext = 'exr' if a['exr'] else 'png'
    sub = 'stills' if a['stills'] else 'frames'
    d = os.path.join(a['out'], name, f"{a['mode']}_{aspect}", sub)
    os.makedirs(d, exist_ok=True)
    frames = frame_list(a, duration)
    sc.frame_start, sc.frame_end = 1, int(round(duration * a['fps']))
    t0 = time.time(); done = 0
    for k, f in enumerate(frames):
        tag = f'{f:04d}' if not a['stills'] else f"t{a['stills'][k]:05.2f}"
        path = os.path.join(d, f'{tag}.{ext}')
        if os.path.exists(path) and not a['overwrite']:
            continue
        sc.frame_set(f)
        update((f - 1) / a['fps'])
        sc.render.filepath = path
        ts = time.time()
        for attempt in range(3):
            bpy.ops.render.render(write_still=True)
            if not is_black(path):
                break
            print(f'  ! khung {f} ra đen (GPU/denoiser chưa sẵn sàng?) -> render lại lần {attempt + 2}', flush=True)
        done += 1
        el = time.time() - t0
        left = (len(frames) - k - 1) * el / done
        print(f'  [{name} {aspect}] khung {f}/{frames[-1]}  {time.time() - ts:5.1f}s  '
              f'— còn ~{left / 60:5.1f} phút', flush=True)
    print(f'  [{name} {aspect}] xong {done} khung trong {(time.time() - t0) / 60:.1f} phút')
    return d


# ------------------------------------------------------------------ ffmpeg
def find_ffmpeg():
    for c in (os.environ.get('FFMPEG'), shutil.which('ffmpeg'), shutil.which('ffmpeg.exe'),
              r'C:\ffmpeg\bin\ffmpeg.exe', os.path.join(HERE, 'ffmpeg.exe')):
        if c and os.path.exists(c):
            return c
    return None


def encode(a, frames_dir, dst_noext, wav=None):
    ff = find_ffmpeg()
    if not ff:
        print('  Không thấy ffmpeg -> giữ chuỗi khung ảnh ở', frames_dir); return []
    ext = 'exr' if a['exr'] else 'png'
    inp = ['-framerate', str(a['fps']), '-start_number', '1', '-i', os.path.join(frames_dir, f'%04d.{ext}')]
    aud = ['-i', wav] if wav else []
    amap = ['-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-af',
            'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000', '-shortest'] if wav else []
    outs = []
    if a['mode'] == 'preview':
        jobs = [('.mp4', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'])]
    else:
        jobs = [('_h264.mp4', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']),
                ('_h265.mp4', ['-c:v', 'libx265', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p10le', '-tag:v', 'hvc1', '-movflags', '+faststart'])]
    for suf, vc in jobs:
        dst = dst_noext + suf
        cmd = [ff, '-y', '-loglevel', 'error'] + inp + aud + vc + (amap if wav else []) + [dst]
        print('  ffmpeg ->', dst)
        r = subprocess.run(cmd)
        if r.returncode == 0:
            outs.append(dst)
    return outs


def contact_sheet(frames_dir, dst, cols=5, rows=4, width=384):
    ff = find_ffmpeg()
    if not ff: return None
    files = sorted(f for f in os.listdir(frames_dir) if f.endswith(('.png', '.exr')))
    if not files: return None
    n = cols * rows
    pick = [files[min(len(files) - 1, round(i * (len(files) - 1) / (n - 1)))] for i in range(n)]
    lst = os.path.join(frames_dir, '_sheet.txt')
    with open(lst, 'w', encoding='utf-8') as fh:
        for p in pick:
            fh.write(f"file '{os.path.join(frames_dir, p).replace(os.sep, '/')}'\n")
    subprocess.run([ff, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-vf', f'scale={width}:-2,tile={cols}x{rows}:padding=4:color=0x0b0a0f', '-frames:v', '1', dst])
    os.remove(lst)
    return dst


# ------------------------------------------------------------------ chương trình chính
def run(name, duration, build, defaults=None):
    """build(sc, a, aspect_ratio) -> (update(t), wav_or_None). Được gọi lại cho mỗi khung hình (16x9/9x16)."""
    defaults = defaults or {}
    a = parse_args(defaults)
    print(f"\n== Dream Labs · {name} · {a['mode']} · {a['w']}x{a['h']} @ {a['fps']}fps · {a['spp']} spp · Blender {bpy.app.version_string}")
    results = []
    for aspect in a['aspects']:
        sc = reset_scene()
        backend = setup_device(a['device'])
        setup_render(sc, a, backend, **defaults.get('render', {}))
        ar = set_aspect(sc, a, aspect)
        update, audio = build(sc, a, ar)
        try:
            bpy.app.handlers.frame_change_pre.clear()
            bpy.app.handlers.frame_change_pre.append(lambda s, *_: update((s.frame_current - 1) / s.render.fps))
        except Exception:
            pass
        d = render_frames(sc, a, name, aspect, duration, update)
        if a['stills'] or not a['encode'] or a['frames'] or a['step'] > 1:
            results.append(d); continue
        base = os.path.join(a['out'], name, f'{name}_{aspect}_{a["mode"]}')
        wav = None
        if audio:
            wav = base + '.wav'
            if not os.path.exists(wav):
                audio(wav, duration)
        results += encode(a, d, base, wav)
        sheet = contact_sheet(d, base + '_grid.jpg')
        if sheet: results.append(sheet)
    print('\n== Kết quả:'); [print('  ', r) for r in results]
    return results
