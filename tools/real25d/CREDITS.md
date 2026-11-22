# Nguồn ảnh chụp thật (bộ 2.5D trong img/real/)

Tất cả ảnh lấy từ Pexels, giấy phép Pexels (dùng thương mại được, không bắt buộc ghi công). Ảnh gốc: `https://www.pexels.com/photo/<id>/`.
Tên sản phẩm trong Phòng mẫu là tên giả lập; ảnh không có logo hay tên hãng thật (góc có chữ hãng đã bị loại khỏi bộ).

| Bộ | Mã ảnh Pexels |
|---|---|
| perfume-pink | 16266287, 16266288, 16266289, 16266291, 16266292 |
| headphone-white | 3394666, 3394665, 3394655, 3394648 |
| headphone-black | 7772547, 7772548 |
| bottle-frost | 34089129, 34089127 |
| vase-white | 14608172, 14608169 |
| vase-blue | 8801077, 8801088, 8801080 |

Dựng lại: tải ảnh gốc về một thư mục (`<id>.jpg`), tải hai mô hình ONNX (`isnet-general-use.onnx` của rembg, `depth_anything_v2_vits.onnx` của Depth-Anything-ONNX) rồi chạy
`python3 tools/real25d/build.py <thư mục ảnh> <thư mục mô hình>` và `python3 tools/real25d/samples.py`.

## Bổ sung: 8 bộ thay cho ảnh dựng 3D (ảnh gốc ≥ 3000px, xuất tới 3840px)

Giấy phép Pexels (https://www.pexels.com/license/). Tác giả ghi theo tên trên trang Pexels; ảnh gốc: `https://www.pexels.com/photo/<id>/`.
Tên thương hiệu trong Phòng mẫu (Khuê Lam, Tịnh Vân…) là concept; chữ / logo hãng thật trên ảnh đã được xóa (cột "Đã xử lý").

| Bộ | Mẫu | Mã ảnh Pexels | Tác giả | Đã xử lý |
|---|---|---|---|---|
| perfume-amber | Khuê Lam | 12146870, 12146871 | Rendy Ramdani | không có chữ hãng |
| bag-noir | Tịnh Vân | 22434770, 22434774, 22434769, 22434764, 22434768 | Dhanno | không có chữ hãng |
| shoe-tan | Vũ Hạc | 36589770, 36589768, 36589769, 36589772, 36589774 | Valentin Ivantsov | không có chữ hãng |
| watch-leather | Thiên Trục | 31050001, 31050002, 31049998 | Vahide Spanca | xóa logo trên mặt số, làm mờ chữ trên gáy sách |
| ring-rose | Ánh Triêu | 29107751, 29107752, 29107750 | The Glorious Studio | không có chữ hãng |
| decanter | Vân Sơn | 7253970, 7253972 (+ cận cảnh 7253702, 7253969, 7253821) | Eva Bronzini | bình không nhãn |
| candle-green | Tĩnh Dạ | 6311847, 6311806, 6311973, 6311830 | Ekaterina Bolovtsova | nhãn để trống |
| skin-white | Bạch Liên Privé | 8015780, 8015764, 8015765, 8015774, 8015790 | Cup of Couple | bao bì để trống |
