// Views: Urgent Tasks Hub View (Top 5 Công Việc Cần Làm Nhất Hiện Tại)
// Phục vụ: Kiểm soát Deadline Tuần 9 & Phụ thuộc chéo (Dependency Chain)
(function() {
  class UrgentTasksHubView {
    constructor() {
      // Mặc định Tuần 9 theo yêu cầu đồ án
      // Hết Chủ nhật sẽ bước sang Tuần 10
      this.currentWeek = 9;
      this.mode = 'TEAM'; // 'TEAM' | 'PERSONAL'
      this.filterReadyOnly = false;
    }

    render(allTasks, members, currentUser, onUpdateStatus, onEditTask) {
      const container = document.getElementById('urgent-tasks-hub-container');
      if (!container) return;

      const memberMap = {};
      (members || []).forEach(m => { memberMap[m.id] = m; });

      // Phân tích trạng thái, deadline và dependency của tất cả công việc chưa xong
      const notDoneTasks = (allTasks || []).filter(t => t.status !== 'done');

      const analyzedTasks = notDoneTasks.map(t => {
        const isOverdue = t.end < this.currentWeek;
        const isCurrentWeek = t.end === this.currentWeek;
        const isFuture = t.end > this.currentWeek;

        // Phân tích phụ thuộc (deps): Task này có cần chờ task nào khác chưa xong không?
        const unfinishedDeps = [];
        if (t.deps && t.deps.length > 0) {
          t.deps.forEach(depId => {
            const depTask = allTasks.find(x => x.id === depId);
            if (depTask && depTask.status !== 'done') {
              const ownerRole = depTask.owner;
              const claim = window.UserModel ? window.UserModel.isRoleClaimed(ownerRole) : { isClaimed: false };
              const ownerName = (claim.isClaimed && claim.owner)
                ? `${ownerRole} · ${claim.owner.name}`
                : `${ownerRole} (${memberMap[ownerRole]?.shortTitle || ownerRole})`;

              unfinishedDeps.push({
                id: depTask.id,
                name: depTask.name,
                ownerRole: ownerRole,
                ownerName: ownerName,
                status: depTask.status || 'todo',
                end: depTask.end
              });
            }
          });
        }

        const isReady = unfinishedDeps.length === 0;

        // Tính điểm ưu tiên (Ưu tiên việc trễ hạn và sẵn sàng làm lên đầu)
        let priorityScore = 0;
        if (isOverdue) {
          // Trễ hạn: Điểm cao nhất. Nếu đã sẵn sàng làm thì phải xử lý khẩn cấp!
          priorityScore = isReady ? 1000 - t.end * 10 : 800 - t.end * 10;
        } else if (isCurrentWeek) {
          // Deadline tuần này (Chủ nhật tuần này kết thúc)
          priorityScore = isReady ? 600 - t.start * 10 : 400 - t.start * 10;
        } else {
          // Tuần sau
          priorityScore = isReady ? 200 - t.start * 10 : 100 - t.start * 10;
        }
        if (t.status === 'in_progress') priorityScore += 25; // Đang làm thì ưu tiên kết thúc sớm

        return {
          task: t,
          isOverdue,
          isCurrentWeek,
          isFuture,
          isReady,
          unfinishedDeps,
          priorityScore
        };
      });

      // Thống kê tổng quan
      const totalOverdue = analyzedTasks.filter(x => x.isOverdue).length;
      const totalCurrentWeek = analyzedTasks.filter(x => x.isCurrentWeek).length;
      const totalReady = analyzedTasks.filter(x => x.isReady).length;
      const totalBlocked = analyzedTasks.filter(x => !x.isReady).length;

      // Lọc danh sách theo chế độ TEAM hoặc PERSONAL
      let displayPool = analyzedTasks;
      if (this.mode === 'PERSONAL' && currentUser) {
        displayPool = displayPool.filter(x => x.task.owner === currentUser.memberId);
      }
      if (this.filterReadyOnly) {
        displayPool = displayPool.filter(x => x.isReady);
      }

      // Sắp xếp giảm dần theo điểm ưu tiên
      displayPool.sort((a, b) => b.priorityScore - a.priorityScore || a.task.id.localeCompare(b.task.id));

      const top5 = displayPool.slice(0, 5);

      // Render HTML Hub
      container.innerHTML = `
        <div class="urgent-hub-card ${totalOverdue > 0 ? 'has-overdue' : ''}">
          <div class="urgent-hub-header">
            <div class="urgent-header-left">
              <div class="urgent-badge-row">
                <span class="urgent-tag-main">
                  ${window.Icons.get('alert-triangle', 'icon-xs')}
                  ĐIỀU PHỐI TIẾN ĐỘ KHẨN CẤP
                </span>
                <span class="week-status-pill">
                  ${window.Icons.get('clock', 'icon-xs')}
                  ĐANG Ở: <strong>TUẦN ${this.currentWeek}</strong> / 15
                </span>
                <span class="deadline-note-pill">
                  ${this.currentWeek === 9 
                    ? 'Hết Chủ Nhật tuần này sẽ kết thúc Tuần 9 &rarr; Bước sang Tuần 10' 
                    : `Đang xem mốc Tuần ${this.currentWeek} (Các việc Tuần &le; ${this.currentWeek - 1} bị tính trễ hạn)`}
                </span>
              </div>
              <h2 class="urgent-hub-title">
                5 Công Việc Cần Làm Nhất Hiện Tại & Kiểm Soát Nghẽn Phụ Thuộc
              </h2>
              <div class="urgent-hub-stats-strip">
                <span class="stat-chip ${totalOverdue > 0 ? 'chip-danger' : 'chip-ok'}">
                  ${totalOverdue > 0 ? window.Icons.get('alert-circle', 'icon-xs') : window.Icons.get('check', 'icon-xs')}
                  <strong>${totalOverdue}</strong> việc trễ deadline (Tuần &le; ${this.currentWeek - 1})
                </span>
                <span class="stat-chip chip-warning">
                  ${window.Icons.get('clock', 'icon-xs')}
                  <strong>${totalCurrentWeek}</strong> việc hạn Chủ Nhật này (Tuần ${this.currentWeek})
                </span>
                <span class="stat-chip chip-success">
                  ${window.Icons.get('check-circle', 'icon-xs')}
                  <strong>${totalReady}</strong> việc sẵn sàng làm ngay
                </span>
                <span class="stat-chip chip-muted">
                  ${window.Icons.get('users', 'icon-xs')}
                  <strong>${totalBlocked}</strong> việc đang chờ phụ thuộc
                </span>
              </div>
            </div>

            <!-- Controls: Mode switch & Week Selector -->
            <div class="urgent-header-right">
              <div class="urgent-control-group">
                <label class="control-label">Góc nhìn công việc:</label>
                <div class="control-pills">
                  <button type="button" class="ctrl-pill ${this.mode === 'TEAM' ? 'active' : ''}" data-mode="TEAM" title="Xem 5 việc khẩn cấp nhất của cả 4 thành viên">
                    Toàn Đội (4 Người)
                  </button>
                  <button type="button" class="ctrl-pill ${this.mode === 'PERSONAL' ? 'active' : ''}" data-mode="PERSONAL" title="Xem 5 việc khẩn cấp nhất của riêng bạn">
                    Của Riêng Bạn
                  </button>
                </div>
              </div>

              <div class="urgent-control-group" style="margin-top:8px;">
                <label class="control-label">Mốc tiến độ thời gian:</label>
                <div class="control-pills">
                  <button type="button" class="ctrl-pill ${this.currentWeek === 9 ? 'active' : ''}" data-week="9" title="Thời điểm hiện tại (Tuần 9)">
                    Tuần 9 (Hiện tại)
                  </button>
                  <button type="button" class="ctrl-pill ${this.currentWeek === 10 ? 'active' : ''}" data-week="10" title="Mô phỏng sau Chủ Nhật này (Tuần 10)">
                    Tuần 10 (Sau Chủ Nhật)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Top 5 Cards Container -->
          <div class="urgent-tasks-grid">
            ${top5.length === 0 ? `
              <div class="urgent-empty-state">
                ${window.Icons.get('check-circle', 'icon-lg text-emerald')}
                <h3>Không có công việc nào bị tồn đọng!</h3>
                <p>Tất cả các công việc trong phạm vi đã được hoàn thành xuất sắc.</p>
              </div>
            ` : top5.map((item, index) => this.renderTaskCard(item, index + 1, memberMap)).join('')}
          </div>
        </div>
      `;

      // Event Listeners for Header Controls
      container.querySelectorAll('[data-mode]').forEach(btn => {
        btn.onclick = () => {
          this.mode = btn.dataset.mode;
          this.render(allTasks, members, currentUser, onUpdateStatus, onEditTask);
        };
      });

      container.querySelectorAll('[data-week]').forEach(btn => {
        btn.onclick = () => {
          this.currentWeek = parseInt(btn.dataset.week, 10);
          this.render(allTasks, members, currentUser, onUpdateStatus, onEditTask);
        };
      });

      // Quick Status Dropdown changes on each card
      container.querySelectorAll('.urgent-status-select').forEach(sel => {
        sel.onchange = (e) => {
          const taskId = sel.dataset.taskId;
          const newStatus = e.target.value;
          if (onUpdateStatus) onUpdateStatus(taskId, newStatus);
        };
      });

      // Quick Mark Done button
      container.querySelectorAll('.btn-quick-done').forEach(btn => {
        btn.onclick = () => {
          const taskId = btn.dataset.taskId;
          if (onUpdateStatus) onUpdateStatus(taskId, 'done');
        };
      });

      // Edit Task Modal button
      container.querySelectorAll('.btn-quick-edit').forEach(btn => {
        btn.onclick = () => {
          const taskId = btn.dataset.taskId;
          if (onEditTask) onEditTask(taskId);
        };
      });
    }

    renderTaskCard(item, rankNumber, memberMap) {
      const t = item.task;
      const isOverdue = item.isOverdue;
      const isCurrentWeek = item.isCurrentWeek;
      const isReady = item.isReady;
      const unfinishedDeps = item.unfinishedDeps;

      const ownerMember = memberMap[t.owner] || {};
      const claim = window.UserModel ? window.UserModel.isRoleClaimed(t.owner) : { isClaimed: false };
      const claimantName = (claim.isClaimed && claim.owner) 
        ? `${t.owner} · ${claim.owner.name} (MSSV: ${claim.owner.mssv})`
        : `${t.owner} · ${ownerMember.name || ownerMember.shortTitle || t.owner}`;

      // Deadline Pill (TÔ ĐỎ NẾU TRỄ HẠN)
      let deadlineHtml = '';
      if (isOverdue) {
        deadlineHtml = `
          <div class="deadline-badge overdue">
            ${window.Icons.get('alert-circle', 'icon-xs')}
            <span>TRỄ DEADLINE: Hạn Tuần ${t.end} (Đã quá hạn chót!)</span>
          </div>
        `;
      } else if (isCurrentWeek) {
        deadlineHtml = `
          <div class="deadline-badge urgent">
            ${window.Icons.get('clock', 'icon-xs')}
            <span>HẠN CHỦ NHẬT TUẦN NÀY (Hết CN sang Tuần 10)</span>
          </div>
        `;
      } else {
        deadlineHtml = `
          <div class="deadline-badge future">
            ${window.Icons.get('calendar', 'icon-xs')}
            <span>Hạn: Tuần ${t.end}</span>
          </div>
        `;
      }

      // Dependency Block (CẦN CHỜ CÔNG VIỆC NÀO - CỦA AI XONG THÌ MỚI TIẾN HÀNH)
      let depHtml = '';
      if (!isReady) {
        depHtml = `
          <div class="dep-box blocked">
            <div class="dep-box-header">
              ${window.Icons.get('alert-triangle', 'icon-xs')}
              <strong>CẦN CHỜ CÔNG VIỆC SAU XONG MỚI TIẾN HÀNH LÀM:</strong>
            </div>
            <div class="dep-items-list">
              ${unfinishedDeps.map(d => `
                <div class="dep-item-row">
                  <span class="dep-code">${d.id}</span>
                  <span class="dep-name">${d.name}</span>
                  <span class="dep-owner-chip">&larr; Cần chờ của: <strong>${d.ownerName}</strong> (${d.status === 'in_progress' ? 'Đang làm' : 'Chưa bắt đầu'})</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        depHtml = `
          <div class="dep-box ready">
            <div class="dep-box-header">
              ${window.Icons.get('check-circle', 'icon-xs')}
              <strong>🟢 ĐÃ SẴN SÀNG THỰC HIỆN NGAY:</strong>
            </div>
            <div class="dep-ready-text">
              ${t.deps && t.deps.length > 0 
                ? `Tất cả các công việc phụ thuộc (${t.deps.join(', ')}) đã hoàn thành!` 
                : 'Công việc khởi tạo độc lập, không bị ràng buộc phụ thuộc!'}
            </div>
          </div>
        `;
      }

      return `
        <div class="urgent-task-card ${isOverdue ? 'card-overdue' : ''}">
          <!-- Card Header: Rank, Code, Title, Owner -->
          <div class="utc-header">
            <div class="utc-title-row">
              <span class="utc-rank">#${rankNumber}</span>
              <span class="utc-code">${t.id}</span>
              <h3 class="utc-name">${t.name}</h3>
            </div>
            <div class="utc-owner-badge" style="border-left: 3px solid ${ownerMember.avatarColor || '#0D9488'};">
              <span class="utc-owner-role">${claimantName}</span>
            </div>
          </div>

          <!-- Deadline Indicator (TÔ ĐỎ NẾU TRỄ HẠN) -->
          <div class="utc-deadline-container">
            ${deadlineHtml}
          </div>

          <!-- Dependency Information (CẦN CHỜ AI XONG) -->
          <div class="utc-dep-container">
            ${depHtml}
          </div>

          <!-- Deliverable DoD -->
          <div class="utc-dod">
            <span class="dod-label">Sản phẩm bàn giao (DoD):</span>
            <span class="dod-text">${t.done}</span>
          </div>

          <!-- Quick Action Bar -->
          <div class="utc-action-bar">
            <div class="utc-status-group">
              <label>Trạng thái:</label>
              <select class="select-input select-status-pill ${t.status || 'todo'} urgent-status-select" data-task-id="${t.id}">
                <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Chưa bắt đầu</option>
                <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Đang thực hiện</option>
                <option value="review" ${t.status === 'review' ? 'selected' : ''}>Chờ duyệt / test</option>
                <option value="done" ${t.status === 'done' ? 'selected' : ''}>Hoàn thành</option>
              </select>
            </div>

            <div class="utc-buttons-group">
              <button type="button" class="btn btn-outline btn-sm btn-quick-done" data-task-id="${t.id}" title="Đánh dấu đã hoàn thành (100%)">
                ${window.Icons.get('check', 'icon-xs')} Xong (100%)
              </button>
              <button type="button" class="btn btn-outline btn-sm btn-quick-edit" data-task-id="${t.id}" title="Xem và sửa chi tiết task">
                ${window.Icons.get('edit', 'icon-xs')} Chi tiết
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.UrgentTasksHubView = new UrgentTasksHubView();
})();
