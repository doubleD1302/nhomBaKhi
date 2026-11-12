-- ==============================================================================
-- BẢNG TIẾN ĐỘ DỰ ÁN CHO WEB DASHBOARD (NHÓM BA KHỈ - ĐỀ TÀI 25)
-- Dùng để đồng bộ thời gian thực giữa 4 thành viên (TV01, TV02, TV03, TV04)
-- Chạy script này trong tab SQL Editor trên trang quản trị Supabase của nhóm
-- ==============================================================================

-- 1. Tạo bảng lưu trạng thái 64 task
CREATE TABLE IF NOT EXISTS bang_cong_viec (
    task_id VARCHAR(10) PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'todo',
    progress_percent INT DEFAULT 0,
    actual_hours NUMERIC(5,2) DEFAULT 0,
    pr_link TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(50) DEFAULT ''
);

-- 2. Bật Row Level Security (RLS) và cấp quyền truy cập cho anon key
ALTER TABLE bang_cong_viec ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phep nhom doc ghi tien do" ON bang_cong_viec;
CREATE POLICY "Cho phep nhom doc ghi tien do" 
ON bang_cong_viec 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Tạo bảng lưu cấu hình chung & commit cá nhân (Tùy chọn)
CREATE TABLE IF NOT EXISTS nhat_ky_commit (
    id BIGSERIAL PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    commit_hash VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nhat_ky_commit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phep nhom ghi commit" ON nhat_ky_commit;
CREATE POLICY "Cho phep nhom ghi commit" 
ON nhat_ky_commit 
FOR ALL 
USING (true) 
WITH CHECK (true);
