"""Dream Labs — Video 2: hai ngôi sao va chạm -> thiên hà xoắn ốc (16 giây). Dựng toàn bộ cảnh bằng code.

  blender -b -P tools/blender/dl_stars.py -- --preview        (960x540, 24 fps, 16:9)
  blender -b -P tools/blender/dl_stars.py -- --4k             (3840x2160 + 2160x3840, 30 fps, Cycles GPU)

Đồng bộ với cảnh mở đầu trang chủ (js/core.js, safe('hero')): sao vàng champagne + sao xanh sapphire đêm, bề mặt hạt
đối lưu, viền tối dần, quầng dịu (không tia nhọn), bay vào theo xoắn ốc nghiêng chậm rồi nhanh dần (mũ 2,618) ->
chạm -> quay quanh nhau tăng tốc, vật chất kéo thành 2 cánh -> nổ (chớp, quả cầu lửa, 2 vành sóng, hàng nghìn mảnh có vệt)
-> mảnh bị hút xoáy về thiên hà xoắn ốc logarit 2 nhánh, lõi kem, nhánh tràn khung -> thiên hà xoay chậm.

Nhịp: 0–6,2 s bay vào · 6,2–8,6 s xoáy · 8,6 s nổ · 9,2–13 s hút về thiên hà · 13–16 s xoay chậm.
"""
import os, sys, math
os.environ.setdefault('OPENBLAS_NUM_THREADS', '4')      # module bpy + numpy: tránh lỗi cấp phát khi máy nhiều nhân, ít RAM
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bpy
from mathutils import Vector
import dl_common as C
import dl_audio as A

NAME = 'dl_stars'
DUR = 16.0
K_RATIO = (1 + 5 ** .5) / 2
BG = '#15121C'

T_IN, T_BANG = 6.2, 8.6           # hết bay vào (hai sao chạm) · nổ
RS = 0.55                          # bán kính sao
R0 = 6.4                           # bán kính quỹ đạo lúc đầu
SPIRAL_B = math.log(K_RATIO) / (math.pi / 2)

# màu sao lấy từ shader hero (core.js): A vàng champagne, B xanh sapphire đêm (deep / mid / lite)
STAR_A = ((.56, .39, .2), (.87, .7, .42), (1., .95, .8))
STAR_B = ((.05, .07, .22), (.16, .23, .55), (.6, .7, .98))
SURF_B = ((.09, .14, .42), (.30, .46, 1.0), (.84, .91, 1.0))   # bề mặt phát sáng của sao xanh (sáng hơn màu nền hero)


def lin3(c):   # màu sRGB 0..1 -> tuyến tính
    return tuple((x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4) for x in c)


# ------------------------------------------------------------------ quỹ đạo hai sao
def make_orbit():
    """Bảng góc/bán kính theo thời gian 0..T_BANG (bước 1/600 s). Bay vào: xoắn ốc logarit, tiến độ u^k;
    sau khi chạm: khoảng cách co lại, vận tốc góc tăng mạnh."""
    dt = 1 / 600
    T = np.arange(0, T_BANG + 1e-9, dt)
    th = np.zeros_like(T); rr = np.zeros_like(T)
    total = math.log(R0 / RS) / SPIRAL_B                         # tổng góc quay đoạn bay vào
    m = T <= T_IN
    p = (T[m] / T_IN) ** 2.618
    th[m] = total * p
    rr[m] = R0 * np.exp(-SPIRAL_B * total * p)
    w_c = (th[m][-1] - th[m][-2]) / dt                         # vận tốc góc lúc chạm
    k = ~m
    x = (T[k] - T_IN) / (T_BANG - T_IN)
    w = w_c * (1 + 3.2 * x ** 1.6)
    th[k] = th[m][-1] + np.cumsum(w) * dt
    rr[k] = RS * (1 - .78 * x ** 1.4)
    return T, th + 0.35, rr


ORB_T, ORB_TH, ORB_R = make_orbit()


def orbit(t):
    t = np.clip(t, 0, T_BANG)
    return np.interp(t, ORB_T, ORB_TH), np.interp(t, ORB_T, ORB_R)


# ------------------------------------------------------------------ vật liệu
def mat_star(name, cols, seed):
    """Sao: hạt đối lưu (Voronoi 4D + nhiễu), viền tối dần (limb darkening), phát sáng. Trả về socket thời gian & độ sáng."""
    deep, mid, lite = (lin3(c) for c in cols)
    m, nt, out = C.new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    tval = N.new('ShaderNodeValue'); tval.outputs[0].default_value = 0.0
    vor = N.new('ShaderNodeTexVoronoi'); vor.voronoi_dimensions = '4D'; vor.feature = 'F1'
    vor.inputs['Scale'].default_value = 9.0
    try: vor.inputs['Randomness'].default_value = 0.9
    except Exception: pass
    L.new(tc.outputs['Object'], vor.inputs['Vector']); L.new(tval.outputs[0], vor.inputs['W'])
    nz = N.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'
    nz.inputs['Scale'].default_value = 2.4; nz.inputs['Detail'].default_value = 5.0
    L.new(tc.outputs['Object'], nz.inputs['Vector']); L.new(tval.outputs[0], nz.inputs['W'])
    # hạt: tâm ô sáng, rãnh tối
    cell = N.new('ShaderNodeMapRange'); cell.inputs['From Min'].default_value = 0.0; cell.inputs['From Max'].default_value = 0.42
    cell.inputs['To Min'].default_value = 1.0; cell.inputs['To Max'].default_value = 0.25; cell.interpolation_type = 'SMOOTHSTEP'
    L.new(vor.outputs['Distance'], cell.inputs['Value'])
    heat = N.new('ShaderNodeMath'); heat.operation = 'MULTIPLY_ADD'; heat.inputs[2].default_value = 0.05
    L.new(cell.outputs['Result'], heat.inputs[0]); L.new(nz.outputs['Fac'], heat.inputs[1])
    # viền tối dần: mu = facing
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    L.new(lw.outputs['Facing'], inv.inputs[1])
    mu = N.new('ShaderNodeMath'); mu.operation = 'POWER'; mu.inputs[1].default_value = 0.55
    L.new(inv.outputs[0], mu.inputs[0])
    hh = N.new('ShaderNodeMath'); hh.operation = 'MULTIPLY'
    L.new(heat.outputs[0], hh.inputs[0]); L.new(mu.outputs[0], hh.inputs[1])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].position = 0.0; cr.elements[0].color = (*[c * .5 for c in deep], 1)
    cr.elements[1].position = 1.0; cr.elements[1].color = (*lite, 1)
    e = cr.elements.new(0.22); e.color = (*deep, 1)
    e = cr.elements.new(0.55); e.color = (*mid, 1)
    L.new(hh.outputs[0], ramp.inputs['Fac'])
    em = N.new('ShaderNodeEmission')
    L.new(ramp.outputs['Color'], em.inputs['Color'])
    st = N.new('ShaderNodeMath'); st.operation = 'MULTIPLY_ADD'
    gain = N.new('ShaderNodeValue'); gain.outputs[0].default_value = 3.0
    L.new(mu.outputs[0], st.inputs[0]); L.new(gain.outputs[0], st.inputs[1]); L.new(gain.outputs[0], st.inputs[2])
    L.new(st.outputs[0], em.inputs['Strength'])
    L.new(em.outputs[0], out.inputs['Surface'])
    return m, tval.outputs[0], gain.outputs[0]


def mat_glow(name, col_lin, tail=2.2, sharp=18.0):
    """Quầng dịu trên tấm luôn quay về camera: e^(-k r^2) + đuôi 1/r — không có tia nhọn."""
    m, nt, out = C.new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    vl = N.new('ShaderNodeVectorMath'); vl.operation = 'LENGTH'
    L.new(tc.outputs['Object'], vl.inputs[0])
    sq = N.new('ShaderNodeMath'); sq.operation = 'MULTIPLY'
    L.new(vl.outputs['Value'], sq.inputs[0]); L.new(vl.outputs['Value'], sq.inputs[1])
    k = N.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = -sharp
    L.new(sq.outputs[0], k.inputs[0])
    ex = N.new('ShaderNodeMath'); ex.operation = 'EXPONENT'; L.new(k.outputs[0], ex.inputs[0])
    k2 = N.new('ShaderNodeMath'); k2.operation = 'MULTIPLY'; k2.inputs[1].default_value = -tail * 2
    L.new(vl.outputs['Value'], k2.inputs[0])
    ex2 = N.new('ShaderNodeMath'); ex2.operation = 'EXPONENT'; L.new(k2.outputs[0], ex2.inputs[0])
    edge = N.new('ShaderNodeMapRange'); edge.inputs['From Min'].default_value = 0.5; edge.inputs['From Max'].default_value = 0.36
    L.new(vl.outputs['Value'], edge.inputs['Value'])
    ad = N.new('ShaderNodeMath'); ad.operation = 'MULTIPLY_ADD'; ad.inputs[1].default_value = 0.35
    L.new(ex2.outputs[0], ad.inputs[0]); L.new(ex.outputs[0], ad.inputs[2])
    fall = N.new('ShaderNodeMath'); fall.operation = 'MULTIPLY'
    L.new(ad.outputs[0], fall.inputs[0]); L.new(edge.outputs['Result'], fall.inputs[1])
    gain = N.new('ShaderNodeValue'); gain.outputs[0].default_value = 1.0
    stg = N.new('ShaderNodeMath'); stg.operation = 'MULTIPLY'
    L.new(fall.outputs[0], stg.inputs[0]); L.new(gain.outputs[0], stg.inputs[1])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*col_lin, 1)
    L.new(stg.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); add = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], add.inputs[0]); L.new(tr.outputs[0], add.inputs[1])
    L.new(add.outputs[0], out.inputs['Surface'])
    return m, gain.outputs[0], em.inputs['Color']


def mat_fire(name):
    """Quả cầu lửa: nhiễu 4D cuộn, kem -> hồng đào -> tím, mép mềm trong suốt."""
    m, nt, out = C.new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord'); tv = N.new('ShaderNodeValue')
    nz = N.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'
    nz.inputs['Scale'].default_value = 2.0; nz.inputs['Detail'].default_value = 8.0
    try: nz.inputs['Distortion'].default_value = 0.8
    except Exception: pass
    L.new(tc.outputs['Object'], nz.inputs['Vector']); L.new(tv.outputs[0], nz.inputs['W'])
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.35
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    L.new(lw.outputs['Facing'], inv.inputs[1])
    core = N.new('ShaderNodeMath'); core.operation = 'POWER'; core.inputs[1].default_value = 1.6
    L.new(inv.outputs[0], core.inputs[0])
    f = N.new('ShaderNodeMath'); f.operation = 'MULTIPLY'
    L.new(nz.outputs['Fac'], f.inputs[0]); L.new(core.outputs[0], f.inputs[1])
    heat = N.new('ShaderNodeValue'); heat.outputs[0].default_value = 1.0          # 1 = trắng nóng, giảm dần
    fh = N.new('ShaderNodeMath'); fh.operation = 'MULTIPLY'
    L.new(f.outputs[0], fh.inputs[0]); L.new(heat.outputs[0], fh.inputs[1])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].position = 0.05; cr.elements[0].color = C.srgb('#3B2A6E')
    cr.elements[1].position = 0.75; cr.elements[1].color = C.srgb('#FFF6E6')
    e = cr.elements.new(0.3); e.color = C.srgb('#B0679A')
    e = cr.elements.new(0.5); e.color = C.srgb('#F2B48E')
    L.new(fh.outputs[0], ramp.inputs['Fac'])
    em = N.new('ShaderNodeEmission'); L.new(ramp.outputs['Color'], em.inputs['Color'])
    gain = N.new('ShaderNodeValue'); gain.outputs[0].default_value = 0.0
    sg = N.new('ShaderNodeMath'); sg.operation = 'MULTIPLY'
    L.new(f.outputs[0], sg.inputs[0]); L.new(gain.outputs[0], sg.inputs[1])
    L.new(sg.outputs[0], em.inputs['Strength'])
    al = N.new('ShaderNodeMath'); al.operation = 'MULTIPLY'; al.use_clamp = True
    alpha = N.new('ShaderNodeValue'); alpha.outputs[0].default_value = 0.0
    L.new(f.outputs[0], al.inputs[0]); L.new(alpha.outputs[0], al.inputs[1])
    tr = N.new('ShaderNodeBsdfTransparent'); ms = N.new('ShaderNodeMixShader')
    L.new(al.outputs[0], ms.inputs['Fac']); L.new(tr.outputs[0], ms.inputs[1]); L.new(em.outputs[0], ms.inputs[2])
    L.new(ms.outputs[0], out.inputs['Surface'])
    return m, tv.outputs[0], gain.outputs[0], alpha.outputs[0], heat.outputs[0]


def mat_ring(name, hexcol):
    """Vành sóng xung kích: ống mỏng phát sáng, mép mềm theo góc nhìn."""
    m, nt, out = C.new_mat(name)
    N, L = nt.nodes, nt.links
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    L.new(lw.outputs['Facing'], inv.inputs[1])
    pw = N.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 2.0
    L.new(inv.outputs[0], pw.inputs[0])
    gain = N.new('ShaderNodeValue')
    sg = N.new('ShaderNodeMath'); sg.operation = 'MULTIPLY'
    L.new(pw.outputs[0], sg.inputs[0]); L.new(gain.outputs[0], sg.inputs[1])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = C.srgb(hexcol)
    L.new(sg.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); add = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], add.inputs[0]); L.new(tr.outputs[0], add.inputs[1])
    L.new(add.outputs[0], out.inputs['Surface'])
    return m, gain.outputs[0]


def mat_nebula():
    """Nền tinh vân rất mờ tông tím – hồng đào (tấm xa luôn quay về camera)."""
    m, nt, out = C.new_mat('DL_nebula')
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6; nz.inputs['Detail'].default_value = 8
    try: nz.inputs['Roughness'].default_value = 0.62
    except Exception: pass
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    nz2 = N.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 0.8; nz2.inputs['Detail'].default_value = 3
    L.new(tc.outputs['Object'], nz2.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].position = .38; cr.elements[0].color = (0, 0, 0, 1)
    cr.elements[1].position = .78; cr.elements[1].color = C.srgb('#F2C0A8')
    e = cr.elements.new(.56); e.color = C.srgb('#6F5BAE')
    L.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    msk = N.new('ShaderNodeMapRange'); msk.inputs['From Min'].default_value = .42; msk.inputs['From Max'].default_value = .68
    L.new(nz2.outputs['Fac'], msk.inputs['Value'])
    g = N.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    s2 = N.new('ShaderNodeVectorMath'); s2.operation = 'SCALE'; s2.inputs['Scale'].default_value = 2.0
    L.new(tc.outputs['Object'], s2.inputs[0]); L.new(s2.outputs[0], g.inputs['Vector'])
    mm = N.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'
    L.new(msk.outputs['Result'], mm.inputs[0]); L.new(g.outputs['Fac'], mm.inputs[1])
    gain = N.new('ShaderNodeValue'); gain.outputs[0].default_value = 0.16
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'
    L.new(mm.outputs[0], m2.inputs[0]); L.new(gain.outputs[0], m2.inputs[1])
    em = N.new('ShaderNodeEmission'); L.new(ramp.outputs['Color'], em.inputs['Color']); L.new(m2.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); add = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], add.inputs[0]); L.new(tr.outputs[0], add.inputs[1])
    L.new(add.outputs[0], out.inputs['Surface'])
    return m, gain.outputs[0]


def world(sc):
    w = bpy.data.worlds.new('DL_space'); sc.world = w; w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = C.srgb(BG); bg.inputs['Strength'].default_value = 1.0


def plane(name, mat, size=1.0):
    bpy.ops.mesh.primitive_plane_add(size=size)
    ob = bpy.context.active_object; ob.name = name
    ob.data.materials.append(mat); C.no_shadow(ob)
    return ob


def face_cam(ob, cam_pos):
    d = (cam_pos - ob.location)
    ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()


# ------------------------------------------------------------------ dựng cảnh
def build(sc, a, ar):
    rng = np.random.default_rng(2618)
    pv = a['mode'] == 'preview'
    world(sc)
    C.compositor_glow(sc, threshold=0.85, size=8, mix=-0.45)

    # --- hai sao + quầng
    stars, glows = [], []
    for i, (cols, seed) in enumerate(((STAR_A, 1), (SURF_B, 2))):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=RS, segments=96, ring_count=48)
        s = bpy.context.active_object; s.name = 'Star' + 'AB'[i]
        bpy.ops.object.shade_smooth()
        m, tsock, gsock = mat_star('DL_star' + 'AB'[i], cols, seed)
        s.data.materials.append(m); C.no_shadow(s)
        g_col = lin3(cols[1]) if i == 0 else lin3((.32, .44, .95))
        gm, gg, _ = mat_glow('DL_glow' + 'AB'[i], g_col)
        g = plane('Glow' + 'AB'[i], gm)
        stars.append((s, tsock, gsock)); glows.append((g, gg))

    # --- nổ: chớp sáng toàn khung, quả cầu lửa (2 lớp), 2 vành sóng
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32)
    fire = bpy.context.active_object; fire.name = 'Fireball'; bpy.ops.object.shade_smooth()
    fm, f_t, f_gain, f_alpha, f_heat = mat_fire('DL_fire'); fire.data.materials.append(fm); C.no_shadow(fire)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32)
    fire2 = bpy.context.active_object; fire2.name = 'Fireball2'; bpy.ops.object.shade_smooth()
    fm2, f2_t, f2_gain, f2_alpha, f2_heat = mat_fire('DL_fire2'); fire2.data.materials.append(fm2); C.no_shadow(fire2)
    rings = []
    for j, (hexc, rot) in enumerate((('#FFF1D6', (0, 0, 0)), ('#D9B8FF', (math.radians(72), math.radians(18), 0)))):
        bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.012, major_segments=192, minor_segments=16)
        r = bpy.context.active_object; r.name = f'Shock{j}'; r.rotation_euler = rot; bpy.ops.object.shade_smooth()
        rm, rg = mat_ring(f'DL_shock{j}', hexc); r.data.materials.append(rm); C.no_shadow(r)
        rings.append((r, rg))
    cg, cg_k, cg_col = mat_glow('DL_coreglow', lin3((1., .93, .8)), tail=3.0, sharp=34.0)
    core = plane('CoreGlow', cg)

    # --- tinh vân + bụi sao nhiều lớp
    nm, neb_k = mat_nebula(); neb = plane('Nebula', nm)

    # --- hệ hạt: dòng vật chất (2 cánh), mảnh vỡ (có vệt), sao thiên hà, bụi nền
    m_pts = C.emissive_points_mat('DL_pts')
    NS = 1400 if pv else 2600                         # hạt mỗi cánh
    ND = 1700 if pv else 3200                        # mảnh vỡ
    KD = 6                                           # mẫu vệt mỗi mảnh
    NG = 6000 if pv else 12000                        # sao thiên hà thêm
    NB = 3000 if pv else 5200                        # bụi nền
    pts = C.points_object('Particles', 2 * NS + ND * KD + NG, m_pts, sphere_subdiv=1 if pv else 3); C.no_shadow(pts)
    dust = C.points_object('Dust', NB, C.emissive_points_mat('DL_dust'), sphere_subdiv=1 if pv else 3); C.no_shadow(dust)

    colA = np.array(lin3(STAR_A[2])); colA2 = np.array(lin3(STAR_A[1]))
    colB = np.array(lin3(STAR_B[2])); colB2 = np.array(lin3((.35, .48, .95)))
    gold = np.array(lin3((1., .76, .40))); cream = np.array(lin3((1., .95, .86)))
    peach = np.array(C.srgb('#F2C0A8')[:3]); lav = np.array(C.srgb('#BCA8E6')[:3])

    # dòng vật chất: hạt sinh ra ở mặt sao, giữ góc lúc sinh trong khi sao quay nhanh hơn -> 2 cánh xoắn kéo dài
    s_birth = np.sort(rng.uniform(T_IN - .9, T_BANG, NS))
    s_side = np.concatenate([np.zeros(NS), np.ones(NS)]).astype(int)
    s_b = np.concatenate([s_birth, s_birth + rng.uniform(-.02, .02, NS)])
    s_off = rng.normal(0, .14, 2 * NS); s_v = rng.uniform(.95, 1.35, 2 * NS); s_z = rng.normal(0, .035, 2 * NS)
    s_size = rng.uniform(.010, .024, 2 * NS)
    th_b, r_b = orbit(s_b)
    th_b = th_b + np.pi * s_side + s_off * .25

    # mảnh vỡ: hướng gần mặt phẳng quỹ đạo, tốc độ khác nhau, có lực cản
    ang = rng.uniform(0, 2 * np.pi, ND)
    dz = rng.normal(0, .28, ND)
    ddir = np.stack([np.cos(ang), np.sin(ang), dz], 1); ddir /= np.linalg.norm(ddir, axis=1, keepdims=True)
    dv = rng.uniform(2.5, 11.0, ND) ** 1.0
    tau = .65
    dsize = rng.uniform(.012, .034, ND) * (1 + 1.4 * (rng.uniform(size=ND) < .05))
    dmix = rng.uniform(size=ND)
    dcol = np.where(dmix[:, None] < .42, gold, np.where(dmix[:, None] < .62, colB2, np.where(dmix[:, None] < .8, cream, peach)))

    # đích thiên hà: 2 nhánh xoắn ốc log (bước xoắn cố định), lõi phình
    def galaxy_targets(n, bulge=.14, rmax=14.0):
        isb = rng.uniform(size=n) < bulge
        arm = rng.integers(0, 2, n)
        u = rng.uniform(size=n)
        r = .35 + rmax * u ** 1.35
        th = arm * np.pi + np.log(r / .35) / (SPIRAL_B * 1.1) + rng.normal(0, .16 + .05 * r / rmax, n)
        sc_ = rng.normal(0, 1, n) * (.06 + .05 * r)
        x = r * np.cos(th) - sc_ * np.sin(th); y = r * np.sin(th) + sc_ * np.cos(th)
        z = rng.normal(0, .05 + .02 * r / rmax, n)
        rb = np.abs(rng.normal(0, .55, n)); ab = rng.uniform(0, 2 * np.pi, n)
        x = np.where(isb, rb * np.cos(ab), x); y = np.where(isb, rb * np.sin(ab), y); z = np.where(isb, rng.normal(0, .22, n) * np.exp(-rb), z)
        r = np.where(isb, rb, r)
        return np.stack([x, y, z], 1), r, isb

    gt_d, gr_d, gb_d = galaxy_targets(ND, bulge=.12)
    gt_g, gr_g, gb_g = galaxy_targets(NG, bulge=.16)
    cap0 = 9.1 + 1.6 * (np.minimum(gr_d, 14) / 14) ** .7 + rng.uniform(0, .5, ND)
    cap1 = cap0 + rng.uniform(1.8, 2.8, ND)
    swirl = rng.uniform(1.6, 3.2, ND)
    def galcol(r, isb):
        f = (np.clip((r - .4) / 4.0, 0, 1) ** .7)[:, None]
        c = cream * (1 - f) + gold * f
        c = np.where(isb[:, None], cream, c)
        tint = rng.uniform(size=len(r))[:, None]
        c = np.where(tint < .08, peach, np.where(tint < .13, lav, c))
        return c
    gcol_d = galcol(gr_d, gb_d); gcol_g = galcol(gr_g, gb_g)
    gsize_g = rng.uniform(.008, .024, NG) * (1 + .6 * gb_g)
    gfade_g = 10.6 + 2.8 * (np.minimum(gr_g, 14) / 14) + rng.uniform(0, .6, NG)
    gem_g = rng.uniform(.6, 2.2, NG) * (1 + .8 * np.exp(-gr_g / 1.2))
    # bụi mờ dọc nhánh (nhiều hạt rất nhỏ, tối) -> nhánh có quầng sương thay vì chấm rời rạc
    haze = rng.uniform(size=NG) < .45
    gsize_g = np.where(haze, gsize_g * .55, gsize_g); gem_g = np.where(haze, gem_g * .35, gem_g)

    def rotz(p, angv):
        c, s = np.cos(angv), np.sin(angv)
        return np.stack([p[:, 0] * c - p[:, 1] * s, p[:, 0] * s + p[:, 1] * c, p[:, 2]], 1)

    def omega(r):                                   # xoay vi sai: trong nhanh, ngoài chậm (rad/s)
        return .55 / (1 + r / 1.6) + .04

    T_GAL = 9.0

    def debris_pos(t):
        s = np.maximum(t - T_BANG, 0)
        e = ddir * (dv * tau * (1 - np.exp(-s / tau)))[:, None]
        w = C.smoother(0) if False else np.clip((t - cap0) / (cap1 - cap0), 0, 1)
        w = w * w * w * (w * (6 * w - 15) + 10)
        e = rotz(e, swirl * w)
        g = rotz(gt_d, omega(gr_d) * max(t - T_GAL, 0))
        return e * (1 - w)[:, None] + g * w[:, None], w

    # bụi nền 3 lớp (thị sai khi camera bay)
    lay = rng.choice(3, NB, p=[.5, .32, .18])
    rad = np.array([140., 70., 34.])[lay] * rng.uniform(.85, 1.15, NB)
    v = rng.normal(0, 1, (NB, 3)); v /= np.linalg.norm(v, axis=1, keepdims=True)
    bpos = v * rad[:, None]
    bsize = np.array([.09, .05, .03])[lay] * rng.uniform(.5, 1.4, NB) * (1 + 2 * (rng.uniform(size=NB) < .025))
    bcol = np.array([C.srgb('#D9CCF5')[:3], C.srgb('#FFE3CF')[:3], C.srgb('#C6D8F2')[:3], C.srgb('#BCA8E6')[:3]])[rng.choice(4, NB)]
    bem = rng.uniform(.3, 1.8, NB) ** 2; bph = rng.uniform(0, 6.28, NB); bfq = rng.uniform(.5, 2, NB)

    # --- camera
    cd = bpy.data.cameras.new('Cam'); cd.lens = 32 if ar >= 1 else 24; cd.sensor_width = 36; cd.sensor_fit = 'AUTO'
    cd.clip_start = .1; cd.clip_end = 600
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 4.0
    cam = bpy.data.objects.new('Cam', cd); sc.collection.objects.link(cam); sc.camera = cam
    KD_ = 1.0 if ar >= 1 else 1.12
    shake_rng = np.random.default_rng(7)
    shake_tab = shake_rng.normal(0, 1, (int(DUR * 120) + 10, 3))

    def cam_at(t):
        f_in = C.ease_io(C.lin(t, 0, T_IN + 1.2), 2)
        dist = C.mix(15.5, 9.6, f_in)
        dist = C.mix(dist, 16.5, C.ease_out(C.lin(t, T_BANG, T_BANG + 1.6), 3))
        dist = C.mix(dist, 13.2, C.ease_io(C.lin(t, 10.5, DUR), 2))
        el = C.mix(22, 31, C.smooth(C.lin(t, 0, T_BANG)))
        el = C.mix(el, 50, C.ease_io(C.lin(t, 9.8, 15.2), 2))
        az = -28 + 2.2 * t
        el, az = math.radians(el), math.radians(az)
        p = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist * KD_
        # rung khung: dồn lên khi xoáy, mạnh nhất lúc nổ, tắt nhanh
        amp = .035 * C.smooth(C.lin(t, T_IN, T_BANG)) + .32 * math.exp(-max(0, t - T_BANG) / .35) * (t >= T_BANG)
        i = int(t * 120)
        sh = Vector(shake_tab[i]) * amp * .5 + Vector(shake_tab[i + 1]) * amp * .5
        return p + sh, Vector((0, 0, 0)) + sh * .5

    def face(ob, pos, campos):
        ob.location = pos; d = campos - pos
        ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()

    NTOT = 2 * NS + ND * KD + NG

    def update(t):
        cp, tg = cam_at(t)
        cam.location = cp
        cam.rotation_euler = (tg - cp).to_track_quat('-Z', 'Y').to_euler()
        cd.dof.focus_distance = (tg - cp).length

        # --- hai sao
        th, rr = orbit(t)
        th, rr = float(th), float(rr)
        alive = t < T_BANG
        pre = C.smooth(C.lin(t, T_BANG - .5, T_BANG))           # sáng bùng ngay trước khi nổ
        merge = C.lin(t, T_IN, T_BANG)
        for i, ((s, tsock, gsock), (g, gg)) in enumerate(zip(stars, glows)):
            a_ = th + math.pi * i
            pos = Vector((math.cos(a_) * rr, math.sin(a_) * rr, 0))
            s.location = pos
            stretch = 1 + .9 * merge ** 1.5
            k = 0.0 if not alive else 1 - .35 * merge ** 2
            s.scale = (k * stretch, k / stretch ** .3, k / stretch ** .3)
            s.rotation_euler = (0, 0, a_ + math.pi / 2)
            tsock.default_value = t * .18 + i * 3.1
            gsock.default_value = (2.8 if i == 0 else 2.6) * (1 + 1.6 * merge ** 2 + 3 * pre)
            face(g, pos + (pos - cp).normalized() * RS * 2.4, cp)      # tấm quầng nằm sau cả hai sao -> không cắt qua thân sao
            gs = (4.4 if i == 0 else 4.8) * RS * (1 + .5 * merge + .5 * pre) * (1 if alive else 0) + 1e-4
            g.scale = (gs, gs, gs)
            gg.default_value = (.75 if i == 0 else .95) * (1 + .8 * merge + 1.2 * pre)

        # --- nổ
        s_b = t - T_BANG
        on = s_b >= 0
        fl = math.exp(-max(s_b, 0) / .12) * on + pre * .15
        R1 = (.25 + 2.6 * C.ease_out(C.lin(s_b, 0, 1.8), 3)) * on + 1e-4
        fire.scale = (R1, R1, R1 * .82); f_t.default_value = t * .7
        f_gain.default_value = 3.6 * math.exp(-max(s_b, 0) / .9) * on
        f_alpha.default_value = 2.0 * math.exp(-max(s_b, 0) / .9) * on
        f_heat.default_value = .55 + .55 * math.exp(-max(s_b, 0) / .5)
        R2 = (.4 + 4.2 * C.ease_out(C.lin(s_b, 0, 2.6), 3)) * on + 1e-4
        fire2.scale = (R2, R2, R2 * .7); f2_t.default_value = t * .45 + 11
        f2_gain.default_value = 1.4 * math.exp(-max(s_b, 0) / 1.3) * on
        f2_alpha.default_value = 1.6 * math.exp(-max(s_b, 0) / 1.4) * on
        f2_heat.default_value = .5 + .3 * math.exp(-max(s_b, 0) / .8)
        for j, (r, rg) in enumerate(rings):
            sj = s_b - .06 * j
            Rw = (.3 + (11.0 if j == 0 else 8.0) * C.ease_out(C.lin(sj, 0, 2.6 + .6 * j), 3)) * (sj >= 0) + 1e-4
            r.scale = (Rw, Rw, Rw)
            rg.default_value = (7 if j == 0 else 5) * math.exp(-max(sj, 0) / (.45 + .15 * j)) * (sj >= 0)
        # lõi sáng: chớp khi nổ -> lõi kem của thiên hà
        face(core, Vector((0, 0, 0)), cp)
        cs = (1.9 + 12 * fl) * (1 if (on or pre > 0) else 0) + 1e-4
        core.scale = (cs, cs, cs)
        cg_k.default_value = (9 * fl + .42 * C.smooth(C.lin(t, 9.4, 12.5))) * (on or pre > 0)

        # nền
        nd = (tg - cp).normalized()
        face(neb, cp + nd * 220, cp); neb.scale = (520, 520, 1)
        neb_k.default_value = .16 + .05 * C.smooth(C.lin(t, 9, 14))

        # --- hạt
        co = np.zeros((NTOT, 3)); sz = np.zeros(NTOT); em = np.zeros(NTOT); cl = np.zeros((NTOT, 3))
        # dòng vật chất (2 cánh)
        age = t - s_b_all
        vis = (age > 0) & (t < T_BANG + .25)
        rr_ = r_b + s_v * np.maximum(age, 0) ** 1.15 * .9
        an_ = th_b + .45 * np.maximum(age, 0)
        co[:2 * NS] = np.stack([rr_ * np.cos(an_), rr_ * np.sin(an_), s_z * (1 + age)], 1)
        life = np.exp(-np.maximum(age, 0) / 1.1) * np.clip(age / .08, 0, 1) * vis
        life *= 1 if t < T_BANG else math.exp(-(t - T_BANG) / .08)
        sz[:2 * NS] = s_size * (0.6 + .6 * life) * (life > .01)
        em[:2 * NS] = 4 * life
        cl[:2 * NS] = np.where(s_side[:, None] == 0, colA2, colB2) * (1 - .3) + np.where(s_side[:, None] == 0, gold, lav) * .3
        # mảnh vỡ + vệt
        o = 2 * NS
        if t >= T_BANG:
            for k in range(KD):
                tk = t - k * .02
                p, w = debris_pos(tk)
                fade = (1 - k / KD) ** 1.3
                sl = slice(o + k * ND, o + (k + 1) * ND)
                vis_k = (tk >= T_BANG)
                co[sl] = p
                hot = math.exp(-max(tk - T_BANG, 0) / .9)
                sz[sl] = dsize * fade * vis_k * (1 - .35 * w) * (1 if k == 0 else .8)
                em[sl] = (3 + 9 * hot) * fade * vis_k * (1 - .5 * w)
                c = dcol * (1 - w)[:, None] + gcol_d * w[:, None]
                cl[sl] = c * (1 - hot * .35) + cream * hot * .35
        # sao thiên hà thêm, hiện dần từ trong ra ngoài
        o2 = 2 * NS + ND * KD
        gp = rotz(gt_g, omega(gr_g) * max(t - T_GAL, 0))
        gv = np.clip((t - gfade_g) / 1.4, 0, 1)
        co[o2:] = gp; sz[o2:] = gsize_g * gv; em[o2:] = gem_g * gv * 2.4; cl[o2:] = gcol_g
        C.update_points(pts, co, sz, cl, em)

        tw = .6 + .4 * np.sin(t * bfq * 2 + bph)
        C.update_points(dust, bpos, bsize, bcol, bem * tw * 1.4)

    s_b_all = s_b

    def audio(path, dur):
        s = A.bed('huyen', dur, fade_in=1.0, fade_out=3.0) * .5
        A._place(s, A.riser(T_BANG - .3, 38, 92, seed=21), 0.3, gain=.55)
        for k, (at, ln_, f0, f1) in enumerate(((2.2, 3.6, 160, 1200), (T_IN - .4, 1.4, 300, 2600),
                                               (T_IN + .9, 1.0, 400, 3400), (T_IN + 1.6, .75, 600, 4800))):
            A._place(s, A.whoosh(ln_, f0, f1, q=1.5, rise=.85, curve=1.6, seed=30 + k), at, pan=(-.5, .5)[k % 2], gain=.22 + .08 * k)
        A._place(s, A.boom(7.0, seed=23), T_BANG - .01, gain=1.0)
        A._place(s, A.whoosh(2.4, 2600, 300, q=1.2, rise=.12, curve=.8, seed=41), T_BANG + .05, pan=.3, gain=.35)
        A._place(s, A.shimmer(4.0, 1600, 6000, count=90, seed=8), 9.4, pan=-.2, gain=.16)
        A._place(s, A.chime(432, 6), 12.6, pan=-.25, gain=.22)
        A._place(s, A.chime(648, 6), 12.65, pan=.25, gain=.14)
        s = A.space_verb(s, rt=4.0, wet=.26)
        return A.write(path, s)

    return update, audio


if __name__ == '__main__':
    C.run(NAME, DUR, build, defaults=dict(spp_preview=40, spp_4k=160, render=dict(bounces=(2, 0, 1, 0))))
