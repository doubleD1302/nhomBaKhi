// Views: Team Dashboard View (Team Overview, Member Cards, Tech Highlights)
// Phục vụ: Dự án Quản lý & Thuê Nhà Trọ Sinh Viên (SmartTro)
(function() {
  class TeamDashboardView {
    render(stats, members, techHighlights, selectedMemberFilter, onFilterMember) {
      // 1. Overall Team Stats
      document.getElementById('stat-percent-done').textContent = `${stats.percent}%`;
      document.getElementById('progress-bar-overall').style.width = `${stats.percent}%`;
      document.getElementById('stat-task-count').textContent = `${stats.done}/${stats.total}`;
      document.getElementById('stat-task-sub').textContent = `${stats.inProgress} đang làm · ${stats.review} chờ duyệt · ${stats.todo} chưa bắt đầu`;
      document.getElementById('stat-hours-done').textContent = `${stats.completedHours}h`;
      document.getElementById('stat-hours-sub').textContent = `Kế hoạch: ${stats.plannedHours}h · Thực tế: ${stats.actualHours.toFixed(1)}h`;

      // 2. 4 Member Cards with Claimed Identity & Cross-Support Buddy Names
      const container = document.getElementById('dashboard-member-cards');
      if (container) {
        container.innerHTML = '';
        members.forEach(m => {
          const mTasks = window.ProjectModel.tasks.filter(t => t.owner === m.id);
          const mDone = mTasks.filter(t => t.status === 'done').length;
          const mPct = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;

          const claim = window.UserModel ? window.UserModel.isRoleClaimed(m.id) : { isClaimed: false };
          const backupClaim = window.UserModel ? window.UserModel.isRoleClaimed(m.backup) : { isClaimed: false };

          let ownerDisplayHtml = '';
          if (claim.isClaimed && claim.owner) {
            ownerDisplayHtml = `
              <div class="team-card-owner-chip claimed" title="Vai trò đã được nhận và khóa độc quyền trên Cloud">
                <span class="status-pulse-dot"></span>
                <div class="owner-text">
                  <span class="owner-label">Thành viên phụ trách:</span>
                  <strong class="owner-name">${claim.owner.name}</strong>
                  <span class="owner-mssv">MSSV: ${claim.owner.mssv}</span>
                </div>
              </div>
            `;
          } else {
            ownerDisplayHtml = `
              <div class="team-card-owner-chip vacant">
                <span class="status-vacant-dot"></span>
                <div class="owner-text">
                  <span class="owner-label">Thành viên phụ trách:</span>
                  <strong class="owner-name-vacant">Chưa có người nhận</strong>
                  <span class="owner-mssv">—</span>
                </div>
              </div>
            `;
          }

          let backupDisplayHtml = '';
          if (backupClaim.isClaimed && backupClaim.owner) {
            backupDisplayHtml = `<strong>${m.backup} · ${backupClaim.owner.name}</strong> <span class="backup-mssv-sub">(${backupClaim.owner.mssv})</span>`;
          } else {
            backupDisplayHtml = `<strong>${m.backup}</strong> <span class="backup-empty-sub">(Chưa có người nhận)</span>`;
          }

          const card = document.createElement('div');
          card.className = `card member-card-pro ${selectedMemberFilter === m.id ? 'active-filter' : ''}`;
          card.style.borderTop = `4px solid ${m.avatarColor}`;

          card.innerHTML = `
            <div class="member-card-header">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="member-card-icon" style="background:${m.avatarColor};">
                  ${window.Icons.get(m.icon || 'building', 'icon-md')}
                </div>
                <div>
                  <h4 style="font-size:14px; font-weight:800; color:var(--text-primary); margin-bottom:2px;">
                    ${m.id} · ${m.shortTitle}
                  </h4>
                  <div style="font-size:11px; color:var(--text-muted);">${m.name}</div>
                </div>
              </div>
            </div>

            ${ownerDisplayHtml}

            <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:14px; margin-bottom:4px;">
              <span style="font-weight:600; color:var(--text-secondary);">Tiến độ công việc:</span>
              <span style="font-weight:800; color:${m.avatarColor};">${mDone}/${mTasks.length} (${mPct}%)</span>
            </div>
            <div class="progress-bar-bg" style="height:7px; border-radius:4px;">
              <div class="progress-bar-fill" style="width:${mPct}%; background:${m.avatarColor}; border-radius:4px;"></div>
            </div>

            <div class="member-card-details">
              <div class="backup-line">
                ${window.Icons.get('users', 'icon-sm')}
                <span>Hỗ trợ chéo: ${backupDisplayHtml}</span>
              </div>
              <div class="hours-line">
                ${window.Icons.get('clock', 'icon-sm')}
                <span>Kế hoạch: <strong>${m.plannedHours}h</strong> · 16 đầu việc</span>
              </div>
            </div>

            <button class="btn btn-outline btn-filter-member" style="width:100%; margin-top:12px; padding:6px 10px; font-size:11.5px;">
              ${window.Icons.get('filter', 'icon-sm')} 
              ${selectedMemberFilter === m.id ? `Đang lọc theo ${m.id} (Bấm để hủy)` : `Xem 16 task của ${m.id}`}
            </button>
          `;

          card.querySelector('.btn-filter-member').onclick = (e) => {
            e.stopPropagation();
            if (onFilterMember) onFilterMember(m.id);
          };

          card.onclick = () => {
            if (onFilterMember) onFilterMember(m.id);
          };

          container.appendChild(card);
        });
      }

      // 3. Tech Highlights
      const thContainer = document.getElementById('tech-highlights-container');
      if (thContainer) {
        thContainer.innerHTML = techHighlights.map(th => `
          <div class="card tech-card-pro" style="border-left:4px solid var(--accent);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="tech-tag-pro">
                ${th.tag}
              </span>
            </div>
            <h4 style="font-size:13.5px; font-weight:700; margin-bottom:6px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              ${window.Icons.get(th.icon || 'sparkles', 'icon-sm text-teal')} ${th.title}
            </h4>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${th.desc}</p>
          </div>
        `).join('');
      }
    }
  }

  window.TeamDashboardView = new TeamDashboardView();
})();
