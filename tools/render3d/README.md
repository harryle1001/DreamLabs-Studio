# Công cụ dựng ảnh sản phẩm 3D (Three.js)

Nguồn của 8 dòng sản phẩm concept trong Phòng mẫu (`img/sm-product-*`): `lines/<dòng>.js` (bag, candle, jewel, perfume, shoe, skin, watch, whisky), thư viện chung `lib.js`, trang dựng `render.html`.

Các script (`shoot.js`, `gen.js`, `check.js`) được viết cho một thư mục tạm bên ngoài repo và cổng 4204; đường dẫn tuyệt đối bên trong cần sửa lại trước khi chạy. Cần Playwright (Chromium với cờ `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`) và `sharp`.

## Bộ khung xoay 360 (`img/spin/<dòng>/001.webp…`)

`spin.html` + `spin.js` dựng một dòng thành 48 khung vuông 1200px quanh trục đứng, giữ ánh sáng, nền và tiêu cự của ảnh tĩnh (cấu hình từng dòng ở `CFG` trong `spin.html`: cảnh gốc, vật được giữ lại, trục xoay, độ lấp khung).

```bash
npm i --prefix /tmp/dl three@0.187.0 sharp          # ngoài repo, chỉ cần cho công cụ này
DL_NPM=/tmp/dl/node_modules node tools/render3d/spin.js perfume            # đủ bộ → img/spin/perfume/
DL_NPM=/tmp/dl/node_modules node tools/render3d/spin.js watch --pre 0,12   # xem trước vài khung (PNG trong tools/render3d/out/)
```

Chạy lại sẽ bỏ qua khung PNG đã có trong thư mục `out/` (đổi `DL_OUT` hoặc xóa thư mục đó để dựng lại từ đầu). Trình xem ở `js/spin.js`; mẫu bật 360 bằng trường `spin` trong `js/samples-product.js` (file này giờ sửa tay, `gen.js` không sinh trường `spin`).

### Định dạng v2 (nền trong suốt, cho hiệu ứng lơ lửng)

`node tools/render3d/spin.js <dòng> [--shot <mẫu mã>] --v2` dựng 72 khung 1600px chỉ có sản phẩm (bỏ bệ, sàn, phản chiếu) và ghi vào `img/spin/<slug>/`:
`bg.webp` (ảnh nền), `l/001…072.webp` (960px, đủ khung, dùng khi xoay), `h/001, 003…071.webp` (1600px, khung lẻ, dùng khi dừng và phóng to), `meta.json` (vị trí mặt đất để trình xem vẽ bóng). Chạy lại sẽ bỏ qua khung đã có.
