# Dream Labs

Website của Dream Labs: thiết kế website, landing page, edit video, thiết kế sản phẩm, motion graphic và tự động hóa doanh nghiệp bằng AI.

Trang tĩnh thuần HTML/CSS/JS, không cần máy chủ hay bước cài đặt. Mọi thư viện, phông chữ, ảnh và video nằm sẵn trong repo.

## Đưa lên mạng

Repo này (riêng tư) chứa mã nguồn. Mỗi lần đẩy code lên `main`, GitHub Actions (`.github/workflows/deploy.yml`) tự đóng gói bản nén bằng `npm run dist` rồi đẩy sang repo công khai `dreamlabs-web`, nơi GitHub Pages phục vụ https://dreamlabs.vn sau khoảng 1–2 phút.

Cần cài một lần:
1. Repo công khai `dreamlabs-web` (trống). Đổi tên khác thì khai báo biến `SITE_REPO` trong Settings → Secrets and variables → Actions → Variables.
2. Secret `DEPLOY_TOKEN` trong repo này: fine-grained token chỉ cho repo `dreamlabs-web`, quyền Contents: Read and write.
3. Trong `dreamlabs-web`: Settings → Pages → Deploy from a branch → `main` / `/ (root)`, Custom domain `dreamlabs.vn`.

Đóng gói thử trên máy: `npm install` rồi `npm run dist`, kết quả nằm ở thư mục `dist/`.

## Sửa nội dung

| Muốn sửa | File |
|---|---|
| Giá, tên gói, tính năng từng gói | `js/data.js` |
| Số điện thoại, Zalo, email | `src/partials/00-chrome.html`, `90-contact.html`, `95-footer.html` |
| Mẫu trong Phòng mẫu và showroom trang chủ | `js/samples-<hạng mục>.js` (giá trên thẻ lấy từ trường `pkg` + `js/data.js`; showroom: `js/showroom.js`, `css/showroom.css`) |
| Trang Lab (5 demo) | `src/lab/lab.html` (build.js dựng `lab/index.html`) |
| Công cụ tự tính giá, hỏi đáp | `src/pages/bang-gia.html` (mã `{{tinh-gia}}`) |
| Nội dung từng phần của trang | `src/partials/*.html` |
| Trang dịch vụ (`/thiet-ke-website/`, `/bang-gia/`…) | `src/pages/<slug>.html` (giá tự lấy từ `js/data.js`, dựng bằng `tools/pages.js`) |
| Bài viết | `src/blog/<slug>.html` (dựng bằng `tools/blog.js`) |
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
- `src/partials/`: từng phần của trang chủ (header, hero, showroom mẫu & giá, showreel, ô xem thêm, liên hệ, chân trang; file `.off` là phần đã tắt)
- `giai-phap-theo-nganh/`: danh mục 60 trang ngành (tools/pages.js tự dựng)
- `src/pages/`, `src/blog/`: nguồn trang dịch vụ và bài viết; khung trang dùng chung ở `tools/site.js`
- `css/`, `js/`: giao diện và tương tác
- `demos/`: các website và landing page mẫu chạy thật
- `img/`, `media/`, `fonts/`, `vendor/`: ảnh, video, phông, thư viện
- `tools/`: công cụ kiểm tra và nguồn dựng phim

## Lưu ý

- Thương hiệu trong Phòng mẫu và các demo là concept do Dream Labs tự thiết kế, chưa tra cứu nhãn hiệu.
- Form liên hệ chưa gửi tự động: sau khi bấm gửi, trang soạn sẵn nội dung để khách dán vào Zalo.
- Giá trong `js/data.js` là giá mẫu.
