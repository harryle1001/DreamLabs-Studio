# Video 3D Dream Labs (Blender)

Hai video được **dựng hoàn toàn bằng code** (không cần mở file .blend, không cần tải thêm gì ngoài Blender):

| Video | File kịch bản | Thời lượng | Nội dung |
|---|---|---|---|
| 1. Logo 3D | `logo.py` | 11 giây | Hạt sáng vàng xoáy trôn ốc hội tụ → logo đĩa ngọc trai tím oải hương → hồng đào với trăng khuyết vàng champagne hình thành, xoay chậm, vệt sáng lướt qua, chữ "Dream *Labs*" hiện dần, kết bằng logo tĩnh trên nền sao. |
| 2. Hai ngôi sao va chạm | `collision.py` | 16 giây | Sao vàng champagne và sao xanh sapphire bay vào theo xoắn ốc → chạm nhau, quay quanh nhau thành vòng xoáy → nổ (chớp sáng, quả cầu lửa, 2 vành sóng xung kích, hàng nghìn mảnh sao) → mảnh sao bị hút về thành thiên hà xoắn ốc vàng hai nhánh, xoay chậm. |

Mỗi video có bản ngang **16:9** (3840×2160) và bản dọc **9:16** (2160×3840), 30 khung/giây, có nhạc nền tự tổng hợp (AAC).

Bản xem thử (960×540) đã có sẵn trong `previews/`.

---

## 1. Chuẩn bị (làm 1 lần)

1. **Cài Blender** bản **5.0 trở lên** (đã thử với 5.3; bản 4.2 – 4.5 có chế độ tương thích nhưng chưa được thử, nên ưu tiên 5.x): tải ở <https://www.blender.org/download/>, cài như phần mềm bình thường.
2. **Cập nhật driver card NVIDIA** (GeForce Experience hoặc <https://www.nvidia.com/drivers>). Driver mới giúp dùng được OptiX — nhanh nhất.
3. *(Không bắt buộc)* **Cài ffmpeg** để có thêm bản H.265 nhẹ hơn: mở Command Prompt, gõ
   `winget install Gyan.FFmpeg` rồi Enter. Không cài cũng được — Blender tự ghép ra file `.mp4` (H.264 + nhạc AAC).

## 2. Cách chạy dễ nhất

Vào thư mục `tools\blender` trong thư mục dự án, **bấm đúp vào `render_4k.bat`**.
Một cửa sổ đen hiện ra và chạy lần lượt 2 video (bản ngang 16:9). Cứ để máy chạy; xong sẽ tự mở thư mục kết quả.

- Muốn bản dọc 9:16: mở Command Prompt tại thư mục này (xem mục 3) rồi gõ `render_4k.bat doc`
- Muốn cả 4 bản (ngang + dọc): `render_4k.bat tat-ca`

## 3. Chạy từng video bằng lệnh

1. Mở thư mục `tools\blender` trong File Explorer → bấm vào thanh địa chỉ phía trên, gõ `cmd` rồi Enter → Command Prompt mở sẵn đúng thư mục.
2. Gõ một trong các lệnh dưới đây rồi Enter.
   *(Nếu báo "blender is not recognized", thay `blender` bằng đường dẫn đầy đủ trong ngoặc kép, ví dụ
   `"C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"`)*

| Bản | Lệnh |
|---|---|
| Logo 16:9 (4K) | `blender -b -P logo.py -- --4k` |
| Logo 9:16 (4K dọc) | `blender -b -P logo.py -- --4k --vertical` |
| Va chạm 16:9 (4K) | `blender -b -P collision.py -- --4k` |
| Va chạm 9:16 (4K dọc) | `blender -b -P collision.py -- --4k --vertical` |
| Xem thử nhanh (960×540) | thay `--4k` bằng `--preview` |

Máy tự chọn GPU theo thứ tự **OptiX → CUDA → CPU**, khử nhiễu bằng OptiX (hoặc OpenImageDenoise). Dòng đầu tiên in ra cho biết đang dùng thiết bị nào — nếu thấy `thiết bị: CPU` trên máy có card NVIDIA thì hãy cập nhật driver.

**Bị tắt máy / mất điện giữa chừng?** Chạy lại đúng lệnh cũ: các khung đã render xong được giữ nguyên, máy render tiếp từ chỗ dừng.

## 4. Thời gian ước tính (4K, 30 khung/giây)

| Video | Số khung | RTX 3060 / 4060 | RTX 4070 / 3080 | RTX 4080 / 4090 |
|---|---|---|---|---|
| Logo 16:9 | 330 | ~50–80 giây/khung → **5–7 giờ** | ~30–50 giây/khung → 3–4,5 giờ | ~15–25 giây/khung → 1,5–2,5 giờ |
| Va chạm 16:9 | 480 | ~25–45 giây/khung → **3,5–6 giờ** | ~15–30 giây/khung → 2–4 giờ | ~8–15 giây/khung → 1–2 giờ |
| Bản 9:16 | như trên | xấp xỉ bản 16:9 | | |

Đây là ước tính (máy cloud không có GPU để đo trực tiếp); con số thật in ra sau mỗi khung kèm số phút còn lại. Mỗi khung đều dưới 2 phút trên card tầm trung.
Muốn nhanh hơn ~2 lần (chất lượng vẫn tốt nhờ khử nhiễu), thêm `--samples 128` vào cuối lệnh, ví dụ `blender -b -P logo.py -- --4k --samples 128`.

## 5. Lấy file kết quả

Tất cả nằm trong `tools\blender\out\`:

| File | Là gì |
|---|---|
| `logo_4k_16x9.mp4`, `collision_4k_16x9.mp4` … | **Video hoàn chỉnh có nhạc** (H.264, dùng được mọi nơi) |
| `…_h265.mp4` | Bản H.265 nhẹ hơn (chỉ có khi đã cài ffmpeg) |
| `logo_4k_16x9\frames\*.png` | Từng khung hình PNG 16-bit (để dựng lại trong Premiere/DaVinci nếu cần) |
| `logo_4k_16x9\audio.wav` | Nhạc nền riêng (WAV 48 kHz) |

Thư mục `out\` khá nặng (vài GB) và không được đưa lên git.

## 6. Nhạc nền

Nhạc được **tự tổng hợp bằng code** (không dùng nhạc có bản quyền) và ghép tự động khi render xong:
- Logo: bản "sang trọng" của `tools/music/gen.py` + tiếng vút khi hạt hội tụ, nhịp trầm và tiếng bát hát khi logo xuất hiện, tiếng chuông lấp lánh khi chữ hiện.
- Va chạm: bản "huyền ảo" + tiếng vút khi hai sao bay vào, tiếng vù vù tăng tốc khi xoáy, **tiếng nổ trầm** lúc 6,4 giây, tiếng mảnh sao bay vút, âm dâng khi thiên hà hình thành.

Muốn **thay nhạc khác** (file của bạn, ví dụ `nhac.mp3`), cần ffmpeg, gõ:

```
ffmpeg -i out\logo_4k_16x9.mp4 -i nhac.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest logo_nhac_moi.mp4
```

Chỉ tạo lại nhạc (không render hình): `python audio.py logo nhac_logo.wav 11` hoặc `python audio.py collision nhac_vacham.wav 16`.

## 7. Tùy chọn thêm

| Thêm vào cuối lệnh | Tác dụng |
|---|---|
| `--frames 1-60` | chỉ render khung 1 đến 60 |
| `--stills 1,120,300` | chỉ render vài khung lẻ để xem nhanh hình |
| `--samples 128` | đổi số sample (ít = nhanh hơn, nhiễu hơn) |
| `--cpu` | ép chạy bằng CPU |
| `--no-encode` | chỉ xuất khung PNG, không ghép video |
| `--out D:\render` | đổi thư mục xuất (ổ đĩa còn trống nhiều) |

Chạy bằng Python có module bpy (không cần mở Blender): `pip install bpy` rồi `python logo.py -- --preview`.

## Ghi chú kỹ thuật

- `common.py`: tham số dòng lệnh, chọn GPU, Cycles, compositor (bloom + vignette), hệ hạt tự dựng bằng numpy (mỗi hạt là một vệt sáng kéo dài theo vận tốc), vòng render từng khung có thể chạy tiếp, ghép video bằng ffmpeg hoặc bằng chính Blender.
- Mọi chuyển động tính theo **giây**, nên bản 24 fps (xem thử) và 30 fps (4K) giống hệt nhau.
- Logo đúng theo `src/partials/00-chrome.html` (symbol `dl-logo`): đĩa gradient `dl-lg` (#BCA8E6 → #F2C0A8 → #AACBE0), trăng khuyết = tròn r 7.4164 tâm đĩa trừ tròn r 4.5836 tâm (20.05, 10.71). Font Playfair Display (thường + nghiêng) chuyển từ `fonts/*.woff2` sang `fonts/*.ttf` ở đây.
- Video 2 bám nhịp cảnh mở đầu trang chủ (`js/core.js`, phần `safe('hero'`): quỹ đạo xoắn ốc log nghiêng 1 rad, pha bay vào chậm rồi nhanh dần, pha xoáy tốc độ góc tăng ×6,5, nổ, rồi hút về thiên hà xoắn ốc.
