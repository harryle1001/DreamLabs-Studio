# Video 3D Dream Labs (Blender)

Hai video được **dựng hoàn toàn bằng code** (không cần mở file .blend, không cần tải thêm gì ngoài Blender).

Thư mục này có **hai bản dựng độc lập** của cùng 2 video — chọn bản nào thích hơn sau khi xem thử:

| | Bản A | Bản B |
|---|---|---|
| Kịch bản | `logo.py`, `collision.py` (+ `common.py`, `audio.py`) | `dl_logo.py`, `dl_stars.py` (+ `dl_common.py`, `dl_audio.py`) |
| Bấm đúp để render 4K | `render_4k.bat` | `render_4k_logo.bat`, `render_4k_stars.bat` (tự làm cả 16:9 và 9:16) |
| Độ dài | logo 11 s · va chạm 16 s | logo 12 s · sao 16 s |
| Xem thử | `previews/logo_preview_16x9.mp4` (+ lưới) | `previews/dl_*_preview.mp4` + ảnh lưới `previews/dl_*_grid.jpg` |
| Hướng dẫn | mục 1–7 bên dưới | mục **8** bên dưới |

Font chung: `fonts/PlayfairDisplay-*.ttf`. Mục 1 (chuẩn bị) dùng cho cả hai bản.

### Bản A

| Video | File kịch bản | Thời lượng | Nội dung |
|---|---|---|---|
| 1. Logo 3D | `logo.py` | 11 giây | Hạt sáng vàng xoáy trôn ốc hội tụ → logo đĩa ngọc trai tím oải hương → hồng đào với trăng khuyết vàng champagne hình thành, xoay chậm, vệt sáng lướt qua, chữ "Dream *Labs*" hiện dần, kết bằng logo tĩnh trên nền sao. |
| 2. Hai ngôi sao va chạm | `collision.py` | 16 giây | Sao vàng champagne và sao xanh sapphire bay vào theo xoắn ốc → chạm nhau, quay quanh nhau thành vòng xoáy → nổ (chớp sáng, quả cầu lửa, 2 vành sóng xung kích, hàng nghìn mảnh sao) → mảnh sao bị hút về thành thiên hà xoắn ốc logarit hai nhánh, xoay chậm. |

Mỗi video có bản ngang **16:9** (3840×2160) và bản dọc **9:16** (2160×3840), 30 khung/giây, có nhạc nền tự tổng hợp (AAC).

Bản xem thử (960×540) của bản A: `previews/logo_preview_16x9.mp4`; tự tạo thêm bằng `--preview` (mục 3).

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

## Ghi chú kỹ thuật (bản A)

- `common.py`: tham số dòng lệnh, chọn GPU, Cycles, compositor (bloom + vignette), hệ hạt tự dựng bằng numpy (mỗi hạt là một vệt sáng kéo dài theo vận tốc), vòng render từng khung có thể chạy tiếp, ghép video bằng ffmpeg hoặc bằng chính Blender.
- Mọi chuyển động tính theo **giây**, nên bản 24 fps (xem thử) và 30 fps (4K) giống hệt nhau.
- Logo đúng theo `src/partials/00-chrome.html` (symbol `dl-logo`): đĩa gradient `dl-lg` (#BCA8E6 → #F2C0A8 → #AACBE0), trăng khuyết = tròn r 7.4164 tâm đĩa trừ tròn r 4.5836 tâm (20.05, 10.71). Font Playfair Display (thường + nghiêng) chuyển từ `fonts/*.woff2` sang `fonts/*.ttf` ở đây.
- Video 2 bám nhịp cảnh mở đầu trang chủ (`js/core.js`, phần `safe('hero'`): quỹ đạo xoắn ốc log nghiêng 1 rad, pha bay vào chậm rồi nhanh dần, pha xoáy tốc độ góc tăng ×6,5, nổ, rồi hút về thiên hà xoắn ốc.

---

## 8. Bản B — `dl_logo.py` (12 s) và `dl_stars.py` (16 s)

Cùng cốt truyện, dựng riêng; đã render thử và đo thời gian thật trên máy Windows có **RTX 4060 Ti 8 GB**, chạy được trên Blender **4.5 LTS** và **5.x** (đã thử module `bpy` 5.3).

- **Video 1 · Logo:** hạt vàng xoáy theo xoắn ốc vào tâm (0–3,2 s) → logo hình thành có chớp sáng và vành tia → xoay chậm lộ độ dày, ánh sáng lướt → chữ "Dream *Labs*" hiện dần (7,4–9,6 s) → logo tĩnh trên nền #15121C, bụi sao, quầng dịu.
- **Video 2 · Sao:** bay vào xoắn ốc (0–6,2 s) → chạm, xoáy tăng tốc, vật chất kéo thành 2 cánh → nổ lúc 8,6 s (chớp, quả cầu lửa, 2 vành sóng, hàng nghìn mảnh có vệt) → hút về thiên hà vàng 2 nhánh (9–13 s) → xoay chậm, nhánh tràn khung.

### Chạy

Cách dễ nhất: **bấm đúp** `render_4k_logo.bat` hoặc `render_4k_stars.bat` (tự tìm Blender trong `C:\Program Files\Blender Foundation`, làm cả 16:9 và 9:16, chạy tiếp được nếu bị ngắt).

Bằng lệnh (Command Prompt, đứng ở thư mục dự án):

```
"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" -b -P tools\blender\dl_logo.py -- --4k
"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" -b -P tools\blender\dl_stars.py -- --4k
```

| Tùy chọn (sau `--`) | Ý nghĩa |
|---|---|
| `--4k` / `--preview` | 3840×2160 30 fps / 960×540 24 fps |
| `--aspect 16x9` / `--aspect 9x16` / `--aspect both` | khổ hình (4K mặc định cả hai) |
| `--stills 3.2,8.6,15` | chỉ render ảnh tại các giây đó |
| `--frames 1-120`, `--samples 512`, `--device CUDA`, `--exr`, `--overwrite`, `--no-encode`, `--out D:\render` | như tên |

### Thời gian (đo thật, RTX 4060 Ti 8 GB, OptiX)

| | 1 khung 4K | mỗi khổ | cả 16:9 + 9:16 |
|---|---|---|---|
| Logo (360 khung, 384 sample) | ~16 giây | ~1 giờ 40 phút | **~3,5 giờ** |
| Sao (480 khung, 160 sample) | ~14 giây | ~1 giờ 55 phút | **~4 giờ** |

RTX 4070/3080 trở lên nhanh hơn ~1,5–2 lần. Bản `--preview`: ~3 phút mỗi khổ. Cần ~15 GB trống cho ảnh 4K. Nên tắt app khác đang dùng card (ComfyUI, game) — thiếu VRAM sẽ báo `Out of memory`; chạy lại là tiếp tục. Khung bị đen được tự phát hiện và render lại.

### Kết quả

Trong `tools\blender\out\dl_logo\` (tương tự `dl_stars\`):

| File | Là gì |
|---|---|
| `dl_logo_16x9_4k_h264.mp4`, `dl_logo_9x16_4k_h264.mp4` | **Video hoàn chỉnh có nhạc** (H.264, AAC −16 LUFS) |
| `…_h265.mp4` | H.265 10-bit, nhẹ hơn |
| `…_4k.wav` | nhạc riêng |
| `…_grid.jpg` | lưới 20 khung để duyệt |
| `4k_16x9\frames\0001.png …` | từng khung (xóa được sau khi có mp4) |

Bản B cần **ffmpeg** để ghép mp4 (`winget install Gyan.FFmpeg`); thiếu ffmpeg thì vẫn ra ảnh từng khung, cài xong chạy lại lệnh là chỉ ghép.

### Nhạc

Logo: bản "sang-trong" của `tools/music/gen.py` + tiếng vút, lấp lánh, nổ trầm nhẹ và chuông khi logo hình thành / chữ hiện. Sao: bản "huyen" + nền trầm dâng, tiếng vút khi xoáy, **nổ trầm lúc 8,6 s**, lấp lánh khi thiên hà thành hình. Đổi bản nền: sửa `A.bed('sang-trong'` / `A.bed('huyen'` thành `am`, `huyen`, `sang`, `sang-trong` hoặc `tho`, xóa file `.wav` cũ trong `out\` rồi chạy lại (khung đã render giữ nguyên). Thay bằng nhạc riêng: dùng lệnh ffmpeg ở mục 6.

### Ghi chú kỹ thuật (bản B)

- `dl_common.py`: tham số, chọn GPU (OptiX → CUDA → HIP → Metal → CPU), Cycles + khử nhiễu, bloom compositor cho Blender 4.x và 5.x, render từng khung có chạy tiếp và tự render lại khung đen, ffmpeg H.264/H.265, ảnh lưới.
- `dl_audio.py`: nhạc nền từ `tools/music/gen.py` + hiệu ứng tổng hợp bằng numpy.
- Mọi chuyển động tính theo giây trong `update(t)`; hạt là cầu nhỏ đặt bằng Geometry Nodes, vệt sáng = nhiều mẫu lùi thời gian.
