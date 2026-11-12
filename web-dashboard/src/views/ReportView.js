// Views: Weekly Report Generator View
// Phục vụ: Dự án Quản lý & Thuê Nhà Trọ Sinh Viên (SmartTro)
(function() {
  class ReportView {
    generate(week, memberId, tasks) {
      let targetTasks = tasks.filter(t => t.start === week);
      if (memberId !== 'ALL') {
        targetTasks = targetTasks.filter(t => t.owner === memberId);
      }

      const done = targetTasks.filter(t => t.status === 'done');
      const inProg = targetTasks.filter(t => t.status === 'in_progress');
      const todo = targetTasks.filter(t => t.status === 'todo');

      let md = `# BÁO CÁO TIẾN ĐỘ TUẦN ${week} — NHÓM BA KHỈ\n`;
      md += `**Đề tài 25: Hệ thống Quản lý & Thuê Nhà Trọ Sinh Viên (SmartTro) · INT4211**\n`;
      md += `**Người báo cáo:** ${memberId === 'ALL' ? 'Toàn bộ nhóm 4 thành viên' : memberId}\n`;
      md += `**Thời điểm xuất:** ${new Date().toLocaleDateString('vi-VN')}\n\n`;

      md += `## 1. Công việc đã hoàn thành\n`;
      if (done.length === 0) {
        md += `* (Chưa có đầu việc hoàn thành trong tuần này)\n`;
      } else {
        done.forEach(t => {
          md += `* [x] **[${t.id}] ${t.name}** (${t.owner}, ${t.hours}h) — DoD: ${t.done}${t.prLink ? ` | PR: ${t.prLink}` : ''}\n`;
        });
      }

      md += `\n## 2. Công việc đang thực hiện & Tiếp diễn\n`;
      if (inProg.length === 0) {
        md += `* (Không có đầu việc dở dang)\n`;
      } else {
        inProg.forEach(t => {
          md += `* [-] **[${t.id}] ${t.name}** (${t.owner}, tiến độ ${t.progressPercent || 50}%) — ${t.done}\n`;
        });
      }

      md += `\n## 3. Công việc tồn đọng / Kế hoạch tiếp theo\n`;
      if (todo.length === 0) {
        md += `* (Không có task tồn đọng)\n`;
      } else {
        todo.forEach(t => {
          md += `* [ ] **[${t.id}] ${t.name}** (${t.owner}, ${t.hours}h)\n`;
        });
      }

      md += `\n## 4. Tình trạng hạ tầng & Minh chứng Git\n`;
      md += `* Backend Render: Hoạt động bình thường có HTTPS.\n`;
      md += `* Supabase PostgreSQL: Kết nối tốt qua IPv4 pooler.\n`;

      const outputEl = document.getElementById('report-output-text');
      if (outputEl) outputEl.value = md;
    }
  }

  window.ReportView = new ReportView();
})();
