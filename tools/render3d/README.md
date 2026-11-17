# Công cụ dựng ảnh sản phẩm 3D (Three.js)

Nguồn của 8 dòng sản phẩm concept trong Phòng mẫu (`img/sm-product-*`): `lines/<dòng>.js` (bag, candle, jewel, perfume, shoe, skin, watch, whisky), thư viện chung `lib.js`, trang dựng `render.html`.

Các script (`shoot.js`, `gen.js`, `check.js`) được viết cho một thư mục tạm bên ngoài repo và cổng 4204; đường dẫn tuyệt đối bên trong cần sửa lại trước khi chạy. Cần Playwright (Chromium với cờ `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`) và `sharp`.
