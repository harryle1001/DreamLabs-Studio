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
