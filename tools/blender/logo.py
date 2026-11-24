"""Dream Labs — Video 1: logo 3D (11 giây).

  blender -b -P tools/blender/logo.py -- --preview            # 960x540, 24 fps (duyệt nhanh, CPU được)
  blender -b -P tools/blender/logo.py -- --4k                 # 3840x2160, 30 fps, Cycles GPU
  blender -b -P tools/blender/logo.py -- --4k --vertical      # 2160x3840 (9:16)

Kịch bản: hạt sáng vàng xoáy theo hai nhánh xoắn ốc hội tụ vào tâm -> đĩa logo hình thành (đĩa ngọc trai pha
tím oải hương -> hồng đào, trăng khuyết kim loại vàng champagne) -> đĩa xoay chậm lộ độ dày, vệt sáng lướt qua ->
chữ "Dream Labs" hiện dần -> logo tĩnh trên nền tối có bụi sao và quầng sáng dịu.
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bpy
from mathutils import Vector, Euler
import common as C

DUR = 11.0
LAV, PEACH, MIST = '#BCA8E6', '#F2C0A8', '#AACBE0'
BG = '#15121C'
GOLD = '#F3D7A2'
CHAMP = '#E9D3A8'
CREAM = '#F1E8D8'
PHI = (1 + 5 ** .5) / 2

a = C.args()
sc = C.reset()
dev = C.setup_render(sc, a, 'logo', samples_preview=40, samples_4k=320, duration=DUR)
V = a.vertical

# ------------------------------------------------------------------ thế giới (nền tối + mây tím rất nhẹ)
w = bpy.data.worlds.new('W'); sc.world = w
C.world_nodes(w)
N, L = w.node_tree.nodes, w.node_tree.links
N.clear()
wo = N.new('ShaderNodeOutputWorld'); bg = N.new('ShaderNodeBackground')
bg.inputs['Color'].default_value = C.hexc(BG); bg.inputs['Strength'].default_value = .55
lp = N.new('ShaderNodeLightPath')
mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
mx.inputs['A'].default_value = C.hexc('#2A2236')     # ánh sáng môi trường cho phản chiếu (không thấy trên nền)
L.new(bg.outputs[0], wo.inputs[0])
bg2 = N.new('ShaderNodeBackground'); bg2.inputs['Color'].default_value = C.hexc('#6A5560'); bg2.inputs['Strength'].default_value = .45
ms = N.new('ShaderNodeMixShader')
L.new(lp.outputs['Is Camera Ray'], ms.inputs[0])
L.new(bg2.outputs[0], ms.inputs[1]); L.new(bg.outputs[0], ms.inputs[2])
L.new(ms.outputs[0], wo.inputs[0])

# ------------------------------------------------------------------ vật liệu
def m_disc():
    m, N, L = C.mat('Disc')
    b = C.principled(m)
    tc = N.new('ShaderNodeTexCoord')
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    # đường chéo trên-trái -> dưới-phải như gradient dl-lg (x1=0,y1=0 -> x2=1,y2=1)
    add = N.new('ShaderNodeMath'); add.operation = 'SUBTRACT'
    L.new(sep.outputs['X'], add.inputs[0]); L.new(sep.outputs['Z'], add.inputs[1])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1.45; mr.inputs['From Max'].default_value = 1.45
    L.new(add.outputs[0], mr.inputs['Value'])
    ramp = N.new('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.elements[0].color = C.hexc('#A88CE6'); cr.elements[1].position = 1; cr.elements[1].color = C.hexc('#8DB6D8')
    e = cr.elements.new(.618); e.color = C.hexc('#F2A88A')
    L.new(mr.outputs[0], ramp.inputs['Fac'])
    L.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .2
    b.inputs['Coat Weight'].default_value = 1.0
    b.inputs['Coat Roughness'].default_value = .04
    b.inputs['Coat IOR'].default_value = 1.55
    b.inputs['Transmission Weight'].default_value = .1
    b.inputs['Subsurface Weight'].default_value = .0
    b.inputs['Sheen Weight'].default_value = .12
    b.inputs['Sheen Tint'].default_value = C.hexc('#FFE9F2')
    try:
        b.inputs['Thin Film Thickness'].default_value = 420
        b.inputs['Thin Film IOR'].default_value = 1.38
    except KeyError:
        pass
    L.new(ramp.outputs['Color'], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = .12
    return m, b


def m_metal(name, col, rough, k=0.0):
    m, N, L = C.mat(name)
    b = C.principled(m)
    b.inputs['Base Color'].default_value = C.hexc(col)
    b.inputs['Metallic'].default_value = 1
    b.inputs['Roughness'].default_value = rough
    b.inputs['Emission Color'].default_value = C.hexc(col)
    b.inputs['Emission Strength'].default_value = k
    try:
        b.inputs['Anisotropic'].default_value = .0
    except KeyError:
        pass
    return m, b


def m_text():
    """Kim loại mờ màu kem + hiện dần từ trái qua phải (mép hiện có viền sáng)."""
    m, N, L = C.mat('Text')
    b = C.principled(m)
    b.inputs['Base Color'].default_value = C.hexc(CREAM)
    b.inputs['Metallic'].default_value = .85
    b.inputs['Roughness'].default_value = .34
    b.inputs['Coat Weight'].default_value = .3
    out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ')
    L.new(tc.outputs['Generated'], sep.inputs[0])
    thr = N.new('ShaderNodeValue'); thr.name = 'reveal'; thr.outputs[0].default_value = -1
    sub = N.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'
    L.new(thr.outputs[0], sub.inputs[0]); L.new(sep.outputs['X'], sub.inputs[1])        # >0: đã hiện
    sm = N.new('ShaderNodeMapRange'); sm.interpolation_type = 'SMOOTHSTEP'
    sm.inputs['From Min'].default_value = 0; sm.inputs['From Max'].default_value = .12
    L.new(sub.outputs[0], sm.inputs['Value'])
    # viền sáng ở mép đang hiện
    edge = N.new('ShaderNodeMapRange'); edge.interpolation_type = 'SMOOTHSTEP'
    edge.inputs['From Min'].default_value = .0; edge.inputs['From Max'].default_value = .1
    edge.inputs['To Min'].default_value = 0; edge.inputs['To Max'].default_value = 1
    L.new(sub.outputs[0], edge.inputs['Value'])
    inv = N.new('ShaderNodeMath'); inv.operation = 'PINGPONG'; inv.inputs[1].default_value = .5
    eg = N.new('ShaderNodeMath'); eg.operation = 'MULTIPLY'; eg.inputs[1].default_value = 4
    L.new(edge.outputs[0], inv.inputs[0]); L.new(inv.outputs[0], eg.inputs[0])
    L.new(eg.outputs[0], b.inputs['Emission Strength'])
    b.inputs['Emission Color'].default_value = C.hexc(GOLD)
    tr = N.new('ShaderNodeBsdfTransparent')
    mix = N.new('ShaderNodeMixShader')
    L.new(sm.outputs[0], mix.inputs[0]); L.new(tr.outputs[0], mix.inputs[1]); L.new(b.outputs[0], mix.inputs[2])
    L.new(mix.outputs[0], out.inputs['Surface'])
    return m, thr


def m_halo():
    m, N, L = C.mat('Halo')
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tc = N.new('ShaderNodeTexCoord')
    gr = N.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (.2, .2, .2)
    L.new(tc.outputs['Object'], mp.inputs[0]); L.new(mp.outputs[0], gr.inputs[0])
    pw = N.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 2.6
    L.new(gr.outputs['Fac'], pw.inputs[0])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    cr.elements[0].color = C.hexc('#7E68C8'); cr.elements[1].color = C.hexc('#FFE9DA')
    e = cr.elements.new(.6); e.color = C.hexc('#E7A7C0')
    L.new(gr.outputs['Fac'], ramp.inputs['Fac'])
    em = N.new('ShaderNodeEmission')
    L.new(ramp.outputs['Color'], em.inputs['Color'])
    k = N.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.name = 'k'; k.inputs[1].default_value = .3
    L.new(pw.outputs[0], k.inputs[0]); L.new(k.outputs[0], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); ad = N.new('ShaderNodeAddShader')
    L.new(em.outputs[0], ad.inputs[0]); L.new(tr.outputs[0], ad.inputs[1])
    L.new(ad.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'
    return m, k


# ------------------------------------------------------------------ dựng logo
def cyl(name, r, depth, verts=192, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=depth)
    bm.to_mesh(me); bm.free()
    o = C.link_obj(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = (math.pi / 2, 0, 0)        # trục tròn hướng theo Y (về phía camera)
    return o


mark = C.link_obj(bpy.data.objects.new('Mark', None))
TH = .2                                            # độ dày đĩa (bán kính 1)
disc = cyl('Disc', 1, TH)
bv = disc.modifiers.new('bv', 'BEVEL'); bv.width = .045; bv.segments = 6; bv.limit_method = 'ANGLE'
disc.data.polygons.foreach_set('use_smooth', [True] * len(disc.data.polygons))
try:
    disc.data.shade_smooth_by_angle(angle=math.radians(40))
except Exception:
    pass
md, disc_b = m_disc(); disc.data.materials.append(md)
disc.parent = mark

# trăng khuyết: tròn lớn (tâm đĩa, r = 7.4164/12) trừ tròn nhỏ (tâm (20.0535, 10.7082) trong khung 26, r = 4.5836/12)
R1, R2 = 7.4164 / 12, 4.5836 / 12
cx2, cz2 = (20.0535 - 13) / 12, (13 - 10.7082) / 12
cdep = .085
cres = cyl('Crescent', R1, cdep, 160, loc=(0, -TH / 2 - cdep / 2 + .02, 0))
cut = cyl('Cut', R2, cdep * 3, 128, loc=(cx2, -TH / 2 - cdep / 2 + .02, cz2))
bo = cres.modifiers.new('cut', 'BOOLEAN'); bo.object = cut; bo.operation = 'DIFFERENCE'; bo.solver = 'EXACT'
bpy.context.view_layer.objects.active = cres
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
me2 = bpy.data.meshes.new_from_object(cres.evaluated_get(dg))
cres.modifiers.clear(); cres.data = me2
bpy.data.objects.remove(cut)
bv2 = cres.modifiers.new('bv', 'BEVEL'); bv2.width = .026; bv2.segments = 4; bv2.limit_method = 'ANGLE'
cres.data.polygons.foreach_set('use_smooth', [True] * len(cres.data.polygons))
try:
    cres.data.shade_smooth_by_angle(angle=math.radians(35))
except Exception:
    pass
mc, cres_b = m_metal('Champagne', '#EFD6A6', .34, .0)
cres.data.materials.clear(); cres.data.materials.append(mc)
cres.parent = mark
# rãnh khoét trên mặt đĩa dưới trăng khuyết (bóng đổ mảnh làm trăng nổi khối)

# ------------------------------------------------------------------ chữ
def text(body, font, size):
    cu = bpy.data.curves.new(body, 'FONT')
    cu.body = body; cu.font = bpy.data.fonts.load(os.path.join(C.FONTS, font))
    cu.size = size; cu.extrude = .028; cu.bevel_depth = .006; cu.bevel_resolution = 3
    cu.align_x = 'LEFT'; cu.align_y = 'CENTER'
    cu.resolution_u = 24
    o = C.link_obj(bpy.data.objects.new(body, cu))
    o.rotation_euler = (math.pi / 2, 0, 0)
    return o


mt, reveal_t = m_text()
TS = 1.02
t1 = text('Dream', 'PlayfairDisplay-Regular.ttf', TS)
mt2 = mt.copy(); reveal_t2 = mt2.node_tree.nodes['reveal']
t2 = text('Labs', 'PlayfairDisplay-Italic.ttf', TS)
t1.data.materials.append(mt); t2.data.materials.append(mt2)
bpy.context.view_layer.update()


def width(o):
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return max(v.x for v in bb) - min(v.x for v in bb)


w1, w2 = width(t1), width(t2)
space = TS * .26
tw = w1 + space + w2
if not V:
    GAP = .5
    total = 2 + GAP + tw
    x0 = -total / 2
    MARK_POS = Vector((x0 + 1, 0, 0))
    tx = x0 + 2 + GAP
    tz = -.02
else:
    MARK_POS = Vector((0, 0, .95))
    tx = -tw / 2
    tz = -.95
t1.location = (tx, 0, tz); t2.location = (tx + w1 + space, 0, tz)
mark.location = MARK_POS

# ------------------------------------------------------------------ quầng sáng sau logo + bụi sao
halo = bpy.data.objects.new('Halo', bpy.data.meshes.new('Halo'))
import bmesh
bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=9); bm.to_mesh(halo.data); bm.free()
C.link_obj(halo); halo.rotation_euler = (math.pi / 2, 0, 0); halo.location = (MARK_POS.x, 1.2, MARK_POS.z)
mh, halo_k = m_halo(); halo.data.materials.append(mh)
C.ray_vis(halo, glossy=False)

CAM_D = 19.0 if not V else 18.5
LENS = 70
C.star_dust('Dust_far', 2600 if a.uhd else 1500, 40, 90, 7, size_px=1.0, bright=(.12, .8), cam_dist=CAM_D,
            hfov=2 * math.atan(18 / LENS), res=sc.render.resolution_x)
C.star_dust('Dust_mid', 700 if a.uhd else 420, 14, 30, 11, size_px=1.4, bright=(.1, .5), cam_dist=CAM_D,
            hfov=2 * math.atan(18 / LENS), res=sc.render.resolution_x)

# ------------------------------------------------------------------ ánh sáng
def area(name, loc, rot, size, sy, energy, col, spread=180):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = size; ld.size_y = sy
    ld.energy = energy; ld.color = C.hexc(col)[:3]
    try:
        ld.spread = math.radians(spread)
    except Exception:
        pass
    o = C.link_obj(bpy.data.objects.new(name, ld)); o.location = loc; o.rotation_euler = rot
    o.visible_camera = False
    return o


key = area('Key', (-5, -6, 5), (math.radians(55), 0, math.radians(-40)), 5, 5, 420, '#FFE6C4')
rim = area('Rim', (6, 5, 3), (math.radians(-60), 0, math.radians(-130)), 4, 4, 700, '#C9B6FF')
fill = area('Fill', (4, -7, -3), (math.radians(110), 0, math.radians(30)), 6, 6, 260, '#FFD9C8')
front = area('Front', (1.5, -16, 4.5), (math.radians(76), 0, math.radians(5)), 10, 4, 480, '#FFF0DC', spread=90)
sweep = area('Sweep', (-8, -4, 0), (math.radians(90), 0, 0), .35, 9, 2600, '#FFF6E6', spread=60)
core = bpy.data.lights.new('Core', 'POINT'); core.color = C.hexc(GOLD)[:3]; core.shadow_soft_size = .2
core_o = C.link_obj(bpy.data.objects.new('Core', core))

# ------------------------------------------------------------------ camera
cam_d = bpy.data.cameras.new('Cam'); cam_d.lens = LENS; cam_d.sensor_width = 36
cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 2.0; cam_d.dof.aperture_blades = 7
cam = C.link_obj(bpy.data.objects.new('Cam', cam_d)); sc.camera = cam
aim = C.link_obj(bpy.data.objects.new('Aim', None))
tr = cam.constraints.new('TRACK_TO'); tr.target = aim; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'
cam_d.dof.focus_object = aim

# ------------------------------------------------------------------ hạt sáng xoắn ốc
NP = 5200 if a.uhd else 2600
rng = np.random.default_rng(1618)
arm = rng.integers(0, 2, NP)
B = math.log(PHI) / (math.pi / 2)                       # xoắn ốc vàng: bán kính x phi mỗi 1/4 vòng
t_arr = 1.15 + 2.0 * rng.random(NP) ** .8                 # thời điểm chạm tâm
t_dep = t_arr - (1.5 + 1.2 * rng.random(NP))             # thời điểm xuất hiện
r_start = rng.uniform(3.2, 9.0, NP)
th_off = arm * math.pi + rng.normal(0, .16, NP)
lat = rng.normal(0, 1, (NP, 3)) * .05                     # độ dày dòng hạt
yz = rng.normal(0, .4, NP)                                # độ sâu (lệch trục Y), co dần về 0
size0 = rng.uniform(.010, .024, NP) * (1 + 2.2 * (rng.random(NP) < .05))
pal = np.array([C.hexc(c)[:3] for c in (GOLD, '#FFF2D8', '#FFD27A', LAV, PEACH)])
ci = rng.choice(5, NP, p=[.5, .2, .18, .07, .05])
pcol = pal[ci]
pk = rng.uniform(3, 8, NP)
cloud = C.Cloud('Spiral', NP, streak=.8)

# bụi mờ trôi gần camera (bokeh)
NB = 160 if a.uhd else 90
bk_p = np.c_[rng.uniform(-7, 7, NB), rng.uniform(-9, -2, NB), rng.uniform(-4, 4, NB)]
bk_v = rng.normal(0, .05, (NB, 3))
bk_s = rng.uniform(.006, .016, NB)
bk_c = pal[rng.choice(5, NB)]
bokeh = C.Cloud('Bokeh', NB, streak=0)


def spiral_pos(t):
    s = np.clip((t - t_dep) / (t_arr - t_dep), 0, 1)
    e = 1 - (1 - s) ** 1.0
    e = e ** 1.6                                           # chậm lúc đầu, nhanh dần khi vào tâm
    r = r_start * (1 - e) + .02
    phi = np.log(r_start / r) / B                          # góc quét theo xoắn ốc log
    th = th_off - phi * .62 + .35 * t                      # quay ngược chiều kim đồng hồ
    x = np.cos(th) * r; z = np.sin(th) * r * .92
    y = yz * (1 - e) * 1.6
    p = np.c_[x, y, z] + lat * (1 - e)[:, None] * r[:, None] * .6
    return p, s


def update(t, f):
    # --- hạt
    p, s = spiral_pos(t)
    p0, _ = spiral_pos(t - 1 / 30)
    vel = (p - p0) * 30
    p = p + np.array(MARK_POS)
    alive = (s > 0) & (s < 1)
    fade_in = np.clip(s / .12, 0, 1)
    burst = 1 + 1.2 * np.clip((s - .85) / .15, 0, 1) ** 2   # sáng rực khi sắp chạm tâm
    k = pk * fade_in * burst * alive
    sz = size0 * (1 - .4 * s) * alive
    cloud.update(p, vel, sz, pcol, k, dt=1 / 24)

    bp = bk_p + bk_v * t
    bokeh.update(bp, np.zeros_like(bp), bk_s, bk_c, 2.0 + 0 * bk_s)

    # --- logo hình thành (2.75 -> 3.6 s), xoay chậm lộ độ dày, dừng hẳn ở 7.8 s
    g = C.win(t, 2.7, 3.7)
    sc_ = float(C.ease_out(g, 3)) if g < 1 else 1.0
    sc_ = sc_ * (1 + .06 * math.sin(min(1, g) * math.pi))      # nhú nhẹ rồi về đúng cỡ
    mark.scale = (max(sc_, 1e-3),) * 3
    rt = C.win(t, 2.7, 8.2)
    yaw = (1 - float(C.ease_out(rt, 2.618))) * math.radians(-235)
    pitch = (1 - float(C.ease_out(rt, 2))) * math.radians(14)
    mark.rotation_euler = (pitch, 0, yaw)
    flash = math.exp(-max(0, t - 3.05) / .35) * (t > 2.75) * C.win(t, 2.75, 3.05)
    disc_b.inputs['Emission Strength'].default_value = .12 + .45 * flash
    cres_b.inputs['Emission Strength'].default_value = 1.2 * flash
    core.energy = 300 * flash + 300 * C.win(t, 1.0, 2.8) * (t < 3.2)
    core_o.location = MARK_POS + Vector((0, -.6, 0))

    # --- vệt sáng lướt qua mặt logo (5.0 -> 6.8 s) và qua chữ (8.4 -> 9.8 s)
    sw = C.win(t, 4.8, 6.9); sw2 = C.win(t, 8.3, 9.9)
    if 0 < sw < 1:
        sweep.location = (MARK_POS.x - 5 + 10 * float(C.ease_io(sw, 2)), -4, MARK_POS.z)
        sweep.data.energy = 2600 * math.sin(sw * math.pi)
    elif 0 < sw2 < 1:
        sweep.location = (-9 + 18 * float(C.ease_io(sw2, 2)), -4, 0)
        sweep.data.energy = 1800 * math.sin(sw2 * math.pi)
    else:
        sweep.data.energy = 0

    # --- chữ hiện dần (trái -> phải)
    reveal_t.outputs[0].default_value = -.15 + 1.3 * float(C.ease_io(C.win(t, 5.7, 7.3), 1.6))
    reveal_t2.outputs[0].default_value = -.15 + 1.3 * float(C.ease_io(C.win(t, 6.5, 8.0), 1.6))
    t1.location.y = .25 * (1 - float(C.ease_out(C.win(t, 5.6, 7.6))))
    t2.location.y = .25 * (1 - float(C.ease_out(C.win(t, 6.4, 8.4))))

    # --- quầng sáng
    halo_k.inputs[1].default_value = (.12 + .25 * flash + .2 * C.win(t, 3, 9)) * C.win(t, .5, 2.6)

    # --- camera: bắt đầu gần tâm (xoắn ốc), lùi dần lộ cả cụm logo, đẩy rất chậm ở cuối
    cp = float(C.ease_io(C.win(t, 2.4, 8.2), 2.2))
    d = (9.0 * (1 - cp) + CAM_D * cp) - .9 * C.win(t, 8.2, 11) ** 1.2
    ang = math.radians(-24) * (1 - cp) + math.radians(-3) * cp
    el = math.radians(16) * (1 - cp) + math.radians(4) * cp
    foc = MARK_POS * (1 - cp) + Vector((0, 0, 0)) * cp
    aim.location = foc
    cam.location = foc + Vector((math.sin(ang) * d * math.cos(el), -math.cos(ang) * d * math.cos(el), math.sin(el) * d))
    cam_d.dof.aperture_fstop = 1.6 + 2.4 * cp


C.compositor(sc, bloom=.55, threshold=1.2, size=.62, vignette=.3)
frames = C.render_loop(sc, a, update)


def audio_fn(au, wav, dur):
    au.logo_track(wav, dur)


C.finish(sc, a, audio_fn, DUR)
