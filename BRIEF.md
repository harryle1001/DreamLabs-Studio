# DreamLab — bản lệnh nâng cấp v2 (3 session chạy song song)

Mục tiêu: nâng website DreamLab lên chuẩn studio quốc tế hạng đầu (cấp Awwwards Site of the Day). Motion graphic có mặt ở mọi phần, tỷ lệ vàng φ ở mọi con số, có hình ảnh, sản phẩm và demo thật để khách tham khảo. Chạy mượt trên điện thoại.

## 1. Thương hiệu
- DreamLab: studio nhận thiết kế **Website, Landing Page, Edit Video, Thiết kế sản phẩm (bao bì/nhận diện/3D), Video Motion Graphic, Tự động hóa doanh nghiệp bằng AI**. Id dịch vụ cố định: `web, landing, video, product, motion, ai`.
- Phong cách: **dreamy + linen**. Mơ màng, mềm, sang, nhiều khoảng thở. Pastel lavender / peach / xanh sương trên nền vải linen; serif Fraunces (tiêu đề, hay dùng italic cho chữ nhấn `<em>`) + Be Vietnam Pro (nội dung). Glass nhẹ, bo góc mềm, bóng khuếch tán. Chế độ tối là "giấc mơ ban đêm".
- Ngôn ngữ: tiếng Việt, câu ngắn, rõ, nói theo góc nhìn khách hàng. Không dùng chữ "cách mạng", "đột phá", không emoji làm icon.
- Khách xem site: chủ doanh nghiệp Việt Nam muốn thuê làm web/video/AI. Trang phải khiến họ tin tay nghề ngay từ 5 giây đầu.

## 2. Tỷ lệ vàng φ = 1.61803 (BẮT BUỘC, mọi ngóc ngách)
Chỉ dùng token trong `css/tokens.css`. Không tự đặt số lẻ.
- Cỡ chữ: 10 · 13 · 16 · 20 · 26 · 33 · 42 · 53 · 68 · 110 · 178 (`--t0 … --t6`, bậc nửa `--t0h …`). Line-height 1.618 cho đoạn văn.
- Khoảng cách: 4 · 6 · 10 · 16 · 26 · 42 · 68 · 110 · 178 (`--s0 … --s8`). Bo góc 6 · 10 · 16 · 26 · 42 · 68.
- Bố cục: cột 61.8 / 38.2 (`.golden`, `--cols-golden`), khung hình 1.618:1 hoặc 1:1.618, lưới theo dãy Fibonacci (1,1,2,3,5,8,13), điểm nhấn đặt ở 61.8% chiều ngang/dọc.
- Motion: thời lượng 100 · 162 · 262 · 424 · 686 · 1110 · 1796 ms; stagger 0.062 / 0.1 / 0.162 s; scale/dịch chuyển theo bậc φ (0.618, 0.382, 1.618); góc xoay 137.5° (góc vàng) cho bố trí hạt/lá.
- Màu: nền 61.8%, phụ 38.2%; độ mờ 0.618 / 0.382.
- Họa tiết thương hiệu: đường xoắn ốc vàng, lưới hình chữ nhật vàng, phyllotaxis (hoa hướng dương, góc 137.5°). Dùng làm motion graphic nền, loader, chuyển cảnh, icon.
- Trong JS dùng `DL.PHI`.

## 3. Nền đã có sẵn (đọc trước khi viết)
```
/home/user/dreamlab
  BRIEF.md            bản này
  build.js            ghép trang. Session test bằng: node build.js <A|B|C>  -> _A.html / _B.html / _C.html
  serve.js            node serve.js <port>   (A: 4101, B: 4102, C: 4103)
  tools/check.js      node tools/check.js http://127.0.0.1:<port>/_X.html <thư mục scratch>/<tên>  -> chụp desktop+mobile+dark, báo lỗi console, tràn ngang
  src/head.html       <title>, meta
  src/partials/NN-ten.html   mỗi phần 1 file, ghép theo thứ tự số
  src/legacy-v1.html  bản v1 một file (tham khảo markup, CSS, hiệu ứng cũ)
  css/fonts.css tokens.css base.css   (đã nạp sẵn) + css/core.css (A) work.css (B) lab.css (C)
  js/data.js          window.DL_DATA = {ICONS, CATS, STEPS}: giá và dịch vụ chuẩn
  js/kit.js           window.DL: API chung + motion khai báo (xem chú thích đầu file)
  js/core.js (A)  js/work.js (B)  js/lab.js (C)
  vendor/             gsap 3.15 + ScrollTrigger, SplitText (nạp sẵn); Flip, DrawSVG, MorphSVG, MotionPath, CustomEase, Draggable, Inertia, Observer, ScrambleText (nạp bằng DL.load('vendor/X.min.js')); lenis (nạp sẵn); three.module.js + three.core.js (import động)
  fonts/ img/ media/
```
Thứ tự nạp: css fonts → tokens → base → core → work → lab; js gsap → ScrollTrigger → SplitText → lenis → data → kit → core → work → lab.

**API `DL` (kit.js):** `DL.PHI, DL.RM (reduced motion), DL.fine, DL.gsap, DL.lenis, DL.vnd(n), DL.ready(fn), DL.load(src), DL.scrollTo(el|selector,{offset,immediate}), DL.modal.open({title,node|html,narrow,onClose}) → trả về phần thân modal, DL.modal.close(), DL.scan(root) (gọi sau khi chèn HTML động), DL.refresh()`.

**Motion khai báo trong HTML:** `data-reveal[=up|left|right|scale|clip]` `data-delay` · `data-stagger` · `data-split` (tiêu đề hiện theo dòng) · `data-parallax="0.1"` · `data-magnetic` · `data-tilt` (đặt `--mx/--my` theo chuột) · `data-count="18000000" data-format="vnd|int"` · `data-cursor="Xem"` (nhãn con trỏ).

**Liên kết giữa các phần:**
- Thứ tự và id: `00-chrome` (A) · `10-hero #top` (A) · `20-marquee` (A) · `30-services #dich-vu` (A) · `40-reel #showreel` (C) · `45-work #du-an` (B) · `50-lab #lab` (C) · `60-process #quy-trinh` (A) · `70-pricing #bao-gia` (A) · `80-faq #faq` (A) · `90-contact #lien-he` (A) · `95-footer` (A).
- Bảng giá từng dịch vụ có id `#p-web, #p-landing, #p-video, #p-product, #p-motion, #p-ai`. Nút kêu gọi ở B và C dùng `<a class="btn primary" href="#lien-he" data-pick="Website — Chuyên nghiệp">`; A lo việc điền sẵn form theo `data-pick`.
- Mỗi partial là một `<section id="…">` trọn vẹn, tự có `.wrap` bên trong, đầu phần dùng mẫu `.sec-head` (eyebrow + h2 có `<em>` + `.lead`).
- Tiền tố class: A tự do; B dùng `wk-`; C dùng `lab-` và `reel-`. JS bọc trong IIFE, bắt đầu bằng `DL.ready(()=>{…})`.
- Ảnh B phải xuất đúng tên để A dùng: `img/svc-web.webp, svc-landing.webp, svc-video.webp, svc-product.webp, svc-motion.webp, svc-ai.webp` (1280×791, ≤ 110KB mỗi ảnh) và `img/og.webp` (1200×742). A đặt nền gradient phía sau `<img>` phòng khi ảnh chưa có.

## 4. Giới hạn kỹ thuật (trang sẽ xuất bản thành Claude Artifact, sau đó mới lên hosting)
- Chỉ đường dẫn **tương đối** tới file trong thư mục này (`img/x.webp`, không có `/` đầu). Không tải gì từ host ngoài: không CDN, không Google Fonts, không fetch API ngoài, không iframe trang ngoài, không ảnh ngoài.
- Không `alert/confirm/prompt`, không `window.open`, không `window.print`, không tải file bằng `<a download>`. Form: `preventDefault`, không gửi đi đâu, báo rõ là demo. `mailto:`/`tel:` không đáng tin: hiện email/số dạng chữ chọn được.
- Âm thanh chỉ phát sau thao tác người dùng. Video nền: `muted playsinline loop`, có `poster`.
- Hash chỉ dạng `#ten-don-gian`. Không dùng `pushState`, không query string.
- Không viết `<!doctype>`, `<html>`, `<head>`, `<body>` trong partial.
- Màu chỉ lấy từ token; phải đẹp ở cả light và dark (check.js chụp cả hai). Không hard-code màu chỉ hợp một nền.
- Điện thoại 390px: không tràn ngang, gutter ≥ 16px, vùng chạm ≥ 42px, hiệu ứng nặng tự hạ cấp. `prefers-reduced-motion`: dừng mọi vòng lặp, hiện trạng thái tĩnh đẹp.
- Hiệu năng: canvas/WebGL chỉ chạy khi trong khung nhìn (IntersectionObserver), DPR ≤ 1.5, không layout thrash, animation chỉ dùng transform/opacity/clip-path. Ảnh `.webp`, `loading="lazy"`, có `width`/`height`. Tổng dung lượng phần của mỗi session ≤ 4MB (riêng video ≤ 5MB).
- Nội dung phía trên màn hình đầu phải đọc được ngay khi tải (không để `opacity:0` chờ JS).
- Trung thực: thương hiệu trong demo là **concept do DreamLab tự nghĩ**, gắn nhãn `Concept` (`.tag-concept`), tên không trùng công ty thật. Không bịa lời khen khách hàng, logo khách hàng, số liệu thành tích. Liên hệ giữ giá trị mẫu `hello@dreamlab.vn`, `0900 000 000`.

## 5. Phân công

### Session A — "Core": bộ khung, hero, dịch vụ, quy trình, báo giá, liên hệ
File: `src/partials/00-chrome.html, 10-hero.html, 20-marquee.html, 30-services.html, 60-process.html, 70-pricing.html, 80-faq.html, 90-contact.html, 95-footer.html`, `css/core.css`, `js/core.js`; được sửa `js/kit.js`, `css/base.css`, `js/data.js`, `src/head.html` (chỉ thêm, không phá API).
1. **Chrome:** preloader xoắn ốc vàng vẽ dần (≤ 1.1s, không che nội dung quá lâu, bỏ qua khi reduced motion); header kính dính trên đầu, có thanh tiến trình cuộn, menu điện thoại toàn màn hình mở theo clip-path; con trỏ tùy biến có nhãn `data-cursor`; màn chuyển cảnh gradient khi nhảy mục xa; nút đổi sáng/tối (đặt `data-theme` trên `<html>`, nhớ bằng localStorage có try/catch); nút nổi Zalo/Liên hệ.
2. **Hero:** cảnh WebGL mơ màng làm dấu ấn của trang: mây aurora shader + lớp hạt phyllotaxis (góc 137.5°) xoay chậm tạo thành xoắn ốc vàng, phản ứng theo chuột và cuộn; tiêu đề SplitText theo chữ; bố cục 61.8/38.2. Trên điện thoại hạ cấp nhưng vẫn đẹp. Có fallback CSS khi không có WebGL.
3. **Marquee** hai hàng ngược chiều, tốc độ đổi theo vận tốc cuộn.
4. **Dịch vụ:** 6 thẻ xếp theo lưới vàng xen kẽ, dùng ảnh `img/svc-*.webp`, mỗi thẻ có motion riêng khi hover (icon SVG tự vẽ bằng DrawSVG hoặc stroke-dash), giá "từ …", bấm nhảy tới bảng giá tương ứng.
5. **Quy trình 5 bước:** ghim + cuộn ngang trên desktop, có đường SVG nối các bước tự vẽ theo cuộn; điện thoại vuốt ngang có snap.
6. **Báo giá:** chuyển từ v1 và nâng cấp: thanh tab dính + scrollspy, 3 gói mỗi hạng mục, đếm số, tilt 3D, bảng so sánh chi tiết thu gọn/mở rộng, công cụ tự tính giá (giảm 10% từ 3 hạng mục), điện thoại vuốt ngang. Dữ liệu lấy từ `DL_DATA`.
7. **FAQ, liên hệ (form điền sẵn theo `data-pick`), footer** chữ khổng lồ parallax + xoắn ốc vàng.
8. Rà toàn trang: mọi số đo khớp thang φ.

### Session B — "Showroom": hình ảnh, sản phẩm, dự án concept, demo website thật
File: `src/partials/45-work.html`, `css/work.css`, `js/work.js`, `img/*`, `demos/*`.
Không có công cụ AI sinh ảnh dùng được, nên **mọi hình ảnh phải tự dựng bằng code rồi chụp/render bằng Playwright** (Chromium có sẵn, `require('playwright')`), nén bằng `sharp` (cài sẵn tại `/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/npm/node_modules`). Đó cũng là bằng chứng tay nghề thật.
1. **4 demo website thật** cho 4 thương hiệu concept thuộc 4 ngành khác nhau (ví dụ: spa/làm đẹp, cà phê rang xay, mỹ phẩm thiên nhiên, bất động sản nghỉ dưỡng, nhà hàng, phòng tập). Mỗi demo là một file độc lập `demos/<slug>.html` (đủ doctype, CSS/JS nội tuyến, không phụ thuộc ngoài trừ `../fonts`, `../vendor`, `../img`), có nhận diện riêng (màu, chữ, bố cục khác hẳn nhau và khác DreamLab), có motion, chạy tốt trên điện thoại, có nút "Quay lại DreamLab" (`../index.html`). Đây là hàng mẫu để khách bấm vào xem.
2. **Ảnh chụp** các demo đó đặt trong khung thiết bị (laptop + điện thoại) dựng bằng CSS, chụp ra `.webp`; thêm ảnh cuộn dài toàn trang cho case study.
3. **Render sản phẩm/bao bì 3D** bằng Three.js hoặc CSS 3D (hộp, chai, túi, nhãn) cho 3–4 concept, chụp ra ảnh tĩnh; thêm một **trình xem sản phẩm 3D xoay được** ngay trên trang (kéo để xoay, đổi màu/nhãn), nhẹ, chỉ chạy khi trong khung nhìn.
4. **Ảnh dịch vụ** `img/svc-*.webp` ×6 và `img/og.webp` đúng tên, đúng kích thước ở mục 3.
5. **Phần "Dự án" `#du-an`:** lưới so le theo tỷ lệ vàng, lọc theo dịch vụ (animation Flip), hover có parallax ảnh và nhãn con trỏ "Xem"; bấm mở case study trong `DL.modal` (bối cảnh, việc đã làm, ảnh cuộn dài, bảng màu, phông chữ, gói giá tương ứng, nút `data-pick`); với demo website có nút **"Mở demo trực tiếp"** (mở `demos/<slug>.html` trong iframe bên trong modal, có nút chuyển khung desktop/điện thoại; nếu iframe không tải được thì hiện ảnh cuộn dài thay thế) và một liên kết thường tới file demo.
6. Thanh trượt **trước/sau** (ví dụ bao bì cũ → mới hoặc wireframe → giao diện hoàn chỉnh).

### Session C — "Lab": showreel motion graphic và demo tương tác
File: `src/partials/40-reel.html, 50-lab.html`, `css/lab.css`, `js/lab.js`, `media/*`, `img/lab-*`.
1. **Showreel thật (video MP4):** dựng một phim motion graphic 15–21 giây bằng code (GSAP timeline trên trang HTML riêng `tools/reel/`), nhận diện DreamLab, lấy xoắn ốc vàng và phyllotaxis làm mạch hình, typography động tiếng Việt, 6 dịch vụ lần lượt xuất hiện, kết bằng logo. Xuất bằng cách cho Playwright nhảy từng khung hình (`timeline.seek`) chụp PNG rồi `ffmpeg` nén H.264 yuv420p → `media/showreel.mp4` (1280×792, 30fps, ≤ 4MB) + `media/showreel-poster.webp`. Nếu còn sức: bản dọc 9:16 `media/dreamlab-ad-9x16.mp4` (≤ 4MB) để chạy quảng cáo TikTok/Reels. Phần `#showreel` phát video này trong khung 1.618:1 phóng to dần khi cuộn, có nút phát/tạm dừng, bật tắt tiếng không cần (phim không tiếng), tự dừng khi ra khỏi khung nhìn.
2. **Demo Lab `#lab`** — khách tự tay thử từng dịch vụ, mỗi demo gắn nhãn "Demo mô phỏng":
   - **Chatbot AI bán hàng:** khung chat kiểu Zalo, kịch bản hội thoại mô phỏng (không gọi API) cho một shop concept: gợi ý câu hỏi bấm sẵn và ô nhập tự do có nhận diện từ khóa (giá, ship, tư vấn, đặt hàng), hiệu ứng đang gõ, cuối luồng tạo "đơn hàng" hiện sang bảng bên cạnh.
   - **Luồng tự động hóa:** sơ đồ node động (Zalo/Form → AI phân loại → Google Sheets → CRM → thông báo) vẽ bằng SVG, hạt dữ liệu chạy theo đường (MotionPath), bấm "Chạy thử" để xem một khách hàng đi qua từng bước và bảng số liệu cập nhật.
   - **Motion graphic chạy trực tiếp:** 3 mẫu tua lại được (logo animation, kinetic typography, infographic số liệu) với thanh timeline kéo được.
   - **Edit video / color grading:** thanh trượt trước/sau trên một khung hình dựng bằng code, chọn preset màu (điện ảnh, ấm, mát) áp bằng CSS filter/canvas, và đổi tỷ lệ 16:9 · 1:1 · 9:16 có animation.
   - **Landing page builder mini:** đổi màu chủ đạo, phông, tiêu đề → xem trước landing trong khung điện thoại cập nhật tức thì.
   Bố cục Lab: tab hoặc bento theo tỷ lệ vàng; điện thoại dùng tab vuốt ngang. Mỗi demo có nút `data-pick` dẫn về gói giá liên quan.
3. Chỉ chạy demo đang hiển thị; mọi vòng lặp dừng khi ra khỏi khung nhìn.

## 6. Cách làm việc (cả 3 session)
- Chỉ sửa file của mình. Không chạy `node build.js` không tham số (đó là bản ghép cuối do điều phối viên làm). Không đụng server/port của session khác.
- Vòng lặp: viết → `node build.js <X>` → `node serve.js <port> &` → `node tools/check.js http://127.0.0.1:<port>/_X.html <scratch>/<X>` → **mở ảnh chụp ra xem bằng mắt** (desktop, mobile, dark) → sửa. Tự viết thêm script Playwright để thử tương tác (bấm tab, mở modal, kéo slider) và chụp giữa chừng animation. Bản `_X.html` gồm cả phần của session khác nếu đã có; phần chưa có thì bỏ qua.
- Thư mục scratch cho ảnh chụp và file tạm: `/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/<A|B|C>/`. Cần thêm gói npm thì cài trong scratch, chỉ chép file cần dùng vào `vendor/`.
- Chất lượng: mỗi phần phải có một khoảnh khắc đáng nhớ, không chỉ "đủ dùng". Nhưng hoàn thành và chạy đúng quan trọng hơn tham vọng dở dang: xong bản chắc chắn trước, đánh bóng sau.
- Kết thúc, báo cáo ngắn: file đã tạo, đã kiểm tra gì (kèm kết quả check.js: lỗi console, tràn ngang), điều gì chưa kiểm tra được hoặc còn dở, dung lượng, và điều cần điều phối viên xử lý khi ghép.

---

# v3 — "Phòng mẫu" (Atelier): mẫu và sản phẩm cho từng hạng mục báo giá

Yêu cầu của chủ studio: dưới cùng mỗi hạng mục báo giá có một **nút "Xem mẫu" nhỏ**; bấm vào mở phòng mẫu của hạng mục đó, bên trong có **nhiều sản phẩm, nhiều mẫu mã để khách lựa**. Chủ đề mẫu: **hàng xa xỉ cho giới siêu giàu** (nước hoa cao cấp, túi hiệu, giày high-end, đồng hồ, trang sức, du thuyền, phi cơ riêng, penthouse, siêu xe, rượu hiếm…). Mục tiêu: khách xem xong tin rằng DreamLab làm được hàng đẳng cấp nhất.

Mọi quy định v2 ở trên vẫn áp dụng (φ, token, giới hạn artifact, light/dark, 390px, reduced motion, không tải gì từ ngoài, ảnh tự dựng bằng code rồi chụp/render).

## Nguyên tắc nội dung
- Tất cả là **mẫu concept do DreamLab tự thiết kế**: gắn nhãn `Concept`. Thương hiệu tự nghĩ, **tuyệt đối không dùng tên, logo, monogram, họa tiết đặc trưng hay kiểu dáng nhận diện của hãng thật** (không Chanel, Hermès, Louis Vuitton, Dior, Rolex, Ferrari… và không nhái na ná). Không bịa khách hàng, lời khen, doanh số. Mỗi session tự đặt tên thương hiệu, tránh trùng nhau bằng tiền tố ngành trong danh sách dưới.
- Thẩm mỹ xa xỉ thật: tiết chế, khoảng trống rộng, typography sắc, chất liệu (kính, kim loại, da, đá, lụa), ánh sáng studio. Mỗi mẫu một thế giới riêng, không lặp bố cục.
- Chất lượng hơn số lượng, nhưng số lượng tối thiểu ở từng mục là bắt buộc.

## Hợp đồng dữ liệu
Mỗi hạng mục một file `js/samples-<cat>.js` (cat ∈ `web, landing, video, product, motion, ai`), nạp trước `js/samples.js`:
```js
(window.DL_SAMPLES = window.DL_SAMPLES || {}).web = [ item, item, … ];
```
`item`:
```js
{
  id: 'web-maison-xyz',          // duy nhất, bắt đầu bằng cat
  title: 'Maison XYZ',            // tên mẫu / thương hiệu concept
  industry: 'Nước hoa',           // nhóm lọc: Nước hoa · Túi xách · Giày · Đồng hồ · Trang sức · Du thuyền · Phi cơ riêng · Bất động sản · Siêu xe · Rượu & ẩm thực · Thời trang · Nghỉ dưỡng · Khác
  desc: 'Một câu mô tả mẫu này làm gì cho thương hiệu.',
  tags: ['3D', 'E-commerce'],     // tối đa 3
  pkg: 'Website — Cao cấp',       // gói giá gợi ý, đúng dạng "<Tên hạng mục> — <Tên gói>" trong DL_DATA
  cover: 'img/sm-web-xyz.webp',   // 1280×791, ≤ 70KB
  kind: 'site' | 'product' | 'video' | 'interactive',
  // kind 'site'
  demo: 'demos/lux-xyz.html', long: 'img/sm-web-xyz-long.webp', longM: 'img/sm-web-xyz-long-m.webp',
  // kind 'product'  (nhiều mẫu mã trong một mẫu)
  variants: [{ name: 'Noir', swatch: '#111', img: 'img/sm-product-xyz-noir.webp' }, …],  // ≥ 3
  gallery: ['img/…webp', …],      // ảnh bổ sung (cận cảnh, bộ sưu tập, hộp), tùy chọn
  // kind 'video'
  src: 'media/sm-motion-xyz.mp4', poster: 'media/sm-motion-xyz.webp', ratio: '16:9' | '9:16' | '1:1', duration: 8,
  before: 'img/…webp',            // tùy chọn cho Edit Video: khung hình trước khi chỉnh
  // kind 'interactive'
  mount(el) { … return () => { /* dọn dẹp */ } }   // tự vẽ demo vào el; class tiền tố sm<cat>-
}
```
Tên file ảnh/video: `img/sm-<cat>-*`, `media/sm-<cat>-*`, demo: `demos/lux-*.html`. Ảnh `.webp`, có kích thước thật khớp tỷ lệ khai báo.

## Phân công v3
| Session | File sở hữu | Việc |
|---|---|---|
| **F — Khung phòng mẫu + AI + liên hệ** | `js/samples.js`, `css/samples.css`, `js/samples-ai.js`, `img/sm-ai-*`; được sửa file của Session A cũ (`70-pricing.html`, `core.js`, `core.css`, `00-chrome.html`, `90-contact.html`, `95-footer.html`, `data.js`, `head.html`) | Khung phòng mẫu, nút "Xem mẫu" ở từng hạng mục giá, cập nhật thông tin liên hệ thật, 6 mẫu AI tương tác |
| **W — Website** | `js/samples-web.js`, `demos/lux-*` (trang web), `img/sm-web-*` | ≥ 6 website xa xỉ chạy thật |
| **L — Landing page** | `js/samples-landing.js`, `demos/lux-lp-*`, `img/sm-landing-*` | ≥ 6 landing page xa xỉ chạy thật |
| **P — Sản phẩm** | `js/samples-product.js`, `img/sm-product-*` | ≥ 8 dòng sản phẩm/bao bì, mỗi dòng ≥ 3 mẫu mã |
| **M — Motion + Edit Video** | `js/samples-motion.js`, `js/samples-video.js`, `media/sm-*`, `img/sm-motion-*`, `img/sm-video-*`, `tools/reel2/*` | ≥ 6 phim motion + ≥ 6 mẫu edit video |

Port / build tag / scratch: F 4201 `F`, W 4202 `W`, L 4203 `L`, P 4204 `P`, M 4205 `M`; scratch `/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/<tag>/`. Trong lúc Session F chưa xong khung, các session khác tự kiểm tra dữ liệu bằng một trang thử riêng trong scratch (đọc `DL_SAMPLES`, hiện cover/variants/video) và kiểm tra từng demo trực tiếp.
