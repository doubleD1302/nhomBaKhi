const bcrypt = require('bcryptjs');

async function seedDatabase(queryFn) {
  const existingAdmin = await queryFn(
    'SELECT id FROM nguoi_dung WHERE email = $1',
    ['admin@nhombakhi.edu.vn'],
  );
  if (existingAdmin.rows.length > 0) {
    return { alreadySeeded: true };
  }

  const [adminHash, employerHash, studentHash] = await Promise.all([
    bcrypt.hash('Admin@123456', 10),
    bcrypt.hash('Employer@123', 10),
    bcrypt.hash('Student@123', 10),
  ]);

  // 1. Tai khoan Quan tri vien
  await queryFn(
    `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
     VALUES ($1, $2, $3, $4, 'QUAN_TRI')
     ON CONFLICT (email) DO NOTHING`,
    ['admin@nhombakhi.edu.vn', adminHash, 'Quản trị viên Hệ thống', '0901000001'],
  );

  // 2. Nhom viec (6 nhom)
  const categoryNames = ['Phục vụ', 'Gia sư', 'Bán hàng', 'Giao hàng', 'Sự kiện', 'Văn phòng'];
  const categoryIds = [];
  for (const name of categoryNames) {
    const res = await queryFn(
      `INSERT INTO nhom_viec (ten) VALUES ($1)
       ON CONFLICT (ten) DO UPDATE SET ten = EXCLUDED.ten
       RETURNING id`,
      [name],
    );
    categoryIds.push(res.rows[0].id);
  }

  // 3. Nha tuyen dung (25 NTD: 21 DA_DUYET, 2 CHO_DUYET, 2 TU_CHOI)
  const districts = [
    { name: 'Quận 1, TP.HCM', lat: 10.7769, lon: 106.7009 },
    { name: 'Quận 3, TP.HCM', lat: 10.7843, lon: 106.6844 },
    { name: 'Quận 5, TP.HCM', lat: 10.7540, lon: 106.6634 },
    { name: 'Quận 7, TP.HCM', lat: 10.7340, lon: 106.7218 },
    { name: 'Bình Thạnh, TP.HCM', lat: 10.8106, lon: 106.7091 },
    { name: 'Thủ Đức, TP.HCM', lat: 10.8511, lon: 106.7720 },
  ];
  const companyBrands = [
    'Highlands Coffee Campus', 'Nhà sách Phương Nam', 'Trung tâm Anh ngữ Horizon',
    'Giao Hàng Nhanh Hub', 'Chuỗi Cửa hàng Bách Hóa Xanh', 'Công ty Sự kiện Ánh Dương',
    'Văn phòng Luật Minh Tâm', 'The Coffee House Hub', 'Phúc Long Heritage',
    'Siêu thị Mini Circle K', 'Trung tâm Gia sư Tri Thức', 'Kho vận Sài Gòn Express',
    'Studio Truyền thông Sáng Tạo', 'Nhà hàng Bếp Việt', 'Chuỗi Trà sữa Koi Thé',
    'Công ty Dịch vụ Sự kiện Sao Việt', 'Trung tâm Tin học Thực hành', 'Hiệu sách Cá Chép',
    'Cửa hàng Tiện lợi GS25', 'Văn phòng Tư vấn Du học EduGo', 'Tiệm Bánh Mì Sài Gòn',
    'Chuỗi Cà phê Cộng', 'Công ty Tổ chức Hội chợ Expo', 'Trung tâm Luyện thi Thủ Khoa',
    'Đơn vị Vận chuyển Tốc Độ',
  ];

  const approvedEmployerIds = [];
  let demoEmployerId = null;

  for (let i = 0; i < 25; i += 1) {
    const email = i === 0 ? 'ntd@nhombakhi.edu.vn' : `ntd${i + 1}@nhombakhi.edu.vn`;
    const contactName = i === 0 ? 'Nguyễn Minh Tuấn' : `Đại diện NTD ${i + 1}`;
    const phone = `091${String(1000000 + i).slice(0, 7)}`;
    const userRes = await queryFn(
      `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
       VALUES ($1, $2, $3, $4, 'NHA_TUYEN_DUNG')
       RETURNING id`,
      [email, employerHash, contactName, phone],
    );
    const userId = userRes.rows[0].id;

    let status = 'DA_DUYET';
    let verified = true;
    let rejectionReason = null;
    if (i === 21 || i === 22) {
      status = 'CHO_DUYET';
      verified = false;
    } else if (i === 23 || i === 24) {
      status = 'TU_CHOI';
      verified = false;
      rejectionReason = 'Ảnh giấy phép kinh doanh chưa rõ mã số thuế';
    }

    const district = districts[i % districts.length];
    const empRes = await queryFn(
      `INSERT INTO nha_tuyen_dung
         (nguoi_dung_id, ten_cong_ty, ma_so_thue, dia_chi, giay_phep_url, trang_thai_duyet, da_xac_minh, ly_do_tu_choi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        companyBrands[i],
        `031${String(1000000 + i)}`,
        `${12 + i} Nguyễn Văn Cừ, ${district.name}`,
        `https://storage.nhombakhi.edu.vn/licenses/ntd-${i + 1}.pdf`,
        status,
        verified,
        rejectionReason,
      ],
    );
    if (i === 0) demoEmployerId = empRes.rows[0].id;
    if (status === 'DA_DUYET') approvedEmployerIds.push(empRes.rows[0].id);
  }

  // 4. Tin tuyen dung (85 tin >= 80, gom DA_DUYET, CHO_DUYET, TU_CHOI, DA_GO)
  const jobTemplates = [
    { title: 'Nhân viên pha chế bán thời gian', desc: 'Pha chế đồ uống theo công thức chuẩn, giữ quầy gọn sạch, hỗ trợ xoay ca theo lịch học.', wage: 32000 },
    { title: 'Gia sư Toán - Lý cấp 2 buổi tối', desc: 'Kèm 1-1 hoặc nhóm nhỏ 3 học sinh, có giáo án sẵn, ưu tiên sinh viên sư phạm/bách khoa.', wage: 80000 },
    { title: 'Thu ngân cửa hàng tiện lợi ca linh hoạt', desc: 'Tính tiền POS, kiểm kê hàng hóa đầu/cuối ca, hướng dẫn khách hàng thân thiện.', wage: 29000 },
    { title: 'Cộng tác viên giao nhận đơn nội thành', desc: 'Giao bưu phẩm gọn nhẹ khu vực trung tâm trong bán kính 5km, có phụ cấp xăng xe.', wage: 38000 },
    { title: 'Nhân sự hỗ trợ sự kiện cuối tuần', desc: 'Đón khách check-in hội thảo, phát tài liệu và hỗ trợ điều phối khu vực sân khấu.', wage: 45000 },
    { title: 'Trợ lý nhập liệu văn phòng bán thời gian', desc: 'Tổng hợp chứng từ Excel, phân loại hồ sơ khách hàng theo quy trình hướng dẫn.', wage: 35000 },
  ];

  const approvedJobIds = [];
  let demoJobId = null;

  for (let i = 0; i < 85; i += 1) {
    const employerId = approvedEmployerIds[i % approvedEmployerIds.length];
    const catIdx = i % categoryIds.length;
    const tpl = jobTemplates[catIdx];
    const district = districts[i % districts.length];

    let status = 'DA_DUYET';
    let rejectionReason = null;
    if (i >= 65 && i < 75) {
      status = 'CHO_DUYET';
    } else if (i >= 75 && i < 81) {
      status = 'TU_CHOI';
      rejectionReason = 'Mức lương và mô tả ca làm chưa ghi rõ quyền lợi thử việc';
    } else if (i >= 81) {
      status = 'DA_GO';
      rejectionReason = 'Tin vi phạm quy định thu phí đồng phục trước khi nhận việc';
    }

    const latOffset = ((i % 7) - 3) * 0.0012;
    const lonOffset = ((i % 5) - 2) * 0.0012;
    const jobRes = await queryFn(
      `INSERT INTO tin_tuyen_dung
         (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong, trang_thai_duyet, ly_do_tu_choi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        employerId,
        categoryIds[catIdx],
        `${tpl.title} #${i + 1}`,
        tpl.desc,
        district.name,
        Number((district.lat + latOffset).toFixed(6)),
        Number((district.lon + lonOffset).toFixed(6)),
        tpl.wage + (i % 4) * 2000,
        3 + (i % 4),
        status,
        rejectionReason,
      ],
    );
    if (status === 'DA_DUYET') {
      approvedJobIds.push({
        id: jobRes.rows[0].id,
        employerId,
        lat: Number((district.lat + latOffset).toFixed(6)),
        lon: Number((district.lon + lonOffset).toFixed(6)),
      });
      if (demoJobId === null) demoJobId = jobRes.rows[0].id;
    }
  }

  // 5. Sinh vien (200 sinh vien co khung gio ranh)
  const schools = [
    'ĐH Khoa học Tự nhiên TP.HCM',
    'ĐH Bách khoa TP.HCM',
    'ĐH Kinh tế TP.HCM',
    'ĐH Công nghệ Thông tin',
    'ĐH Sư phạm TP.HCM',
  ];
  const majors = ['Công nghệ thông tin', 'Quản trị kinh doanh', 'Kế toán', 'Ngôn ngữ Anh', 'Kỹ thuật phần mềm'];
  const studentProfileIds = [];

  for (let i = 0; i < 200; i += 1) {
    const email = i === 0 ? 'sinhvien@nhombakhi.edu.vn' : `sv${i + 1}@nhombakhi.edu.vn`;
    const fullName = i === 0 ? 'Hà Gia Bảo' : `Sinh viên Mẫu ${i + 1}`;
    const phone = `098${String(1000000 + i).slice(0, 7)}`;
    const uRes = await queryFn(
      `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
       VALUES ($1, $2, $3, $4, 'SINH_VIEN')
       RETURNING id`,
      [email, studentHash, fullName, phone],
    );
    const pRes = await queryFn(
      `INSERT INTO ho_so_sinh_vien (nguoi_dung_id, truong, nganh, nam_hoc, ky_nang, gioi_thieu)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        uRes.rows[0].id,
        schools[i % schools.length],
        majors[i % majors.length],
        (i % 4) + 1,
        'Giao tiếp, Tin học văn phòng, Tiếng Anh cơ bản',
        'Sinh viên năng động, đúng giờ, tìm việc làm thêm phù hợp lịch học.',
      ],
    );
    const profileId = pRes.rows[0].id;
    studentProfileIds.push(profileId);

    if (i === 0) {
      // Sinh vien demo ranh tat ca cac ngay tu Thu 2 den Chu nhat (08:00-12:00 & 17:30-22:00)
      for (let day = 1; day <= 7; day += 1) {
        await queryFn(
          `INSERT INTO khung_gio_ranh (sinh_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc)
           VALUES ($1, $2, '08:00', '12:00'), ($1, $2, '17:30', '22:00')`,
          [profileId, day],
        );
      }
    } else {
      const day1 = (i % 7) + 1;
      const day2 = ((i + 2) % 7) + 1;
      await queryFn(
        `INSERT INTO khung_gio_ranh (sinh_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc)
         VALUES ($1, $2, '08:00', '12:00'), ($1, $3, '18:00', '22:00')
         ON CONFLICT DO NOTHING`,
        [profileId, day1, day2],
      );
    }
  }

  // 6. Ca lam viec (320 ca >= 300: 260 ca da thuc hien + 60 ca sap toi cho demo tim viec & nhan ca)
  const now = new Date();
  const formatDate = (date) => date.toISOString().slice(0, 10);
  const pastShifts = [];

  for (let i = 0; i < 260; i += 1) {
    const job = approvedJobIds[i % approvedJobIds.length];
    const daysAgo = (i % 20) + 1;
    const shiftDate = new Date(now.getTime() - daysAgo * 86400000);
    const isMorning = i % 2 === 0;
    const sRes = await queryFn(
      `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can, so_nguoi_da_nhan)
       VALUES ($1, $2, $3, $4, 3, 2)
       RETURNING id`,
      [job.id, formatDate(shiftDate), isMorning ? '08:00' : '18:00', isMorning ? '12:00' : '22:00'],
    );
    pastShifts.push({
      id: sRes.rows[0].id,
      jobId: job.id,
      lat: job.lat,
      lon: job.lon,
      shiftDate,
    });
  }

  for (let i = 0; i < 60; i += 1) {
    const job = approvedJobIds[i % approvedJobIds.length];
    const daysAhead = (i % 12) + 1;
    const shiftDate = new Date(now.getTime() + daysAhead * 86400000);
    const isMorning = i % 2 === 0;
    await queryFn(
      `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can, so_nguoi_da_nhan)
       VALUES ($1, $2, $3, $4, 4, 0)`,
      [job.id, formatDate(shiftDate), isMorning ? '08:30' : '18:00', isMorning ? '11:30' : '21:30'],
    );
  }

  // Duyet truoc ung tuyen cho sinh vien demo o 2 tin dau tien de demo Nhan ca ngay
  for (let j = 0; j < 2 && j < approvedJobIds.length; j += 1) {
    await queryFn(
      `INSERT INTO ung_tuyen (tin_id, sinh_vien_id, trang_thai)
       VALUES ($1, $2, 'DA_DUYET')
       ON CONFLICT (tin_id, sinh_vien_id) DO NOTHING`,
      [approvedJobIds[j].id, studentProfileIds[0]],
    );
  }

  // 7. Ung tuyen, Nhan ca & Cham cong (520 ban ghi cham cong >= 500)
  const statuses = ['DA_DUYET', 'DA_DUYET', 'DA_DUYET', 'CHO_DUYET', 'CAN_DUYET_THU_CONG', 'TU_CHOI'];
  let attendanceIdx = 0;

  for (let i = 0; i < pastShifts.length; i += 1) {
    const shift = pastShifts[i];
    for (let slot = 0; slot < 2; slot += 1) {
      const studentProfileId = studentProfileIds[(i * 2 + slot) % studentProfileIds.length];
      await queryFn(
        `INSERT INTO ung_tuyen (tin_id, sinh_vien_id, trang_thai)
         VALUES ($1, $2, 'DA_DUYET')
         ON CONFLICT (tin_id, sinh_vien_id) DO NOTHING`,
        [shift.jobId, studentProfileId],
      );
      const claimRes = await queryFn(
        `INSERT INTO nhan_ca (ca_id, sinh_vien_id, trang_thai)
         VALUES ($1, $2, 'DA_NHAN')
         ON CONFLICT (ca_id, sinh_vien_id) DO NOTHING
         RETURNING id`,
        [shift.id, studentProfileId],
      );
      if (!claimRes.rows[0]) continue;

      const status = statuses[attendanceIdx % statuses.length];
      const checkIn = new Date(shift.shiftDate);
      checkIn.setHours(8, 0, 0, 0);
      const checkOut = new Date(checkIn.getTime() + 4 * 3600 * 1000);
      const latIn = status === 'CAN_DUYET_THU_CONG' ? shift.lat + 0.003 : shift.lat;

      await queryFn(
        `INSERT INTO cham_cong
           (nhan_ca_id, check_in_luc, check_out_luc, vi_do_in, kinh_do_in, vi_do_out, kinh_do_out, so_gio, trang_thai_duyet)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 4.00, $8)`,
        [
          claimRes.rows[0].id,
          checkIn.toISOString(),
          checkOut.toISOString(),
          latIn,
          shift.lon,
          shift.lat,
          shift.lon,
          status,
        ],
      );
      attendanceIdx += 1;
    }
  }

  // 8. Bao cao lua dao mau (3 bao cao)
  const reporterRes = await queryFn(
    "SELECT id FROM nguoi_dung WHERE email = 'sinhvien@nhombakhi.edu.vn'",
  );
  const reporterId = reporterRes.rows[0].id;
  await queryFn(
    `INSERT INTO bao_cao_lua_dao (tin_id, nguoi_bao_id, noi_dung, bang_chung_url, trang_thai, ket_luan)
     VALUES
       ($1, $2, 'Tin đăng yêu cầu đặt cọc 500.000đ tiền đồng phục trước khi phỏng vấn.', 'https://storage.nhombakhi.edu.vn/evidence/1.png', 'CHO_XU_LY', NULL),
       ($3, $2, 'Địa chỉ phỏng vấn không khớp với thông tin trên hồ sơ doanh nghiệp.', NULL, 'CONFIRMED', 'Đã xác minh vi phạm và gỡ tin tuyển dụng.'),
       ($4, $2, 'Nghi ngờ nhầm số điện thoại liên hệ tuyển dụng.', NULL, 'DISMISSED', 'Nhà tuyển dụng đã đính chính số liên hệ hợp lệ.')`,
    [approvedJobIds[0].id, reporterId, approvedJobIds[1].id, approvedJobIds[2].id],
  );

  // 9. Bang luong mau cho ky hien tai
  const currentPeriod = now.toISOString().slice(0, 7);
  await queryFn(
    `INSERT INTO bang_luong (sinh_vien_id, ntd_id, ky, tong_gio, tong_tien, trang_thai)
     VALUES
       ($1, $2, $3, 12.00, 384000, 'DA_DUYET'),
       ($4, $2, $3, 8.00, 256000, 'CHO_DUYET')
     ON CONFLICT (sinh_vien_id, ntd_id, ky) DO NOTHING`,
    [studentProfileIds[0], demoEmployerId, currentPeriod, studentProfileIds[1]],
  );

  return { alreadySeeded: false };
}

async function seedLightDemo(queryFn) {
  const existingAdmin = await queryFn(
    'SELECT id FROM nguoi_dung WHERE email = $1',
    ['admin@nhombakhi.edu.vn'],
  );
  if (existingAdmin.rows.length > 0) {
    return { alreadySeeded: true };
  }

  const [adminHash, employerHash, studentHash] = await Promise.all([
    bcrypt.hash('Admin@123456', 10),
    bcrypt.hash('Employer@123', 10),
    bcrypt.hash('Student@123', 10),
  ]);

  await queryFn(
    `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
     VALUES ($1, $2, $3, $4, 'QUAN_TRI')`,
    ['admin@nhombakhi.edu.vn', adminHash, 'Quản trị viên Hệ thống', '0901000001'],
  );

  const categoryNames = ['Phục vụ', 'Gia sư', 'Bán hàng', 'Giao hàng', 'Sự kiện', 'Văn phòng'];
  const categoryIds = [];
  for (const name of categoryNames) {
    const res = await queryFn(
      `INSERT INTO nhom_viec (ten) VALUES ($1)
       ON CONFLICT (ten) DO UPDATE SET ten = EXCLUDED.ten
       RETURNING id`,
      [name],
    );
    categoryIds.push(res.rows[0].id);
  }

  const employerSeeds = [
    {
      email: 'ntd@nhombakhi.edu.vn',
      name: 'Nguyễn Minh Tuấn',
      phone: '0911000001',
      company: 'Highlands Coffee Campus',
      taxCode: '0311000001',
      address: '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      licenseUrl: 'https://storage.nhombakhi.edu.vn/licenses/ntd-1.pdf',
      status: 'DA_DUYET',
      verified: true,
      reason: null,
    },
    {
      email: 'ntd2@nhombakhi.edu.vn',
      name: 'Lê Thảo Vy',
      phone: '0911000002',
      company: 'Nhà sách Phương Nam',
      taxCode: '0311000002',
      address: '12 Lê Lợi, Quận 1, TP.HCM',
      licenseUrl: 'https://storage.nhombakhi.edu.vn/licenses/ntd-2.pdf',
      status: 'CHO_DUYET',
      verified: false,
      reason: null,
    },
    {
      email: 'ntd3@nhombakhi.edu.vn',
      name: 'Phạm Quốc Bảo',
      phone: '0911000003',
      company: 'Tiệm Bánh Sài Gòn',
      taxCode: '0311000003',
      address: '88 Võ Văn Ngân, Thủ Đức, TP.HCM',
      licenseUrl: 'https://storage.nhombakhi.edu.vn/licenses/ntd-3.pdf',
      status: 'TU_CHOI',
      verified: false,
      reason: 'Ảnh giấy phép kinh doanh chưa rõ mã số thuế',
    },
  ];

  let demoEmployerId = null;
  for (let i = 0; i < employerSeeds.length; i += 1) {
    const e = employerSeeds[i];
    const uRes = await queryFn(
      `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
       VALUES ($1, $2, $3, $4, 'NHA_TUYEN_DUNG') RETURNING id`,
      [e.email, employerHash, e.name, e.phone],
    );
    const eRes = await queryFn(
      `INSERT INTO nha_tuyen_dung
         (nguoi_dung_id, ten_cong_ty, ma_so_thue, dia_chi, giay_phep_url, trang_thai_duyet, da_xac_minh, ly_do_tu_choi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [uRes.rows[0].id, e.company, e.taxCode, e.address, e.licenseUrl, e.status, e.verified, e.reason],
    );
    if (i === 0) demoEmployerId = eRes.rows[0].id;
  }

  const job1 = (await queryFn(
    `INSERT INTO tin_tuyen_dung
       (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong, trang_thai_duyet)
     VALUES ($1, $2, $3, $4, $5, 10.7769, 106.7009, 35000, 3, 'DA_DUYET') RETURNING id`,
    [
      demoEmployerId,
      categoryIds[0],
      'Nhân viên pha chế ca sáng',
      'Pha chế đồ uống theo công thức chuẩn, hỗ trợ xoay ca theo lịch học.',
      'Quận 1, TP.HCM',
    ],
  )).rows[0].id;

  const job2 = (await queryFn(
    `INSERT INTO tin_tuyen_dung
       (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong, trang_thai_duyet)
     VALUES ($1, $2, $3, $4, $5, 10.7843, 106.6844, 32000, 2, 'DA_DUYET') RETURNING id`,
    [
      demoEmployerId,
      categoryIds[2],
      'Thu ngân cửa hàng cuối tuần',
      'Tính tiền POS, sắp xếp quầy kệ và hỗ trợ khách hàng.',
      'Quận 3, TP.HCM',
    ],
  )).rows[0].id;

  await queryFn(
    `INSERT INTO tin_tuyen_dung
       (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong, trang_thai_duyet)
     VALUES ($1, $2, $3, $4, $5, 10.7540, 106.6634, 80000, 2, 'CHO_DUYET')`,
    [
      demoEmployerId,
      categoryIds[1],
      'Gia sư Toán cấp 2 buổi tối',
      'Kèm học sinh lớp 8 tại nhà, có tài liệu sẵn.',
      'Quận 5, TP.HCM',
    ],
  );

  await queryFn(
    `INSERT INTO tin_tuyen_dung
       (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong, trang_thai_duyet, ly_do_tu_choi)
     VALUES ($1, $2, $3, $4, $5, 10.7340, 106.7218, 45000, 4, 'TU_CHOI', $6)`,
    [
      demoEmployerId,
      categoryIds[4],
      'Cộng tác viên sự kiện',
      'Hỗ trợ check-in hội thảo sinh viên.',
      'Quận 7, TP.HCM',
      'Chưa nêu rõ quyền lợi và giờ nghỉ giữa ca',
    ],
  );

  const sv1UserId = (await queryFn(
    `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
     VALUES ('sinhvien@nhombakhi.edu.vn', $1, 'Hà Gia Bảo', '0981000001', 'SINH_VIEN') RETURNING id`,
    [studentHash],
  )).rows[0].id;
  const sv1Id = (await queryFn(
    `INSERT INTO ho_so_sinh_vien (nguoi_dung_id, truong, nganh, nam_hoc, ky_nang, gioi_thieu)
     VALUES ($1, 'ĐH Khoa học Tự nhiên TP.HCM', 'Công nghệ thông tin', 3, 'Giao tiếp, Pha chế, Tin học', 'Sinh viên năm 3 tìm việc bán thời gian theo lịch rảnh.') RETURNING id`,
    [sv1UserId],
  )).rows[0].id;

  const sv2UserId = (await queryFn(
    `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
     VALUES ('sv2@nhombakhi.edu.vn', $1, 'Trần Minh Khoa', '0981000002', 'SINH_VIEN') RETURNING id`,
    [studentHash],
  )).rows[0].id;
  const sv2Id = (await queryFn(
    `INSERT INTO ho_so_sinh_vien (nguoi_dung_id, truong, nganh, nam_hoc, ky_nang, gioi_thieu)
     VALUES ($1, 'ĐH Kinh tế TP.HCM', 'Quản trị kinh doanh', 2, 'Bán hàng, Thu ngân POS', 'Nhanh nhẹn, đúng giờ.') RETURNING id`,
    [sv2UserId],
  )).rows[0].id;

  const dates = (await queryFn(
    `SELECT
       (CURRENT_DATE + 1)::text AS tomorrow,
       (CURRENT_DATE + 2)::text AS day_after,
       (CURRENT_DATE - 1)::text AS yesterday,
       (CURRENT_DATE - 2)::text AS two_days_ago,
       EXTRACT(ISODOW FROM CURRENT_DATE + 1)::int AS dow1,
       EXTRACT(ISODOW FROM CURRENT_DATE + 2)::int AS dow2,
       TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM') AS period`,
  )).rows[0];
  const dow3 = (dates.dow2 % 7) + 1;

  await queryFn(
    `INSERT INTO khung_gio_ranh (sinh_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc)
     VALUES
       ($1, $2, '08:00', '12:00'),
       ($1, $3, '18:00', '21:00'),
       ($1, $4, '09:00', '11:00')`,
    [sv1Id, dates.dow1, dates.dow2, dow3],
  );
  await queryFn(
    `INSERT INTO khung_gio_ranh (sinh_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc)
     VALUES ($1, $2, '18:00', '22:00')`,
    [sv2Id, dates.dow1],
  );

  // Ca tuong lai: Job 1 khop lich ranh sv1, Job 2 khong khop de de test loc schedule=true
  await queryFn(
    `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can, so_nguoi_da_nhan)
     VALUES
       ($1, $3, '08:00', '12:00', 3, 0),
       ($1, $4, '18:00', '21:00', 2, 0),
       ($2, $3, '18:00', '21:00', 2, 0)`,
    [job1, job2, dates.tomorrow, dates.day_after],
  );

  // Ca qua khu de co du lieu cham cong & tinh luong gon nhe
  const pastShift1 = (await queryFn(
    `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can, so_nguoi_da_nhan)
     VALUES ($1, $2, '08:00', '12:00', 3, 2) RETURNING id`,
    [job1, dates.yesterday],
  )).rows[0].id;
  const pastShift2 = (await queryFn(
    `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can, so_nguoi_da_nhan)
     VALUES ($1, $2, '18:00', '22:00', 2, 1) RETURNING id`,
    [job1, dates.two_days_ago],
  )).rows[0].id;

  await queryFn(
    `INSERT INTO ung_tuyen (tin_id, sinh_vien_id, trang_thai)
     VALUES
       ($1, $3, 'DA_DUYET'),
       ($1, $4, 'DA_DUYET'),
       ($2, $4, 'CHO_DUYET')`,
    [job1, job2, sv1Id, sv2Id],
  );

  const claim1 = (await queryFn(
    `INSERT INTO nhan_ca (ca_id, sinh_vien_id, trang_thai)
     VALUES ($1, $2, 'DA_NHAN') RETURNING id`,
    [pastShift1, sv1Id],
  )).rows[0].id;
  const claim2 = (await queryFn(
    `INSERT INTO nhan_ca (ca_id, sinh_vien_id, trang_thai)
     VALUES ($1, $2, 'DA_NHAN') RETURNING id`,
    [pastShift1, sv2Id],
  )).rows[0].id;
  const claim3 = (await queryFn(
    `INSERT INTO nhan_ca (ca_id, sinh_vien_id, trang_thai)
     VALUES ($1, $2, 'DA_NHAN') RETURNING id`,
    [pastShift2, sv1Id],
  )).rows[0].id;

  await queryFn(
    `INSERT INTO cham_cong
       (nhan_ca_id, check_in_luc, check_out_luc, vi_do_in, kinh_do_in, vi_do_out, kinh_do_out, so_gio, trang_thai_duyet)
     VALUES
       ($1, NOW() - interval '4 hours', NOW(), 10.7769, 106.7009, 10.7769, 106.7009, 4.00, 'CHO_DUYET'),
       ($2, NOW() - interval '4 hours', NOW(), 10.7799, 106.7009, 10.7769, 106.7009, 4.00, 'CAN_DUYET_THU_CONG'),
       ($3, NOW() - interval '4 hours', NOW(), 10.7769, 106.7009, 10.7769, 106.7009, 4.00, 'DA_DUYET')`,
    [claim1, claim2, claim3],
  );

  await queryFn(
    `INSERT INTO bao_cao_lua_dao (tin_id, nguoi_bao_id, noi_dung, bang_chung_url, trang_thai)
     VALUES ($1, $2, 'Tin đăng có dấu hiệu yêu cầu đóng phí giữ chỗ 200.000đ.', 'https://storage.nhombakhi.edu.vn/evidence/1.png', 'CHO_XU_LY')`,
    [job2, sv1UserId],
  );

  await queryFn(
    `INSERT INTO bang_luong (sinh_vien_id, ntd_id, ky, tong_gio, tong_tien, trang_thai)
     VALUES ($1, $2, $3, 4.00, 140000, 'CHO_DUYET')`,
    [sv2Id, demoEmployerId, dates.period],
  );

  return { alreadySeeded: false };
}

async function runCli() {
  require('dotenv').config();
  const { pool } = require('../src/db');
  try {
    const result = await seedDatabase((sql, params) => pool.query(sql, params));
    if (result.alreadySeeded) {
      console.log('Database already contains seed accounts; skipped.');
    } else {
      console.log('Seed API v1 completed successfully.');
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  });
}

module.exports = { seedDatabase, seedLightDemo };
