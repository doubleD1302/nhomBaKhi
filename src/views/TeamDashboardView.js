// Views: Team Dashboard View (Team Overview, Member Cards, Tech Highlights)
(function() {
  class TeamDashboardView {
    render(stats, members, techHighlights, selectedMemberFilter, onFilterMember) {
      // Overall Stats
      document.getElementById('stat-percent-done').textContent = `${stats.percent}%`;
      document.getElementById('progress-bar-overall').style.width = `${stats.percent}%`;
      document.getElementById('stat-task-count').textContent = `${stats.done}/${stats.total}`;
      document.getElementById('stat-task-sub').textContent = `${stats.inProgress} đang làm · ${stats.review} chờ duyệt · ${stats.todo} chưa bắt đầu`;
      document.getElementById('stat-hours-done').textContent = `${stats.completedHours}h`;
      document.getElementById('stat-hours-sub').textContent = `Kế hoạch: ${stats.plannedHours}h · Thực tế: ${stats.actualHours.toFixed(1)}h`;

      // 4 Member Cards
      const container = document.getElementById('dashboard-member-cards');
      if (container) {
        container.innerHTML = '';
        members.forEach(m => {
          const mTasks = window.ProjectModel.tasks.filter(t => t.owner === m.id);
          const mDone = mTasks.filter(t => t.status === 'done').length;
          const mPct = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;

          const card = document.createElement('div');
          card.className = `card member-card ${selectedMemberFilter === m.id ? 'active-filter' : ''}`;
          card.style.borderTop = `4px solid ${m.avatarColor}`;
          card.style.cursor = 'pointer';

          card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
              <div style="width:40px; height:40px; border-radius:9999px; background:${m.avatarColor}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700;">
                ${window.Icons.get(m.icon || 'server', 'icon-sm')}
              </div>
              <div>
                <h4 style="font-size:13.5px; font-weight:700;">${m.id} · ${m.shortTitle}</h4>
                <p style="font-size:11.5px; color:var(--text-muted);">${m.name}</p>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:8px;">
              <span>Tiến độ task: <b>${mDone}/${mTasks.length}</b></span>
              <span><b>${mPct}%</b></span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width:${mPct}%; background:${m.avatarColor};"></div>
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:8px; display:flex; justify-content:space-between;">
              <span>Kế hoạch: ${m.plannedHours}h</span>
              <span>Dự phòng: ${m.backup}</span>
            </div>
          `;

          card.onclick = () => {
            if (onFilterMember) onFilterMember(m.id);
          };

          container.appendChild(card);
        });
      }

      // Tech Highlights
      const thContainer = document.getElementById('tech-highlights-container');
      if (thContainer) {
        thContainer.innerHTML = techHighlights.map(th => `
          <div class="card" style="border-left:4px solid var(--accent);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; font-weight:700; background:var(--accent-light); color:var(--accent); padding:2px 8px; border-radius:4px;">
                ${th.tag}
              </span>
            </div>
            <h4 style="font-size:13.5px; font-weight:700; margin-bottom:6px; color:var(--primary); display:flex; align-items:center; gap:6px;">
              ${window.Icons.get(th.icon || 'sparkles')} ${th.title}
            </h4>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.45;">${th.desc}</p>
          </div>
        `).join('');
      }
    }
  }

  window.TeamDashboardView = new TeamDashboardView();
})();
