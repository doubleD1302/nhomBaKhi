// Dữ liệu quản lý dự án Đề tài 25 - Nền tảng việc làm bán thời gian cho sinh viên
// INT4211 - Lập trình trên các thiết bị di động (HK261)

window.PROJECT_DATA = {
    title: "Nền tảng việc làm bán thời gian cho sinh viên",
    subject: "INT4211 – Lập trình trên các thiết bị di động (HK261)",
    topicId: 25,
    repoUrl: "https://github.com/doubleD1302/nhomBaKhi",
    renderUrl: "https://nhombakhi-backend.onrender.com",
    supabaseUrl: "aws-0-ap-southeast-1.pooler.supabase.com:5432",
    totalPlannedHours: 340,
    totalCapacityHours: 384,
    reserveHours: 44,
    members: [
  {
    "id": "TV01",
    "defaultCode": "BK-TV01",
    "name": "Backend & Hạ Tầng Cloud",
    "shortTitle": "Backend & Cloud",
    "role": "Phát triển máy chủ REST API, Xác thực JWT/bcrypt, Quản lý hồ sơ NTD, Tin tuyển dụng, Kiểm duyệt và Xử lý báo cáo lừa đảo, Triển khai Cloud Render 24/7 (Tuân thủ UC01, UC02, UC05, UC10, UC11, UC12, UC16-UC21).",
    "avatarColor": "#1B365D",
    "badgeBg": "#EBF1FA",
    "badgeBorder": "#2E6B9E",
    "icon": "server",
    "plannedHours": 84,
    "backup": "TV04",
    "techStack": [
      "Node.js 20",
      "Express 4",
      "JWT",
      "bcrypt",
      "PostgreSQL pg",
      "Render Cloud",
      "Supabase Storage"
    ],
    "assignedTasksCount": 16,
    "deliverables": [
      "Module mã nguồn Backend Node.js/Express phụ trách",
      "Tài liệu đặc tả hợp đồng API (api.md) chuẩn REST",
      "URL máy chủ chạy online có HTTPS trên Render",
      "Mục 1, 4, 6 trong báo cáo tổng kết đồ án"
    ],
    "roleChecklist": [
      {
        "id": "tv01_1",
        "text": "Khởi tạo Express server với biến môi trường .env (không lộ SECRET)",
        "done": false
      },
      {
        "id": "tv01_2",
        "text": "Cấu hình JWT Token & bcrypt băm mật khẩu bảo mật",
        "done": false
      },
      {
        "id": "tv01_3",
        "text": "Deploy Web Service lên Render kết nối Supabase Pooler (IPv4 cổng 5432)",
        "done": false
      },
      {
        "id": "tv01_4",
        "text": "Endpoint kiểm tra sức khỏe /health hoạt động HTTPS công khai",
        "done": false
      },
      {
        "id": "tv01_5",
        "text": "API duyệt NTD kèm giấy phép, địa chỉ và MST",
        "done": false
      },
      {
        "id": "tv01_6",
        "text": "API duyệt tin tuyển dụng theo bộ tiêu chí chống lừa đảo (từ chối có lý do)",
        "done": false
      },
      {
        "id": "tv01_7",
        "text": "API gắn cờ, gỡ tin vi phạm và khóa tài khoản NTD tái phạm",
        "done": false
      },
      {
        "id": "tv01_8",
        "text": "API sinh viên báo cáo lừa đảo và quản trị lưu kết luận hồ sơ",
        "done": false
      }
    ]
  },
  {
    "id": "TV02",
    "defaultCode": "BK-TV02",
    "name": "Ứng Dụng Android (Admin & NTD)",
    "shortTitle": "App Android",
    "role": "Toàn bộ App Android Java + XML Layout (minSdk 24), Phân quyền 2 vai trò QUAN_TRI và NHA_TUYEN_DUNG, 2 danh sách RecyclerView, Duyệt hồ sơ NTD/tin, Quản lý ca, Duyệt chấm công/lương, Biểu đồ thống kê (Tuân thủ Tiêu chuẩn C.1 và UC11-UC21).",
    "avatarColor": "#2E6B9E",
    "badgeBg": "#E8F3FA",
    "badgeBorder": "#1E4E79",
    "icon": "smartphone",
    "plannedHours": 85,
    "backup": "TV03",
    "techStack": [
      "Android Studio",
      "Java",
      "XML Layout",
      "Retrofit 2",
      "Gson",
      "minSdk 24",
      "MPAndroidChart"
    ],
    "assignedTasksCount": 16,
    "deliverables": [
      "Toàn bộ mã nguồn App Android Studio (Java + XML)",
      "File cài đặt APK Release trên máy thật",
      "Ảnh chụp màn hình minh chứng 10 tiêu chí C.1",
      "Mục 2, 5 (phần Android) trong báo cáo cuối kỳ"
    ],
    "roleChecklist": [
      {
        "id": "tv02_1",
        "text": "Cấu hình Retrofit 2 + Gson gọi API backend Render",
        "done": false
      },
      {
        "id": "tv02_2",
        "text": "Màn hình đăng nhập phân quyền QUAN_TRI và NHA_TUYEN_DUNG",
        "done": false
      },
      {
        "id": "tv02_3",
        "text": "Tối thiểu 2 danh sách dùng RecyclerView kèm ViewHolder/Adapter",
        "done": false
      },
      {
        "id": "tv02_4",
        "text": "Màn hình duyệt NTD và duyệt tin tuyển dụng kèm lý do",
        "done": false
      },
      {
        "id": "tv02_5",
        "text": "Màn hình quản lý ca làm và duyệt hồ sơ ứng tuyển của NTD",
        "done": false
      },
      {
        "id": "tv02_6",
        "text": "Màn hình xem bảng chấm công và duyệt tay khi GPS vượt 200m",
        "done": false
      },
      {
        "id": "tv02_7",
        "text": "Màn hình báo cáo thống kê vẽ biểu đồ (ngành nghề, lương TB, tin bị gỡ)",
        "done": false
      },
      {
        "id": "tv02_8",
        "text": "Giữ dữ liệu form khi xoay màn hình (onSaveInstanceState / ViewModel)",
        "done": false
      }
    ]
  },
  {
    "id": "TV03",
    "defaultCode": "BK-TV03",
    "name": "Ứng Dụng Flutter (Client Sinh Viên)",
    "shortTitle": "App Flutter",
    "role": "Toàn bộ App Flutter Dart, Phân hệ Sinh viên, Tạo hồ sơ cá nhân, Khung giờ rảnh theo tuần (có Undo SnackBar), Tìm việc đa tiêu chí & lọc phù hợp lịch rảnh, Nhận ca, Chấm công định vị GPS Haversine, Xem lương, Báo cáo lừa đảo (Tuân thủ Tiêu chuẩn C.2 và UC01-UC10).",
    "avatarColor": "#087F8C",
    "badgeBg": "#E6F5F7",
    "badgeBorder": "#06616B",
    "icon": "layers",
    "plannedHours": 85,
    "backup": "TV02",
    "techStack": [
      "Flutter 3.35+",
      "Dart 3",
      "Material Design 3",
      "Geolocator GPS",
      "Http / Dio",
      "Shared Preferences"
    ],
    "assignedTasksCount": 16,
    "deliverables": [
      "Toàn bộ mã nguồn App Flutter hoàn chỉnh",
      "File cài đặt APK Release trên điện thoại thật",
      "Kịch bản và Video clip demo hệ thống 5–8 phút",
      "Log kiểm tra flutter analyze sạch lỗi (0 errors)",
      "Mục 5 (phần Flutter) trong báo cáo cuối kỳ"
    ],
    "roleChecklist": [
      {
        "id": "tv03_1",
        "text": "Khởi tạo Flutter 3.35+ với cấu trúc thư mục phân lớp rõ ràng",
        "done": false
      },
      {
        "id": "tv03_2",
        "text": "Đăng ký/đăng nhập sinh viên, lưu token an toàn",
        "done": false
      },
      {
        "id": "tv03_3",
        "text": "Màn hình hồ sơ sinh viên và thiết lập khung giờ rảnh theo thứ trong tuần",
        "done": false
      },
      {
        "id": "tv03_4",
        "text": "Thao tác xóa khung giờ rảnh có Dialog xác nhận và SnackBar Undo (C.2)",
        "done": false
      },
      {
        "id": "tv03_5",
        "text": "Tìm kiếm việc làm có bộ lọc khu vực, mức lương và phuHopLich=true",
        "done": false
      },
      {
        "id": "tv03_6",
        "text": "Chi tiết tin tuyển dụng hiển thị nhãn 'Đã xác minh'",
        "done": false
      },
      {
        "id": "tv03_7",
        "text": "Màn hình nhận ca làm việc và xem lịch tuần của sinh viên",
        "done": false
      },
      {
        "id": "tv03_8",
        "text": "Tích hợp GPS lấy tọa độ check-in/check-out gửi về server",
        "done": false
      }
    ]
  },
  {
    "id": "TV04",
    "defaultCode": "BK-TV04",
    "name": "Cơ Sở Dữ Liệu & Kiểm Thử QA",
    "shortTitle": "CSDL & Kiểm Thử QA",
    "role": "Thiết kế & Quản trị CSDL PostgreSQL trên Supabase (ERD 14-21 bảng chuẩn theo ThietKe_De25), Nạp bộ dữ liệu mẫu (Seed) đủ 5 định mức, Backend Transaction nhận ca bằng khóa dòng chống overbooking, Backend tính khoảng cách GPS Haversine (200m), Backend tính lương theo kỳ, Điều phối kiểm thử hồi quy 25 ca.",
    "avatarColor": "#D97706",
    "badgeBg": "#FEF6E8",
    "badgeBorder": "#B45309",
    "icon": "database",
    "plannedHours": 86,
    "backup": "TV01",
    "techStack": [
      "PostgreSQL 16",
      "Supabase",
      "SQL Transactions",
      "Haversine Math",
      "Jest / Postman",
      "QA Test Suite"
    ],
    "assignedTasksCount": 16,
    "deliverables": [
      "Script schema.sql chuẩn 12 bảng có khóa ngoại thật",
      "Script seed.sql đạt đủ 5 định mức dữ liệu mẫu",
      "Module backend Transaction nhận ca và tính lương",
      "Bảng tổng hợp kết quả kiểm thử thực tế (≥25 ca)",
      "Mục 3, 7, 8 trong báo cáo cuối kỳ"
    ],
    "roleChecklist": [
      {
        "id": "tv04_1",
        "text": "Thiết kế ERD 12 bảng và viết schema.sql chạy được từ đầu",
        "done": false
      },
      {
        "id": "tv04_2",
        "text": "Xây dựng seed.sql đủ: 25 NTD, 80 tin, 200 SV, 300 ca, 500 chấm công",
        "done": false
      },
      {
        "id": "tv04_3",
        "text": "Viết API nhận ca bọc trong Transaction có SELECT ... FOR UPDATE chống đầy/trùng",
        "done": false
      },
      {
        "id": "tv04_4",
        "text": "Viết API chấm công tính khoảng cách Haversine (ngưỡng 200m -> CAN_DUYET_TAY)",
        "done": false
      },
      {
        "id": "tv04_5",
        "text": "Viết API tính lương theo kỳ bằng Transaction (giờ duyệt × đơn giá giờ)",
        "done": false
      },
      {
        "id": "tv04_6",
        "text": "Xây dựng bộ kịch bản kiểm thử tích hợp xuyên suốt từ CSDL -> API -> 2 App",
        "done": false
      },
      {
        "id": "tv04_7",
        "text": "Thực hiện và lưu kết quả thực tế tối thiểu 25 ca kiểm thử (Đạt/Không đạt)",
        "done": false
      },
      {
        "id": "tv04_8",
        "text": "Kiểm tra khôi phục schema/seed trên Supabase trước buổi bảo vệ",
        "done": false
      }
    ]
  }
],
    milestones: [
  {
    "week": 8,
    "name": "Khởi động & Đăng ký đề",
    "deadline": "23:59 Chủ nhật Tuần 8",
    "deliverable": "Danh sách 4 thành viên, Mã đề 25, Link repo GitHub 3 nhánh (backend/, admin-android/, client-flutter/)",
    "isGraded": false,
    "completed": true,
    "note": "Đăng ký trên hệ thống LMS theo hướng dẫn môn học."
  },
  {
    "week": 9,
    "name": "Chốt Phân tích Thiết kế & Deploy Sớm",
    "deadline": "Hết Tuần 9",
    "deliverable": "Sơ đồ Use Case + Sơ đồ CSDL ERD 12 bảng + Bảng phân công công việc. Mục tiêu nội bộ: Deploy sớm backend lên Render.",
    "isGraded": false,
    "completed": false,
    "note": "Hạn cuối đổi đề; Chốt hợp đồng API ban đầu (api.md)."
  },
  {
    "week": 11,
    "name": "KIỂM TRA GIỮA KỲ ĐỒ ÁN (CÓ ĐIỂM)",
    "deadline": "Buổi thực hành Tuần 11",
    "deliverable": "Backend online HTTPS trên Render + >= 3 API nghiệp vụ thật + >= 2 màn hình mỗi app kết nối CSDL chung.",
    "isGraded": true,
    "gradeWeight": "1.0 điểm / 10 điểm đồ án",
    "completed": false,
    "warning": "MỐC BẮT BUỘC, KHÔNG CHO NỘP BÙ! Cần test sẵn đường dẫn HTTPS và dữ liệu trước buổi chấm.",
    "note": "Đánh giá khả năng tích hợp hệ thống đa nền tảng sớm."
  },
  {
    "week": 13,
    "name": "Bản Chạy Nghiệp Vụ Tích Hợp",
    "deadline": "Hết Tuần 13",
    "deliverable": "Cả 2 app gọi API thật; Demo trọn vẹn luồng chính: Đăng tin -> Duyệt -> Ứng tuyển -> Nhận ca -> Chấm công GPS -> Duyệt lương.",
    "isGraded": false,
    "completed": false,
    "note": "Thử nghiệm 2 điểm nhấn kỹ thuật (GPS Haversine + Lọc lịch rảnh)."
  },
  {
    "week": 15,
    "name": "BẢO VỆ ĐỒ ÁN CUỐI KỲ",
    "deadline": "Buổi bảo vệ Tuần 15",
    "deliverable": "8 sản phẩm bàn giao (Mục D.1): Mã nguồn repo, 2 file APK Release, Báo cáo PDF 20-35 trang, Video demo 5-8 phút, >=25 test case thật, Bảng phân công có chữ ký.",
    "isGraded": true,
    "gradeWeight": "40% điểm tổng học phần INT4211",
    "completed": false,
    "note": "Mỗi nhóm thuyết trình 10 phút + 10 phút hỏi đáp trực tiếp từng thành viên."
  }
],
    tasks: [
  {
    "id": "T001",
    "start": 8,
    "end": 8,
    "owner": "TV01",
    "hours": 4,
    "deps": [],
    "req": [
      "R01",
      "R28"
    ],
    "name": "Khởi động, đăng ký đề, lập repo và quy ước",
    "done": "Thông tin LMS, link repo, danh sách 4 tài khoản và biên bản khởi động",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T002",
    "start": 8,
    "end": 8,
    "owner": "TV01",
    "hours": 6,
    "deps": [
      "T001"
    ],
    "req": [
      "R15",
      "R16"
    ],
    "name": "Khởi tạo Express, JWT/bcrypt và hợp đồng API",
    "done": "Auth và /health chạy local; api.md bản đầu, mã lỗi và vai trò thống nhất",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T003",
    "start": 8,
    "end": 8,
    "owner": "TV02",
    "hours": 5,
    "deps": [
      "T001"
    ],
    "req": [
      "R02"
    ],
    "name": "Phác thảo Android và ma trận quyền màn hình",
    "done": "Sơ đồ tối thiểu 6 màn hình; phân biệt QUAN_TRI và NHA_TUYEN_DUNG",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T004",
    "start": 8,
    "end": 8,
    "owner": "TV02",
    "hours": 4,
    "deps": [
      "T003"
    ],
    "req": [
      "R02",
      "R03"
    ],
    "name": "Khởi tạo Java/XML và học Retrofit từ phụ lục 2",
    "done": "minSdk 24, quyền Internet, khung điều hướng, cấu hình API mẫu",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T005",
    "start": 8,
    "end": 8,
    "owner": "TV03",
    "hours": 5,
    "deps": [
      "T001"
    ],
    "req": [
      "R10",
      "R11"
    ],
    "name": "Phác thảo Flutter và luồng sinh viên",
    "done": "Wireframe hồ sơ, lịch rảnh, tìm việc, ứng tuyển, nhận ca và chấm công",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T006",
    "start": 8,
    "end": 8,
    "owner": "TV03",
    "hours": 4,
    "deps": [
      "T005"
    ],
    "req": [
      "R10"
    ],
    "name": "Khởi tạo Flutter và học gọi API từ phụ lục 3",
    "done": "Dart/Flutter đúng hướng dẫn; khung API và điều hướng cơ bản",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T007",
    "start": 8,
    "end": 8,
    "owner": "TV04",
    "hours": 6,
    "deps": [
      "T001"
    ],
    "req": [
      "R17"
    ],
    "name": "Thiết kế ERD và bảng dữ liệu đề 25",
    "done": "ERD đủ 12 bảng chính, khóa ngoại; đề xuất tọa độ nơi làm và lịch sử duyệt",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T008",
    "start": 8,
    "end": 8,
    "owner": "TV04",
    "hours": 4,
    "deps": [
      "T007"
    ],
    "req": [
      "R22",
      "R23"
    ],
    "name": "Khảo sát GPS, khoảng cách và giao khoảng thời gian",
    "done": "Đặc tả ca kiểm tra 199/200/201m và giao thời gian; dữ liệu tọa độ giả lập an toàn",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T009",
    "start": 9,
    "end": 9,
    "owner": "TV01",
    "hours": 6,
    "deps": [
      "T002",
      "T007",
      "T015"
    ],
    "req": [
      "R15",
      "R17",
      "R27"
    ],
    "name": "Hoàn thiện auth và deploy Render kết nối Supabase",
    "done": "/health và đăng nhập HTTPS hoạt động; cấu hình pooler theo hướng dẫn",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T010",
    "start": 9,
    "end": 9,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T009"
    ],
    "req": [
      "R04",
      "R05"
    ],
    "name": "API nhà tuyển dụng và tin tuyển dụng cơ bản",
    "done": "Tạo/duyệt NTD, tạo/duyệt tin; tin bị từ chối có lý do",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T011",
    "start": 9,
    "end": 9,
    "owner": "TV02",
    "hours": 7,
    "deps": [
      "T004",
      "T009",
      "T010"
    ],
    "req": [
      "R02",
      "R03",
      "R04"
    ],
    "name": "Android đăng nhập và danh sách nhà tuyển dụng từ API",
    "done": "2 màn hình thật; lưu token, RecyclerView, đủ trạng thái tải/lỗi",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T012",
    "start": 9,
    "end": 9,
    "owner": "TV02",
    "hours": 4,
    "deps": [
      "T003",
      "T007"
    ],
    "req": [
      "R01",
      "R02"
    ],
    "name": "Chốt use case và rà soát màn hình theo yêu cầu",
    "done": "Sơ đồ use case, ma trận màn hình–vai trò và bảng phân công bản nháp",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T013",
    "start": 9,
    "end": 9,
    "owner": "TV03",
    "hours": 7,
    "deps": [
      "T006",
      "T009",
      "T010"
    ],
    "req": [
      "R10",
      "R11"
    ],
    "name": "Flutter đăng nhập và danh sách tin từ API",
    "done": "2 màn hình thật, token lưu theo hướng dẫn, danh sách từ backend chung",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T014",
    "start": 9,
    "end": 9,
    "owner": "TV03",
    "hours": 4,
    "deps": [
      "T005",
      "T008"
    ],
    "req": [
      "R11",
      "R23"
    ],
    "name": "Form hồ sơ và lịch rảnh; đặc tả bộ lọc phù hợp",
    "done": "Form validator; quy tắc ngày/giờ, cùng múi giờ và kiểm tra ca nằm trọn khung rảnh",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T015",
    "start": 9,
    "end": 9,
    "owner": "TV04",
    "hours": 7,
    "deps": [
      "T007",
      "T008"
    ],
    "req": [
      "R17",
      "R18"
    ],
    "name": "Viết schema và seed nhỏ cho luồng tích hợp",
    "done": "schema.sql và seed.sql chạy trên CSDL thử; ≥8 bảng có FK, mục tiêu đủ 12 bảng đề",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T016",
    "start": 9,
    "end": 9,
    "owner": "TV04",
    "hours": 4,
    "deps": [
      "T009",
      "T011",
      "T013",
      "T015"
    ],
    "req": [
      "R27",
      "R28"
    ],
    "name": "Kiểm thử xuyên suốt và lưu minh chứng mốc tuần 9",
    "done": "CSDL → API online → 2 app; ERD/use case/phân công sẵn sàng nộp",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T017",
    "start": 10,
    "end": 10,
    "owner": "TV01",
    "hours": 7,
    "deps": [
      "T010"
    ],
    "req": [
      "R04",
      "R05",
      "R06"
    ],
    "name": "API kiểm duyệt, gắn cờ, gỡ tin và khóa NTD",
    "done": "Role/ownership chặn API sai quyền, khóa NTD có hiệu lực phía server",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T018",
    "start": 10,
    "end": 10,
    "owner": "TV01",
    "hours": 4,
    "deps": [
      "T014",
      "T015"
    ],
    "req": [
      "R11",
      "R23"
    ],
    "name": "API hồ sơ/lịch rảnh và tìm việc theo khu vực, lương, lịch",
    "done": "CRUD hồ sơ và lịch rảnh đúng chủ sở hữu; tìm tin theo nhóm/khu vực/lương và ca phù hợp, có test biên",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T019",
    "start": 10,
    "end": 10,
    "owner": "TV02",
    "hours": 8,
    "deps": [
      "T011",
      "T017"
    ],
    "req": [
      "R04",
      "R05",
      "R06"
    ],
    "name": "Android duyệt NTD, tin và xử lý vi phạm",
    "done": "Danh sách NTD/tin dùng RecyclerView; lý do từ chối, dialog xác nhận",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T020",
    "start": 10,
    "end": 10,
    "owner": "TV02",
    "hours": 3,
    "deps": [
      "T019"
    ],
    "req": [
      "R02",
      "R03"
    ],
    "name": "Android trạng thái lỗi, token hết hạn và form xoay màn hình",
    "done": "Giữ nội dung form khi xoay; 401 về đăng nhập, lỗi mạng có thử lại",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T021",
    "start": 10,
    "end": 10,
    "owner": "TV03",
    "hours": 8,
    "deps": [
      "T013",
      "T014",
      "T018"
    ],
    "req": [
      "R10",
      "R11"
    ],
    "name": "Flutter hồ sơ, lịch rảnh, tìm kiếm và chi tiết tin",
    "done": "API thật; nhãn đã xác minh; ít nhất 2 ListView.builder theo kế hoạch màn hình",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T022",
    "start": 10,
    "end": 10,
    "owner": "TV03",
    "hours": 3,
    "deps": [
      "T006",
      "T008"
    ],
    "req": [
      "R13",
      "R22"
    ],
    "name": "Thử nghiệm lấy vị trí và xử lý từ chối quyền",
    "done": "PoC trên thiết bị; không tự đánh dấu chấm công khi thiếu tọa độ",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T023",
    "start": 10,
    "end": 10,
    "owner": "TV04",
    "hours": 7,
    "deps": [
      "T015",
      "T008"
    ],
    "req": [
      "R12",
      "R19"
    ],
    "name": "API ca và nhận ca bằng transaction",
    "done": "Chặn đầy ca/trùng ca; 2 yêu cầu đồng thời tranh suất cuối chỉ 1 thành công",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T024",
    "start": 10,
    "end": 10,
    "owner": "TV04",
    "hours": 4,
    "deps": [
      "T023"
    ],
    "req": [
      "R13",
      "R22"
    ],
    "name": "API chấm công phiên bản đầu và kiểm tra khoảng cách",
    "done": "Server tự tính mét; ngoài ngưỡng vẫn lưu nhưng chuyển cần duyệt tay",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T025",
    "start": 11,
    "end": 11,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T017"
    ],
    "req": [
      "R12"
    ],
    "name": "API ứng tuyển và cập nhật trạng thái",
    "done": "Chặn ứng tuyển trùng; NTD chỉ truy cập hồ sơ của tin mình",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T026",
    "start": 11,
    "end": 11,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T009",
      "T018",
      "T023",
      "T024",
      "T025"
    ],
    "req": [
      "R27"
    ],
    "name": "Chuẩn bị API/demo mốc tuần 11",
    "done": "≥3 API nghiệp vụ thật + /health; log/collection và đường dẫn HTTPS từ máy khác",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T027",
    "start": 11,
    "end": 11,
    "owner": "TV02",
    "hours": 8,
    "deps": [
      "T019",
      "T023",
      "T025"
    ],
    "req": [
      "R07",
      "R12"
    ],
    "name": "Android quản lý ca và hồ sơ ứng tuyển của NTD",
    "done": "Tạo/sửa ca và duyệt hồ sơ theo phạm vi sở hữu, kiểm tra số người đã nhận",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T028",
    "start": 11,
    "end": 11,
    "owner": "TV02",
    "hours": 3,
    "deps": [
      "T020",
      "T026",
      "T027"
    ],
    "req": [
      "R27"
    ],
    "name": "Kiểm tra và ghi hình Android cho mốc tuần 11",
    "done": "≥2 màn hình gọi backend online, dữ liệu thật, có build cài thử",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T029",
    "start": 11,
    "end": 11,
    "owner": "TV03",
    "hours": 8,
    "deps": [
      "T021",
      "T023",
      "T025"
    ],
    "req": [
      "R12"
    ],
    "name": "Flutter ứng tuyển, trạng thái và nhận ca",
    "done": "Nhận ca đúng điều kiện, hiển thị đầy/trùng; lịch tuần lấy từ API",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T030",
    "start": 11,
    "end": 11,
    "owner": "TV03",
    "hours": 3,
    "deps": [
      "T026",
      "T029"
    ],
    "req": [
      "R27"
    ],
    "name": "Kiểm tra và ghi hình Flutter cho mốc tuần 11",
    "done": "≥2 màn hình thật; thử thay đổi Admin → Client thấy sau tải lại",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T031",
    "start": 11,
    "end": 11,
    "owner": "TV04",
    "hours": 7,
    "deps": [
      "T024",
      "T022"
    ],
    "req": [
      "R13",
      "R22"
    ],
    "name": "Hoàn thiện chấm công định vị và bộ test biên",
    "done": "GPS hợp lệ, khoảng cách biên, check-out trước in, gửi lặp và chấm hộ bị kiểm soát",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T032",
    "start": 11,
    "end": 11,
    "owner": "TV04",
    "hours": 4,
    "deps": [
      "T026",
      "T028",
      "T030",
      "T031"
    ],
    "req": [
      "R27"
    ],
    "name": "Chạy kiểm tra mốc tuần 11 và lưu biên bản",
    "done": "Đường dẫn + ảnh/video + collection + trạng thái thật; nộp đúng lịch LMS",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T033",
    "start": 12,
    "end": 12,
    "owner": "TV01",
    "hours": 6,
    "deps": [
      "T017"
    ],
    "req": [
      "R09"
    ],
    "name": "API báo cáo lừa đảo, kết luận và hồ sơ xử lý",
    "done": "Sinh viên gửi báo cáo; quản trị lưu kết luận, liên kết tin/NTD liên quan",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T034",
    "start": 12,
    "end": 12,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T017",
      "T023",
      "T031"
    ],
    "req": [
      "R16"
    ],
    "name": "Rà soát JWT, SQL tham số hóa và quyền sở hữu",
    "done": "Gọi trực tiếp API sai vai trò/ID người khác bị chặn; không lộ mật khẩu/khóa",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T035",
    "start": 12,
    "end": 12,
    "owner": "TV02",
    "hours": 8,
    "deps": [
      "T027",
      "T031",
      "T039"
    ],
    "req": [
      "R08",
      "R13"
    ],
    "name": "Android bảng chấm công, duyệt tay và bảng lương",
    "done": "Xem vị trí/khoảng cách/lý do; duyệt tay; duyệt chi trả có quyền quản trị",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T036",
    "start": 12,
    "end": 12,
    "owner": "TV02",
    "hours": 3,
    "deps": [
      "T033"
    ],
    "req": [
      "R09"
    ],
    "name": "Android báo cáo lừa đảo và hồ sơ vụ việc",
    "done": "Danh sách/chi tiết/kết luận; không mất nội dung khi đổi màn hình",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T037",
    "start": 12,
    "end": 12,
    "owner": "TV03",
    "hours": 8,
    "deps": [
      "T022",
      "T029",
      "T031"
    ],
    "req": [
      "R13",
      "R22"
    ],
    "name": "Flutter lịch ca và check-in/check-out có vị trí",
    "done": "Xin quyền đúng luồng, API thật; hiển thị cần duyệt tay khi ở xa",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T038",
    "start": 12,
    "end": 12,
    "owner": "TV03",
    "hours": 3,
    "deps": [
      "T033",
      "T039"
    ],
    "req": [
      "R08",
      "R09"
    ],
    "name": "Flutter bảng lương và gửi báo cáo lừa đảo",
    "done": "Giờ × đơn giá do server tính, gửi bằng chứng và phản hồi kết quả",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T039",
    "start": 12,
    "end": 12,
    "owner": "TV04",
    "hours": 8,
    "deps": [
      "T023",
      "T031"
    ],
    "req": [
      "R08",
      "R19"
    ],
    "name": "API tính/duyệt lương theo kỳ bằng transaction",
    "done": "Chỉ tính giờ hợp lệ đã duyệt; tính lại không nhân đôi, lưu đơn giá áp dụng",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T040",
    "start": 12,
    "end": 12,
    "owner": "TV04",
    "hours": 3,
    "deps": [
      "T015",
      "T024"
    ],
    "req": [
      "R18"
    ],
    "name": "Mở rộng seed đủ quy mô đề 25",
    "done": "25 NTD, 80 tin cả từ chối, 200 SV có lịch rảnh, 300 ca, 500 chấm công",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T041",
    "start": 13,
    "end": 13,
    "owner": "TV01",
    "hours": 6,
    "deps": [
      "T033",
      "T039"
    ],
    "req": [
      "R14"
    ],
    "name": "API thống kê và tài liệu API đầy đủ",
    "done": "Ngành tuyển nhiều, lương trung bình theo nhóm, tin bị gỡ; collection dùng được",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T042",
    "start": 13,
    "end": 13,
    "owner": "TV01",
    "hours": 4,
    "deps": [
      "T034",
      "T041",
      "T040"
    ],
    "req": [
      "R27"
    ],
    "name": "Ổn định backend và cấu hình bản tuần 13",
    "done": "API online và dữ liệu seed đủ; backup trước thay đổi, ghi tag ứng viên",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T043",
    "start": 13,
    "end": 13,
    "owner": "TV02",
    "hours": 7,
    "deps": [
      "T035",
      "T036",
      "T041"
    ],
    "req": [
      "R14"
    ],
    "name": "Android dashboard và báo cáo biểu đồ",
    "done": "Biểu đồ từ API thật; tổng số khớp dữ liệu, ít nhất 6 màn hình hoàn chỉnh",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T044",
    "start": 13,
    "end": 13,
    "owner": "TV02",
    "hours": 4,
    "deps": [
      "T043"
    ],
    "req": [
      "R02",
      "R03"
    ],
    "name": "Hoàn tất Android và rà soát tiêu chí C.1",
    "done": "Điều hướng, form, 2 RecyclerView, xoay màn hình, vai trò và mã nhóm",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T045",
    "start": 13,
    "end": 13,
    "owner": "TV03",
    "hours": 7,
    "deps": [
      "T037",
      "T038",
      "T039"
    ],
    "req": [
      "R10",
      "R13"
    ],
    "name": "Hoàn tất Flutter và tiêu chí C.2",
    "done": "6+ màn hình, ảnh URL, mounted, điều hướng trả kết quả, tải/lỗi và analyze",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T046",
    "start": 13,
    "end": 13,
    "owner": "TV03",
    "hours": 4,
    "deps": [
      "T045"
    ],
    "req": [
      "R10"
    ],
    "name": "Xóa lịch rảnh có xác nhận và Hoàn tác",
    "done": "Chỉ xóa khung giờ rảnh của mình; dialog + SnackBar Undo, đồng bộ lại server",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T047",
    "start": 13,
    "end": 13,
    "owner": "TV04",
    "hours": 8,
    "deps": [
      "T040",
      "T042",
      "T044",
      "T045",
      "T046"
    ],
    "req": [
      "R27",
      "R29"
    ],
    "name": "Kiểm thử tích hợp bản tuần 13",
    "done": "Demo đăng tin→duyệt→ứng tuyển→nhận ca→chấm công→duyệt lương; ghi lỗi thật",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T048",
    "start": 13,
    "end": 13,
    "owner": "TV04",
    "hours": 3,
    "deps": [
      "T047"
    ],
    "req": [
      "R22",
      "R23"
    ],
    "name": "Đối soát điểm nhấn và biên bản nghiệm thu nội bộ",
    "done": "Định vị ngoài ngưỡng cần duyệt tay; lọc lịch chính xác, ca đồng thời không vượt chỗ",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T049",
    "start": 14,
    "end": 14,
    "owner": "TV01",
    "hours": 7,
    "deps": [
      "T047",
      "T048"
    ],
    "req": [
      "R16",
      "R27"
    ],
    "name": "Sửa lỗi backend, kiểm tra deploy và README",
    "done": "Không còn lỗi chặn demo; README có API, hướng dẫn 3 phần, tài khoản mỗi vai trò",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T050",
    "start": 14,
    "end": 14,
    "owner": "TV01",
    "hours": 4,
    "deps": [
      "T041",
      "T049"
    ],
    "req": [
      "R30"
    ],
    "name": "Viết báo cáo mục 1,4,6 và ráp bản đầu",
    "done": "Nội dung dựa bản chạy thật; ghi nguồn, biến môi trường chỉ tên và ví dụ giả",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T051",
    "start": 14,
    "end": 14,
    "owner": "TV02",
    "hours": 7,
    "deps": [
      "T047"
    ],
    "req": [
      "R02",
      "R03"
    ],
    "name": "Sửa lỗi Android và build release thử trên máy thật",
    "done": "APK cài/đăng nhập được; thử offline, xoay form và vai trò",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T052",
    "start": 14,
    "end": 14,
    "owner": "TV02",
    "hours": 4,
    "deps": [
      "T044",
      "T051"
    ],
    "req": [
      "R30"
    ],
    "name": "Viết báo cáo mục 2,5 và chụp màn hình Android",
    "done": "Use case 5–7 luồng; ảnh thật đúng phiên bản và phân quyền",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T053",
    "start": 14,
    "end": 14,
    "owner": "TV03",
    "hours": 7,
    "deps": [
      "T047"
    ],
    "req": [
      "R10"
    ],
    "name": "Sửa lỗi Flutter, analyze và build release máy thật",
    "done": "Analyze không lỗi, APK release cài/đăng nhập được, thử quyền GPS bị từ chối",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T054",
    "start": 14,
    "end": 14,
    "owner": "TV03",
    "hours": 4,
    "deps": [
      "T045",
      "T053"
    ],
    "req": [
      "R30"
    ],
    "name": "Chuẩn bị kịch bản video và ảnh Flutter",
    "done": "Kịch bản 5–8 phút, ảnh thật, chia người thuyết minh và dữ liệu demo",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T055",
    "start": 14,
    "end": 14,
    "owner": "TV04",
    "hours": 7,
    "deps": [
      "T047",
      "T049",
      "T051",
      "T053"
    ],
    "req": [
      "R29"
    ],
    "name": "Chạy hồi quy và bổ sung kết quả kiểm thử thật",
    "done": "Ít nhất 25 case có thực tế Đạt/Không đạt, link minh chứng và lỗi liên quan",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T056",
    "start": 14,
    "end": 14,
    "owner": "TV04",
    "hours": 4,
    "deps": [
      "T040",
      "T055"
    ],
    "req": [
      "R28",
      "R30"
    ],
    "name": "Viết mục 3,7,8; thu minh chứng đóng góp",
    "done": "ERD cuối, test thật, ảnh GitHub, nhật ký và bảng tự đánh giá; không tự điền số giả",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T057",
    "start": 15,
    "end": 15,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T050",
      "T052",
      "T054",
      "T056"
    ],
    "req": [
      "R30"
    ],
    "name": "Chốt báo cáo PDF và README bàn giao",
    "done": "Báo cáo 20–35 trang đủ 9 mục; mục 9 cả nhóm viết dựa thực tế",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T058",
    "start": 15,
    "end": 15,
    "owner": "TV01",
    "hours": 5,
    "deps": [
      "T057",
      "T059",
      "T062",
      "T064"
    ],
    "req": [
      "R27",
      "R30"
    ],
    "name": "Diễn tập, xác nhận quyền GV và nộp LMS",
    "done": "10 phút trình bày + 10 phút Q&A; repo GV truy cập; API active; lưu bằng chứng nộp",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T059",
    "start": 15,
    "end": 15,
    "owner": "TV02",
    "hours": 5,
    "deps": [
      "T051",
      "T055"
    ],
    "req": [
      "R02",
      "R30"
    ],
    "name": "Chốt APK Android release và minh chứng C.1",
    "done": "APK final + phiên bản + mã băm; build cùng nguồn đã kiểm thử",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T060",
    "start": 15,
    "end": 15,
    "owner": "TV02",
    "hours": 5,
    "deps": [
      "T059",
      "T057"
    ],
    "req": [
      "R28",
      "R30"
    ],
    "name": "Đối chiếu phân công có chữ ký và tập bảo vệ Android",
    "done": "Cả nhóm xác nhận phần trăm thực tế; giải thích được code đã commit",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T061",
    "start": 15,
    "end": 15,
    "owner": "TV03",
    "hours": 5,
    "deps": [
      "T053",
      "T055"
    ],
    "req": [
      "R10",
      "R30"
    ],
    "name": "Chốt APK Flutter release và minh chứng C.2",
    "done": "APK final cài máy thật; Flutter analyze lưu log; cùng backend demo",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T062",
    "start": 15,
    "end": 15,
    "owner": "TV03",
    "hours": 5,
    "deps": [
      "T054",
      "T059",
      "T061"
    ],
    "req": [
      "R30"
    ],
    "name": "Quay video demo thật và kiểm tra link",
    "done": "Video 5–8 phút có thuyết minh; kiểm tra quyền xem và dữ liệu hai app",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T063",
    "start": 15,
    "end": 15,
    "owner": "TV04",
    "hours": 5,
    "deps": [
      "T055",
      "T056",
      "T059",
      "T061"
    ],
    "req": [
      "R18",
      "R29"
    ],
    "name": "Kiểm tra dữ liệu cuối và checklist nghiệm thu",
    "done": "Đủ 5 định mức seed, schema/seed phục hồi được, xác minh minh chứng 18 mục",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  },
  {
    "id": "T064",
    "start": 15,
    "end": 15,
    "owner": "TV04",
    "hours": 5,
    "deps": [
      "T057",
      "T060",
      "T062",
      "T063"
    ],
    "req": [
      "R30"
    ],
    "name": "Đóng gói bàn giao và chuẩn bị biên bản kết thúc",
    "done": "Danh mục file/link/tag, kết quả nghiệm thu, tồn đọng thật và sao lưu; hoàn tất biên bản sau nộp",
    "status": "todo",
    "progressPercent": 0,
    "actualHours": 0,
    "prLink": "",
    "commitHash": "",
    "notes": ""
  }
],
    criteriaC1: [
  {
    "id": "C1_01",
    "name": "Đăng nhập và phân quyền",
    "desc": "Ít nhất 2 vai trò: QUAN_TRI và NHA_TUYEN_DUNG",
    "completed": false
  },
  {
    "id": "C1_02",
    "name": "Danh sách RecyclerView",
    "desc": "Tối thiểu 2 màn hình danh sách dùng RecyclerView với ViewHolder và Adapter",
    "completed": false
  },
  {
    "id": "C1_03",
    "name": "Kiến trúc màn hình",
    "desc": "Sử dụng Fragment hoặc nhiều Activity điều hướng mượt mà",
    "completed": false
  },
  {
    "id": "C1_04",
    "name": "Kiểm tra hợp lệ form",
    "desc": "Kiểm tra dữ liệu nhập (email, SĐT, MST, số tiền, ngày giờ) đầy đủ trước khi gửi",
    "completed": false
  },
  {
    "id": "C1_05",
    "name": "Xác nhận xóa dữ liệu",
    "desc": "Hiển thị AlertDialog xác nhận trước khi gỡ tin, xóa ca hoặc khóa tài khoản",
    "completed": false
  },
  {
    "id": "C1_06",
    "name": "Báo cáo có biểu đồ",
    "desc": "Ít nhất 1 màn hình báo cáo thống kê vẽ biểu đồ (ngành nghề, lương TB, tin bị gỡ)",
    "completed": false
  },
  {
    "id": "C1_07",
    "name": "Xử lý trạng thái tải/lỗi",
    "desc": "Đủ 3 trạng thái: Đang tải (ProgressBar), Có dữ liệu, và Lỗi mạng (có nút Thử lại)",
    "completed": false
  },
  {
    "id": "C1_08",
    "name": "Xử lý xoay màn hình",
    "desc": "Giữ nguyên dữ liệu trong form khi xoay màn hình (ViewModel / onSaveInstanceState)",
    "completed": false
  },
  {
    "id": "C1_09",
    "name": "Xử lý hết hạn token",
    "desc": "Tự động đăng xuất và quay về màn hình đăng nhập khi nhận mã lỗi 401 Unauthorized",
    "completed": false
  },
  {
    "id": "C1_10",
    "name": "Định danh mã nhóm",
    "desc": "Tên ứng dụng, Application ID / Package name và TAG log phải chứa mã nhóm",
    "completed": false
  }
],
    criteriaC2: [
  {
    "id": "C2_01",
    "name": "Đăng nhập & Lưu token",
    "desc": "Đăng nhập sinh viên, lưu trữ token an toàn và tự động đính kèm vào header",
    "completed": false
  },
  {
    "id": "C2_02",
    "name": "Điều hướng nhiều màn hình",
    "desc": "Sử dụng Navigator, truyền tham số và nhận kết quả trả về giữa các màn hình",
    "completed": false
  },
  {
    "id": "C2_03",
    "name": "Danh sách ListView.builder",
    "desc": "Ít nhất 2 màn hình danh sách tải từ API với ListView.builder phân trang/tải lại",
    "completed": false
  },
  {
    "id": "C2_04",
    "name": "Form & Validator",
    "desc": "Form tạo hồ sơ sinh viên, thiết lập lịch rảnh có kiểm tra lỗi trực quan",
    "completed": false
  },
  {
    "id": "C2_05",
    "name": "Cấu trúc giao diện chuẩn",
    "desc": "Sử dụng Scaffold với AppBar, Drawer hoặc NavigationBar hiện đại",
    "completed": false
  },
  {
    "id": "C2_06",
    "name": "Thao tác có Hoàn tác (Undo)",
    "desc": "Khi xóa khung giờ rảnh, hiển thị SnackBar kèm nút 'Hoàn tác' khôi phục ngay",
    "completed": false
  },
  {
    "id": "C2_07",
    "name": "Hiển thị ảnh từ URL",
    "desc": "Tải ảnh từ Supabase Storage có widget chờ (loading) và widget ảnh lỗi",
    "completed": false
  },
  {
    "id": "C2_08",
    "name": "Kiểm tra mounted khi async",
    "desc": "Kiểm tra if (mounted) trước khi setState hoặc dùng BuildContext sau lệnh await",
    "completed": false
  },
  {
    "id": "C2_09",
    "name": "Xử lý trạng thái tải & lỗi",
    "desc": "Hiển thị CircularProgressIndicator khi tải và thông báo lỗi thân thiện khi rớt mạng",
    "completed": false
  },
  {
    "id": "C2_10",
    "name": "Phân tích tĩnh sạch lỗi",
    "desc": "Lệnh `flutter analyze` chạy qua không còn bất kỳ lỗi (0 errors) hoặc cảnh báo nghiêm trọng",
    "completed": false
  }
],
    seedQuota: [
  {
    "entity": "Nhà tuyển dụng",
    "target": 25,
    "current": 25,
    "unit": "doanh nghiệp",
    "note": "Gồm cả đã xác minh, đang chờ duyệt và bị từ chối"
  },
  {
    "entity": "Tin tuyển dụng",
    "target": 80,
    "current": 80,
    "unit": "tin đăng",
    "note": "Đủ các nhóm việc làm sinh viên, có tin bị từ chối kèm lý do"
  },
  {
    "entity": "Hồ sơ Sinh viên",
    "target": 200,
    "current": 200,
    "unit": "sinh viên",
    "note": "Hồ sơ trường/ngành/năm và đã thiết lập khung giờ rảnh trong tuần"
  },
  {
    "entity": "Ca làm việc",
    "target": 300,
    "current": 300,
    "unit": "ca làm",
    "note": "Phân bổ theo nhiều ngày và các khung giờ sáng, chiều, tối"
  },
  {
    "entity": "Bản ghi chấm công",
    "target": 500,
    "current": 500,
    "unit": "lượt chấm",
    "note": "Bao gồm check-in <200m (hợp lệ), >200m (cần duyệt tay) và đã duyệt chi trả"
  }
],
    techHighlights: [
  {
    "title": "Chấm công GPS & Cơ chế duyệt tay (Ngưỡng 200m)",
    "desc": "Sinh viên check-in/out gửi tọa độ. Server tính Haversine. Nếu khoảng cách >200m, server KHÔNG từ chối mà lưu cờ CAN_DUYET_TAY để Admin xem xét duyệt trên app Android.",
    "icon": "map-pin",
    "tag": "Điểm nhấn 1"
  },
  {
    "title": "Lọc việc làm phù hợp lịch học (Giao khoảng thời gian)",
    "desc": "Bài toán Interval Overlap: So khớp khung giờ ca làm với khung giờ rảnh theo tuần của sinh viên. Ca phải nằm trọn trong giờ rảnh và không trùng với ca đã nhận.",
    "icon": "calendar",
    "tag": "Điểm nhấn 2"
  },
  {
    "title": "Transaction an toàn khi nhận ca (Chống Overbooking)",
    "desc": "Sử dụng Database Transaction với khóa dòng (SELECT ... FOR UPDATE) để ngăn chặn tranh chấp tài nguyên khi nhiều sinh viên cùng nhận suất cuối.",
    "icon": "shield-check",
    "tag": "Điểm nhấn 3"
  },
  {
    "title": "Tính lương tự động theo kỳ (Lưu vết đơn giá)",
    "desc": "Server tự động tổng hợp số giờ từ các lượt chấm công đã duyệt, nhân đơn giá giờ tại thời điểm làm việc, tính toán theo kỳ trong transaction chống nhân đôi dữ liệu.",
    "icon": "dollar-sign",
    "tag": "Điểm nhấn 4"
  }
]
};
