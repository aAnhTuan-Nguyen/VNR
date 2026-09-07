export type ChapterId =
  | "preparation"
  | "revolution"
  | "resistance"
  | "reunification"
  | "renovation"
  | "integration";

export interface MediaCredit {
  localPath: string;
  title: string;
  creator: string;
  date: string;
  sourceUrl: string;
  license: string;
  alt: string;
  /** Photograph type; date records capture time, never the upload date. */
  mediaType?: "historical-photo" | "artifact-photo" | "site-photo" | "contemporary-photo";
  licenseUrl?: string;
  changes?: string;
}

export interface HistorySource {
  id: string;
  title: string;
  url: string;
}

export interface HistoryPage {
  title: string;
  body: string;
  media?: MediaCredit;
  sourceIds: string[];
}

export interface HistoryChapter {
  id: ChapterId;
  period: string;
  title: string;
  summary: string;
  keyPoints: [string, string, string];
  takeaway: string;
  heroImage: MediaCredit;
  supportingMedia: [MediaCredit, MediaCredit];
  lightingPreset: string;
  motif: string;
  accent: string;
  cover: { color: string; foil: string; subtitle: string };
  /** Intro, context, three events, meaning, lesson, sources: exactly eight pages. */
  pages: HistoryPage[];
  sources: HistorySource[];
  updatedAt: string;
  events: { date: string; title: string; sourceId: string }[];
}

const commons = "https://commons.wikimedia.org/wiki/";

const media = {
  nguyenAiQuoc: {
    localPath: "/assets/museum/history/nguyen-ai-quoc-1924.jpg",
    title: "Nguyễn Ái Quốc tại Đại hội Quốc tế Cộng sản lần thứ V",
    creator: "Nhiếp ảnh gia khuyết danh",
    date: "1924",
    sourceUrl: `${commons}File%3AComrade_Nguyen_Ai_Quoc_%281924%29.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam/PD-US)",
    alt: "Chân dung tư liệu Nguyễn Ái Quốc năm 1924 tại Moskva",
    mediaType: "historical-photo",
  },
  congress: {
    localPath: "/assets/museum/history/nguyen-ai-quoc-congress-1924.jpg",
    title: "Đại biểu tại Đại hội Quốc tế Cộng sản năm 1924",
    creator: "Nhiếp ảnh gia khuyết danh",
    date: "1924",
    sourceUrl: `${commons}File%3AComrade_Nguyen_Ai_Quoc_and_several_representatives_at_the_fifth_Communist_International_Congress.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam/PD-US)",
    alt: "Nhóm đại biểu tại Đại hội Quốc tế Cộng sản lần thứ V năm 1924",
    mediaType: "historical-photo",
  },
  baDinh: {
    localPath: "/assets/museum/history/ba-dinh-square-1945.jpg",
    title: "Quảng trường Ba Đình — 2/9/1945 (ảnh tư liệu)",
    creator: "Tác giả khuyết danh; tư liệu lưu trữ Việt Nam",
    date: "1945-09-02",
    sourceUrl: `${commons}File%3ABa_Dinh_Square_September_2nd%2C_1945.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam)",
    alt: "Toàn cảnh Quảng trường Ba Đình trong ngày 2 tháng 9 năm 1945",
    mediaType: "historical-photo",
  },
  proclaiming: {
    localPath: "/assets/museum/history/proclaiming-independence-1945.jpg",
    title: "Tranh trưng bày về lễ Độc lập 1945 — ảnh chụp năm 2012",
    creator: "Gary Todd",
    date: "2012-11-28 (ảnh chụp tranh trưng bày)",
    sourceUrl: `${commons}File%3AProclaiming_Vietnamese_Independence%2C_1945_%289735736107%29.jpg`,
    license: "CC0 1.0 (Wikimedia Commons)",
    alt: "Tranh tái hiện lễ Độc lập trong Bảo tàng Lịch sử Quốc gia; ảnh Gary Todd chụp ngày 28/11/2012",
    mediaType: "artifact-photo",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  hoAndGiap: {
    localPath: "/assets/museum/history/ho-chi-minh-vo-nguyen-giap-1945.jpg",
    title: "Hồ Chí Minh và Võ Nguyên Giáp tại Ba Đình — 2/9/1945",
    creator: "Võ An Ninh",
    date: "1945-09-02",
    sourceUrl: `${commons}File%3AHo_Chi_Minh_and_Vo_Nguyen_Giap%2C_Sept._2%2C_1945.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam)",
    alt: "Hồ Chí Minh và Võ Nguyên Giáp sau lễ đọc Tuyên ngôn Độc lập năm 1945",
    mediaType: "historical-photo",
  },
  dienBien: {
    localPath: "/assets/museum/history/victory-dien-bien-phu.jpg",
    title: "Chiến thắng Điện Biên Phủ",
    creator: "Quân đội Nhân dân Việt Nam (theo hồ sơ Commons)",
    date: "1954",
    sourceUrl: `${commons}File%3AVictory_in_Battle_of_Dien_Bien_Phu.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam)",
    alt: "Lực lượng Việt Minh cắm cờ trên hầm chỉ huy Pháp tại Điện Biên Phủ năm 1954",
    mediaType: "historical-photo",
  },
  dienBienMuseum: {
    localPath: "/assets/museum/history/dien-bien-phu-cc0.jpg",
    title: "Sa bàn Điện Biên Phủ — ảnh chụp năm 2012",
    creator: "Gary Todd",
    date: "2012-11-29 (ảnh chụp sa bàn)",
    sourceUrl: `${commons}File%3ABattle_of_Dienbienphu%2C_1954%2C_Final_French_Defeat_%289732265971%29.jpg`,
    license: "CC0 1.0 (Wikimedia Commons)",
    alt: "Sa bàn địa hình chiến dịch Điện Biên Phủ tại Bảo tàng Lịch sử Quân sự Việt Nam, chụp năm 2012",
    mediaType: "artifact-photo",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  tank: {
    localPath: "/assets/museum/history/tank-843.jpg",
    title: "Xe tăng 843 gắn với ngày 30/4/1975 — ảnh hiện vật năm 2025",
    creator: "kitmasterbloke",
    date: "2025-04-03 (ảnh chụp hiện vật)",
    sourceUrl: `${commons}File%3A843_T-54B_tank_-_one_of_two_that_breached_the_Independence_Palace_30th_April_1975.jpg`,
    license: "CC BY 2.0 (Wikimedia Commons; ghi công tác giả)",
    alt: "Xe tăng T-54B số hiệu 843 được trưng bày tại bảo tàng quân sự Việt Nam",
    mediaType: "artifact-photo",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  palace: {
    localPath: "/assets/museum/history/reunification-palace.jpg",
    title: "Dinh Thống Nhất — ảnh di tích năm 2009",
    creator: "Eustaquio Santimano",
    date: "2009-05-24 (ảnh chụp di tích)",
    sourceUrl: `${commons}File%3AReunification_Palace%2C_Ho_Chi_Minh_City%2C_Vietnam.jpg`,
    license: "CC BY 2.0 (Wikimedia Commons; ghi công tác giả)",
    alt: "Mặt tiền Dinh Thống Nhất tại Thành phố Hồ Chí Minh",
    mediaType: "site-photo",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  renovation: {
    localPath: "/assets/museum/history/vietnamese-women-1986.jpg",
    title: "Đời sống Việt Nam năm 1986",
    creator: "Jim Bryant, U.S. Department of Defense",
    date: "1986-04-01",
    sourceUrl: `${commons}File%3AVietnamese_women_do_laundry_beside_pond_with_US_aircraft_wreckage.jpg`,
    license: "Public domain (U.S. federal government photo)",
    alt: "Phụ nữ Việt Nam bên ao nước năm 1986, ảnh lưu trữ công khai",
    mediaType: "historical-photo",
  },
  hanoiNineties: {
    localPath: "/assets/museum/history/vietnam-1999-hanoi.jpg",
    title: "Hà Nội năm 1999",
    creator: "Rc1959",
    date: "1999",
    sourceUrl: `${commons}File%3AVietnam_1999.Hanoi_%2817%29.jpg`,
    license: "CC BY 4.0 (Wikimedia Commons; ghi công tác giả)",
    alt: "Một góc phố Hà Nội trong tư liệu ảnh năm 1999",
    mediaType: "historical-photo",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  giapReview: {
    localPath: "/assets/museum/history/vo-nguyen-giap-review-1945.jpg",
    title: "Võ Nguyên Giáp duyệt lực lượng ở Hà Nội",
    creator: "Tác giả khuyết danh",
    date: "1945",
    sourceUrl: `${commons}File%3A26-8-1945_Vo_Nguyen_Giap_reviewing_the_People%27s_Army.jpg`,
    license: "Public domain (Wikimedia Commons; PD-Vietnam)",
    alt: "Võ Nguyên Giáp duyệt lực lượng nhân dân tại Hà Nội năm 1945",
    mediaType: "historical-photo",
  },
  tours: {
    localPath: "/assets/museum/history/nguyen-ai-quoc-tours-1920.jpg",
    title: "Nguyễn Ái Quốc tại Đại hội Tua — tháng 12/1920 (ảnh tư liệu)",
    creator: "Nhiếp ảnh gia khuyết danh",
    date: "1920-12",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Comrade_Nguyen_Ai_Quoc_at_the_national_congress_of_the_Socialist_Party_of_France_in_the_city_of_Tous,_France_in_December_1920.jpg",
    license: "Public domain (theo trang mô tả Wikimedia Commons)",
    alt: "Nguyễn Ái Quốc phát biểu tại Đại hội Đảng Xã hội Pháp ở Tours tháng 12/1920",
    mediaType: "historical-photo",
    changes: "Bản JPEG từ Commons, không chỉnh sửa nội dung",
  },
  evacuation: {
    localPath: "/assets/museum/history/saigon-evacuation-1975.jpg",
    title: "Người di tản từ Sài Gòn tại U-Tapao, Thái Lan — 29/4/1975",
    creator: "Nhiếp ảnh gia khuyết danh; Bộ Không quân Hoa Kỳ, NARA 542335",
    date: "1975-04-29",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:The_air_evacuation_of_siege-stricken_Vietnamese_from_Saigon_to_the_U.S._was_conducted_after_the_Babylift_operation...._-_NARA_-_542335.tif",
    license: "Public domain (PD-USGov; NARA)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov",
    alt: "Người Việt di tản từ Sài Gòn chờ chuyến C-141 tại điểm dừng U-Tapao ở Thái Lan ngày 29/4/1975",
    mediaType: "historical-photo",
    changes: "Bản JPEG thu nhỏ từ TIFF của NARA qua Commons; không chỉnh sửa nội dung",
  },
  hanoiStreet: {
    localPath: "/assets/museum/history/hanoi-street-1999.jpg",
    title: "Sinh hoạt vỉa hè Hà Nội — 1999 (ảnh tư liệu)",
    creator: "Rc1959",
    date: "1999",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Vietnam_1999.Hanoi_(18).jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    alt: "Người dân ngồi bên vỉa hè và hàng quán trên một góc phố Hà Nội năm 1999",
    mediaType: "historical-photo",
    changes: "Thu nhỏ còn tối đa 1280 px; không cắt hoặc chỉnh sửa nội dung",
  },
  skyline: {
    localPath: "/assets/museum/history/ho-chi-minh-city-2022.jpg",
    title: "Đô thị bên sông Sài Gòn — 26/8/2022 (ảnh đương đại)",
    creator: "Xuanphuocle",
    date: "2022-08-26",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_Skyline_2022_(1).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    alt: "Đường chân trời khu vực Bình Thạnh và hữu ngạn sông Sài Gòn ngày 26/8/2022",
    mediaType: "contemporary-photo",
    changes: "Thu nhỏ còn 1280 px; không cắt hoặc chỉnh sửa nội dung; giữ CC BY-SA 4.0",
  },
  dragonBridge: {
    localPath: "/assets/museum/history/da-nang-dragon-bridge-2015.jpg",
    title: "Chi tiết Cầu Rồng, Đà Nẵng — 2015 (ảnh đương đại)",
    creator: "P. Hughes",
    date: "2015",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Da_Nang_-_Dragon_Bridge.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    alt: "Phần đầu rồng màu vàng của Cầu Rồng tại Đà Nẵng, ảnh chụp năm 2015",
    mediaType: "contemporary-photo",
    changes: "Thu nhỏ còn 1280 px; không cắt hoặc chỉnh sửa nội dung",
  },
  hanoiMetro: {
    localPath: "/assets/museum/history/hanoi-le-duc-tho-station-2024.jpg",
    title: "Ga Lê Đức Thọ, Hà Nội — 11/8/2024 (ảnh đương đại)",
    creator: "Virtual trip",
    date: "2024-08-11",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:%E3%83%AC%E3%83%89%E3%82%A5%E3%82%AF%E3%83%88%E9%A7%85%E3%81%AE%E9%A7%85%E8%88%8E.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    alt: "Mặt ngoài ga Lê Đức Thọ trên tuyến metro số 3 tại Hà Nội, ngày 11/8/2024",
    mediaType: "contemporary-photo",
    changes: "Thu nhỏ còn 1280 px; không cắt hoặc chỉnh sửa nội dung",
  },
} satisfies Record<string, MediaCredit>;

// Narrative bodies use whitespace-delimited Vietnamese word counts, excluding page 8.
// The eight-page order is shared across all six books.
const books = {
  "preparation": {
    "cover": {
      "color": "#283451",
      "foil": "#D6AA78",
      "subtitle": "Tư tưởng, con người và tổ chức"
    },
    "events": [
      {
        "date": "5/6/1911",
        "title": "Rời Bến Nhà Rồng",
        "sourceId": "prep-departure"
      },
      {
        "date": "12/1920",
        "title": "Bước ngoặt tại Đại hội Tua",
        "sourceId": "prep-tours"
      },
      {
        "date": "6/1925",
        "title": "Thành lập Hội Việt Nam Cách mạng Thanh niên",
        "sourceId": "prep-youth"
      }
    ],
    "sources": [
      {
        "id": "prep-departure",
        "title": "Bảo tàng Hồ Chí Minh — Chuyến đi lịch sử",
        "url": "https://baotanghochiminh.vn/chuyen-di-lich-su.htm"
      },
      {
        "id": "prep-tours",
        "title": "Bảo tàng Hồ Chí Minh — Nguyễn Ái Quốc với đào tạo cán bộ trẻ",
        "url": "https://baotanghochiminh.vn/lanh-tu-nguyen-ai-quoc-voi-viec-dao-tao-boi-duong-can-bo-tre-nham-chuan-bi-thanh-lap-dang-cong-san-viet-nam-gia-tri-ly-luan-va-thuc-tien-cho-giai-doan-hien-nay.htm"
      },
      {
        "id": "prep-youth",
        "title": "Bảo tàng Lịch sử Quốc gia — Báo Thanh Niên năm 1925",
        "url": "https://baotanglichsu.vn/vi/Articles/3097/18248/thanh-nien-to-bao-cach-mang-do-lanh-tu-nguyen-ai-quoc-sang-lap-nam-1925.html"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Hành trình từ năm 1911 đến năm 1929 là quá trình Nguyễn Tất Thành, rồi Nguyễn Ái Quốc, tìm kiếm con đường giải phóng dân tộc. Những chuyến đi, công việc mưu sinh và hoạt động chính trị dần kết nối khát vọng độc lập với lý luận và tổ chức.",
        media: media.nguyenAiQuoc,
        "sourceIds": [
          "prep-departure",
          "prep-tours"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Dưới chế độ thuộc địa, các phong trào yêu nước đặt ra câu hỏi về lực lượng và phương pháp giành độc lập. Nguyễn Tất Thành lựa chọn ra nước ngoài học hỏi. Trải nghiệm đời sống lao động giúp Người quan sát bất bình đẳng cả ở thuộc địa lẫn chính quốc.",
        "sourceIds": [
          "prep-departure"
        ]
      },
      {
        "title": "5/6/1911 · Lên đường",
        "body": "Ngày 5/6/1911, Nguyễn Tất Thành rời Bến Nhà Rồng trên tàu Amiral Latouche-Tréville, làm phụ bếp. Cuộc ra đi mở đầu chặng đường khảo nghiệm lâu dài. Tự lao động để sinh sống, học hỏi và tiếp xúc với nhiều cộng đồng trở thành những điều kiện hình thành nhận thức chính trị.",
        "sourceIds": [
          "prep-departure"
        ]
      },
      {
        "title": "12/1920 · Lựa chọn",
        "body": "Tháng 12/1920, tại Đại hội Tua của Đảng Xã hội Pháp, Nguyễn Ái Quốc tán thành gia nhập Quốc tế Cộng sản và tham gia sáng lập Đảng Cộng sản Pháp. Việc tiếp cận tư tưởng Lênin về dân tộc, thuộc địa trước đó góp phần định hướng lựa chọn cách mạng vô sản.",
        media: media.tours,
        "sourceIds": [
          "prep-tours"
        ]
      },
      {
        "title": "6/1925 · Gây dựng",
        "body": "Tháng 6/1925, tại Quảng Châu, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên. Báo Thanh Niên ra số đầu ngày 21/6/1925. Các lớp huấn luyện cùng báo chí đưa tư tưởng cách mạng đến những người hoạt động, chuẩn bị lực lượng và mạng lưới cho phong trào trong nước.",
        "sourceIds": [
          "prep-youth",
          "prep-tours"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Sự chuẩn bị không chỉ nằm trong một văn bản hay một chuyến đi. Đó là sự kết hợp giữa nghiên cứu, truyền bá tư tưởng và đào tạo con người. Ảnh đại biểu năm 1924 gợi mở môi trường giao lưu quốc tế của Nguyễn Ái Quốc trong tiến trình tìm đường.",
        media: media.congress,
        "sourceIds": [
          "prep-tours",
          "prep-youth"
        ]
      },
      {
        "title": "Bài học",
        "body": "Từ hành trình này, người đọc có thể suy ngẫm về cách học từ thực tế và kiên trì kiểm chứng điều mình tin. Khi xem ảnh, hãy đối chiếu thời gian, địa điểm với câu chuyện. Một chân dung đúng niên đại giúp hiểu nhân vật trong hoàn cảnh cụ thể.",
        "sourceIds": [
          "prep-departure",
          "prep-tours"
        ]
      }
    ]
  },
  "revolution": {
    "cover": {
      "color": "#A83C2E",
      "foil": "#D7B35C",
      "subtitle": "Từ tổ chức đến nền độc lập"
    },
    "events": [
      {
        "date": "3/2/1930",
        "title": "Thành lập Đảng Cộng sản Việt Nam",
        "sourceId": "rev-party"
      },
      {
        "date": "19/8/1945",
        "title": "Khởi nghĩa giành chính quyền ở Hà Nội",
        "sourceId": "rev-august"
      },
      {
        "date": "2/9/1945",
        "title": "Công bố Tuyên ngôn Độc lập",
        "sourceId": "rev-independence"
      }
    ],
    "sources": [
      {
        "id": "rev-party",
        "title": "Tư liệu văn kiện Đảng — Ngày thành lập Đảng 3/2/1930",
        "url": "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342"
      },
      {
        "id": "rev-august",
        "title": "Bảo tàng Lịch sử Quốc gia — Tự vệ Hà Nội trong Tháng Tám 1945",
        "url": "https://baotanglichsu.vn/vi/Articles/3096/71018/ky-niem-74-nam-cach-mang-thang-tam-thanh-cong-19-8-1945-19-8-2019-tu-ve-ha-noi-trong-nhung-ngay-thang-tam-lich-su.html"
      },
      {
        "id": "rev-independence",
        "title": "Bảo tàng Lịch sử Quốc gia — Ảnh tư liệu khởi nghĩa và lễ Độc lập",
        "url": "https://baotanglichsu.vn/vi/Articles/4092/anh-tu-lieu"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Từ năm 1930 đến mùa thu 1945, phong trào cách mạng đi qua quá trình xây dựng tổ chức và chuẩn bị lực lượng. Sự ra đời của Đảng Cộng sản Việt Nam, khởi nghĩa ở Hà Nội và lễ Độc lập là ba điểm nhìn để khám phá bước chuyển lịch sử.",
        media: media.baDinh,
        "sourceIds": [
          "rev-party",
          "rev-august",
          "rev-independence"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Các tổ chức cộng sản xuất hiện đặt ra yêu cầu thống nhất lãnh đạo. Sau khi Đảng ra đời, việc vận động quần chúng tiếp tục tích lũy lực lượng. Đến năm 1945, hoạt động chuẩn bị khởi nghĩa ở Hà Nội dựa vào các cơ sở nội thành, ngoại thành và lực lượng tự vệ.",
        "sourceIds": [
          "rev-party",
          "rev-august"
        ]
      },
      {
        "title": "3/2/1930 · Thành lập Đảng",
        "body": "Ngày 3/2/1930 được xác định là ngày thành lập Đảng Cộng sản Việt Nam. Hội nghị hợp nhất tại Hương Cảng do Nguyễn Ái Quốc chủ trì thông qua những văn kiện nền tảng. Việc thống nhất tổ chức tạo điều kiện tập hợp lực lượng và định hướng phong trào đấu tranh giải phóng dân tộc.",
        "sourceIds": [
          "rev-party"
        ]
      },
      {
        "title": "19/8/1945 · Hà Nội",
        "body": "Ngày 19/8/1945, nhân dân Hà Nội khởi nghĩa giành chính quyền. Các đội tự vệ phối hợp với đông đảo quần chúng trong hoạt động chiếm những cơ quan trọng yếu. Thắng lợi tại Hà Nội góp phần vào Tổng khởi nghĩa Tháng Tám trên cả nước.",
        "sourceIds": [
          "rev-august",
          "rev-independence"
        ]
      },
      {
        "title": "2/9/1945 · Độc lập",
        "body": "Ngày 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa. Những bức ảnh trong ngày lễ ghi lại sự hiện diện của lãnh đạo và nhân dân, giúp người xem hình dung không gian công bố nền độc lập.",
        media: media.hoAndGiap,
        "sourceIds": [
          "rev-independence"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Mùa thu 1945 đánh dấu sự ra đời của một nhà nước mới, đồng thời đặt ra trách nhiệm bảo vệ và tổ chức nền độc lập. Tranh trưng bày được chụp năm 2012 cho thấy cách bảo tàng diễn giải sự kiện; niên đại ảnh chụp khác với thời điểm lịch sử được tái hiện.",
        media: media.proclaiming,
        "sourceIds": [
          "rev-independence"
        ]
      },
      {
        "title": "Bài học",
        "body": "Tổ chức, sự tham gia của nhân dân và khả năng nắm thời cơ là những điều có thể suy ngẫm từ chương sách. Khi tìm hiểu Tháng Tám, hãy phân biệt mốc ở từng địa phương với toàn bộ cuộc khởi nghĩa, rồi so sánh ảnh tư liệu với các cách tái hiện về sau.",
        "sourceIds": [
          "rev-party",
          "rev-august"
        ]
      }
    ]
  },
  "resistance": {
    "cover": {
      "color": "#565D3A",
      "foil": "#D7C997",
      "subtitle": "Giữ nền độc lập, dựng đời sống"
    },
    "events": [
      {
        "date": "6/1/1946",
        "title": "Tổng tuyển cử đầu tiên",
        "sourceId": "res-election"
      },
      {
        "date": "19/12/1946",
        "title": "Toàn quốc kháng chiến",
        "sourceId": "res-national"
      },
      {
        "date": "7/5/1954",
        "title": "Chiến thắng Điện Biên Phủ",
        "sourceId": "res-dienbien"
      }
    ],
    "sources": [
      {
        "id": "res-election",
        "title": "Báo Chính phủ — Tổng tuyển cử 1946",
        "url": "https://baochinhphu.vn/tong-tuyen-cu-1946-buoc-truong-thanh-cua-nha-nuoc-cach-mang-vn-102196201.htm"
      },
      {
        "id": "res-national",
        "title": "Bảo tàng Lịch sử Quốc gia — Ngày toàn quốc kháng chiến",
        "url": "https://baotanglichsu.vn/vi/Articles/2002/68312/19-12-1946-ngay-toan-quoc-khang-chien.html"
      },
      {
        "id": "res-dienbien",
        "title": "Bảo tàng Lịch sử Quốc gia — Hiện vật chiến thắng Điện Biên Phủ",
        "url": "https://baotanglichsu.vn/vi/Articles/4057/mot-so-hien-vat-ve-chien-thang-djien-bien-phu-thang-5-1954"
      },
      {
        "id": "res-logistics",
        "title": "Bảo tàng Lịch sử Quốc gia — Sổ tay dân công Phú Thọ năm 1954",
        "url": "https://baotanglichsu.vn/VI/Articles/1002/74906/cuon-so-tay-cua-dan-cong-tinh-phu-tho-trong-chien-dich-djien-bien-phu-nam-1954.html"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Sau mùa thu 1945, bảo vệ nền độc lập gắn liền với xây dựng nhà nước và đời sống nhân dân. Giai đoạn đến năm 1954 cho thấy hai nhiệm vụ kháng chiến, kiến quốc đan xen. Lá phiếu, chiến lũy và công việc hậu cần cùng thuộc về câu chuyện ấy.",
        media: media.dienBien,
        "sourceIds": [
          "res-election",
          "res-national",
          "res-dienbien"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Chính quyền mới phải củng cố tổ chức trong khi nguy cơ chiến tranh gia tăng. Những nỗ lực thương lượng và chuẩn bị lực lượng diễn ra song song. Ảnh Võ Nguyên Giáp năm 1945 ghi lại lực lượng trong buổi đầu cách mạng, trước khi cuộc kháng chiến toàn quốc bùng nổ.",
        media: media.giapReview,
        "sourceIds": [
          "res-national"
        ]
      },
      {
        "title": "6/1/1946 · Lá phiếu",
        "body": "Ngày 6/1/1946, cuộc Tổng tuyển cử đầu tiên bầu Quốc hội diễn ra trên cả nước, kể cả những nơi có chiến sự. Việc tổ chức bầu cử trong hoàn cảnh khó khăn là bước xây dựng thiết chế đại diện của nhà nước mới, thể hiện ý chí độc lập và thống nhất.",
        "sourceIds": [
          "res-election"
        ]
      },
      {
        "title": "19/12/1946 · Kháng chiến",
        "body": "Ngày 19/12/1946, cuộc kháng chiến toàn quốc bùng nổ. Lời kêu gọi của Chủ tịch Hồ Chí Minh nêu quyết tâm bảo vệ độc lập. Tại Hà Nội, chiến đấu trong đô thị góp phần tạo thời gian để cả nước chuyển vào kháng chiến lâu dài, đồng thời bảo toàn và tổ chức lực lượng.",
        "sourceIds": [
          "res-national"
        ]
      },
      {
        "title": "7/5/1954 · Điện Biên Phủ",
        "body": "Ngày 7/5/1954, chiến dịch Điện Biên Phủ kết thúc thắng lợi. Đằng sau chiến trường là sức lao động của dân công, những chuyến vận chuyển và sự phối hợp hậu phương, tiền tuyến. Sa bàn được chụp tại bảo tàng năm 2012 hỗ trợ hình dung địa hình, không phải ảnh chụp trận đánh.",
        media: media.dienBienMuseum,
        "sourceIds": [
          "res-dienbien",
          "res-logistics"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Kháng chiến cho thấy sức bền được tạo bởi tổ chức và đóng góp của nhiều tầng lớp. Cuốn sổ dân công ghi việc nhận, giao gạo nhắc rằng thắng lợi còn phụ thuộc những công việc cụ thể, có kỷ luật. Kiến quốc vì thế hiện diện ngay trong điều kiện chiến tranh.",
        "sourceIds": [
          "res-logistics",
          "res-election"
        ]
      },
      {
        "title": "Bài học",
        "body": "Có thể đọc chương này từ những con người ít được gọi tên: người vận chuyển, người tổ chức bầu cử, người giữ liên lạc. Khi đối chiếu một hiện vật với hồ sơ lưu giữ, ta hiểu rõ hơn mối liên hệ giữa trách nhiệm cá nhân và công việc chung của cộng đồng.",
        "sourceIds": [
          "res-election",
          "res-logistics"
        ]
      }
    ]
  },
  "reunification": {
    "cover": {
      "color": "#703E36",
      "foil": "#E9DFC5",
      "subtitle": "Qua chia cắt, hướng về đoàn tụ"
    },
    "events": [
      {
        "date": "19/5/1959",
        "title": "Thành lập Đoàn 559",
        "sourceId": "uni-truongson"
      },
      {
        "date": "27/1/1973",
        "title": "Ký Hiệp định Paris",
        "sourceId": "uni-paris"
      },
      {
        "date": "30/4/1975",
        "title": "Chiến dịch Hồ Chí Minh toàn thắng",
        "sourceId": "uni-victory"
      }
    ],
    "sources": [
      {
        "id": "uni-geneva",
        "title": "Báo Chính phủ — Bác Hồ với Hiệp định Geneva",
        "url": "https://baochinhphu.vn/bac-ho-voi-hiep-dinh-geneva-102167289.htm"
      },
      {
        "id": "uni-truongson",
        "title": "Báo Chính phủ — Đường Trường Sơn và Đoàn 559",
        "url": "https://baochinhphu.vn/dia-danh-lich-su-chien-tich-hao-hung-102256029.htm"
      },
      {
        "id": "uni-paris",
        "title": "Bảo tàng Lịch sử Quốc gia — Sưu tập hình ảnh Hội nghị Paris 1968–1973",
        "url": "https://baotanglichsu.vn/DataFiles/2023/09/News/Tieng%20Viet/20.9.2023/Thong%20bao%20khoa%20h%E1%BB%8Dc%20s%C3%B3%201%20nam%202023/007.pdf"
      },
      {
        "id": "uni-victory",
        "title": "Bảo tàng Lịch sử Quốc gia — Chiến dịch Hồ Chí Minh 26–30/4/1975",
        "url": "https://baotanglichsu.vn/vi/Articles/2002/67989/chien-dich-ho-chi-minh-lich-su-26-4-30-4-1975.html"
      },
      {
        "id": "uni-state",
        "title": "Bảo tàng Lịch sử Quốc gia — Ảnh tư liệu thống nhất nhà nước năm 1976",
        "url": "https://baotanglichsu.vn/vi/Articles/4107/anh-tu-lieu"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Từ năm 1954 đến năm 1975, đất nước trải qua chia cắt và chiến tranh. Câu chuyện thống nhất gắn với chiến đấu, ngoại giao và những gia đình chịu mất mát. Xe tăng 843 được giới thiệu bằng ảnh hiện vật chụp năm 2025, với niên đại ghi rõ.",
        media: media.tank,
        "sourceIds": [
          "uni-geneva",
          "uni-victory"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Hiệp định Geneva năm 1954 quy định giới tuyến quân sự có tính chất tạm thời. Tuy nhiên, tiến trình thống nhất trải qua chiến tranh kéo dài. Miền Bắc trở thành hậu phương chi viện cho miền Nam. Dinh Độc Lập là địa điểm gắn với thời khắc kết thúc chiến tranh năm 1975.",
        media: media.palace,
        "sourceIds": [
          "uni-geneva",
          "uni-truongson",
          "uni-victory"
        ]
      },
      {
        "title": "19/5/1959 · Mở đường",
        "body": "Ngày 19/5/1959, Đoàn 559 được thành lập để mở tuyến vận tải chiến lược chi viện miền Nam. Từ những tuyến đường ban đầu, đường Trường Sơn phát triển qua nhiều năm. Công sức của bộ đội, thanh niên xung phong và lực lượng vận tải giúp duy trì liên hệ giữa hậu phương với tiền tuyến.",
        "sourceIds": [
          "uni-truongson"
        ]
      },
      {
        "title": "27/1/1973 · Đàm phán",
        "body": "Ngày 27/1/1973, Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký chính thức. Hiệp định quy định việc rút quân Mỹ khỏi miền Nam. Đây là kết quả của quá trình đàm phán lâu dài, gắn với diễn biến trên các mặt trận chính trị và quân sự.",
        "sourceIds": [
          "uni-paris"
        ]
      },
      {
        "title": "30/4/1975 · Toàn thắng",
        "body": "Ngày 30/4/1975, Chiến dịch Hồ Chí Minh toàn thắng; chính quyền Việt Nam Cộng hòa đầu hàng. Sự kiện kết thúc chiến tranh, mở đường cho thống nhất đất nước. Quá trình thống nhất về mặt nhà nước được tiếp tục trong năm 1976, cần phân biệt với mốc quân sự tháng Tư.",
        "sourceIds": [
          "uni-victory",
          "uni-state"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Thống nhất mở ra khả năng nối lại đời sống chung sau chia cắt. Ký ức chiến tranh cũng chứa những cuộc di tản: ảnh ngày 29/4/1975 ghi người Việt từ Sài Gòn chờ nối chuyến tại U-Tapao, Thái Lan. Đọc đúng địa điểm giúp tôn trọng trải nghiệm của con người trong biến động.",
        media: media.evacuation,
        "sourceIds": [
          "uni-victory"
        ]
      },
      {
        "title": "Bài học",
        "body": "Tìm hiểu thống nhất đòi hỏi vừa theo dõi sự kiện, vừa lắng nghe ký ức gia đình. Hãy phân biệt ảnh chụp năm 1975 với ảnh di tích hoặc hiện vật chụp sau này. Sự cẩn trọng ấy giúp bảo tồn tư liệu và nuôi dưỡng trách nhiệm gìn giữ hòa bình.",
        "sourceIds": [
          "uni-victory",
          "uni-state"
        ]
      }
    ]
  },
  "renovation": {
    "cover": {
      "color": "#A85E46",
      "foil": "#E4BB94",
      "subtitle": "Tái thiết, Đổi mới và mở cửa"
    },
    "events": [
      {
        "date": "2/7/1976",
        "title": "Quốc hội quyết nghị tên nước thống nhất",
        "sourceId": "reno-state"
      },
      {
        "date": "15–18/12/1986",
        "title": "Đại hội VI khởi xướng Đổi mới",
        "sourceId": "reno-congress"
      },
      {
        "date": "28/7/1995",
        "title": "Việt Nam gia nhập ASEAN",
        "sourceId": "reno-asean"
      }
    ],
    "sources": [
      {
        "id": "reno-state",
        "title": "Bảo tàng Lịch sử Quốc gia — Kỳ họp Quốc hội ngày 2/7/1976 và tư liệu Đổi mới",
        "url": "https://baotanglichsu.vn/vi/Articles/4107/anh-tu-lieu"
      },
      {
        "id": "reno-congress",
        "title": "Tư liệu văn kiện Đảng — Niên biểu Đại hội VI",
        "url": "https://tulieuvankien.dangcongsan.vn/ban-chap-hanh-trung-uong-dang/dai-hoi-dang/lan-thu-vi/nien-bieu-toan-khoa-1497?categoryId=104000024"
      },
      {
        "id": "reno-asean",
        "title": "Báo Chính phủ — Quyết định gia nhập ASEAN ngày 28/7/1995",
        "url": "https://baochinhphu.vn/quyet-dinh-mang-y-nghia-tam-quoc-gia-va-khu-vuc-102167843.htm"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Sau năm 1975, đất nước bước vào công cuộc tái thiết và thống nhất nhà nước. Đến cuối thế kỷ XX, Đổi mới và mở rộng hợp tác tạo những bước chuyển trong đời sống. Ảnh năm 1986 và năm 1999 giúp tiếp cận giai đoạn này từ sinh hoạt thường ngày.",
        media: media.renovation,
        "sourceIds": [
          "reno-state",
          "reno-congress",
          "reno-asean"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Hậu quả chiến tranh cùng những khó khăn trong tổ chức sản xuất, phân phối đặt ra yêu cầu thay đổi. Tư liệu bảo tàng về thời bao cấp ghi cảnh xếp hàng mua thực phẩm. Đặt các hình ảnh ấy cạnh văn kiện giúp hiểu vì sao việc đổi mới cách quản lý trở nên cấp thiết.",
        "sourceIds": [
          "reno-state",
          "reno-congress"
        ]
      },
      {
        "title": "2/7/1976 · Nhà nước chung",
        "body": "Ngày 2/7/1976, tại kỳ họp thứ nhất, Quốc hội khóa VI thông qua các nghị quyết về tên nước, Quốc kỳ, Quốc huy, Thủ đô và Quốc ca. Tên nước Cộng hòa xã hội chủ nghĩa Việt Nam thể hiện bước thống nhất về nhà nước sau chiến tranh, tạo khuôn khổ chung cho xây dựng đất nước.",
        "sourceIds": [
          "reno-state"
        ]
      },
      {
        "title": "12/1986 · Đổi mới",
        "body": "Đại hội VI diễn ra tại Hà Nội từ ngày 15 đến 18/12/1986, khởi xướng công cuộc Đổi mới. Đại hội đặt yêu cầu đánh giá đúng thực trạng để điều chỉnh chủ trương phát triển. Đây là dấu mốc của quá trình vượt khó, đổi mới tư duy và cách làm.",
        "sourceIds": [
          "reno-congress"
        ]
      },
      {
        "title": "28/7/1995 · ASEAN",
        "body": "Ngày 28/7/1995, Việt Nam chính thức gia nhập ASEAN tại Brunei, trở thành thành viên thứ bảy của hiệp hội vào thời điểm đó. Bước đi này mở rộng hợp tác khu vực và tạo điều kiện cho hội nhập quốc tế, gắn phát triển trong nước với quan hệ cùng các nước láng giềng.",
        "sourceIds": [
          "reno-asean"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Chuyển mình là một quá trình gồm nhiều quyết định và nỗ lực trong đời sống. Những góc phố Hà Nội năm 1999 bổ sung lát cắt sinh hoạt vào câu chuyện chính sách. Ảnh chỉ phản ánh một thời điểm; cần thêm tư liệu để hiểu giai đoạn.",
        media: media.hanoiNineties,
        "sourceIds": [
          "reno-congress",
          "reno-asean"
        ]
      },
      {
        "title": "Bài học",
        "body": "Từ Đổi mới có thể suy ngẫm về năng lực nhìn nhận khó khăn, học từ thực tiễn và điều chỉnh cách làm. Ảnh sinh hoạt vỉa hè năm 1999 mời người xem liên hệ ký ức gia đình với lịch sử chung, đồng thời khuyến khích tìm hiểu thêm.",
        media: media.hanoiStreet,
        "sourceIds": [
          "reno-congress"
        ]
      }
    ]
  },
  "integration": {
    "cover": {
      "color": "#536D83",
      "foil": "#C0C8CE",
      "subtitle": "Hợp tác quốc tế, trách nhiệm hôm nay"
    },
    "events": [
      {
        "date": "11/1/2007",
        "title": "Việt Nam trở thành thành viên WTO",
        "sourceId": "int-wto"
      },
      {
        "date": "14/1/2019",
        "title": "CPTPP có hiệu lực với Việt Nam",
        "sourceId": "int-cptpp"
      },
      {
        "date": "3/6/2020",
        "title": "Phê duyệt Chương trình Chuyển đổi số quốc gia",
        "sourceId": "int-digital"
      }
    ],
    "sources": [
      {
        "id": "int-wto",
        "title": "WTO — Hồ sơ gia nhập của Việt Nam",
        "url": "https://www.wto.org/english/thewto_e/acc_e/a1_vietnam_e.htm"
      },
      {
        "id": "int-cptpp",
        "title": "Bộ Công Thương — CPTPP có hiệu lực với Việt Nam từ 14/1/2019",
        "url": "https://moit.gov.vn/tin-tuc/thi-truong-nuoc-ngoai/hiep-dinh-cptpp-chinh-thuc-co-hieu-luc-doi-voi-viet-nam-tu-n.html"
      },
      {
        "id": "int-digital",
        "title": "Cổng thông tin Chính phủ — Quyết định 749/QĐ-TTg ngày 3/6/2020",
        "url": "https://chinhphu.vn/?docid=200163&pageid=27160"
      }
    ],
    "pages": [
      {
        "title": "Mở đầu",
        "body": "Từ năm 2000, câu chuyện Việt Nam gắn với những kết nối rộng hơn về thương mại, tri thức và đời sống. Chương sách chọn ba dấu mốc đã xác minh. Ảnh đô thị năm 2022 bổ sung một lát cắt đương đại, không đại diện cho toàn bộ đất nước.",
        media: media.skyline,
        "sourceIds": [
          "int-wto",
          "int-cptpp",
          "int-digital"
        ]
      },
      {
        "title": "Bối cảnh",
        "body": "Hội nhập đòi hỏi hiểu cam kết và chuẩn bị năng lực tham gia. Các hiệp định tạo khuôn khổ trao đổi, còn cơ hội phụ thuộc cách thực hiện. Ảnh Cầu Rồng năm 2015 gợi liên tưởng về kết nối, minh họa đời sống đương đại.",
        media: media.dragonBridge,
        "sourceIds": [
          "int-wto",
          "int-cptpp"
        ]
      },
      {
        "title": "11/1/2007 · WTO",
        "body": "Ngày 11/1/2007, Việt Nam trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới. Hồ sơ WTO phân biệt ngày gia nhập với các bước đàm phán và phê chuẩn trước đó. Dấu mốc này đưa quan hệ thương mại vào khuôn khổ cam kết đa phương, cùng các quyền và nghĩa vụ.",
        "sourceIds": [
          "int-wto"
        ]
      },
      {
        "title": "14/1/2019 · CPTPP",
        "body": "Ngày 14/1/2019, Hiệp định Đối tác Toàn diện và Tiến bộ xuyên Thái Bình Dương có hiệu lực đối với Việt Nam. Bộ Công Thương nhấn mạnh nhu cầu hiểu đúng các cam kết để tận dụng cơ hội. Mốc hiệu lực với Việt Nam cần được phân biệt với mốc của các thành viên khác.",
        "sourceIds": [
          "int-cptpp"
        ]
      },
      {
        "title": "3/6/2020 · Chuyển đổi số",
        "body": "Ngày 3/6/2020, Thủ tướng ban hành Quyết định 749/QĐ-TTg, phê duyệt Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030. Văn bản xác định chương trình và mục tiêu chính sách. Việc ban hành không tự chứng minh mọi mục tiêu đã hoàn thành; đánh giá kết quả cần nguồn riêng.",
        "sourceIds": [
          "int-digital"
        ]
      },
      {
        "title": "Ý nghĩa",
        "body": "Nhìn qua ba dấu mốc, kết nối quốc tế đi cùng yêu cầu học hỏi và tổ chức thực hiện trong nước. Có thể đọc hội nhập như một quá trình liên tục xây dựng năng lực. Các sự kiện được ghi nhận theo hồ sơ chính thức.",
        "sourceIds": [
          "int-wto",
          "int-cptpp",
          "int-digital"
        ]
      },
      {
        "title": "Bài học",
        "body": "Mỗi người có thể tiếp nối câu chuyện bằng việc học kỹ năng, kiểm tra thông tin và sử dụng công nghệ có trách nhiệm. Ảnh ga Lê Đức Thọ năm 2024 ghi lại một địa điểm cụ thể. Hãy quan sát sự thay đổi quanh mình và tìm nguồn trước khi khái quát.",
        media: media.hanoiMetro,
        "sourceIds": [
          "int-digital"
        ]
      }
    ]
  }
} satisfies Record<
  ChapterId,
  Pick<HistoryChapter, "cover" | "pages" | "sources" | "events">
>;

function chapterBook(chapterId: ChapterId): Pick<
  HistoryChapter,
  "cover" | "pages" | "sources" | "events" | "updatedAt"
> {
  const book = books[chapterId];
  const pages: HistoryPage[] = book.pages;
  const images = [...new Map(
    pages.flatMap((page) => page.media ? [[page.media.localPath, page.media] as const] : []),
  ).values()];
  const imageSources: HistorySource[] = images.map((asset, index) => ({
    id: `${chapterId}-media-${index + 1}`,
    title: [
      asset.title,
      asset.creator,
      asset.date,
      asset.license,
      asset.licenseUrl,
      asset.changes,
    ].filter(Boolean).join(" · "),
    url: asset.sourceUrl,
  }));
  const sources: HistorySource[] = [...book.sources, ...imageSources];
  return {
    cover: book.cover,
    events: book.events,
    sources,
    updatedAt: "2026-09-05",
    pages: [
      ...pages.map((page) => ({
        ...page,
        sourceIds: [
          ...page.sourceIds,
          ...(page.media
            ? [imageSources[images.findIndex((asset) => asset.localPath === page.media?.localPath)].id]
            : []),
        ],
      })),
      {
        title: "Nguồn tham khảo",
        body: "Nội dung được biên soạn từ các hồ sơ dưới đây. Ảnh được ghi rõ người tạo, thời điểm chụp và giấy phép. Chọn liên kết để xem bản gốc khi có Internet; bản trình chiếu đã lưu nội dung và ảnh trên máy.",
        sourceIds: sources.map((source) => source.id),
      },
    ],
  };
}

export const HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    id: "preparation",
    period: "1911–1929",
    title: "Hành trình tìm đường",
    summary:
      "Hành trình tìm đường cứu nước kết nối lý luận cách mạng với phong trào công nhân và yêu nước, tạo nền tảng cho một tổ chức thống nhất.",
    keyPoints: [
      "Những trải nghiệm quốc tế mở rộng tầm nhìn về độc lập dân tộc.",
      "Tư tưởng giải phóng gắn với lực lượng quần chúng và tổ chức.",
      "Báo chí, đào tạo và truyền bá lý luận tạo mạng lưới chuẩn bị.",
    ],
    takeaway: "Một thay đổi lớn thường bắt đầu từ việc hình thành tư tưởng và mạng lưới con người.",
    heroImage: media.nguyenAiQuoc,
    supportingMedia: [media.congress, media.tours],
    lightingPreset: "ember",
    motif: "journey",
    accent: "#B8794F",
    ...chapterBook("preparation"),
  },
  {
    id: "revolution",
    period: "1930–1945",
    title: "Mùa thu độc lập",
    summary:
      "Sự ra đời của Đảng tạo trung tâm lãnh đạo; cao trào cách mạng và thời cơ năm 1945 đưa khát vọng độc lập thành một nhà nước mới.",
    keyPoints: [
      "Hợp nhất các tổ chức cộng sản thành một lực lượng lãnh đạo.",
      "Phong trào quần chúng được tổ chức qua nhiều cao trào lịch sử.",
      "Thắng lợi của Cách mạng Tháng Tám mở ra kỷ nguyên độc lập.",
    ],
    takeaway: "Tổ chức thống nhất giúp biến sức mạnh phân tán thành hành động có định hướng.",
    heroImage: media.baDinh,
    supportingMedia: [media.proclaiming, media.hoAndGiap],
    lightingPreset: "gold",
    motif: "press",
    accent: "#D7B35C",
    ...chapterBook("revolution"),
  },
  {
    id: "resistance",
    period: "1945–1954",
    title: "Kháng chiến và kiến quốc",
    summary:
      "Nhà nước non trẻ vừa bảo vệ nền độc lập vừa xây dựng lực lượng, hậu phương và đời sống mới trong cuộc kháng chiến trường kỳ.",
    keyPoints: [
      "Giữ vững chính quyền và củng cố nền độc lập vừa giành được.",
      "Hậu phương, dân công và thế trận nhân dân tạo sức bền.",
      "Chiến thắng Điện Biên Phủ làm thay đổi cục diện Đông Dương.",
    ],
    takeaway: "Kiến quốc và bảo vệ Tổ quốc là hai nhiệm vụ gắn bó trong cùng một tiến trình.",
    heroImage: media.dienBien,
    supportingMedia: [media.dienBienMuseum, media.giapReview],
    lightingPreset: "terrain",
    motif: "terrain",
    accent: "#D7C997",
    ...chapterBook("resistance"),
  },
  {
    id: "reunification",
    period: "1954–1975",
    title: "Non sông liền một dải",
    summary:
      "Đất nước đi qua một giai đoạn chia cắt và chiến tranh, hướng tới mục tiêu độc lập, giải phóng miền Nam và thống nhất non sông.",
    keyPoints: [
      "Miền Bắc xây dựng hậu phương và tiếp tục chi viện cho tiền tuyến.",
      "Phong trào đấu tranh ở miền Nam phát triển qua nhiều bước ngoặt.",
      "Mùa Xuân 1975 kết thúc chiến tranh, mở ra thời kỳ thống nhất.",
    ],
    takeaway: "Ký ức thống nhất được tạo nên bởi nhiều thế hệ và nhiều không gian của đất nước.",
    heroImage: media.tank,
    supportingMedia: [media.palace, media.evacuation],
    lightingPreset: "bridge",
    motif: "bridge",
    accent: "#E9DFC5",
    ...chapterBook("reunification"),
  },
  {
    id: "renovation",
    period: "1975–2000",
    title: "Đất nước chuyển mình",
    summary:
      "Sau chiến tranh, xã hội tập trung khắc phục hậu quả, ổn định đời sống và mở ra tư duy Đổi mới để phát triển trong điều kiện mới.",
    keyPoints: [
      "Tái thiết đòi hỏi sức bền của cộng đồng và các thiết chế xã hội.",
      "Đổi mới đặt trọng tâm vào giải phóng nguồn lực và hiệu quả phát triển.",
      "Cuối thế kỷ XX chứng kiến bước chuyển từ khép kín sang mở cửa.",
    ],
    takeaway: "Đổi mới là năng lực tự điều chỉnh để thích ứng mà vẫn giữ mục tiêu phát triển dài hạn.",
    heroImage: media.renovation,
    supportingMedia: [media.hanoiNineties, media.hanoiStreet],
    lightingPreset: "renewal",
    motif: "motion",
    accent: "#C38B65",
    ...chapterBook("renovation"),
  },
  {
    id: "integration",
    period: "2000–nay",
    title: "Việt Nam kết nối",
    summary:
      "Bước vào thế kỷ XXI, Việt Nam mở rộng hợp tác, chuyển đổi phương thức phát triển và kết nối sâu hơn với khu vực, thế giới.",
    keyPoints: [
      "Hội nhập mở thêm không gian hợp tác, học hỏi và trao đổi.",
      "Phát triển đặt cạnh yêu cầu đổi mới sáng tạo và bền vững.",
      "Công dân trẻ tiếp tục viết tiếp câu chuyện lịch sử bằng lựa chọn hôm nay.",
    ],
    takeaway: "Lịch sử không nằm yên trong tủ kính; nó trở thành trách nhiệm và năng lực của thế hệ hiện tại.",
    heroImage: media.skyline,
    supportingMedia: [media.dragonBridge, media.hanoiMetro],
    lightingPreset: "network",
    motif: "network",
    accent: "#C0C8CE",
    ...chapterBook("integration"),
  },
];

export const HISTORY_SOURCE_LIST = [
  {
    title: "Lịch sử biên niên Đảng Cộng sản Việt Nam — Tập 1",
    url: "https://tulieuvankien.dangcongsan.vn/van-kien-tu-lieu-ve-dang/book/lich-su-dang/lich-su-bien-nien-dang-cong-san-viet-nam-tap-1-18",
  },
  {
    title: "Lịch sử biên niên Đảng Cộng sản Việt Nam — Tập 2",
    url: "https://tulieuvankien.dangcongsan.vn/van-kien-tu-lieu-ve-dang/book/lich-su-dang/lich-su-bien-nien-dang-cong-san-viet-nam-tap-2-175",
  },
  {
    title: "Hồ sơ ngày thành lập Đảng 3/2/1930",
    url: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342",
  },
  {
    title: "Bảo tàng Hồ Chí Minh — tác phẩm, bảo vật quốc gia",
    url: "https://baotanghochiminh.vn/ra-mat-bo-sach-ho-chi-minh-tac-pham-bao-vat-quoc-gia.htm",
  },
  {
    title: "Cục Văn thư và Lưu trữ Nhà nước — Việt Nam thời kỳ 1945–1946",
    url: "https://www.archives.org.vn/luu-tru-viet-nam-thoi-ky-1945-1946.htm",
  },
  // Keep the original bibliography above; expose every chapter citation as well.
  ...HISTORY_CHAPTERS.flatMap((chapter) => chapter.sources.map(({ title, url }) => ({ title, url }))),
] as const;

export function getChapter(chapterId: ChapterId): HistoryChapter {
  return HISTORY_CHAPTERS.find((chapter) => chapter.id === chapterId) ?? HISTORY_CHAPTERS[0];
}
