"""Dream Labs — Video 2: hai ngôi sao va chạm -> thiên hà xoắn ốc (16 giây). Đồng bộ cảnh mở đầu trang chủ.

  blender -b -P tools/blender/collision.py -- --preview
  blender -b -P tools/blender/collision.py -- --4k
  blender -b -P tools/blender/collision.py -- --4k --vertical

Nhịp: 0–3,9 s hai sao (vàng champagne / xanh sapphire đêm) bay vào theo xoắn ốc log nghiêng, chậm rồi nhanh dần
-> chạm nhau -> 3,9–6,4 s quay quanh nhau, tốc độ góc tăng theo hàm mũ, vật chất bị kéo thành 2 cánh
-> 6,4 s nổ: chớp sáng, quả cầu lửa, 2 vành sóng xung kích, hàng nghìn mảnh sao văng ra có vệt
-> mảnh sao bị hút xoáy về thành thiên hà xoắn ốc logarit hai nhánh, lõi kem -> thiên hà xoay chậm tới hết.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bpy, bmesh
from mathutils import Vector, Matrix
import common as C

DUR = 16.0
T_APP, T_BANG = 3.9, 6.4            # chạm nhau / phát nổ
K_RATIO = (1 + 5 ** .5) / 2
B = math.log(K_RATIO) / (math.pi / 2)  # xoắn ốc logarit
BG = '#15121C'

a = C.args()
sc = C.reset()
C.setup_render(sc, a, 'collision', samples_preview=14, samples_4k=128, duration=DUR)
# cảnh chỉ có vật thể tự phát sáng -> hầu như không nhiễu; tắt khử nhiễu để không xóa mất các đốm sao li ti
sc.cycles.use_denoising = False
sc.cycles.use_adaptive_sampling = False
V = a.vertical
rng = np.random.default_rng(2026)

# mặt phẳng quỹ đạo nghiêng 1 rad (như trang chủ): e1 sang phải, e2 ra xa camera và lên trên
E1 = np.array([1.0, 0, 0]); E2 = np.array([0, .8415, .5403]); EN = np.cross(E1, E2)


def plane(x, y, z=0.0):
    x = np.asarray(x); y = np.asarray(y); z = np.asarray(z)
    return x[..., None] * E1 + y[..., None] * E2 + z[..., None] * EN


# ------------------------------------------------------------------ thế giới: nền tối + tinh vân tím–hồng đào rất nhẹ
w = bpy.data.worlds.new('W'); sc.world = w
C.world_nodes(w)
N, L = w.node_tree.nodes, w.node_tree.links
N.clear()
wo = N.new('ShaderNodeOutputWorld'); bgn = N.new('ShaderNodeBackground'); bgn.inputs['Strength'].default_value = 1
tc = N.new('ShaderNodeTexCoord')
nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.4; nz.inputs['Detail'].default_value = 6
nz.inputs['Roughness'].default_value = .62
L.new(tc.outputs['Generated'], nz.inputs['Vector'])
nz2 = N.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 3.2; nz2.inputs['Detail'].default_value = 4
L.new(tc.outputs['Generated'], nz2.inputs['Vector'])
ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
cr.elements[0].position = .42; cr.elements[0].color = C.hexc(BG)
cr.elements[1].position = .78; cr.elements[1].color = C.hexc('#3A2A55')
e = cr.elements.new(.62); e.color = C.hexc('#211A30')
L.new(nz.outputs['Fac'], ramp.inputs['Fac'])
r2 = N.new('ShaderNodeValToRGB'); c2 = r2.color_ramp
c2.elements[0].position = .5; c2.elements[0].color = (0, 0, 0, 1)
c2.elements[1].position = .85; c2.elements[1].color = C.hexc('#5A3A3A')
L.new(nz2.outputs['Fac'], r2.inputs['Fac'])
ad = N.new('ShaderNodeMix'); ad.data_type = 'RGBA'; ad.blend_type = 'ADD'; ad.inputs['Factor'].default_value = .5
L.new(ramp.outputs['Color'], ad.inputs['A']); L.new(r2.outputs['Color'], ad.inputs['B'])
L.new(ad.outputs['Result'], bgn.inputs['Color'])
L.new(bgn.outputs[0], wo.inputs[0])


# ------------------------------------------------------------------ vật liệu
def m_star(name, core, gran, limb, k):
    """Bề mặt sao: hạt đối lưu (Voronoi + nhiễu, trôi theo thời gian) + viền tối dần (limb darkening)."""
    m, N, L = C.mat(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord')
    vo = N.new('ShaderNodeTexVoronoi'); vo.voronoi_dimensions = '4D'; vo.feature = 'SMOOTH_F1'
    vo.inputs['Scale'].default_value = 9; vo.inputs['Smoothness'].default_value = .6
    L.new(tc.outputs['Object'], vo.inputs['Vector'])
    nzz = N.new('ShaderNodeTexNoise'); nzz.noise_dimensions = '4D'; nzz.inputs['Scale'].default_value = 3.5
    nzz.inputs['Detail'].default_value = 8
    L.new(tc.outputs['Object'], nzz.inputs['Vector'])
    wv = N.new('ShaderNodeValue'); wv.name = 'W'
    L.new(wv.outputs[0], vo.inputs['W']); L.new(wv.outputs[0], nzz.inputs['W'])
    mx = N.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'
    L.new(vo.outputs['Distance'], mx.inputs[0]); mx.inputs[1].default_value = .7; L.new(nzz.outputs['Fac'], mx.inputs[2])
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .5
    fac = N.new('ShaderNodeMath'); fac.operation = 'POWER'; fac.inputs[1].default_value = .8
    one = N.new('ShaderNodeMath'); one.operation = 'SUBTRACT'; one.inputs[0].default_value = 1
    L.new(lw.outputs['Facing'], one.inputs[1]); L.new(one.outputs[0], fac.inputs[0])         # 1 ở tâm, 0 ở rìa
    gr = N.new('ShaderNodeValToRGB'); g = gr.color_ramp
    g.elements[0].color = C.hexc(gran); g.elements[1].color = C.hexc(core)
    g.elements[0].position = .35; g.elements[1].position = 1
    L.new(mx.outputs[0], gr.inputs['Fac'])
    lr = N.new('ShaderNodeValToRGB'); l2 = lr.color_ramp
    l2.elements[0].color = C.hexc(limb); l2.elements[1].color = (1, 1, 1, 1)
    l2.elements[1].position = .55
    L.new(fac.outputs[0], lr.inputs['Fac'])
    mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1
    L.new(gr.outputs['Color'], mul.inputs['A']); L.new(lr.outputs['Color'], mul.inputs['B'])
    em = N.new('ShaderNodeEmission')
    L.new(mul.outputs['Result'], em.inputs['Color'])
    kk = N.new('ShaderNodeMath'); kk.operation = 'MULTIPLY'; kk.name = 'k'; kk.inputs[1].default_value = k
    L.new(fac.outputs[0], kk.inputs[0])
    kk2 = N.new('ShaderNodeMath'); kk2.operation = 'ADD'; kk2.inputs[1].default_value = .25 * k
    L.new(kk.outputs[0], kk2.inputs[0])
    L.new(kk2.outputs[0], em.inputs['Strength'])
    L.new(em.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, kk, wv


def m_glow(name, inner, outer, k=1.0, power=2.4, scale=1.0):
    """Quầng/hào quang mềm trên tấm phẳng quay về camera (gradient cầu), cộng sáng."""
    m, N, L = C.mat(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord')
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    L.new(tc.outputs['Object'], mp.inputs[0])
    gr = N.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'
    L.new(mp.outputs[0], gr.inputs[0])
    pw = N.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = power
    L.new(gr.outputs['Fac'], pw.inputs[0])
    rp = N.new('ShaderNodeValToRGB'); c = rp.color_ramp
    c.elements[0].color = C.hexc(outer); c.elements[1].color = C.hexc(inner)
    L.new(gr.outputs['Fac'], rp.inputs['Fac'])
    em = N.new('ShaderNodeEmission'); L.new(rp.outputs['Color'], em.inputs['Color'])
    kk = N.new('ShaderNodeMath'); kk.operation = 'MULTIPLY'; kk.name = 'k'; kk.inputs[1].default_value = k
    L.new(pw.outputs[0], kk.inputs[0]); L.new(kk.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); adx = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], adx.inputs[0]); L.new(tr.outputs[0], adx.inputs[1]); L.new(adx.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, kk


def m_ring(name, col, k=4.0):
    """Vành sóng xung kích: dải sáng mảnh trên tấm phẳng (gradient cầu -> hàm chuông quanh bán kính 0.8)."""
    m, N, L = C.mat(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord')
    ln = N.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
    L.new(tc.outputs['Object'], ln.inputs[0])
    sb = N.new('ShaderNodeMath'); sb.operation = 'SUBTRACT'; sb.inputs[1].default_value = .8
    L.new(ln.outputs['Value'], sb.inputs[0])
    wd = N.new('ShaderNodeValue'); wd.name = 'width'; wd.outputs[0].default_value = .04
    dv = N.new('ShaderNodeMath'); dv.operation = 'DIVIDE'; L.new(sb.outputs[0], dv.inputs[0]); L.new(wd.outputs[0], dv.inputs[1])
    sq = N.new('ShaderNodeMath'); sq.operation = 'MULTIPLY'; L.new(dv.outputs[0], sq.inputs[0]); L.new(dv.outputs[0], sq.inputs[1])
    ng = N.new('ShaderNodeMath'); ng.operation = 'MULTIPLY'; ng.inputs[1].default_value = -1; L.new(sq.outputs[0], ng.inputs[0])
    ex = N.new('ShaderNodeMath'); ex.operation = 'EXPONENT'; L.new(ng.outputs[0], ex.inputs[0])
    # nhiễu để vành không đều tăm tắp
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3; nz.inputs['Detail'].default_value = 4
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    nm = N.new('ShaderNodeMapRange'); nm.inputs['To Min'].default_value = .35; nm.inputs['To Max'].default_value = 1.4
    L.new(nz.outputs['Fac'], nm.inputs['Value'])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; L.new(ex.outputs[0], m2.inputs[0]); L.new(nm.outputs[0], m2.inputs[1])
    kk = N.new('ShaderNodeMath'); kk.operation = 'MULTIPLY'; kk.name = 'k'; kk.inputs[1].default_value = k
    L.new(m2.outputs[0], kk.inputs[0])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = C.hexc(col)
    L.new(kk.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); adx = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], adx.inputs[0]); L.new(tr.outputs[0], adx.inputs[1]); L.new(adx.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, kk, wd


def m_fire(name):
    """Quả cầu lửa: nhiễu cuộn (thời gian = W) -> dải màu kem/hồng đào/tím, mờ dần ra rìa."""
    m, N, L = C.mat(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'; nz.inputs['Scale'].default_value = 2.4
    nz.inputs['Detail'].default_value = 10; nz.inputs['Roughness'].default_value = .62
    try:
        nz.inputs['Distortion'].default_value = .8
    except KeyError:
        pass
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    wv = N.new('ShaderNodeValue'); wv.name = 'W'; L.new(wv.outputs[0], nz.inputs['W'])
    rp = N.new('ShaderNodeValToRGB'); c = rp.color_ramp
    c.elements[0].position = .3; c.elements[0].color = C.hexc('#4A2D6A')
    c.elements[1].position = .78; c.elements[1].color = C.hexc('#FFF3DC')
    x = c.elements.new(.52); x.color = C.hexc('#F2A07E')
    L.new(nz.outputs['Fac'], rp.inputs['Fac'])
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .55
    one = N.new('ShaderNodeMath'); one.operation = 'SUBTRACT'; one.inputs[0].default_value = 1
    L.new(lw.outputs['Facing'], one.inputs[1])
    pw = N.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 1.6
    L.new(one.outputs[0], pw.inputs[0])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'
    L.new(pw.outputs[0], m2.inputs[0]); L.new(nz.outputs['Fac'], m2.inputs[1])
    kk = N.new('ShaderNodeMath'); kk.operation = 'MULTIPLY'; kk.name = 'k'; kk.inputs[1].default_value = 6
    L.new(m2.outputs[0], kk.inputs[0])
    em = N.new('ShaderNodeEmission'); L.new(rp.outputs['Color'], em.inputs['Color']); L.new(kk.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); adx = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], adx.inputs[0]); L.new(tr.outputs[0], adx.inputs[1]); L.new(adx.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, kk, wv


def m_spiral_glow(name):
    """Ánh sáng khuếch tán của đĩa thiên hà: 2 nhánh xoắn ốc log (pha = 2·(θ + ln r / b)), lõi kem, mờ ra ngoài."""
    m, N, L = C.mat(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(sep.outputs['Y'], at.inputs[0]); L.new(sep.outputs['X'], at.inputs[1])
    ln = N.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L.new(tc.outputs['Object'], ln.inputs[0])
    lg = N.new('ShaderNodeMath'); lg.operation = 'LOGARITHM'; lg.inputs[1].default_value = math.e
    mxr = N.new('ShaderNodeMath'); mxr.operation = 'MAXIMUM'; mxr.inputs[1].default_value = .05
    L.new(ln.outputs['Value'], mxr.inputs[0]); L.new(mxr.outputs[0], lg.inputs[0])
    kb = N.new('ShaderNodeMath'); kb.operation = 'MULTIPLY'; kb.inputs[1].default_value = .72 / B
    L.new(lg.outputs[0], kb.inputs[0])
    rot = N.new('ShaderNodeValue'); rot.name = 'rot'
    s1 = N.new('ShaderNodeMath'); s1.operation = 'ADD'; L.new(at.outputs[0], s1.inputs[0]); L.new(kb.outputs[0], s1.inputs[1])
    s2 = N.new('ShaderNodeMath'); s2.operation = 'SUBTRACT'; L.new(s1.outputs[0], s2.inputs[0]); L.new(rot.outputs[0], s2.inputs[1])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = 2; L.new(s2.outputs[0], m2.inputs[0])
    cs = N.new('ShaderNodeMath'); cs.operation = 'COSINE'; L.new(m2.outputs[0], cs.inputs[0])
    arm = N.new('ShaderNodeMapRange'); arm.inputs['From Min'].default_value = -1; arm.inputs['From Max'].default_value = 1
    arm.inputs['To Min'].default_value = 0; arm.inputs['To Max'].default_value = 1
    L.new(cs.outputs[0], arm.inputs['Value'])
    ap = N.new('ShaderNodeMath'); ap.operation = 'POWER'; ap.inputs[1].default_value = 5; L.new(arm.outputs[0], ap.inputs[0])
    # độ sáng theo bán kính: exp(-r/2.6)
    fr = N.new('ShaderNodeMath'); fr.operation = 'MULTIPLY'; fr.inputs[1].default_value = -1 / 2.6
    L.new(ln.outputs['Value'], fr.inputs[0])
    ef = N.new('ShaderNodeMath'); ef.operation = 'EXPONENT'; L.new(fr.outputs[0], ef.inputs[0])
    core = N.new('ShaderNodeMath'); core.operation = 'MULTIPLY'; core.inputs[1].default_value = -1.6
    L.new(ln.outputs['Value'], core.inputs[0])
    ce = N.new('ShaderNodeMath'); ce.operation = 'EXPONENT'; L.new(core.outputs[0], ce.inputs[0])
    am = N.new('ShaderNodeMath'); am.operation = 'MULTIPLY_ADD'; am.inputs[2].default_value = .12
    L.new(ap.outputs[0], am.inputs[0]); am.inputs[1].default_value = .88
    ab = N.new('ShaderNodeMath'); ab.operation = 'MULTIPLY'; L.new(am.outputs[0], ab.inputs[0]); L.new(ef.outputs[0], ab.inputs[1])
    tot = N.new('ShaderNodeMath'); tot.operation = 'MULTIPLY_ADD'; L.new(ce.outputs[0], tot.inputs[0]); tot.inputs[1].default_value = 2.2
    L.new(ab.outputs[0], tot.inputs[2])
    kk = N.new('ShaderNodeMath'); kk.operation = 'MULTIPLY'; kk.name = 'k'; kk.inputs[1].default_value = 0
    L.new(tot.outputs[0], kk.inputs[0])
    rp = N.new('ShaderNodeValToRGB'); c = rp.color_ramp
    c.elements[0].color = C.hexc('#8C6FD0'); c.elements[1].color = C.hexc('#FFF1D6')
    x = c.elements.new(.45); x.color = C.hexc('#E9B98A')
    L.new(ef.outputs[0], rp.inputs['Fac'])
    em = N.new('ShaderNodeEmission'); L.new(rp.outputs['Color'], em.inputs['Color']); L.new(kk.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); adx = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], adx.inputs[0]); L.new(tr.outputs[0], adx.inputs[1]); L.new(adx.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, kk, rot


# ------------------------------------------------------------------ dựng vật thể
def sphere(name, r, mat_, seg=64):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    bm.to_mesh(me); bm.free()
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    o = C.link_obj(bpy.data.objects.new(name, me)); o.data.materials.append(mat_)
    C.ray_vis(o, glossy=False)
    return o


def quad(name, half, mat_):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=half)
    bm.to_mesh(me); bm.free()
    o = C.link_obj(bpy.data.objects.new(name, me)); o.data.materials.append(mat_)
    C.ray_vis(o, glossy=False)
    return o


RS = .82
STARS = []
for i, (nm, core, gran, limb, halo_in, halo_out) in enumerate((
        ('Champagne', '#FFE6B0', '#E8A44C', '#7A3E16', '#FFD99A', '#F2C0A8'),
        ('Sapphire', '#CADBFF', '#2F5FD8', '#0B1650', '#8FB0FF', '#5B4BC0'))):
    m, k, wv = m_star(nm, core, gran, limb, .75 if i == 0 else 1.0)
    o = sphere(nm, RS, m)
    hm, hk = m_glow(nm + 'Halo', halo_in, halo_out, k=.5, power=3.2, scale=1 / (RS * 4.2))
    h = quad(nm + 'Halo', RS * 4.2, hm)
    STARS.append(dict(o=o, k=k, w=wv, h=h, hk=hk, k0=k.inputs[1].default_value))

flash_m, flash_k = m_glow('FlashGlow', '#FFFFFF', '#FFE2C8', k=0, power=3.0, scale=1 / 2.6)
flash = quad('Flash', 2.6, flash_m)
fire_m, fire_k, fire_w = m_fire('Fire')
fire = sphere('Fire', 1, fire_m, 96)
rings = []
for i, col in enumerate(('#FFE9C8', '#C9B8FF')):
    rm, rk, rw = m_ring('Ring%d' % i, col)
    ro = quad('Ring%d' % i, 1, rm)
    rings.append((ro, rk, rw))
core_m, core_k = m_glow('CoreGlow', '#FFF6E6', '#F2C0A8', k=0, power=3.2, scale=1 / 3.2)
core_h = quad('CoreGlow', 3.2, core_m)
core_m2, core_k2 = m_glow('CoreBloom', '#FFE8D0', '#8C6FD0', k=0, power=2.0, scale=1 / 9)
core_h2 = quad('CoreBloom', 9, core_m2)
sg_m, sg_k, sg_rot = m_spiral_glow('SpiralGlow')
sglow = quad('SpiralGlow', 16, sg_m)
# đặt tấm phát sáng xoắn ốc vào mặt phẳng thiên hà
basis = Matrix(((E1[0], E2[0], EN[0]), (E1[1], E2[1], EN[1]), (E1[2], E2[2], EN[2])))
sglow.matrix_world = basis.to_4x4()

# ------------------------------------------------------------------ camera
cam_d = bpy.data.cameras.new('Cam'); cam_d.lens = 32 if not V else 24; cam_d.sensor_width = 36
cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 4.0
cam = C.link_obj(bpy.data.objects.new('Cam', cam_d)); sc.camera = cam
aim = C.link_obj(bpy.data.objects.new('Aim', None))
tr = cam.constraints.new('TRACK_TO'); tr.target = aim; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'
cam_d.dof.focus_object = aim
for o in [s['h'] for s in STARS] + [flash, core_h, core_h2]:
    c = o.constraints.new('TRACK_TO'); c.target = cam; c.track_axis = 'TRACK_Z'; c.up_axis = 'UP_Y'

# ------------------------------------------------------------------ bụi sao nền nhiều lớp
HF = 2 * math.atan(18 / cam_d.lens)
RES = max(sc.render.resolution_x, sc.render.resolution_y)
C.star_dust('Dust_far', 6000 if a.uhd else 3200, 60, 110, 3, size_px=.8, bright=(.08, .5), cam_dist=16, hfov=HF, res=RES, back_only=False)
C.star_dust('Dust_mid', 1600 if a.uhd else 900, 30, 55, 5, size_px=1.0, bright=(.1, .7), cam_dist=16, hfov=HF, res=RES, back_only=False)
C.star_dust('Dust_near', 220 if a.uhd else 140, 18, 28, 9, size_px=1.5, bright=(.2, 1.2), cam_dist=16, hfov=HF, res=RES, back_only=False)


# ------------------------------------------------------------------ quỹ đạo hai sao (như starPos trong js/core.js)
R0 = 9.5
RC = RS * 1.08                       # chạm nhau: hai tâm cách nhau ~2 bán kính
TH = math.pi * 2.6
W_GROW = 6.5


def star_pos(t):
    """Trả về (vị trí sao 1, sao 2, tiến độ xoáy 0..1, góc)."""
    T1, T2 = T_APP, T_BANG - T_APP
    g1 = K_RATIO ** (-TH / (math.pi / 2))
    if t < T1:
        q = max(0, t / T1)
        sq = .146 * q + .854 * q ** 2.618
        g = K_RATIO ** (-TH * sq / (math.pi / 2))
        th = math.pi - .22 + TH * sq
        r = RC + (R0 - RC) * (g - g1) / (1 - g1)
        wh = 0
    else:
        ta = min(T2, t - T1)
        k = math.log(W_GROW) / T2
        w0 = TH * 2.382 / T1
        wh = ta / T2
        th = math.pi - .22 + TH + w0 / k * (math.exp(k * ta) - 1)
        r = RC * (1 - .3 * wh * wh)
    p = plane(math.cos(th) * r, math.sin(th) * r)
    return p, -p, wh, th, r


# ------------------------------------------------------------------ vật chất bị kéo thành 2 cánh (trong pha xoáy)
NW = 5000 if a.uhd else 2400
w_side = rng.integers(0, 2, NW)
w_lag = rng.random(NW) ** 1.4
w_jit = rng.normal(0, 1, (NW, 3))
w_sz = rng.uniform(.012, .03, NW)
wing_col = np.where(w_side[:, None] == 0, np.array(C.hexc('#FFD9A0')[:3]), np.array(C.hexc('#8FB0FF')[:3]))
wing_col = wing_col * (1 - w_lag[:, None] * .4) + np.array(C.hexc('#F2C0A8')[:3]) * w_lag[:, None] * .4
wings = C.Cloud('Wings', NW, streak=.9)


def wing_state(t):
    _, _, wh, th, r = star_pos(t)
    on = (t > T_APP - .3) & (t < T_BANG + .05)
    amt = C.smooth(C.win(t, T_APP - .3, T_BANG)) if on else 0.0
    lag = w_lag * (.4 + 3.4 * amt)                                     # độ dài cánh (radian)
    ang = th + w_side * math.pi - lag
    rr = r * (1 + w_lag * (.5 + 4.5 * amt))                               # xoắn ra ngoài
    sp = .05 + .18 * w_lag * rr
    x = np.cos(ang) * rr + w_jit[:, 0] * sp; y = np.sin(ang) * rr + w_jit[:, 1] * sp
    p = plane(x, y, w_jit[:, 2] * sp * .5)
    k = (14 * (1 - w_lag) ** 1.5 + 1.5) * amt * on
    return p, k


# ------------------------------------------------------------------ mảnh sao (nổ) -> thiên hà
NF = 16000 if a.uhd else 7000
NG = 32000 if a.uhd else 14000             # sao thiên hà hiện dần thêm
# hướng bay: dẹt theo mặt phẳng quỹ đạo, tốc độ phân bố rộng
ang0 = rng.uniform(0, 2 * math.pi, NF)
elev = rng.normal(0, .35, NF)
spd = (rng.random(NF) ** 1.8 * 7.5 + .6)
dirv = plane(np.cos(ang0) * np.cos(elev), np.sin(ang0) * np.cos(elev), np.sin(elev))
p0f = rng.normal(0, RS * .5, (NF, 3))
DRAG = 1.3
# mục tiêu trên thiên hà: 2 nhánh xoắn ốc logarit
def galaxy_targets(n, seed, rmin=.25, rmax=15.0):
    r_ = np.random.default_rng(seed)
    u = r_.random(n)
    rad = rmin + (rmax - rmin) * (u ** 1.9)
    bulge = r_.random(n) < .16
    rad = np.where(bulge, np.abs(r_.normal(0, .55, n)) + .05, rad)
    arm_ = r_.integers(0, 2, n)
    spread = np.abs(.2 + .08 * r_.standard_normal(n)) + .07 * rad ** .5
    th = arm_ * math.pi + np.log(np.maximum(rad, .05)) / B * -.72 + r_.normal(0, 1, n) * spread
    th = np.where(bulge, r_.uniform(0, 2 * math.pi, n), th)
    hgt = r_.normal(0, 1, n) * (.05 + .03 * rad) * np.where(bulge, 3.0, 1.0)
    return rad, th, hgt, bulge


g_r, g_th, g_h, g_b = galaxy_targets(NF, 77)
f_delay = rng.uniform(0, 1.6, NF)
f_sz = rng.uniform(.012, .03, NF) * np.where(rng.random(NF) < .04, 2.2, 1)
GOLD = np.array([C.hexc(c)[:3] for c in ('#FFD27A', '#F3D7A2', '#FFF1D6', '#F2C0A8', '#BCA8E6', '#AACBE0')])


def gal_color(rad, bulge, seed):
    r_ = np.random.default_rng(seed)
    n = len(rad)
    pick = np.where(bulge, 2, np.where(rad < 3.5, r_.choice([0, 1, 2], n, p=[.4, .4, .2]),
                                        r_.choice([0, 1, 3, 4, 5], n, p=[.32, .25, .18, .17, .08])))
    return GOLD[pick]


f_col = gal_color(g_r, g_b, 5)
f_hot = np.array(C.hexc('#FFF6EA')[:3])
frags = C.Cloud('Fragments', NF, streak=1.4)

h_r, h_th, h_h, h_b = galaxy_targets(NG, 99, rmin=.3, rmax=16.0)
h_col = gal_color(h_r, h_b, 6)
h_sz = rng.uniform(.008, .02, NG)
h_delay = rng.uniform(0, 1, NG)
h_k = rng.uniform(2, 6, NG) * np.where(h_b, 1.6, 1)
gal = C.Cloud('Galaxy', NG, streak=1.0)


def omega(rad):
    return .1 + .06 / (1 + rad)                           # quay gần như cứng, lõi nhanh hơn chút (rad/s)


def galaxy_xy(rad, th, hgt, tg):
    ang = th + omega(rad) * tg
    return plane(np.cos(ang) * rad, np.sin(ang) * rad, hgt), ang


def frag_state(t):
    tb = t - T_BANG
    if tb < 0:
        z = np.zeros((NF, 3)); return z, z, np.zeros(NF), np.zeros(NF)
    bal = p0f + dirv * (spd / DRAG * (1 - math.exp(-DRAG * tb)))[:, None]
    # hút về thiên hà: bắt đầu 0.7 s sau nổ, mỗi mảnh trễ khác nhau
    cap = C.ease_io(np.clip((tb - .7 - f_delay) / 3.6, 0, 1), 2.0)
    tg = max(tb - .7, 0)
    tgt, ang_t = galaxy_xy(g_r, g_th, g_h, tg)
    # nội suy theo tọa độ cực trong mặt phẳng thiên hà (cho cảm giác xoáy)
    bx, by, bz = bal @ E1, bal @ E2, bal @ EN
    rb = np.hypot(bx, by); ab = np.arctan2(by, bx)
    d = (ang_t - ab) % (2 * math.pi) + 2 * math.pi * .5      # luôn xoáy thêm cùng chiều quay
    rr = rb + (g_r - rb) * cap
    aa = ab + d * cap
    hh = bz + (g_h - bz) * cap
    p = plane(np.cos(aa) * rr, np.sin(aa) * rr, hh)
    heat = math.exp(-tb / .5)
    col = f_col * (1 - heat) + f_hot * heat
    k = (3.0 + 14 * heat) * (.55 + .45 * cap)
    return p, col, k, cap


def update(t, f):
    # --- hai sao
    p1, p2, wh, th, r = star_pos(t)
    tb = t - T_BANG
    pre = C.win(t, T_BANG - .5, T_BANG)
    for i, (s, p) in enumerate(zip(STARS, (p1, p2))):
        o = s['o']; o.location = Vector(p)
        q = 1 + .65 * wh ** 2
        tang = Vector(plane(-math.sin(th), math.cos(th)) * (1 if i == 0 else -1))
        o.rotation_euler = tang.to_track_quat('X', 'Z').to_euler()
        o.scale = (q, 1 / q ** .5, 1 / q ** .5)
        s['w'].outputs[0].default_value = t * .35 + i * 10
        alive = tb < 0
        o.hide_render = not alive
        s['k'].inputs[1].default_value = s['k0'] * (1 + 1.6 * pre)
        s['h'].location = Vector(p); s['h'].hide_render = not alive
        s['hk'].inputs[1].default_value = .5 * (1 + 2 * pre)

    # --- cánh vật chất
    wp, wk = wing_state(t)
    wp0, _ = wing_state(t - 1 / 30)
    wings.update(wp, (wp - wp0) * 30, w_sz, wing_col, wk)

    # --- nổ
    if tb >= 0:
        fk = math.exp(-tb / .1)
        flash.hide_render = False; flash.scale = (1 + 1.2 * C.ease_out(min(1, tb / .25)),) * 3
        flash_k.inputs[1].default_value = 7 * fk
        fire.hide_render = tb > 2.6
        fs = .4 + 3.0 * float(C.ease_out(tb / 2.4, 2.6))
        fire.scale = (fs,) * 3
        fire.rotation_euler = (tb * .3, tb * .2, tb * .5)
        fire_k.inputs[1].default_value = 2.4 * math.exp(-tb / .6) * C.win(tb, 0, .06)
        fire_w.outputs[0].default_value = tb * .9
        for j, (ro, rk, rw) in enumerate(rings):
            tj = tb - j * .14
            ro.hide_render = not (0 < tj < 2.2)
            kk = float(C.ease_out(tj / 2.2, 2.2))
            ro.scale = ((.5 + (17 if j == 0 else 12) * kk),) * 3
            rk.inputs[1].default_value = (9 if j == 0 else 6) * (1 - kk) ** 1.6 * C.win(tj, 0, .05)
            rw.outputs[0].default_value = .025 + .05 * kk
    else:
        flash.hide_render = fire.hide_render = True
        for ro, _, _ in rings:
            ro.hide_render = True
    rings[0][0].matrix_world = (basis @ Matrix.Rotation(0, 3, 'X')).to_4x4() @ Matrix.Diagonal((*rings[0][0].scale, 1))
    tilt = Matrix.Rotation(math.radians(64), 3, 'X') @ Matrix.Rotation(math.radians(25), 3, 'Y')
    rings[1][0].matrix_world = (basis @ tilt).to_4x4() @ Matrix.Diagonal((*rings[1][0].scale, 1))

    # --- mảnh sao -> thiên hà
    fp, fc, fkk, cap = frag_state(t)
    fp0, _, _, _ = frag_state(t - 1 / 30)
    vel = (fp - fp0) * 30
    on = 1.0 if tb >= 0 else 0.0
    frags.update(fp, vel, f_sz * on, fc, fkk * on)

    tg = max(tb - .7, 0)
    hp, _ = galaxy_xy(h_r, h_th, h_h, tg)
    hp0, _ = galaxy_xy(h_r, h_th, h_h, max(tg - 1 / 30, 0))
    ha = np.clip((tb - 2.6 - h_delay * 2.4) / 2.0, 0, 1) if tb > 0 else np.zeros(NG)
    gal.update(hp, (hp - hp0) * 30, h_sz * (ha > 0), h_col, h_k * ha)

    ga = float(C.smooth(C.win(tb, 1.0, 6.0))) if tb > 0 else 0.0
    sg_k.inputs[1].default_value = 1.1 * ga
    sg_rot.outputs[0].default_value = .105 * tg                 # nhánh khuếch tán quay chậm theo thiên hà
    core_k.inputs[1].default_value = (3.2 * C.smooth(C.win(tb, .5, 3.5)) + 2.2 * math.exp(-max(tb, 0) / .35) * (tb > 0)) if tb > 0 else 0
    core_k2.inputs[1].default_value = .35 * C.smooth(C.win(tb, .2, 4.0)) if tb > 0 else 0
    core_h.hide_render = core_h2.hide_render = tb <= 0
    sglow.hide_render = bool(ga <= 0)

    # --- camera
    shake = Vector((0, 0, 0))
    if -.0 < tb < .45:
        a_ = (1 - tb / .45) ** 2 * .12
        shake = Vector((math.sin(t * 91) * a_, math.sin(t * 73 + 1) * a_ * .5, math.sin(t * 67 + 2) * a_))
    shake += Vector((math.sin(t * 41), 0, math.cos(t * 37))) * .02 * wh ** 2
    c1 = float(C.ease_io(C.win(t, 0, T_BANG), 1.6))
    c2 = float(C.ease_io(C.win(t, T_BANG + .2, T_BANG + 5.5), 2.0))
    dist = (19 - 5.5 * c1) * (1 - c2) + 18.5 * c2 - 1.4 * C.win(t, T_BANG + 5.5, DUR)
    if V:
        dist *= 1.05
    az = math.radians(-14 + 12 * c1) * (1 - c2) + math.radians(-6 + 16 * C.win(t, T_BANG, DUR)) * c2
    el = math.radians(9 + 5 * c1) * (1 - c2) + math.radians(30) * c2
    aim.location = Vector((0, 0, 0))
    cam.location = Vector((math.sin(az) * math.cos(el) * dist, -math.cos(az) * math.cos(el) * dist, math.sin(el) * dist)) + shake
    cam_d.dof.aperture_fstop = 5.6


comp_ex = C.compositor(sc, bloom=.7, threshold=1.0, size=.7, fog=.0, vignette=.35)


def upd(t, f):
    update(t, f)
    tb = t - T_BANG
    comp_ex.inputs['Exposure'].default_value = .9 * math.exp(-tb / .08) if tb >= 0 else .9 * C.win(t, T_BANG - .35, T_BANG) ** 3


C.render_loop(sc, a, upd)


def audio_fn(au, wav, dur):
    au.collision_track(wav, dur, bang=T_BANG)


C.finish(sc, a, audio_fn, DUR)
