// Views: Personal Dashboard View (Customized Studio for Each Member)
(function() {
  class PersonalDashboardView {
    render(user, member, stats, commits, onUpdateStatus, onEditTask, onAddCommit) {
      if (!user || !member) return;

      // Personal Hero Banner
      const banner = document.getElementById('personal-hero-banner');
      if (banner) {
        banner.style.background = `linear-gradient(135deg, ${member.avatarColor} 0%, #152B4A 100%)`;
        document.getElementById('personal-hero-icon').innerHTML = window.Icons.get(member.icon || 'server', 'icon-xl');
        document.getElementById('personal-hero-role').textContent = `${member.id} — ${member.name}`;
        document.getElementById('personal-hero-desc').textContent = member.role;
        document.getElementById('personal-hero-backup').innerHTML = `${window.Icons.get('users', 'icon-sm')} Dự phòng hỗ trợ chéo: <strong>${member.backup}</strong>`;
        document.getElementById('personal-hero-hours').innerHTML = `${window.Icons.get('clock', 'icon-sm')} Khối lượng: <strong>${member.plannedHours} giờ (16 task)</strong>`;
      }

      // Personal Task Stats
      document.getElementById('personal-stat-tasks-done').textContent = `${stats.done}/${stats.total}`;
      document.getElementById('personal-stat-tasks-sub').textContent = `${stats.inProgress} đang làm · ${stats.review} chờ duyệt · ${stats.todo} chưa làm`;
      document.getElementById('personal-stat-percent').textContent = `${stats.percent}%`;
      document.getElementById('personal-progress-fill').style.width = `${stats.percent}%`;
      document.getElementById('personal-stat-hours').textContent = `${stats.actualHours.toFixed(1)}h / ${member.plannedHours}h`;

      // Commit Tracker
      const commitCount = commits.length;
      document.getElementById('personal-stat-commit-count').textContent = `${commitCount}/15 commit`;
      const commitPct = Math.min(100, Math.round((commitCount / 15) * 100));
      document.getElementById('personal-commit-progress-fill').style.width = `${commitPct}%`;
      document.getElementById('personal-commit-sub').textContent = commitCount >= 15 
        ? 'Đạt chuẩn yêu cầu của Giảng viên (≥15 commit)' 
        : `Còn thiếu ${15 - commitCount} commit có ý nghĩa rải đều 8 tuần`;

      this.renderCommitList(commits);
      this.renderRoleWorkspace(member);
      this.renderTaskList(member.id, onUpdateStatus, onEditTask);
    }

    renderCommitList(commits) {
      const container = document.getElementById('personal-commits-container');
      if (!container) return;

      if (commits.length === 0) {
        container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px 0;">Chưa có commit nào được ghi nhận. Hãy bấm nút '+ Ghi nhận commit' khi bạn đẩy code lên GitHub.</div>`;
        return;
      }

      container.innerHTML = commits.slice(-5).reverse().map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
          <div>
            <span style="font-family:monospace; background:var(--primary-subtle); color:var(--primary); font-weight:700; padding:1px 5px; border-radius:3px;">${c.hash || 'commit'}</span>
            <span style="margin-left:6px; font-weight:600;">${c.message}</span>
          </div>
          <span style="font-size:11px; color:var(--text-muted);">${c.date || ''}</span>
        </div>
      `).join('');
    }

    renderRoleWorkspace(member) {
      const container = document.getElementById('role-specific-workspace-panel');
      if (!container) return;

      if (member.id === 'TV01') {
        container.innerHTML = `
          <div class="card">
            <div class="card-title">
              <span>${window.Icons.get('server')} Trung Tâm Điều Hành Backend & Cloud Render (TV01)</span>
              <span class="badge-status in_progress">Online HTTPS</span>
            </div>
            <div style="font-size:12.5px; line-height:1.6; margin-bottom:14px;">
              <p><strong>URL Render Web Service:</strong> <a href="${window.PROJECT_DATA.renderUrl}" target="_blank" style="color:var(--primary); font-weight:600;">${window.PROJECT_DATA.renderUrl}</a></p>
              <p><strong>Endpoint Kiểm tra sức khỏe:</strong> <code>GET /health</code> (Đảm bảo trả về HTTP 200 OK)</p>
              <p><strong>Cơ chế bảo mật:</strong> JWT Token tự phát hành, bcrypt băm mật khẩu, phân quyền 3 vai trò (SINH_VIEN, NHA_TUYEN_DUNG, QUAN_TRI) chặt chẽ ở Backend.</p>
            </div>
            <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Checklist Nhiệm Vụ Backend & Deploy:</h4>
            <div id="role-checklist-container"></div>
          </div>
        `;
      } else if (member.id === 'TV02') {
        container.innerHTML = `
          <div class="card">
            <div class="card-title">
              <span>${window.Icons.get('smartphone')} Xưởng Phát Triển App Android Studio (TV02)</span>
              <span class="badge-status in_progress">Java + XML Layout</span>
            </div>
            <div style="font-size:12.5px; line-height:1.6; margin-bottom:14px;">
              <p><strong>Stack kỹ thuật:</strong> Android Studio, Java, XML Layout, Retrofit 2 + Gson, MPAndroidChart, minSdk 24.</p>
              <p><strong>Quy định bắt buộc:</strong> Tên app, Package ID và log TAG phải chứa mã nhóm <code>nhomBaKhi</code>.</p>
              <p><strong>2 Màn hình RecyclerView:</strong> Danh sách Nhà tuyển dụng & Danh sách Tin tuyển dụng.</p>
            </div>
            <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Checklist 10 Tiêu Chí C.1 (Android Admin):</h4>
            <div id="role-checklist-container"></div>
          </div>
        `;
      } else if (member.id === 'TV03') {
        container.innerHTML = `
          <div class="card">
            <div class="card-title">
              <span>${window.Icons.get('layers')} Xưởng Phát Triển App Client Flutter (TV03)</span>
              <span class="badge-status in_progress">Flutter 3.35+ Dart</span>
            </div>
            <div style="font-size:12.5px; line-height:1.6; margin-bottom:14px;">
              <p><strong>Stack kỹ thuật:</strong> Flutter 3.35+, Dart 3, Material 3, Geolocator GPS, Package Http/Dio.</p>
              <p><strong>Điểm nhấn nghiệp vụ:</strong> Check-in/out định vị GPS, Lọc tin phù hợp lịch rảnh (Interval Overlap), Xóa lịch rảnh có <strong>Undo SnackBar</strong>.</p>
              <p><strong>Chất lượng mã nguồn:</strong> Lệnh <code>flutter analyze</code> phải sạch 0 errors.</p>
            </div>
            <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Checklist 10 Tiêu Chí C.2 (Flutter Client):</h4>
            <div id="role-checklist-container"></div>
          </div>
        `;
      } else if (member.id === 'TV04') {
        container.innerHTML = `
          <div class="card">
            <div class="card-title">
              <span>${window.Icons.get('database')} Cơ Sở Dữ Liệu, Core Logic & Kiểm Thử QA (TV04)</span>
              <span class="badge-status in_progress">PostgreSQL ERD ThietKe_De25</span>
            </div>
            <div style="font-size:12.5px; line-height:1.6; margin-bottom:14px;">
              <p><strong>Kết nối CSDL:</strong> Supabase Pooler Session mode IPv4 (cổng 5432).</p>
              <p><strong>Core Logic 1:</strong> API nhận ca bọc trong Transaction có khóa dòng <code>SELECT FOR UPDATE</code> chống overbooking.</p>
              <p><strong>Core Logic 2:</strong> Chấm công GPS tính khoảng cách Haversine. Khoảng cách &gt;200m tự động gắn cờ <code>CAN_DUYET_TAY</code>.</p>
            </div>
            <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Tiến Độ Dữ Liệu Mẫu (Seed Quota) & Test Case:</h4>
            <div id="role-checklist-container"></div>
          </div>
        `;
      }

      this.renderChecklistItems(member);
    }

    renderChecklistItems(member) {
      const container = document.getElementById('role-checklist-container');
      if (!container) return;
      const items = member.roleChecklist || [];

      container.innerHTML = items.map((it, idx) => `
        <div style="display:flex; align-items:flex-start; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12.5px;">
          <input type="checkbox" id="rc_${idx}" ${it.done ? 'checked' : ''} style="margin-top:3px;" />
          <label for="rc_${idx}" style="cursor:pointer; flex:1;">${it.text}</label>
        </div>
      `).join('');

      container.querySelectorAll('input').forEach((cb, idx) => {
        cb.onchange = (e) => {
          items[idx].done = e.target.checked;
          window.ProjectModel.save();
        };
      });
    }

    renderTaskList(memberId, onUpdateStatus, onEditTask) {
      const tbody = document.getElementById('personal-tasks-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const tasks = window.ProjectModel.tasks.filter(t => t.owner === memberId);

      tasks.forEach(t => {
        const tr = document.createElement('tr');
        const isMilestone = ["T026", "T028", "T030", "T032", "T047", "T057", "T058"].includes(t.id);

        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} />
          </td>
          <td style="font-weight:700; color:var(--primary); text-align:center;">${t.id}</td>
          <td>
            <div style="font-weight:600;">${isMilestone ? `${window.Icons.get('flag', 'icon-sm text-amber')} ` : ''}${t.name}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${t.done}</div>
          </td>
          <td style="text-align:center; font-weight:600;">Tuần ${t.start}</td>
          <td style="text-align:center; font-weight:700;">${t.hours}h</td>
          <td style="text-align:center;">
            <select class="select-input" style="padding:2px 6px; font-size:11px;">
              <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Chưa bắt đầu</option>
              <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Đang làm</option>
              <option value="review" ${t.status === 'review' ? 'selected' : ''}>Chờ review</option>
              <option value="done" ${t.status === 'done' ? 'selected' : ''}>Hoàn thành</option>
            </select>
          </td>
          <td style="text-align:center;">
            ${t.prLink ? `<a href="${t.prLink}" target="_blank" style="color:var(--primary); font-weight:600;">${window.Icons.get('git-pull-request', 'icon-sm')} PR</a>` : '—'}
          </td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-edit" style="padding:2px 8px; font-size:11px;">
              ${window.Icons.get('edit', 'icon-sm')} Sửa
            </button>
          </td>
        `;

        tr.querySelector('input[type="checkbox"]').onchange = (e) => {
          if (onUpdateStatus) onUpdateStatus(t.id, e.target.checked ? 'done' : 'todo');
        };

        tr.querySelector('select').onchange = (e) => {
          if (onUpdateStatus) onUpdateStatus(t.id, e.target.value);
        };

        tr.querySelector('.btn-edit').onclick = () => {
          if (onEditTask) onEditTask(t.id);
        };

        tbody.appendChild(tr);
      });
    }
  }

  window.PersonalDashboardView = new PersonalDashboardView();
})();
