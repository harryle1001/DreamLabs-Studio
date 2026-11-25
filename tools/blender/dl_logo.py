"""Dream Labs — Video 1: logo 3D (12 giây). Dựng toàn bộ cảnh bằng code.

  blender -b -P tools/blender/dl_logo.py -- --preview        (960x540, 24 fps, 16:9)
  blender -b -P tools/blender/dl_logo.py -- --4k             (3840x2160 + 2160x3840, 30 fps, Cycles GPU)
  blender -b -P tools/blender/dl_logo.py -- --4k --aspect 9x16

Nhịp: 0–3,2 s hạt vàng xoáy theo đường xoắn ốc hội tụ vào tâm · 3,2 s logo hình thành (chớp sáng, vành tia)
· 3,2–9 s logo xoay chậm lộ độ dày, camera lùi–tiến êm, ánh sáng lướt qua bề mặt · 7,4–9,6 s chữ hiện dần
· 9,6–12 s logo tĩnh trên nền tối #15121C, bụi sao mờ, quầng sáng dịu.
"""
import os, sys, math
os.environ.setdefault('OPENBLAS_NUM_THREADS', '4')      # module bpy + numpy: tránh lỗi cấp phát khi máy nhiều nhân, ít RAM
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bpy
from mathutils import Vector, Euler
import dl_common as C
import dl_audio as A

NAME = 'dl_logo'
DUR = 12.0
K_RATIO = (1 + 5 ** .5) / 2
FONT_DIR = os.path.join(C.HERE, 'fonts')

# màu thương hiệu (src/partials/00-chrome.html: gradient dl-lg = lav -> peach (0.618) -> mist)
LAV, PEACH, MIST = '#BCA8E6', '#F2C0A8', '#AACBE0'
PAPER, BG = '#FBF8F3', '#15121C'
CHAMPAGNE = '#EADCC2'
CREAM_TXT = '#EFE5D3'

S = 0.1                    # 1 đơn vị viewBox (26) = 0.1 m
R_DISC = 12 * S
MARK_Z = 0.62              # tâm logo (trục đứng thế giới)
TEXT_Z = -1.32


def svg(x, y):
    return ((x - 13) * S, -(y - 13) * S)


# ------------------------------------------------------------------ hình học logo
def crescent_pts(n=220):
    """Trăng khuyết = đĩa lớn (tâm 13,13 r 7.4164) trừ đĩa nhỏ (tâm 20.054,10.708 r 4.5836) — đúng path trong SVG."""
    cb = np.array(svg(20.0540, 10.7082)); rb = 4.5836 * S; rB = 7.4164 * S
    p1 = np.array(svg(17.3593, 7.0)); p2 = np.array(svg(20.0534, 15.2918))
    a1 = math.atan2(p1[1], p1[0]); a2 = math.atan2(p2[1], p2[0]) + 2 * math.pi
    pts = [(rB * math.cos(a), rB * math.sin(a)) for a in np.linspace(a1, a2, int(n * .7))]
    b2 = math.atan2(*(p2 - cb)[::-1]) % (2 * math.pi); b1 = math.atan2(*(p1 - cb)[::-1]) % (2 * math.pi)
    for a in np.linspace(b2, b1, int(n * .3))[1:-1]:
        pts.append((cb[0] + rb * math.cos(a), cb[1] + rb * math.sin(a)))
    return pts


def curve_obj(name, loops, extrude, bevel, offset=0.0, res=4):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = extrude; cu.bevel_depth = bevel; cu.bevel_resolution = res; cu.offset = offset
    for pts in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for p, (x, y) in zip(sp.points, pts):
            p.co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def circle_pts(r, n=256, cx=0.0, cy=0.0):
    return [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in np.linspace(0, 2 * math.pi, n, endpoint=False)]


# ------------------------------------------------------------------ vật liệu
def mat_disc():
    m, nt, out = C.new_mat('DL_disc_pearl')
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ')
    L.new(tc.outputs['Object'], sx.inputs[0])
    sub = N.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'
    L.new(sx.outputs['X'], sub.inputs[0]); L.new(sx.outputs['Y'], sub.inputs[1])
    mad = N.new('ShaderNodeMath'); mad.operation = 'MULTIPLY_ADD'
    mad.inputs[1].default_value = 1 / (4 * R_DISC); mad.inputs[2].default_value = 0.5
    L.new(sub.outputs[0], mad.inputs[0])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].position = 0.0; cr.elements[0].color = C.srgb(LAV)
    cr.elements[1].position = 1.0; cr.elements[1].color = C.srgb(MIST)
    e = cr.elements.new(0.618); e.color = C.srgb(PEACH)
    L.new(mad.outputs[0], ramp.inputs['Fac'])
    p = N.new('ShaderNodeBsdfPrincipled')
    L.new(ramp.outputs['Color'], p.inputs['Base Color'])
    C.setin(p, 'Roughness', 0.22)
    C.setin(p, ('Coat Weight', 'Clearcoat'), 1.0)
    C.setin(p, ('Coat Roughness', 'Clearcoat Roughness'), 0.035)
    C.setin(p, ('Subsurface Weight', 'Subsurface'), 0.18)
    C.setin(p, 'Subsurface Radius', (0.05, 0.04, 0.05))
    C.setin(p, ('Sheen Weight', 'Sheen'), 0.35)
    C.setin(p, 'Sheen Tint', C.srgb('#F4EEFF'))
    C.setin(p, 'Thin Film Thickness', 260.0)
    C.setin(p, 'Thin Film IOR', 1.38)
    C.setin(p, ('Emission Color', 'Emission'), C.srgb('#FFF1DC'))
    glow = C.setin(p, 'Emission Strength', 0.0)
    L.new(p.outputs[0], out.inputs['Surface'])
    return m, glow


def mat_metal(name, hexcol, rough, metallic=1.0, wipe=False):
    m, nt, out = C.new_mat(name)
    N, L = nt.nodes, nt.links
    p = N.new('ShaderNodeBsdfPrincipled')
    C.setin(p, 'Base Color', C.srgb(hexcol)); C.setin(p, 'Metallic', metallic); C.setin(p, 'Roughness', rough)
    C.setin(p, ('Specular IOR Level', 'Specular'), 0.6)
    C.setin(p, ('Emission Color', 'Emission'), C.srgb('#FFE9C4'))
    glow = C.setin(p, 'Emission Strength', 0.0)
    if not wipe:
        L.new(p.outputs[0], out.inputs['Surface'])
        return m, glow, None
    # chữ hiện dần: mặt nạ quét trái -> phải theo toạ độ X của vật thể, mép mềm
    tc = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ')
    L.new(tc.outputs['Object'], sx.inputs[0])
    val = N.new('ShaderNodeValue'); val.outputs[0].default_value = -5.0
    sub = N.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'
    L.new(val.outputs[0], sub.inputs[0]); L.new(sx.outputs['X'], sub.inputs[1])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.0; mr.inputs['From Max'].default_value = 0.55
    mr.interpolation_type = 'SMOOTHSTEP'
    L.new(sub.outputs[0], mr.inputs['Value'])
    tr = N.new('ShaderNodeBsdfTransparent')
    ms = N.new('ShaderNodeMixShader')
    L.new(mr.outputs['Result'], ms.inputs['Fac'])
    L.new(tr.outputs[0], ms.inputs[1]); L.new(p.outputs[0], ms.inputs[2])
    L.new(ms.outputs[0], out.inputs['Surface'])
    # ánh viền sáng ở mép quét
    edge = N.new('ShaderNodeMapRange'); edge.inputs['From Min'].default_value = 0.0; edge.inputs['From Max'].default_value = 0.35
    edge.inputs['To Min'].default_value = 1.0; edge.inputs['To Max'].default_value = 0.0
    edge.interpolation_type = 'SMOOTHSTEP'
    L.new(sub.outputs[0], edge.inputs['Value'])
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 6.0
    mul2 = N.new('ShaderNodeMath'); mul2.operation = 'MULTIPLY'
    L.new(edge.outputs['Result'], mul.inputs[0]); L.new(mul.outputs[0], mul2.inputs[0]); L.new(mr.outputs['Result'], mul2.inputs[1])
    add = N.new('ShaderNodeMath'); add.operation = 'ADD'
    gval = N.new('ShaderNodeValue'); gval.outputs[0].default_value = 0.0
    L.new(mul2.outputs[0], add.inputs[0]); L.new(gval.outputs[0], add.inputs[1])
    L.new(add.outputs[0], p.inputs['Emission Strength'])
    return m, gval.outputs[0], val.outputs[0]


def mat_emit(name, hexcol, strength):
    m, nt, out = C.new_mat(name)
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = C.srgb(hexcol)
    em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    return m, em.inputs['Strength']


def mat_halo():
    """Quầng sáng dịu phía sau logo: gradient tròn tím oải hương -> hồng đào, mép trong suốt."""
    m, nt, out = C.new_mat('DL_halo')
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord'); g = N.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    sc2 = N.new('ShaderNodeVectorMath'); sc2.operation = 'SCALE'; sc2.inputs['Scale'].default_value = 2.0
    L.new(tc.outputs['Object'], sc2.inputs[0]); L.new(sc2.outputs[0], g.inputs['Vector'])
    pw = N.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 3.0
    L.new(g.outputs['Fac'], pw.inputs[0])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].color = C.srgb('#6F5BAE'); cr.elements[1].color = C.srgb('#F2C0A8')
    cr.elements[1].position = 0.9
    L.new(pw.outputs[0], ramp.inputs['Fac'])
    em = N.new('ShaderNodeEmission'); L.new(ramp.outputs['Color'], em.inputs['Color'])
    k = N.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = 0.0
    L.new(pw.outputs[0], k.inputs[0]); L.new(k.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); ad = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], ad.inputs[0]); L.new(tr.outputs[0], ad.inputs[1])
    L.new(ad.outputs[0], out.inputs['Surface'])
    return m, k.inputs[1]


def world_setup(sc):
    """Camera thấy nền phẳng #15121C; tia phản chiếu thấy một 'studio' tối có dải sáng mềm để kim loại có gì phản chiếu."""
    w = bpy.data.worlds.new('DL_world'); sc.world = w; w.use_nodes = True
    nt = w.node_tree; N, L = nt.nodes, nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputWorld')
    bg_cam = N.new('ShaderNodeBackground'); bg_cam.inputs['Color'].default_value = C.srgb(BG); bg_cam.inputs['Strength'].default_value = 1.0
    tc = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sx.inputs[0])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].position = 0.35; cr.elements[0].color = C.srgb('#120F18')
    cr.elements[1].position = 0.95; cr.elements[1].color = C.srgb('#8E82AE')
    e = cr.elements.new(0.62); e.color = C.srgb('#3A3050')
    L.new(sx.outputs['Z'], ramp.inputs['Fac'])
    bg_env = N.new('ShaderNodeBackground'); bg_env.inputs['Strength'].default_value = 0.85
    L.new(ramp.outputs['Color'], bg_env.inputs['Color'])
    lp = N.new('ShaderNodeLightPath'); ms = N.new('ShaderNodeMixShader')
    L.new(lp.outputs['Is Camera Ray'], ms.inputs['Fac'])
    L.new(bg_env.outputs[0], ms.inputs[1]); L.new(bg_cam.outputs[0], ms.inputs[2])
    L.new(ms.outputs[0], out.inputs['Surface'])


def area(name, loc, rot, size, energy, col='#FFFFFF', shape='RECTANGLE', size_y=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.color = C.srgb(col)[:3]
    ld.shape = shape; ld.size = size
    if size_y: ld.size_y = size_y
    ob = bpy.data.objects.new(name, ld); bpy.context.scene.collection.objects.link(ob)
    ob.location = loc; ob.rotation_euler = rot
    if hasattr(ob, 'visible_camera'): ob.visible_camera = False
    return ob


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


# ------------------------------------------------------------------ dựng cảnh
def build(sc, a, ar):
    rng = np.random.default_rng(1618)
    world_setup(sc)
    C.compositor_glow(sc, threshold=0.9, size=8, mix=-0.55)

    # --- logo: đĩa (có lỗ hình trăng khuyết) + trăng khuyết kim loại, cha là một trục xoay
    pivot = bpy.data.objects.new('MarkPivot', None); sc.collection.objects.link(pivot)
    pivot.location = (0, 0, MARK_Z)
    cres = crescent_pts()
    disc = curve_obj('Disc', [circle_pts(R_DISC), cres], extrude=0.085, bevel=0.034, res=6)
    moon = curve_obj('Crescent', [cres], extrude=0.105, bevel=0.022, offset=-0.026, res=5)
    m_disc, disc_glow = mat_disc()
    m_moon, moon_glow, _ = mat_metal('DL_champagne', CHAMPAGNE, 0.24)
    disc.data.materials.append(m_disc); moon.data.materials.append(m_moon)
    for ob in (disc, moon):
        ob.parent = pivot; ob.rotation_euler = (math.pi / 2, 0, 0)

    # --- chữ "Dream Labs" (Dream thường, Labs nghiêng — Playfair Display)
    fr = bpy.data.fonts.load(os.path.join(FONT_DIR, 'PlayfairDisplay-Regular.ttf'))
    fi = bpy.data.fonts.load(os.path.join(FONT_DIR, 'PlayfairDisplay-Italic.ttf'))
    td = bpy.data.curves.new('Wordmark', 'FONT')
    td.body = 'Dream Labs'; td.font = fr; td.font_italic = fi
    for i in range(6, 10): td.body_format[i].use_italic = True
    td.align_x = 'CENTER'; td.align_y = 'CENTER'; td.size = 0.66; td.space_character = 1.04
    td.extrude = 0.022; td.bevel_depth = 0.0045; td.bevel_resolution = 3
    text = bpy.data.objects.new('Wordmark', td); sc.collection.objects.link(text)
    text.rotation_euler = (math.pi / 2, 0, 0); text.location = (0, 0, TEXT_Z)
    m_txt, txt_glow, txt_wipe = mat_metal('DL_cream_metal', CREAM_TXT, 0.42, metallic=0.85, wipe=True)
    td.materials.append(m_txt)

    # --- quầng sáng sau logo
    bpy.ops.mesh.primitive_plane_add(size=1)
    halo = bpy.context.active_object; halo.name = 'Halo'
    halo.rotation_euler = (math.pi / 2, 0, 0); halo.location = (0, 7.0, MARK_Z - 0.3); halo.scale = (20, 20, 1)
    m_halo, halo_k = mat_halo(); halo.data.materials.append(m_halo); C.no_shadow(halo)

    # --- đèn: key mềm trên-trái, viền sau hai bên (bắt sáng mép vát), fill thấp ấm, chớp sáng khi hình thành
    key = area('Key', (-4.5, -6.5, 5.0), (0, 0, 0), 5.0, 900, '#FFF4E6'); look_at(key, (0, 0, MARK_Z))
    rimL = area('RimL', (-4.2, 3.5, 2.6), (0, 0, 0), 2.0, 1400, '#D9CCFF'); look_at(rimL, (0, 0, MARK_Z))
    rimR = area('RimR', (4.4, 3.2, 1.2), (0, 0, 0), 2.0, 1300, '#FFD7C2'); look_at(rimR, (0, 0, MARK_Z))
    fill = area('Fill', (2.5, -7.0, -2.8), (0, 0, 0), 6.0, 160, '#F2C0A8'); look_at(fill, (0, 0, 0))
    fl = bpy.data.lights.new('Flash', 'POINT'); fl.energy = 0; fl.color = C.srgb('#FFE6B8')[:3]; fl.shadow_soft_size = 0.3
    flash = bpy.data.objects.new('Flash', fl); sc.collection.objects.link(flash); flash.location = (0, -0.6, MARK_Z)

    # --- softbox lớn phía trước (chỉ thấy qua phản chiếu): kim loại champagne / lớp coat có ánh kem mềm
    bpy.ops.mesh.primitive_plane_add(size=1)
    sbox = bpy.context.active_object; sbox.name = 'Softbox'; sbox.scale = (16, 7, 1)
    sbox.location = (-3.0, -11.0, MARK_Z + 3.2); look_at(sbox, (0, 0, MARK_Z)); sbox.rotation_euler.rotate_axis('X', math.pi)
    m_sb, sb_k = mat_emit('DL_softbox', '#FFF1DE', 1.5); sbox.data.materials.append(m_sb)
    for k in ('visible_camera', 'visible_diffuse', 'visible_shadow', 'visible_transmission', 'visible_volume_scatter'):
        if hasattr(sbox, k): setattr(sbox, k, False)
    bpy.ops.mesh.primitive_plane_add(size=1)
    sb2 = bpy.context.active_object; sb2.name = 'Softbox2'; sb2.scale = (10, 3, 1)
    sb2.location = (5.0, -9.0, MARK_Z - 3.5); look_at(sb2, (0, 0, MARK_Z)); sb2.rotation_euler.rotate_axis('X', math.pi)
    m_sb2, _ = mat_emit('DL_softbox2', '#E7DBFF', 0.9); sb2.data.materials.append(m_sb2)
    for k in ('visible_camera', 'visible_diffuse', 'visible_shadow', 'visible_transmission', 'visible_volume_scatter'):
        if hasattr(sb2, k): setattr(sb2, k, False)

    # --- dải sáng lướt (light sweep): thanh phát sáng chỉ thấy qua phản chiếu
    bpy.ops.mesh.primitive_plane_add(size=1)
    sweep = bpy.context.active_object; sweep.name = 'Sweep'; sweep.scale = (0.32, 14, 1)
    m_sw, sw_k = mat_emit('DL_sweep', '#FFF6E8', 0.0); sweep.data.materials.append(m_sw)
    for k in ('visible_camera', 'visible_diffuse', 'visible_shadow', 'visible_transmission', 'visible_volume_scatter'):
        if hasattr(sweep, k): setattr(sweep, k, False)

    # --- hạt vàng xoắn ốc (vệt sáng = nhiều mẫu lùi thời gian) + vành tia khi hình thành + bụi sao nền
    NP, K = (520 if a['mode'] == 'preview' else 900), 12
    NSP = 220
    m_pts = C.emissive_points_mat('DL_gold_pts')
    pts = C.points_object('GoldSpiral', NP * K + NSP, m_pts, sphere_subdiv=2 if a['mode'] == 'preview' else 3); C.no_shadow(pts)
    ND = 2600
    m_dust = C.emissive_points_mat('DL_dust_pts')
    dust = C.points_object('StarDust', ND, m_dust, sphere_subdiv=1 if a['mode'] == 'preview' else 3); C.no_shadow(dust)

    # tham số hạt
    arm = rng.integers(0, 2, NP)                               # hai nhánh xoắn
    alpha = arm * math.pi + rng.normal(0, .32, NP)
    s0 = rng.uniform(0.0, 1.0, NP) ** 1.2 * 1.9 - .45                     # lúc xuất phát
    e0 = rng.uniform(2.45, 3.2, NP)                            # lúc tới tâm
    r0 = rng.uniform(5.0, 9.0, NP)
    THETA = 3.25 * math.pi
    B = math.log(K_RATIO) / (math.pi / 2)                          # xoắn ốc logarit: r nhân 1/K mỗi 1/4 vòng
    zj = rng.normal(0, .12, NP)
    size0 = rng.uniform(.010, .026, NP) * (1 + 1.5 * (rng.uniform(size=NP) < .06))
    gold = np.array([C.srgb('#FFD8A0')[:3], C.srgb('#F6C77E')[:3], C.srgb('#FFF0D8')[:3], C.srgb('#F2C0A8')[:3]])
    pcol = gold[rng.choice(4, NP, p=[.38, .34, .18, .10])]
    tilt = Euler((math.radians(62), math.radians(-14), 0)).to_matrix()
    TM = np.array(tilt)
    center = np.array([0, 0, MARK_Z])

    def spiral(t):
        """vị trí (NP,3), mức hiện (0..1) tại thời điểm t."""
        u = np.clip((t - s0) / (e0 - s0), 0, 1)
        uu = u ** 1.55                                         # chậm rồi nhanh dần
        ang = alpha + THETA * uu
        rr = r0 * np.exp(-B * THETA * uu) * (1 - uu ** 6)
        p = np.stack([rr * np.cos(ang), rr * np.sin(ang), zj * rr * .25], 1) @ TM.T + center
        vis = np.clip((t - s0) / .35, 0, 1) * (u < 1)
        return p, vis, u

    # vành tia khi logo hình thành (3,2 s): bung ra từ mép đĩa, chậm dần, tắt dần
    sp_dir = rng.normal(0, 1, (NSP, 3)); sp_dir[:, 1] *= .35
    sp_dir /= np.linalg.norm(sp_dir, axis=1, keepdims=True)
    sp_spd = rng.uniform(1.2, 3.4, NSP); sp_size = rng.uniform(.006, .016, NSP)
    T_FORM = 3.2

    # bụi sao: vỏ xa phía sau + vài lớp gần cho thị sai
    dz = rng.uniform(0, 1, ND)
    dpos = np.stack([rng.uniform(-1, 1, ND) * (14 + 40 * dz), 8 + 55 * dz, rng.uniform(-1, 1, ND) * (9 + 26 * dz) + MARK_Z * 0], 1)
    dsize = (rng.uniform(.006, .02, ND) * (1 + 3 * dz)) * (1 + 2.5 * (rng.uniform(size=ND) < .03))
    dcol = np.array([C.srgb('#D9CCF5')[:3], C.srgb('#FFE7D6')[:3], C.srgb('#C9DDF0')[:3]])[rng.choice(3, ND)]
    dph = rng.uniform(0, 6.283, ND); dfq = rng.uniform(.6, 2.2, ND)
    dem0 = rng.uniform(.25, 1.4, ND) ** 2

    # --- camera
    cd = bpy.data.cameras.new('Cam'); cd.lens = 85; cd.sensor_width = 36; cd.sensor_fit = 'AUTO'
    cd.clip_start = 0.1; cd.clip_end = 400
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.2 if a['mode'] == '4k' else 2.0; cd.dof.aperture_blades = 7
    cam = bpy.data.objects.new('Cam', cd); sc.collection.objects.link(cam); sc.camera = cam
    target = Vector((0, 0, (MARK_Z + TEXT_Z) / 2 + 0.05))
    if ar >= 1:   # 16:9 — khung cao 2*3.0 đơn vị quanh khối logo+chữ
        half_h = 3.05; fov_v = 2 * math.atan((36 / ar / 2) / cd.lens); D_END = half_h / math.tan(fov_v / 2)
    else:         # 9:16 — chữ chiếm ~70% bề ngang
        half_w = 2.55; fov_h = 2 * math.atan((36 * ar / 2) / cd.lens); D_END = half_w / math.tan(fov_h / 2)

    def cam_at(t):
        f = C.ease_io(C.lin(t, 0.0, 9.6), 3)
        dist = D_END * C.mix(1.55, 1.0, f) * (1 - .012 * C.smooth(C.lin(t, 9.6, 12)))
        yaw = math.radians(C.mix(-38, 0, f)); el = math.radians(C.mix(16, 1.5, f))
        tz = C.mix(MARK_Z, target.z, C.smooth(C.lin(t, 2.5, 9.0)))
        tgt = Vector((0, 0, tz))
        pos = tgt + Vector((math.sin(yaw) * math.cos(el), -math.cos(yaw) * math.cos(el), math.sin(el))) * dist
        return pos, tgt

    # --- cập nhật theo thời gian
    def update(t):
        # camera
        pos, tgt = cam_at(t)
        cam.location = pos; look_at(cam, tgt)
        cd.dof.focus_distance = (Vector((0, 0, MARK_Z)) - pos).length if t < 7 else C.mix(
            (Vector((0, 0, MARK_Z)) - pos).length, (target - pos).length, C.smooth(C.lin(t, 7, 9)))

        # logo hình thành + xoay
        g = C.ease_out(C.lin(t, T_FORM - .15, T_FORM + 1.0), 4)
        sc_ = max(1e-4, g * (1 + .035 * math.sin(C.clamp((t - T_FORM) / 1.0) * math.pi)))
        pivot.scale = (sc_, sc_, sc_)
        spin = C.ease_out(C.lin(t, T_FORM - .15, 9.2), 2.2)
        pivot.rotation_euler = (math.radians(C.mix(-14, 0, spin)), 0, math.radians(C.mix(-250, 0, spin)))
        hot = math.exp(-max(0, t - T_FORM) / .3) * (t > T_FORM - .15)
        disc_glow.default_value = 0.9 * hot
        moon_glow.default_value = 1.6 * hot
        fl.energy = 700 * math.exp(-abs(t - T_FORM) / .18) if t > T_FORM - .6 else 0

        # ánh sáng lướt qua: 5,6–7,8 s (đĩa) rồi 9,4–11 s (chữ)
        u1 = C.lin(t, 5.6, 7.8); u2 = C.lin(t, 9.4, 11.2)
        if 0 < u1 < 1:
            x = C.mix(-4.5, 4.5, C.ease_io(u1, 2)); sw_k.default_value = 14 * math.sin(u1 * math.pi) ** .6
        elif 0 < u2 < 1:
            x = C.mix(-4.5, 4.5, C.ease_io(u2, 2)); sw_k.default_value = 6 * math.sin(u2 * math.pi) ** .6
        else:
            x = 9; sw_k.default_value = 0
        # thanh sáng nằm trên đường phản xạ gương giữa camera và logo
        sweep.location = (x, pos.y * .45, MARK_Z + 1.2)
        sweep.rotation_euler = (math.radians(70), 0, math.radians(-24))

        # chữ hiện dần (quét trái -> phải) và nhô lên nhẹ
        w = C.mix(-2.4, 2.6, C.ease_io(C.lin(t, 7.4, 9.6), 2))
        txt_wipe.default_value = w
        txt_glow.default_value = 0.9 * (1 - C.smooth(C.lin(t, 8.9, 10.4))) if t > 7.4 else 0.0
        text.location.z = TEXT_Z - .06 * (1 - C.ease_out(C.lin(t, 7.4, 9.8), 3))

        # quầng sáng: tấm luôn quay về camera, nằm sau logo trên đường nhìn (không lệch khi camera bay)
        mk = Vector((0, 0, MARK_Z - .25)); dv = (mk - pos).normalized()
        halo.location = mk + dv * 3.0; look_at(halo, pos); halo.rotation_euler.rotate_axis('X', math.pi)
        halo_k.default_value = 0.0 + 0.32 * C.smooth(C.lin(t, T_FORM - .2, 6)) + 0.5 * hot

        # hạt xoắn ốc + vệt
        co = np.zeros((NP * K + NSP, 3)); sz = np.zeros(NP * K + NSP); em = np.zeros(NP * K + NSP)
        cl = np.zeros((NP * K + NSP, 3))
        for k in range(K):
            p, vis, u = spiral(t - k * .022)
            fade = (1 - k / K) ** 1.4
            sl = slice(k * NP, (k + 1) * NP)
            co[sl] = p
            near = np.clip(1 - u, 0, 1)
            sz[sl] = size0 * fade * vis * (0.55 + .45 * near)
            em[sl] = (14 if k == 0 else 4.5) * fade * vis * (0.8 + 1.4 * u)
            cl[sl] = pcol
        # vành tia
        ts = t - T_FORM
        o = NP * K
        if ts > 0:
            d = sp_spd * (1 - np.exp(-ts / .55)) * .9
            base = np.array([0, 0, MARK_Z]) + sp_dir * (R_DISC * .9)
            co[o:] = base + sp_dir * d[:, None]
            fade = np.exp(-ts / .7)
            sz[o:] = sp_size * fade; em[o:] = 18 * fade; cl[o:] = gold[0]
        C.update_points(pts, co, sz, cl, em)

        # bụi sao lấp lánh nhẹ, hiện dần từ đầu
        tw = .55 + .45 * np.sin(t * dfq * 2.4 + dph)
        C.update_points(dust, dpos, dsize, dcol, dem0 * tw * (0.35 + .65 * C.smooth(C.lin(t, 0, 2.5))) * 1.6)

    def audio(path, dur):
        s = A.bed('sang-trong', dur, fade_in=1.5, fade_out=2.2) * .55
        w = A.whoosh(3.0, 220, 4200, q=1.4, rise=.92, curve=2.2, seed=11)
        A._place(s, w, 0.25, pan=-.25, gain=.32)
        A._place(s, A.shimmer(2.6, count=70, seed=5), 0.7, pan=.2, gain=.18)
        A._place(s, A.boom(4.5, seed=9) * .5 + 0, T_FORM - .02, gain=.55)
        A._place(s, A.chime(432, 5), T_FORM, pan=-.2, gain=.34)
        A._place(s, A.chime(648, 5), T_FORM + .03, pan=.25, gain=.22)
        A._place(s, A.whoosh(2.2, 900, 5200, q=3, rise=.5, curve=1, seed=12), 5.6, pan=-.6, gain=.10)
        A._place(s, A.chime(864, 4), 8.1, pan=.3, gain=.16)
        A._place(s, A.chime(1036.8, 4), 9.35, pan=-.2, gain=.12)
        s = A.space_verb(s, rt=3.2, wet=.22)
        return A.write(path, s)

    return update, audio


if __name__ == '__main__':
    C.run(NAME, DUR, build, defaults=dict(spp_preview=48, spp_4k=384, render=dict(bounces=(6, 2, 4, 2))))
