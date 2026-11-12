-- Dữ liệu hoàn toàn giả lập. Mật khẩu demo: Demo25!2026 (bcrypt cost 10).
-- Không phải giấy phép/tài khoản người thật. Chỉ dùng trong môi trường học tập.
BEGIN;
SET LOCAL search_path=viec_lam,public;
DO $seed$
DECLARE loop_idx integer;sv bigint;cid bigint;tid bigint;owner_id bigint;
 h text:='$2b$10$yTP.UCZPe5pm6XxSWyDsaOwwE.j/qYUPcTlZxN5.m1p0ss3DtIHGC';
 seqname text;t text;maxid bigint;
BEGIN
 IF EXISTS(SELECT 1 FROM nguoi_dung WHERE email='admin.demo25@example.test') THEN
  RAISE NOTICE 'Seed da ton tai: khong ghi de du lieu';RETURN;
 END IF;
 INSERT INTO nguoi_dung(id,email,mat_khau_hash,ho_ten,sdt,vai_tro) VALUES(1,'admin.demo25@example.test',h,'Quản trị demo','0900000001','QUAN_TRI');
 INSERT INTO nguoi_dung(id,email,mat_khau_hash,ho_ten,sdt,vai_tro)
 SELECT i+1,'ntd'||i||'@example.test',h,'Nhà tuyển dụng demo '||i,'091'||lpad(i::text,7,'0'),'NHA_TUYEN_DUNG' FROM generate_series(1,25) i;
 INSERT INTO nguoi_dung(id,email,mat_khau_hash,ho_ten,sdt,vai_tro)
 SELECT 1000+i,'sv'||i||'@example.test',h,'Sinh viên demo '||i,'092'||lpad(i::text,7,'0'),'SINH_VIEN' FROM generate_series(1,200) i;
 INSERT INTO ho_so_sinh_vien(id,truong,nganh,nam_hoc,ky_nang,gioi_thieu)
 SELECT 1000+i,'Trường demo '||(1+i%5),'Ngành demo '||(1+i%4),1+i%4,'Giao tiếp; làm việc nhóm','Hồ sơ giả lập phục vụ đồ án' FROM generate_series(1,200) i;
 INSERT INTO khung_gio_ranh(sinh_vien_id,thu_trong_tuan,gio_bat_dau,gio_ket_thuc)
 SELECT 1000+i,d::smallint,time '00:00',time '24:00' FROM generate_series(1,200) i CROSS JOIN generate_series(1,7) d;
 INSERT INTO nha_tuyen_dung(id,ten_cong_ty,ma_so_thue,dia_chi,nguoi_lien_he,sdt_lien_he,giay_phep_url,trang_thai_duyet,duyet_boi,duyet_luc)
 SELECT i+1,'Doanh nghiệp giả lập '||i,'DEMO'||lpad(i::text,10,'0'),'Địa chỉ demo '||i||', TP.HCM','Liên hệ demo '||i,'091'||lpad(i::text,7,'0'),
 'https://example.invalid/demo/giay-phep-'||i||'.png','DA_DUYET',1,now() FROM generate_series(1,25) i;
 INSERT INTO nhom_viec(id,ten) VALUES(1,'Phục vụ'),(2,'Bán hàng'),(3,'Kho vận'),(4,'Hỗ trợ sự kiện'),(5,'Gia sư');
 INSERT INTO khu_vuc(id,ma,ten) SELECT i,'KV'||i,'Khu vực demo '||i FROM generate_series(1,5) i;
 INSERT INTO dia_diem_lam_viec(id,ntd_id,khu_vuc_id,ten,dia_chi,vi_do,kinh_do,ban_kinh_m)
 SELECT i,i+1,1+i%5,'Điểm làm việc demo '||i,'Địa chỉ giả lập '||i,10.77+i*0.0001,106.69+i*0.0001,200 FROM generate_series(1,25) i;
 INSERT INTO tin_tuyen_dung(id,ntd_id,nhom_id,dia_diem_id,tieu_de,mo_ta,luong_theo_gio,so_luong,han_ung_tuyen,khong_thu_phi,khong_giu_giay_to,luong_ro_rang,trang_thai_duyet,ly_do_tu_choi,duyet_boi,duyet_luc)
 SELECT i,2+(i-1)%25,1+(i-1)%5,1+(i-1)%25,'Tin việc demo '||i,'Mô tả công việc giả lập, không sử dụng để tuyển dụng thật.',25000+((i-1)%5)*5000,10,current_date+60,
 true,true,true,CASE WHEN i<=60 THEN 'DA_DUYET' WHEN i<=70 THEN 'CHO_DUYET' ELSE 'TU_CHOI' END,
 CASE WHEN i>70 THEN 'Hồ sơ mô tả chưa đầy đủ trong tình huống kiểm thử' END,
 CASE WHEN i<=60 OR i>70 THEN 1 END,CASE WHEN i<=60 OR i>70 THEN now() END FROM generate_series(1,80) i;
 -- 250 ca quá khứ + 50 ca tương lai. Trigger lấy snapshot địa chỉ/đơn giá.
 INSERT INTO ca_lam_viec(id,tin_id,bat_dau,ket_thuc,so_nguoi_can)
 SELECT i,1+(i-1)%60,
  ((CASE WHEN i<=250 THEN current_date-30+(i-1)/10 ELSE current_date+1+(i-251)/10 END)+time '08:00') AT TIME ZONE 'Asia/Ho_Chi_Minh',
  ((CASE WHEN i<=250 THEN current_date-30+(i-1)/10 ELSE current_date+1+(i-251)/10 END)+time '12:00') AT TIME ZONE 'Asia/Ho_Chi_Minh',3
 FROM generate_series(1,300) i;
 INSERT INTO ung_tuyen(tin_id,sinh_vien_id,trang_thai,xu_ly_boi,xu_ly_luc)
 SELECT DISTINCT c.tin_id,1001+(i-1)%200,'CHAP_NHAN',t.ntd_id,now()
 FROM generate_series(1,500) i JOIN ca_lam_viec c ON c.id=1+(i-1)%250 JOIN tin_tuyen_dung t ON t.id=c.tin_id;
 FOR loop_idx IN 1..500 LOOP
  cid:=1+(loop_idx-1)%250;sv:=1001+(loop_idx-1)%200;
  INSERT INTO nhan_ca(id,ca_id,sinh_vien_id,don_gia_chot,nhan_luc) SELECT loop_idx,cid,sv,1,bat_dau-interval '1 day' FROM ca_lam_viec WHERE id=cid;
 END LOOP;
 INSERT INTO cham_cong(id,nhan_ca_id,check_in_luc,vi_do_in,kinh_do_in,check_out_luc,vi_do_out,kinh_do_out,khoang_cach_in_m,trang_thai_duyet,duyet_boi,duyet_luc,ly_do_duyet)
 SELECT n.id,n.id,c.bat_dau,c.vi_do_chot+CASE WHEN n.id%10=0 THEN 0.003 ELSE 0 END,c.kinh_do_chot,
 c.ket_thuc,c.vi_do_chot,c.kinh_do_chot,0,
 CASE WHEN n.id%10=0 THEN 'CHO_DUYET' WHEN n.id%11=0 THEN 'TU_CHOI' ELSE 'DA_DUYET' END,
 CASE WHEN n.id%10<>0 THEN 1 END,CASE WHEN n.id%10<>0 THEN now() END,
 CASE WHEN n.id%10<>0 THEN 'Kết quả giả lập: '||CASE WHEN n.id%11=0 THEN 'từ chối do không đủ xác minh' ELSE 'đối chiếu ca làm hợp lệ' END END
 FROM nhan_ca n JOIN ca_lam_viec c ON c.id=n.ca_id;
 INSERT INTO bao_cao_lua_dao(id,tin_id,nguoi_bao_id,noi_dung)
 SELECT i,71+(i-1)%10,1000+i,'Báo cáo giả lập: tin có thông tin đáng ngờ cần quản trị kiểm tra, mã '||i FROM generate_series(1,12) i;
 INSERT INTO bang_chung_bao_cao(bao_cao_id,tep_url,mo_ta)
 SELECT i,'https://example.invalid/demo/bang-chung-'||i||'.png','Tệp minh họa giả lập, chưa upload thật' FROM generate_series(1,12) i;
 PERFORM fn_xu_ly_bao_cao(1,1,'DANG_XU_LY','Đã nhận hồ sơ giả lập để kiểm tra');
 PERFORM fn_xu_ly_bao_cao(1,1,'DA_KET_LUAN','Kết luận giả lập: tin cần bổ sung thông tin, không coi là kết luận pháp lý');
 FOR owner_id,tid IN SELECT DISTINCT t.ntd_id,extract(year FROM c.bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::int*100+extract(month FROM c.bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::int
 FROM cham_cong cc JOIN nhan_ca n ON n.id=cc.nhan_ca_id JOIN ca_lam_viec c ON c.id=n.ca_id JOIN tin_tuyen_dung t ON t.id=c.tin_id WHERE cc.trang_thai_duyet='DA_DUYET' LOOP
  PERFORM fn_tinh_luong(1,owner_id,make_date((tid/100)::int,(tid%100)::int,1));
 END LOOP;
 -- Đồng bộ sequence sau khi chèn id cố định.
 FOR t IN SELECT table_name FROM information_schema.columns WHERE table_schema='viec_lam' AND column_name='id' AND is_identity='YES' LOOP
  seqname:=pg_get_serial_sequence('viec_lam.'||t,'id');EXECUTE format('SELECT max(id) FROM viec_lam.%I',t) INTO maxid;
  PERFORM setval(seqname,greatest(coalesce(maxid,1),1),maxid IS NOT NULL);
 END LOOP;
END $seed$;
COMMIT;
