"""Render wireframe / clay / hi-fi passes of one model from its hero camera on a shared orbit.
Purpose: render-only marketing media. Never saves the .blend (read-only use of the delivered file).
Usage: blender -b --factory-startup <file.blend> --python render-orbit-passes.py -- '<json args>'
args: cam, frame, out, res [w,h], orbit_n, arc_deg, indices [..], passes ["wire","clay","hifi"], samples, device"""
import bpy, json, math, os, re, sys, time
sys.path.insert(0, "/Users/jang/Products/design-os-3d-blender/scripts")
import agent_runtime as rt
from mathutils import Matrix, Vector

A = json.loads(sys.argv[sys.argv.index('--') + 1])
sc = bpy.context.scene
sc.frame_set(A.get('frame', 1))
if A.get('cam_json'):  # recreate a recorded camera so different build stages share one view
    J = json.load(open(A['cam_json']))
    cam = bpy.data.objects.new('STAGE_CAMERA', bpy.data.cameras.new('STAGE_CAMERA')); sc.collection.objects.link(cam)
    for k in ('lens', 'sensor_width', 'sensor_fit', 'shift_x', 'shift_y', 'clip_start', 'clip_end'): setattr(cam.data, k, J[k])
    cam.matrix_world = Matrix(J['matrix'])
else:
    cam = bpy.data.objects[A['cam']]
sc.camera = cam
STUDIO = re.compile(A.get('studio_re', r'(?i)(^studio|studio_|_ground$|^ground|cyclo|backdrop)'))
model = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render and not STUDIO.search(o.name)]
studio = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render and STUDIO.search(o.name)]
pts = [o.matrix_world @ Vector(c) for o in model for c in o.bound_box]
pivot = sum(pts, Vector()) / len(pts)
base = cam.matrix_world.copy()  # evaluated hero pose (constraints + animation at this frame)
for con in cam.constraints: con.mute = True  # the orbit owns the camera from here on (file is never saved)
cam.animation_data_clear(); cam.parent = None
if A.get('lens_mul'): cam.data.lens *= A['lens_mul']

def place(i):  # rotate the hero camera about the vertical axis through the model centre
    a = math.radians(A['arc_deg']) * (i / max(1, A['orbit_n'] - 1) - 0.5)
    cam.matrix_world = Matrix.Translation(pivot) @ Matrix.Rotation(a, 4, 'Z') @ Matrix.Translation(-pivot) @ base

r = sc.render; r.resolution_x, r.resolution_y = A['res']; r.resolution_percentage = 100
r.image_settings.file_format = 'JPEG'; r.image_settings.quality = 92; r.film_transparent = False
times = {}
VT = (sc.view_settings.view_transform, sc.view_settings.look)
for p in A['passes']:
    for o in studio: o.hide_render = p != 'hifi'
    if p == 'hifi':
        sc.view_settings.view_transform, sc.view_settings.look = VT
        r.engine = 'CYCLES'; c = sc.cycles
        c.samples, c.use_denoising, c.use_adaptive_sampling = A.get('samples', 64), True, True
        if A.get('device') == 'METAL':
            pr = bpy.context.preferences.addons['cycles'].preferences
            pr.compute_device_type = 'METAL'; pr.get_devices()
            for d in pr.devices: d.use = d.type == 'METAL'
            c.device = 'GPU'
        else: c.device = 'CPU'
    else:
        r.engine = 'BLENDER_WORKBENCH'; sh = sc.display.shading
        sh.background_type, sh.background_color = 'VIEWPORT', (0.914, 0.906, 0.890)
        sc.view_settings.view_transform, sc.view_settings.look = 'Standard', 'None'
        if p == 'wire':
            sh.type, sh.light, sh.show_object_outline = 'WIREFRAME', 'FLAT', True
            sh.object_outline_color = (0.07, 0.07, 0.07); sh.wireframe_color_type = 'OBJECT'
            for o in model: o.color = (0.09, 0.09, 0.09, 1.0)  # ink hairlines
        else:
            sh.type, sh.light, sh.color_type = 'SOLID', 'STUDIO', 'SINGLE'
            sh.single_color, sh.show_cavity, sh.cavity_type, sh.show_shadows = (0.80, 0.79, 0.77), True, 'BOTH', True
            sh.show_object_outline = False
    os.makedirs(f"{A['out']}/{p}", exist_ok=True)
    t0 = time.time()
    for i in A['indices']:
        place(i); r.filepath = f"{A['out']}/{p}/o{i:03d}.jpg"; bpy.ops.render.render(write_still=True)
    times[p] = round((time.time() - t0) / len(A['indices']), 2)
written = {p: len([f for f in os.listdir(f"{A['out']}/{p}") if f.endswith('.jpg')]) for p in A['passes']}
rt.emit_ok("orbit-passes", model_objects=len(model), studio_objects=len(studio),
           studio_names=",".join(o.name for o in studio)[:200], pivot=[round(v, 3) for v in pivot],
           **{f"{p}_s_per_frame": t for p, t in times.items()}, **{f"{p}_files": n for p, n in written.items()})
