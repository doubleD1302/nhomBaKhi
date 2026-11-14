// Views: Weekly Report Generator View
// Phục vụ: Dự án quản lý việc làm bán thời gian cho sinh viên
(function() {
  class ReportView {
    generate(week, memberId, tasks) {
      let targetTasks = tasks.filter(t => t.start === week);
      if (memberId !== 'ALL') {
        targetTasks = targetTasks.filter(t => t.owner === memberId);
      }

      const done = targetTasks.filter(t => t.status === 'done');
      const inProg = targetTasks.filter(t => t.status === 'in_progress');
      const review = targetTasks.filter(t => t.status === 'review');
      const todo = targetTasks.filter(t => t.status === 'todo');

      let md = `# BÁO CÁO TIẾN ĐỘ TUẦN ${week} — NHÓM BÁ KHÍ\n`;
      md += `**Đề tài 25: Nền tảng tìm kiếm việc làm cho sinh viên · INT4211**\n`;
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
          md += `* [-] **[${t.id}] ${t.name}** (${t.owner}, tiến độ ${t.progressPercent ?? 0}%) — ${t.done}\n`;
        });
      }

      if (review.length) {
        md += `\n### Chờ review / test\n`;
        review.forEach(t => {
          md += `* **[${t.id}] ${t.name}** (${t.owner})${t.prLink ? ` | Minh chứng: ${t.prLink}` : ''}\n`;
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
      md += `* Backend Render: Chưa xác minh trong báo cáo này; kiểm tra HTTPS /health và /ready, đính kèm log.\n`;
      md += `* Supabase PostgreSQL: Chưa xác minh trong báo cáo này; cần kết quả truy vấn và đối chiếu schema.\n`;

      const outputEl = document.getElementById('report-output-text');
      if (outputEl) outputEl.value = md;
    }
  }

  window.ReportView = new ReportView();
})();
