# Dòng Lịch Sử · Thư viện ký ức Việt Nam

Sáu cuốn sách lịch sử trong góc thư viện 3D: kệ gỗ óc chó, nền trầm, ánh đèn ấm, ảnh tư liệu và chữ nhũ. Dùng **bộ dựng sách gốc ThreeUI / Three.js r165**, không chuyển sang R3F và không nhúng trang tài liệu ThreeUI.

## Chạy bản trình chiếu

Yêu cầu Node.js **22.13+** (đã dùng 22.22), các dependency đã cài sẵn trong project này.

```sh
npm run demo
```

Mở `http://127.0.0.1:4173`. Lệnh build rồi phục vụ bản production trên localhost. Khi đã cài dependencies, build và trình chiếu không cần Internet. Ảnh, font, texture và Three.js r165 đều nằm trên máy; chỉ liên kết tham khảo mở ra website ngoài.

Máy mới cần `npm ci` một lần khi có mạng. `npm run dev` phục vụ chế độ phát triển. Sau khi sửa catalog hoặc template, chạy lại `npm run library:build` (hoặc khởi động lại `npm run dev`) để cập nhật HTML dẫn xuất.

## Điều khiển

- Chọn sách bằng chuột, sáu mốc thời gian, cuộn chuột hoặc phím ← →.
- Kéo nền để đổi góc kệ; nút **Đặt lại góc nhìn** khôi phục góc mặc định.
- **Khám phá cuốn sách** đưa sách ra trước. Kéo bìa sang trái hoặc bấm **Mở sách**.
- Kéo trang sang trái/phải, bấm nút mũi tên hoặc dùng bàn phím để lật.
- **Đọc rõ** hiển thị đúng trang đang mở với chữ lớn. Lật trong chế độ này cũng thay đổi trang sách 3D.
- Chọn ảnh trên trang sách hoặc ảnh nhỏ bên cạnh để xem nguyên khung, phóng to 2×, xem ghi công; đóng ảnh không đổi trang.
- **Nguồn tư liệu** mở hồ sơ của cuốn hiện tại. `Esc` đóng ảnh trước, sau đó đóng chế độ đọc; nút × bên cạnh tiêu đề đưa sách về kệ.
- **Đọc 2D** dùng cùng catalog; nếu WebGL lỗi, bản đọc này tự xuất hiện và vẫn đọc được đủ sáu cuốn.

## Nội dung và các tài sản bàn giao

| Cuốn | Giai đoạn |
|---|---|
| Hành trình tìm đường | 1911–1929 |
| Mùa thu độc lập | 1930–1945 |
| Kháng chiến và kiến quốc | 1945–1954 |
| Non sông liền một dải | 1954–1975 |
| Đất nước chuyển mình | 1975–2000 |
| Việt Nam kết nối | 2000–nay |

Mỗi cuốn có 8 trang, 3 sự kiện, 3 ý chính, một ảnh chủ đạo và hai ảnh phụ. Phần nội dung chính mỗi cuốn có khoảng 369–381 từ tính theo khoảng trắng, không tính nguồn. Chương cuối ghi ngày cập nhật **05/09/2026**; mục tiêu của các chương trình chính sách không bị trình bày như kết quả đã đạt được.

- `src/content/history.ts`: catalog duy nhất cho sách, đọc lớn, nguồn và bản 2D.
- `scripts/history-shelf/library.js`: canvas bìa/trang, không gian 3D và cầu nối tới trạng thái lật sách gốc.
- `scripts/history-shelf/interface.html`, `library.css`: giao diện tiếng Việt và responsive.
- `scripts/build-history-library.mjs`: kiểm tra SHA-256 rồi tạo biến thể; dừng nếu source gốc thay đổi.
- `src/experience/generated/history-library.html`: tài liệu dẫn xuất đưa vào `CompleteShelfLandingPage` bằng `srcDoc` ổn định.
- `public/landing-pages/lich-su-dang-shelf.html`: cùng biến thể để mở độc lập.
- `public/assets/museum/covers/`: **18 WebP** — bìa trước, bìa sau và gáy của 6 cuốn; `CREDITS.json` mô tả nguồn và giấy phép.
- `public/assets/museum/textures/`: bốn texture tường, giấy, vải và gỗ do AI tạo. Prompt ở `scripts/history-shelf/materials-prompt.md`.
- `public/assets/museum/history/`: ảnh tư liệu nguyên khung, có ghi ngày chụp/loại ảnh, tác giả và nguồn.
- `public/assets/museum/runtime/`, `fonts/`: r165, Inter và Source Serif 4, kèm giấy phép. Trên máy không có Iowan Old Style, phần thiết kế mới dùng Source Serif 4 cục bộ để bảo đảm dấu tiếng Việt; props ThreeUI đã chọn vẫn được giữ.

Xuất lại bộ bìa sau khi sửa thiết kế hoặc catalog:

```sh
npm run library:covers
npm run build
```

Lệnh xuất bìa dùng Chrome/Edge qua Playwright; đặt `PLAYWRIGHT_EXECUTABLE_PATH` nếu Chrome không ở đường dẫn mặc định. `npm run library:vendor` khôi phục runtime/font đã ghim; lần tải đầu cần mạng nếu tài sản chưa tồn tại. Không chạy lại vendor khi trình chiếu offline.

## Source gốc và giấy phép

Bốn file đăng ký gốc vẫn được giữ nguyên byte, gồm `public/landing-pages/complete-shelf-v2.html` với SHA-256 `606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e`. Các file R3F/overlay cũ được giữ làm tham khảo nhưng không nằm trên luồng render chính.

Ảnh có nguồn từ Wikimedia Commons/NARA; thông tin cụ thể nằm ở mỗi trang sách và màn nguồn. Bìa cắt khung ảnh và thêm bố cục/chữ, còn ảnh xem lớn không cắt. Bìa trước **Việt Nam kết nối** là bản phái sinh ảnh CC BY-SA 4.0 của Xuanphuocle, được phân phối theo cùng giấy phép trong `covers/CREDITS.json`.

**Giới hạn tư liệu 1975:** bìa *Non sông liền một dải* dùng ảnh hiện vật xe tăng 843 chụp ngày 03/04/2025. Ảnh phụ năm 1975 là người di tản từ Sài Gòn tại U-Tapao, Thái Lan, ngày 29/04/1975. Cả hai được ghi đúng thời gian/địa điểm, không giả là ảnh xe tăng tiến vào Dinh năm 1975. Không có ảnh sự kiện lịch sử do AI dựng.

## Kiểm tra vừa đủ cho bài trình bày

```sh
npm test
npm run test:e2e
```

Smoke test dùng thao tác chuột/touch bình thường, không `force` click: kéo bìa/trang, ảnh 3D, đọc đồng bộ, nguồn, timeline, mobile và fallback. Các yêu cầu ngoài localhost bị chặn để kiểm tra runtime offline. Ảnh kiểm tra lưu ngoài repo trong thư mục tạm hoặc `LIBRARY_QA_OUTPUT`.

Chrome headless được kiểm tra ở 1366×768, 1920×1080 và 390×844. Môi trường kiểm tra dùng renderer phần mềm và giảm chuyển động; **không coi đây là benchmark FPS** trên RTX 3050 Ti/Iris Xe. Scene giảm DPR/bóng/bụi trên thiết bị yếu hoặc render chậm. Tổng thư mục `dist` đang dưới mục tiêu 20 MB, kể cả source tham khảo và tài sản legacy được giữ lại.

Gợi ý trình bày 5–7 phút: 30 giây giới thiệu kệ, khoảng 45–50 giây/cuốn theo ba ý chính, 45 giây cuối kết nối bài học và xem nguồn.
