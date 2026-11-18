#!/usr/bin/env python3
"""Tải mô hình 3D quét từ vật thật (Poly Haven, giấy phép CC0) cho các mẫu trong products.json.
python3 tools/scan3d/fetch.py [độ phân giải texture, mặc định 2k]  → tools/scan3d/models/<id>/ (không đưa vào git)"""
import json,os,sys,urllib.request
urllib.request.install_opener(urllib.request.build_opener());O=urllib.request.build_opener();O.addheaders=[('User-Agent','Mozilla/5.0 (scan3d)')];urllib.request.install_opener(O)
D=os.path.dirname(os.path.abspath(__file__));RES=sys.argv[1] if len(sys.argv)>1 else '2k'
for p in json.load(open(os.path.join(D,'products.json'))):
  g=json.load(urllib.request.urlopen('https://api.polyhaven.com/files/'+p['id']))['gltf']
  g=g[RES if RES in g else sorted(g)[0]]['gltf'];out=os.path.join(D,'models',p['id'])
  for u,rel in [(g['url'],os.path.basename(g['url']))]+[(v['url'],k) for k,v in g.get('include',{}).items()]:
    f=os.path.join(out,rel);os.makedirs(os.path.dirname(f),exist_ok=True)
    if not os.path.exists(f):urllib.request.urlretrieve(u,f)
  print(p['id'],'ok')
