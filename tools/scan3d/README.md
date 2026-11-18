# Studio 3D cho mô hình quét từ vật thật

Nguồn mẫu "Quét 3D vật thật" trong Phòng mẫu (`img/sm-product-scan-*`, `img/spin/scan-*/`) và phim `media/sm-motion-studio3d.mp4`.

- Mô hình: thư viện [Poly Haven](https://polyhaven.com/models), giấy phép **CC0** (dùng thương mại tự do, không cần ghi tên). Chỉ chọn vật không có chữ hay logo hãng.
- Danh sách mẫu, tên hiển thị, chất liệu, tông nền: `products.json`.
- Dựng: `studio.html` (Three.js: nền vầng sáng, bệ đá viền đồng, ánh sáng chính ấm + viền lạnh, bóng mềm) và `run.js`.

```bash
python3 tools/scan3d/fetch.py 2k                       # tải mô hình vào tools/scan3d/models/ (không đưa vào git)
npm i --prefix /tmp/dl three@0.187.0 sharp             # ngoài repo
export DL_NPM=/tmp/dl/node_modules
node tools/scan3d/run.js pre <id>                      # xem trước vài khung trong tools/scan3d/out/pre
node tools/scan3d/run.js still <id>                    # ảnh bìa 1280×791
node tools/scan3d/run.js spin <id> 48                  # bộ xoay 360 → img/spin/scan-<slug>/
node tools/scan3d/run.js film                          # phim 1920×1080 → nén 1280×720 media/sm-motion-studio3d.mp4
```

Mạng của môi trường cần cho phép `api.polyhaven.com`, `dl.polyhaven.org`, `cdn.polyhaven.com`.
