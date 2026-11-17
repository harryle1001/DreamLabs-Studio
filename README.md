# Dream Labs

Website của Dream Labs: thiết kế website, landing page, edit video, thiết kế sản phẩm, motion graphic và tự động hóa doanh nghiệp bằng AI.

Trang tĩnh thuần HTML/CSS/JS, không cần máy chủ hay bước cài đặt. Mọi thư viện, phông chữ, ảnh và video nằm sẵn trong repo.

## Đưa lên mạng

**GitHub Pages (đang dùng):** repo phải ở chế độ công khai. Settings → Pages → Deploy from a branch → `main` / `/ (root)`. File `CNAME` giữ tên miền `dreamlabs.vn`, file `.nojekyll` để GitHub phục vụ nguyên các file tĩnh. DNS ở Mắt Bão: 4 bản ghi A `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; CNAME `www` → `harryle1001.github.io`.

**Cloudflare Pages / Vercel / Netlify:** nối repo này, để trống lệnh build, thư mục xuất bản là thư mục gốc (`/`). Trang chủ là `index.html`.

**Hosting thường:** tải toàn bộ thư mục lên `public_html`.

## Sửa nội dung

| Muốn sửa | File |
|---|---|
| Giá, tên gói, tính năng từng gói | `js/data.js` |
| Số điện thoại, Zalo, email | `src/partials/00-chrome.html`, `90-contact.html`, `95-footer.html` |
| Mẫu trong Phòng mẫu | `js/samples-<hạng mục>.js` |
| Nội dung từng phần của trang | `src/partials/*.html` |
| Màu, cỡ chữ, khoảng cách | `css/tokens.css` |

Sau khi sửa file trong `src/`, ghép lại trang:

```bash
node build.js
```

Xem thử trên máy:

```bash
node serve.js 4100
```

rồi mở http://127.0.0.1:4100

## Cấu trúc

- `index.html`: trang chủ đã ghép (do `build.js` tạo, không sửa tay)
- `src/partials/`: từng phần của trang chủ
- `css/`, `js/`: giao diện và tương tác
- `demos/`: các website và landing page mẫu chạy thật
- `img/`, `media/`, `fonts/`, `vendor/`: ảnh, video, phông, thư viện
- `tools/`: công cụ kiểm tra và nguồn dựng phim

## Lưu ý

- Thương hiệu trong Phòng mẫu và các demo là concept do Dream Labs tự thiết kế, chưa tra cứu nhãn hiệu.
- Form liên hệ chưa gửi tự động: sau khi bấm gửi, trang soạn sẵn nội dung để khách dán vào Zalo.
- Giá trong `js/data.js` là giá mẫu.
