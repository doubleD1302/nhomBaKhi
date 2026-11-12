// Views: Personal Dashboard View (Customized Studio for Each Member)
// Phục vụ: Dự án Quản lý & Thuê Nhà Trọ Sinh Viên (SmartTro)
(function() {
  class PersonalDashboardView {
    constructor() {
      this.currentFilter = 'ALL';
    }

    render(user, member, stats, commits, onUpdateStatus, onEditTask, onAddCommit, onDeleteCommit) {
      if (!user || !member) return;

      // 1. Personal Hero Banner
      const banner = document.getElementById('personal-hero-banner');
      if (banner) {
        banner.style.background = `linear-gradient(135deg, ${member.avatarColor} 0%, #0F203C 100%)`;
        document.getElementById('personal-hero-icon').innerHTML = window.Icons.get(member.icon || 'building', 'icon-xl');
        
        // Vai trò và Người phụ trách hiện tại
        document.getElementById('personal-hero-role').innerHTML = `
          <span>${member.id} · ${member.name}</span>
          <span class="hero-user-badge">
            ${window.Icons.get('user-check', 'icon-sm')} 
            <strong>${user.name}</strong> (MSSV: ${user.mssv})
          </span>
        `;
        document.getElementById('personal-hero-desc').textContent = member.role;

        // HỖ TRỢ CHÉO: Cập nhật hiển thị Tên và MSSV của người nhận vai trò dự phòng (TV04, TV01,...)
        const backupId = member.backup;
        const backupClaim = window.UserModel ? window.UserModel.isRoleClaimed(backupId) : { isClaimed: false };

        let backupHtml = '';
        if (backupClaim.isClaimed && backupClaim.owner) {
          backupHtml = `
            <span class="hero-chip chip-claimed" title="Thành viên phụ trách hỗ trợ chéo cho bạn">
              ${window.Icons.get('users', 'icon-sm')} 
              Hỗ trợ chéo: <strong class="backup-name-highlight">${backupId} · ${backupClaim.owner.name}</strong> 
              <span class="backup-mssv-chip">MSSV: ${backupClaim.owner.mssv}</span>
            </span>
          `;
        } else {
          backupHtml = `
            <span class="hero-chip chip-vacant" title="Vai trò này hiện chưa có thành viên nào nhận trên Cloud">
              ${window.Icons.get('users', 'icon-sm')} 
              Hỗ trợ chéo: <strong>${backupId}</strong> 
              <span class="backup-vacant-chip">(Chưa có người nhận)</span>
            </span>
          `;
        }
        document.getElementById('personal-hero-backup').innerHTML = backupHtml;

        document.getElementById('personal-hero-hours').innerHTML = `
          <span class="hero-chip">
            ${window.Icons.get('clock', 'icon-sm')} Khối lượng: <strong>${member.plannedHours} giờ (16 đầu việc)</strong>
          </span>
        `;
      }

      // 2. Project Team Roster Strip (Hiển thị danh sách 4 thành viên cùng vai trò & hỗ trợ chéo)
      this.renderTeamRosterStrip(user.memberId);

      // 3. Personal Task Stats
      document.getElementById('personal-stat-tasks-done').textContent = `${stats.done}/${stats.total}`;
      document.getElementById('personal-stat-tasks-sub').textContent = `${stats.inProgress} đang làm · ${stats.review} chờ duyệt · ${stats.todo} chưa làm`;
      document.getElementById('personal-stat-percent').textContent = `${stats.percent}%`;
      document.getElementById('personal-progress-fill').style.width = `${stats.percent}%`;
      document.getElementById('personal-stat-hours').textContent = `${stats.actualHours.toFixed(1)}h / ${member.plannedHours}h`;

      // 4. Commit Tracker (Header Mini Widget)
      const commitCount = commits.length;
      document.getElementById('personal-stat-commit-count').textContent = `${commitCount}/15 commit`;
      const commitPct = Math.min(100, Math.round((commitCount / 15) * 100));
      document.getElementById('personal-commit-progress-fill').style.width = `${commitPct}%`;
      document.getElementById('personal-commit-sub').textContent = commitCount >= 15 
        ? 'Đạt chuẩn yêu cầu của Giảng viên (≥15 commit)' 
        : `Còn thiếu ${15 - commitCount} commit có ý nghĩa rải đều 8 tuần`;

      this.renderCommitList(commits, user.memberId, onDeleteCommit);
      this.renderRoleWorkspace(member);
      this.renderTaskList(member.id, onUpdateStatus, onEditTask);
    }

    renderTeamRosterStrip(activeMemberId) {
      let rosterContainer = document.getElementById('team-roster-mini-strip');
      if (!rosterContainer) {
        rosterContainer = document.createElement('div');
        rosterContainer.id = 'team-roster-mini-strip';
        rosterContainer.className = 'team-roster-bar';
        const banner = document.getElementById('personal-hero-banner');
        if (banner && banner.parentNode) {
          banner.parentNode.insertBefore(rosterContainer, banner.nextSibling);
        }
      }

      const members = window.ProjectModel.members || [];
      rosterContainer.innerHTML = `
        <div class="roster-title">
          ${window.Icons.get('users', 'icon-sm')} 
          <span>Đội Ngũ 4 Thành Viên Dự Án (Kết Nối & Hỗ Trợ Chéo):</span>
        </div>
        <div class="roster-grid">
          ${members.map(m => {
            const claim = window.UserModel ? window.UserModel.isRoleClaimed(m.id) : { isClaimed: false };
            const isMe = m.id === activeMemberId;
            let statusHtml = '';
            if (claim.isClaimed && claim.owner) {
              statusHtml = `
                <div class="roster-card claimed ${isMe ? 'is-me' : ''}">
                  <span class="status-pulse-dot"></span>
                  <div class="roster-info">
                    <span class="roster-role">${m.id} · ${m.shortTitle}</span>
                    <strong class="roster-name">${claim.owner.name}</strong>
                    <span class="roster-mssv">MSSV: ${claim.owner.mssv}</span>
                  </div>
                  ${isMe ? '<span class="badge-me">Bạn</span>' : ''}
                </div>
              `;
            } else {
              statusHtml = `
                <div class="roster-card vacant">
                  <span class="status-vacant-dot"></span>
                  <div class="roster-info">
                    <span class="roster-role">${m.id} · ${m.shortTitle}</span>
                    <span class="roster-name-empty">Chưa có người nhận</span>
                    <span class="roster-mssv">—</span>
                  </div>
                </div>
              `;
            }
            return statusHtml;
          }).join('')}
        </div>
      `;
    }

    renderCommitList(commits, memberId, onDeleteCommit) {
      const container = document.getElementById('personal-commits-container');
      const meterCount = document.getElementById('commit-meter-count');
      const meterBar = document.getElementById('commit-meter-bar');
      const meterStatus = document.getElementById('commit-meter-status');

      const count = (commits || []).length;
      const pct = Math.min(100, Math.round((count / 15) * 100));

      if (meterCount) meterCount.textContent = `${count} / 15 (${pct}%)`;
      if (meterBar) meterBar.style.width = `${pct}%`;

      if (meterStatus) {
        if (count === 0) {
          meterStatus.className = 'commit-meter-status status-alert';
          meterStatus.innerHTML = `<strong>Chưa có commit nào</strong> — Bấm '<strong>+ Ghi Nhận Commit</strong>' bên trên để lưu lịch sử làm việc!`;
        } else if (count < 15) {
          meterStatus.className = 'commit-meter-status status-progress';
          meterStatus.innerHTML = `Đã ghi nhận <strong>${count}/15</strong> commit — Cần thêm <strong>${15 - count}</strong> commit nữa để đạt chuẩn A+ (≥ 15 commit)`;
        } else {
          meterStatus.className = 'commit-meter-status status-success';
          meterStatus.innerHTML = `<strong>Xuất sắc!</strong> Đã hoàn thành chỉ tiêu ${count} commit (Đạt chuẩn tối đa tiêu chí E.3 của Giảng viên).`;
        }
      }

      if (!container) return;

      if (!commits || commits.length === 0) {
        container.innerHTML = `
          <div class="commit-empty-box">
            <div class="commit-empty-icon">
              ${window.Icons.get('git-commit', 'icon-md')}
            </div>
            <div class="commit-empty-title">Chưa ghi nhận commit nào trên repository</div>
            <div class="commit-empty-desc">
              Giảng viên sẽ đối soát trực tiếp commit của từng cá nhân khi bảo vệ đồ án. Mỗi lần bạn push code lên GitHub, hãy bấm ghi nhận để tính điểm.
            </div>
            <button type="button" class="btn btn-outline btn-sm btn-empty-add-commit" style="margin-top:6px; font-size:11.5px; border-color:var(--indigo); color:var(--indigo);">
              ${window.Icons.get('plus', 'icon-xs')} Thêm Commit Đầu Tiên
            </button>
          </div>
        `;
        container.querySelector('.btn-empty-add-commit')?.addEventListener('click', () => {
          window.AppController?.openAddCommitModal?.();
        });
        return;
      }

      // Render reverse order (newest first)
      const reversed = commits.map((c, i) => ({ ...c, originalIndex: i })).reverse();

      container.innerHTML = reversed.map(c => {
        // Extract [Txxx] task tag if present
        const match = c.message.match(/\[(T\d{3})\]/i);
        const taskTag = match ? match[1].toUpperCase() : null;
        const cleanMsg = match ? c.message.replace(/\[T\d{3}\]\s*/i, '') : c.message;

        return `
          <div class="commit-timeline-item">
            <div class="commit-item-main">
              <span class="commit-hash-pill" title="Mã hash GitHub (Bấm để copy)">${c.hash || 'commit'}</span>
              ${taskTag ? `<span class="commit-task-badge">${taskTag}</span>` : ''}
              <span class="commit-msg-text" title="${c.message}">${cleanMsg}</span>
            </div>
            <div class="commit-meta">
              <span class="commit-time-badge">${c.date || 'Hôm nay'}</span>
              <button type="button" class="commit-delete-btn" data-index="${c.originalIndex}" title="Xóa commit này">
                ${window.Icons.get('trash', 'icon-xs')}
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Attach copy listeners
      container.querySelectorAll('.commit-hash-pill').forEach(pill => {
        pill.onclick = () => {
          navigator.clipboard.writeText(pill.textContent.trim()).then(() => {
            window.AppController?.showToast?.("Đã sao chép mã hash commit!");
          });
        };
      });

      // Attach delete listeners
      container.querySelectorAll('.commit-delete-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index, 10);
          if (confirm("Bạn có chắc chắn muốn xóa bản ghi commit này?")) {
            if (onDeleteCommit) {
              onDeleteCommit(memberId, idx);
            }
          }
        };
      });
    }

    renderRoleWorkspace(member) {
      const container = document.getElementById('role-specific-workspace-panel');
      if (!container) return;

      const checklistItems = member.roleChecklist || [];
      const doneCount = checklistItems.filter(i => i.done).length;
      const totalCount = checklistItems.length;
      const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

      let workspaceContent = '';

      if (member.id === 'TV01') {
        workspaceContent = `
          <div class="studio-header">
            <div class="studio-title-box">
              <div class="studio-avatar-badge" style="background: linear-gradient(135deg, ${member.avatarColor} 0%, #0F766E 100%);">
                ${window.Icons.get('server', 'icon-lg')}
              </div>
              <div>
                <div class="studio-title-text">Trung Tâm Điều Hành Backend & Cloud Render (TV01)</div>
                <div class="studio-sub-text">Node.js 20 / Express 4 · Supabase Pooler (IPv4 5432) · Render Cloud Hosting</div>
              </div>
            </div>
            <span class="studio-badge-live">
              <span class="pulse-dot"></span>
              Online HTTPS
            </span>
          </div>

          <!-- Console & Environment Controls -->
          <div class="studio-console-box">
            <div class="studio-url-row">
              <span class="studio-url-label">Render Cloud Web Service:</span>
              <div class="studio-actions-row">
                <a href="${window.PROJECT_DATA.renderUrl}" target="_blank" class="studio-btn studio-btn-primary">
                  ${window.Icons.get('external-link', 'icon-xs')} Mở Dịch Vụ
                </a>
                <button type="button" id="btn-copy-render-url" class="studio-btn studio-btn-outline">
                  ${window.Icons.get('copy', 'icon-xs')} Sao Chép URL
                </button>
                <button type="button" id="btn-ping-health" class="studio-btn studio-btn-accent">
                  ${window.Icons.get('activity', 'icon-xs')} Ping /health
                </button>
              </div>
            </div>
            <div>
              <span class="studio-url-badge">${window.PROJECT_DATA.renderUrl}</span>
            </div>
            <div id="studio-ping-result" class="studio-ping-result">
              <span id="studio-ping-text"></span>
            </div>
            <div style="font-size:11.5px; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
              <span>Healthcheck Spec:</span>
              <span class="method-badge get">GET</span>
              <code>/health</code>
              <span>&rarr; Đảm bảo HTTP 200 OK & { status: "ok" }</span>
            </div>
          </div>

          <!-- Core Feature Badges Grid -->
          <div class="studio-features-grid">
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('building', 'icon-xs')} Danh Mục Phòng & Cọc
              </div>
              <div class="studio-feature-desc">REST API CRUD phòng trọ, chống trùng lặp giữ chỗ overbooking.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('zap', 'icon-xs')} Điện Nước Lũy Tiến
              </div>
              <div class="studio-feature-desc">Thuật toán bậc thang chốt chỉ số công tơ điện và tiền nước theo đầu người.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('credit-card', 'icon-xs')} VietQR Chuẩn NapAS
              </div>
              <div class="studio-feature-desc">Tự động sinh mã VietQR chuyển khoản ngân hàng chính xác tiền hóa đơn.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('shield', 'icon-xs')} JWT & Bcrypt Bảo Mật
              </div>
              <div class="studio-feature-desc">Phân quyền 3 tác nhân: SINH_VIEN, CHU_TRO, QUAN_TRI không lộ mật khẩu.</div>
            </div>
          </div>

          <!-- Checklist Section -->
          <div class="studio-checklist-box">
            <div class="studio-checklist-header">
              <span class="studio-checklist-title">
                ${window.Icons.get('check-square', 'icon-xs')} Checklist 8 Tiêu Chuẩn Backend & Triển Khai:
              </span>
              <span id="role-checklist-count-badge" class="studio-checklist-counter">${doneCount}/${totalCount} (${pct}%)</span>
            </div>
            <div class="studio-checklist-bar">
              <div id="role-checklist-bar-fill" class="studio-checklist-bar-fill" style="width:${pct}%;"></div>
            </div>
            <div id="role-checklist-container" class="studio-checklist-list"></div>
          </div>
        `;
      } else if (member.id === 'TV02') {
        workspaceContent = `
          <div class="studio-header">
            <div class="studio-title-box">
              <div class="studio-avatar-badge" style="background: linear-gradient(135deg, ${member.avatarColor} 0%, #1D4ED8 100%);">
                ${window.Icons.get('smartphone', 'icon-lg')}
              </div>
              <div>
                <div class="studio-title-text">Ứng Dụng Android Chủ Trọ & Quản Lý Tòa Nhà (TV02)</div>
                <div class="studio-sub-text">Android Studio · Java · XML Layout · Retrofit 2 · MPAndroidChart · minSdk 24</div>
              </div>
            </div>
            <span class="studio-badge-live">
              <span class="pulse-dot"></span>
              minSdk 24
            </span>
          </div>

          <div class="studio-console-box">
            <div class="studio-url-row">
              <span class="studio-url-label">Quy chuẩn Mã Nguồn & Định Danh:</span>
              <div class="studio-actions-row">
                <button type="button" id="btn-copy-pkg-tv02" class="studio-btn studio-btn-outline">
                  ${window.Icons.get('copy', 'icon-xs')} Sao Chép Package ID
                </button>
              </div>
            </div>
            <div>
              <span class="studio-url-badge">com.nhombakhi.smarttro.admin</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-muted);">
              Quy định bắt buộc: Tên app, Package ID và log TAG phải mang mã nhóm <code>nhomBaKhi</code>.
            </div>
          </div>

          <div class="studio-features-grid">
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('layout', 'icon-xs')} RecyclerView 2 Danh Mục
              </div>
              <div class="studio-feature-desc">Danh sách phòng trọ & hóa đơn với ViewHolder tối ưu mượt mà.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('zap', 'icon-xs')} Chốt Số Điện Nước
              </div>
              <div class="studio-feature-desc">Giao diện nhập chỉ số công tơ định kỳ có validation và tính tức thì.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('credit-card', 'icon-xs')} Hóa Đơn & Mã VietQR
              </div>
              <div class="studio-feature-desc">Xuất hóa đơn thanh toán tiền phòng tích hợp hiển thị mã QR thu tiền.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('bar-chart', 'icon-xs')} Biểu Đồ MPAndroidChart
              </div>
              <div class="studio-feature-desc">Thống kê doanh thu theo tháng và công nợ trực quan bằng biểu đồ cột.</div>
            </div>
          </div>

          <div class="studio-checklist-box">
            <div class="studio-checklist-header">
              <span class="studio-checklist-title">
                ${window.Icons.get('check-square', 'icon-xs')} Checklist 10 Tiêu Chí C.1 (Android Admin & Chủ Trọ):
              </span>
              <span id="role-checklist-count-badge" class="studio-checklist-counter">${doneCount}/${totalCount} (${pct}%)</span>
            </div>
            <div class="studio-checklist-bar">
              <div id="role-checklist-bar-fill" class="studio-checklist-bar-fill" style="width:${pct}%;"></div>
            </div>
            <div id="role-checklist-container" class="studio-checklist-list"></div>
          </div>
        `;
      } else if (member.id === 'TV03') {
        workspaceContent = `
          <div class="studio-header">
            <div class="studio-title-box">
              <div class="studio-avatar-badge" style="background: linear-gradient(135deg, ${member.avatarColor} 0%, #0284C7 100%);">
                ${window.Icons.get('layers', 'icon-lg')}
              </div>
              <div>
                <div class="studio-title-text">Ứng Dụng Flutter Cho Sinh Viên Thuê Trọ (TV03)</div>
                <div class="studio-sub-text">Flutter 3.35+ · Dart 3 · Material 3 · Geolocator GPS · SharedPreferences</div>
              </div>
            </div>
            <span class="studio-badge-live">
              <span class="pulse-dot"></span>
              Material 3
            </span>
          </div>

          <div class="studio-console-box">
            <div class="studio-url-row">
              <span class="studio-url-label">Chất lượng Mã Nguồn & Tiêu Chuẩn:</span>
              <div class="studio-actions-row">
                <button type="button" id="btn-copy-cmd-tv03" class="studio-btn studio-btn-outline">
                  ${window.Icons.get('copy', 'icon-xs')} Copy Lệnh Analyze
                </button>
              </div>
            </div>
            <div>
              <span class="studio-url-badge">flutter analyze --fatal-infos</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-muted);">
              Yêu cầu đồ án: Mã nguồn Dart phải sạch 100% (0 errors, 0 warnings).
            </div>
          </div>

          <div class="studio-features-grid">
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('navigation', 'icon-xs')} GPS Haversine Bán Kính
              </div>
              <div class="studio-feature-desc">Tìm phòng trọ theo khoảng cách thực tế quanh trường đại học.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('filter', 'icon-xs')} Bộ Lọc Tiện Ích Phòng
              </div>
              <div class="studio-feature-desc">Lọc giá, máy lạnh, gác lửng, ban công, giờ giấc tự do không chung chủ.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('file-text', 'icon-xs')} Đặt Cọc & Hợp Đồng
              </div>
              <div class="studio-feature-desc">Gửi yêu cầu giữ phòng trực tuyến kèm xác nhận điều khoản hợp đồng.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('refresh-cw', 'icon-xs')} Báo Hỏng & Undo SnackBar
              </div>
              <div class="studio-feature-desc">Gửi phản ánh sửa chữa cho chủ trọ, tích hợp thanh Undo SnackBar hoàn tác.</div>
            </div>
          </div>

          <div class="studio-checklist-box">
            <div class="studio-checklist-header">
              <span class="studio-checklist-title">
                ${window.Icons.get('check-square', 'icon-xs')} Checklist 10 Tiêu Chí C.2 (Flutter Sinh Viên):
              </span>
              <span id="role-checklist-count-badge" class="studio-checklist-counter">${doneCount}/${totalCount} (${pct}%)</span>
            </div>
            <div class="studio-checklist-bar">
              <div id="role-checklist-bar-fill" class="studio-checklist-bar-fill" style="width:${pct}%;"></div>
            </div>
            <div id="role-checklist-container" class="studio-checklist-list"></div>
          </div>
        `;
      } else if (member.id === 'TV04') {
        workspaceContent = `
          <div class="studio-header">
            <div class="studio-title-box">
              <div class="studio-avatar-badge" style="background: linear-gradient(135deg, ${member.avatarColor} 0%, #4338CA 100%);">
                ${window.Icons.get('database', 'icon-lg')}
              </div>
              <div>
                <div class="studio-title-text">Cơ Sở Dữ Liệu PostgreSQL & Kiểm Thử QA (TV04)</div>
                <div class="studio-sub-text">Supabase PostgreSQL 15+ · Session Mode IPv4 5432 · 25 Integration Tests</div>
              </div>
            </div>
            <span class="studio-badge-live">
              <span class="pulse-dot"></span>
              PostgreSQL 15
            </span>
          </div>

          <div class="studio-console-box">
            <div class="studio-url-row">
              <span class="studio-url-label">Kết Nối Supabase Pooler IPv4:</span>
              <div class="studio-actions-row">
                <button type="button" id="btn-copy-db-host" class="studio-btn studio-btn-outline">
                  ${window.Icons.get('copy', 'icon-xs')} Sao Chép Host DB
                </button>
              </div>
            </div>
            <div>
              <span class="studio-url-badge">aws-0-ap-northeast-2.pooler.supabase.com:5432</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-muted);">
              Định mức dữ liệu mẫu: &ge;25 Chủ trọ · &ge;80 Phòng · &ge;200 Sinh viên · &ge;300 Hóa đơn.
            </div>
          </div>

          <div class="studio-features-grid">
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('lock', 'icon-xs')} Khóa Dòng FOR UPDATE
              </div>
              <div class="studio-feature-desc">Transaction CSDL chống tình trạng overbooking khi 2 người cùng giữ phòng.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('zap', 'icon-xs')} Công Thức Điện Nước
              </div>
              <div class="studio-feature-desc">Hàm tính toán lũy tiến hóa đơn và định mức lưu trữ CSDL chuẩn xác.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('database', 'icon-xs')} 12 Bảng CSDL Chuẩn Hóa
              </div>
              <div class="studio-feature-desc">Mô hình quan hệ 3NF với ràng buộc khóa ngoại (FK) chặt chẽ.</div>
            </div>
            <div class="studio-feature-card">
              <div class="studio-feature-title">
                ${window.Icons.get('check-circle', 'icon-xs')} 25 Kịch Bản Kiểm Thử QA
              </div>
              <div class="studio-feature-desc">Test case xuyên suốt tích hợp từ Database -> API -> 2 ứng dụng di động.</div>
            </div>
          </div>

          <div class="studio-checklist-box">
            <div class="studio-checklist-header">
              <span class="studio-checklist-title">
                ${window.Icons.get('check-square', 'icon-xs')} Tiến Độ Dữ Liệu Mẫu & Test Case (TV04):
              </span>
              <span id="role-checklist-count-badge" class="studio-checklist-counter">${doneCount}/${totalCount} (${pct}%)</span>
            </div>
            <div class="studio-checklist-bar">
              <div id="role-checklist-bar-fill" class="studio-checklist-bar-fill" style="width:${pct}%;"></div>
            </div>
            <div id="role-checklist-container" class="studio-checklist-list"></div>
          </div>
        `;
      }

      container.innerHTML = `<div class="card studio-card-pro">${workspaceContent}</div>`;

      // Render interactive checklist
      this.renderChecklistItems(member);

      // Event listeners for quick actions inside studio
      document.getElementById('btn-copy-render-url')?.addEventListener('click', () => {
        navigator.clipboard.writeText(window.PROJECT_DATA.renderUrl).then(() => {
          window.AppController?.showToast?.("Đã sao chép URL Render Web Service!");
        });
      });

      document.getElementById('btn-copy-pkg-tv02')?.addEventListener('click', () => {
        navigator.clipboard.writeText("com.nhombakhi.smarttro.admin").then(() => {
          window.AppController?.showToast?.("Đã sao chép Package ID Android!");
        });
      });

      document.getElementById('btn-copy-cmd-tv03')?.addEventListener('click', () => {
        navigator.clipboard.writeText("flutter analyze --fatal-infos").then(() => {
          window.AppController?.showToast?.("Đã sao chép lệnh flutter analyze!");
        });
      });

      document.getElementById('btn-copy-db-host')?.addEventListener('click', () => {
        navigator.clipboard.writeText("aws-0-ap-northeast-2.pooler.supabase.com").then(() => {
          window.AppController?.showToast?.("Đã sao chép Host CSDL Supabase!");
        });
      });

      // Live Ping /health button
      document.getElementById('btn-ping-health')?.addEventListener('click', async () => {
        const pingBtn = document.getElementById('btn-ping-health');
        const resultBox = document.getElementById('studio-ping-result');
        const textSpan = document.getElementById('studio-ping-text');
        if (!pingBtn || !resultBox || !textSpan) return;

        pingBtn.innerHTML = `${window.Icons.get('refresh-cw', 'spin icon-xs')} Đang kiểm tra...`;
        resultBox.className = 'studio-ping-result active';
        textSpan.textContent = 'Đang gửi yêu cầu GET /health...';

        const startTime = Date.now();
        try {
          const res = await fetch(`${window.PROJECT_DATA.renderUrl}/health`, { method: 'GET', mode: 'cors' });
          const latency = Date.now() - startTime;
          if (res.ok) {
            resultBox.style.background = 'rgba(16, 185, 129, 0.12)';
            resultBox.style.color = '#059669';
            resultBox.style.borderColor = 'rgba(16, 185, 129, 0.25)';
            textSpan.innerHTML = `<strong>● HTTP 200 OK</strong> — Độ trễ: <strong>${latency}ms</strong> — Web Service hoạt động ổn định!`;
          } else {
            resultBox.style.background = 'rgba(239, 68, 68, 0.12)';
            resultBox.style.color = '#DC2626';
            resultBox.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            textSpan.innerHTML = `<strong>● HTTP ${res.status}</strong> — Độ trễ: ${latency}ms`;
          }
        } catch (e) {
          const latency = Date.now() - startTime;
          // In case of CORS or cold boot on free Render tier
          resultBox.style.background = 'rgba(59, 130, 246, 0.12)';
          resultBox.style.color = '#2563EB';
          resultBox.style.borderColor = 'rgba(59, 130, 246, 0.25)';
          textSpan.innerHTML = `<strong>● Web Service Standby</strong> — Render server đang thức dậy (Cold boot ~30s) hoặc bảo vệ CORS.`;
        }

        pingBtn.innerHTML = `${window.Icons.get('activity', 'icon-xs')} Ping /health`;
      });
    }

    renderChecklistItems(member) {
      const container = document.getElementById('role-checklist-container');
      if (!container) return;
      const items = member.roleChecklist || [];

      container.innerHTML = items.map((it, idx) => `
        <div class="studio-check-item ${it.done ? 'is-done' : ''}">
          <input type="checkbox" id="rc_${idx}" ${it.done ? 'checked' : ''} />
          <label for="rc_${idx}">${it.text}</label>
        </div>
      `).join('');

      container.querySelectorAll('input').forEach((cb, idx) => {
        cb.onchange = (e) => {
          items[idx].done = e.target.checked;
          const parentItem = cb.closest('.studio-check-item');
          if (parentItem) {
            if (e.target.checked) parentItem.classList.add('is-done');
            else parentItem.classList.remove('is-done');
          }

          // Update progress bar
          const done = items.filter(x => x.done).length;
          const total = items.length;
          const pct = Math.round((done / total) * 100);

          const countBadge = document.getElementById('role-checklist-count-badge');
          if (countBadge) countBadge.textContent = `${done}/${total} (${pct}%)`;

          const barFill = document.getElementById('role-checklist-bar-fill');
          if (barFill) barFill.style.width = `${pct}%`;

          window.ProjectModel.save();
          window.AppController?.showToast?.(e.target.checked ? "Đã đánh dấu hoàn thành mục tiêu!" : "Đã hủy đánh dấu mục tiêu.");
        };
      });
    }

    renderTaskList(memberId, onUpdateStatus, onEditTask) {
      const tbody = document.getElementById('personal-tasks-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      let tasks = window.ProjectModel.tasks.filter(t => t.owner === memberId);

      // Render filter tabs if not already present
      let filterBar = document.getElementById('personal-task-filter-bar');
      if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.id = 'personal-task-filter-bar';
        filterBar.className = 'personal-filter-pills';
        const tableContainer = tbody.closest('.table-container');
        if (tableContainer && tableContainer.parentNode) {
          tableContainer.parentNode.insertBefore(filterBar, tableContainer);
        }
      }

      const allCount = tasks.length;
      const todoCount = tasks.filter(t => (t.status || 'todo') === 'todo').length;
      const inProgCount = tasks.filter(t => t.status === 'in_progress').length;
      const reviewCount = tasks.filter(t => t.status === 'review').length;
      const doneCount = tasks.filter(t => t.status === 'done').length;

      filterBar.innerHTML = `
        <button class="pill-btn ${this.currentFilter === 'ALL' ? 'active' : ''}" data-status="ALL">Tất cả (${allCount})</button>
        <button class="pill-btn ${this.currentFilter === 'todo' ? 'active' : ''}" data-status="todo">Chưa làm (${todoCount})</button>
        <button class="pill-btn ${this.currentFilter === 'in_progress' ? 'active' : ''}" data-status="in_progress">Đang làm (${inProgCount})</button>
        <button class="pill-btn ${this.currentFilter === 'review' ? 'active' : ''}" data-status="review">Chờ duyệt (${reviewCount})</button>
        <button class="pill-btn ${this.currentFilter === 'done' ? 'active' : ''}" data-status="done">Đã xong (${doneCount})</button>
      `;

      filterBar.querySelectorAll('.pill-btn').forEach(btn => {
        btn.onclick = () => {
          this.currentFilter = btn.dataset.status;
          this.renderTaskList(memberId, onUpdateStatus, onEditTask);
        };
      });

      // Filter tasks by currentFilter
      if (this.currentFilter !== 'ALL') {
        tasks = tasks.filter(t => (t.status || 'todo') === this.currentFilter);
      }

      if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">Không có đầu việc nào trong bộ lọc này.</td></tr>`;
        return;
      }

      tasks.forEach(t => {
        const tr = document.createElement('tr');
        const isMilestone = ["T026", "T028", "T030", "T032", "T047", "T057", "T058"].includes(t.id);
        const isDone = t.status === 'done';

        tr.className = isDone ? 'task-row-done' : '';
        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" class="task-checkbox-quick" ${isDone ? 'checked' : ''} title="Đánh dấu đã hoàn thành (100%)" />
          </td>
          <td style="font-weight:700; color:var(--primary); text-align:center;">
            <span class="task-code-chip">${t.id}</span>
          </td>
          <td>
            <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:2px;">
              ${isMilestone ? `${window.Icons.get('flag', 'icon-sm text-rose')} ` : ''}${t.name}
            </div>
            <div class="task-deliverable-chip">
              <strong>Sản phẩm bàn giao (DoD):</strong> ${t.done}
            </div>
          </td>
          <td style="text-align:center;">
            <span class="week-pill ${t.start === 11 ? 'week-11-graded' : ''}">Tuần ${t.start}</span>
          </td>
          <td style="text-align:center; font-weight:700;">${t.hours}h</td>
          <td style="text-align:center;">
            <select class="select-input select-status-pill ${t.status || 'todo'}">
              <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Chưa bắt đầu</option>
              <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Đang thực hiện</option>
              <option value="review" ${t.status === 'review' ? 'selected' : ''}>Chờ review</option>
              <option value="done" ${t.status === 'done' ? 'selected' : ''}>Hoàn thành</option>
            </select>
          </td>
          <td style="text-align:center;">
            ${t.prLink ? `<a href="${t.prLink}" target="_blank" class="pr-link-badge">${window.Icons.get('git-pull-request', 'icon-sm')} PR</a>` : '<span style="color:var(--text-subtle);">—</span>'}
          </td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-edit" style="padding:4px 8px; font-size:11.5px;" title="Cập nhật ghi chú, giờ thực tế, PR link">
              ${window.Icons.get('edit', 'icon-sm')} Sửa
            </button>
          </td>
        `;

        tr.querySelector('.task-checkbox-quick').onchange = (e) => {
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
