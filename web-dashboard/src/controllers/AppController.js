// Controller: Main Application Controller
(function() {
  class AppController {
    constructor() {
      this.currentView = 'PERSONAL'; // 'PERSONAL' | 'TEAM'
      this.filters = {
        member: 'ALL',
        week: 'ALL',
        status: 'ALL',
        keyword: ''
      };
    }

    init() {
      window.ProjectModel.init();
      window.UserModel.init();
      window.CloudSyncService.init();

      this.setupTheme();
      this.setupEventListeners();
      this.setupCloudSync();
      this.checkAuthAndRender();
    }

    setupCloudSync() {
      window.CloudSyncService.onStatusChange(() => this.updateCloudStatusUI());
      this.updateCloudStatusUI();

      // Tự động kiểm tra và kéo dữ liệu mới nhất khi khởi động nếu đã có cấu hình
      if (window.CloudSyncService.isConfigured()) {
        setTimeout(async () => {
          const res = await window.CloudSyncService.pullTasks();
          if (res.success && res.data && res.data.length > 0) {
            const count = window.ProjectModel.applyRemoteSync(res.data);
            if (count > 0) {
              this.renderActiveView();
              this.showToast(`Đã đồng bộ ${count} task mới nhất từ Supabase Cloud!`);
            }
          }
        }, 1200);
      }
    }

    updateCloudStatusUI() {
      const status = window.CloudSyncService.status;
      const dotEl = document.getElementById('cloud-status-dot');
      const textEl = document.getElementById('cloud-status-text');
      const badgeEl = document.getElementById('cloud-status-badge');
      const lastSyncEl = document.getElementById('cloud-last-sync');

      if (!dotEl || !textEl) return;

      dotEl.className = 'cloud-dot';
      let statusLabel = 'Chưa kết nối';
      let badgeBg = 'rgba(234,179,8,0.15)';
      let badgeColor = '#FBBF24';

      if (status === 'connected') {
        dotEl.classList.add('dot-green');
        textEl.textContent = 'Cloud: Online';
        statusLabel = 'Đã kết nối Supabase';
        badgeBg = 'rgba(16,185,129,0.15)';
        badgeColor = '#34D399';
      } else if (status === 'syncing') {
        dotEl.classList.add('dot-blue');
        textEl.textContent = 'Đang đồng bộ...';
        statusLabel = 'Đang đồng bộ dữ liệu...';
        badgeBg = 'rgba(59,130,246,0.15)';
        badgeColor = '#60A5FA';
      } else if (status === 'error') {
        dotEl.classList.add('dot-red');
        textEl.textContent = 'Cloud: Lỗi';
        statusLabel = 'Lỗi kết nối';
        badgeBg = 'rgba(239,68,68,0.15)';
        badgeColor = '#F87171';
      } else {
        dotEl.classList.add('dot-yellow');
        textEl.textContent = 'Cloud: Cục bộ';
        statusLabel = 'Chế độ Cục bộ (Offline)';
        badgeBg = 'rgba(234,179,8,0.15)';
        badgeColor = '#FBBF24';
      }

      if (badgeEl) {
        badgeEl.textContent = statusLabel;
        badgeEl.style.background = badgeBg;
        badgeEl.style.color = badgeColor;
      }

      if (lastSyncEl && window.CloudSyncService.lastSyncTime) {
        lastSyncEl.textContent = `Lần đồng bộ gần nhất: ${window.CloudSyncService.lastSyncTime.toLocaleTimeString('vi-VN')} (${window.CloudSyncService.lastSyncTime.toLocaleDateString('vi-VN')})`;
      }
    }

    openCloudModal() {
      const urlInput = document.getElementById('input-supabase-url');
      const keyInput = document.getElementById('input-supabase-key');
      if (urlInput) urlInput.value = window.CloudSyncService.url;
      if (keyInput) keyInput.value = window.CloudSyncService.anonKey;
      this.updateCloudStatusUI();
      document.getElementById('modal-cloud-sync')?.classList.add('active');
    }

    closeCloudModal() {
      document.getElementById('modal-cloud-sync')?.classList.remove('active');
    }

    setupTheme() {
      document.documentElement.setAttribute('data-theme', window.ProjectModel.theme);
      const btn = document.getElementById('btn-theme-toggle');
      if (btn) {
        btn.innerHTML = window.ProjectModel.theme === 'dark' 
          ? `${window.Icons.get('sun')} Sáng` 
          : `${window.Icons.get('moon')} Tối`;
      }
    }

    toggleTheme() {
      window.ProjectModel.theme = window.ProjectModel.theme === 'dark' ? 'light' : 'dark';
      this.setupTheme();
      window.ProjectModel.save();
    }

    checkAuthAndRender() {
      const gatewayEl = document.getElementById('gateway-screen');
      const appEl = document.getElementById('app-screen');

      if (!window.UserModel.currentUser) {
        if (gatewayEl) gatewayEl.style.display = 'flex';
        if (appEl) appEl.style.display = 'none';
        window.GatewayView.render(window.ProjectModel.members);
      } else {
        if (gatewayEl) gatewayEl.style.display = 'none';
        if (appEl) appEl.style.display = 'block';
        this.updateHeaderSession();
        this.renderActiveView();
      }
    }

    updateHeaderSession() {
      const user = window.UserModel.currentUser;
      if (!user) return;
      const member = window.ProjectModel.members.find(m => m.id === user.memberId) || window.ProjectModel.members[0];

      document.getElementById('header-user-avatar').innerHTML = window.Icons.get(member.icon || 'server', 'icon-sm');
      document.getElementById('header-user-name').textContent = `${user.memberId} · ${user.name}`;
      document.getElementById('header-user-code').textContent = user.accessCode;
    }

    renderActiveView() {
      const user = window.UserModel.currentUser;
      if (!user) return;

      const member = window.ProjectModel.members.find(m => m.id === user.memberId) || window.ProjectModel.members[0];
      const personalStats = window.ProjectModel.getStats(user.memberId);
      const personalCommits = window.UserModel.getCommits(user.memberId);

      // Render Personal Dashboard
      window.PersonalDashboardView.render(
        user,
        member,
        personalStats,
        personalCommits,
        (taskId, status) => this.handleUpdateStatus(taskId, status),
        (taskId) => this.openTaskModal(taskId)
      );

      // Render Team Dashboard
      const teamStats = window.ProjectModel.getStats();
      window.TeamDashboardView.render(
        teamStats,
        window.ProjectModel.members,
        window.ProjectModel.techHighlights,
        this.filters.member,
        (memberId) => {
          this.filters.member = (this.filters.member === memberId) ? 'ALL' : memberId;
          const sel = document.getElementById('filter-member');
          if (sel) sel.value = this.filters.member;
          this.renderTeamViews();
        }
      );

      this.renderTeamViews();

      // Render Milestones
      window.MilestonesView.render(
        window.ProjectModel.milestones,
        window.ProjectModel.criteriaC1,
        window.ProjectModel.criteriaC2,
        (i, val) => { window.ProjectModel.criteriaC1[i].completed = val; window.ProjectModel.save(); },
        (i, val) => { window.ProjectModel.criteriaC2[i].completed = val; window.ProjectModel.save(); }
      );
    }

    renderTeamViews() {
      const filteredTasks = window.ProjectModel.filterTasks(this.filters);
      window.KanbanView.render(
        filteredTasks,
        window.ProjectModel.members,
        (taskId, status) => this.handleUpdateStatus(taskId, status),
        (taskId) => this.openTaskModal(taskId)
      );
      window.WbsView.render(
        filteredTasks,
        window.ProjectModel.members,
        (taskId, status) => this.handleUpdateStatus(taskId, status),
        (taskId) => this.openTaskModal(taskId)
      );
    }

    handleUpdateStatus(taskId, status) {
      window.ProjectModel.updateTaskStatus(taskId, status);
      this.renderActiveView();
      this.showToast(`Đã chuyển task ${taskId} sang [${window.WbsView.getStatusLabel(status)}]`);
    }

    openTaskModal(taskId) {
      const t = window.ProjectModel.tasks.find(x => x.id === taskId);
      if (!t) return;

      document.getElementById('modal-task-id').value = t.id;
      document.getElementById('modal-title-text').textContent = `${t.id} — ${t.name}`;
      document.getElementById('modal-deliverable').textContent = t.done;
      document.getElementById('modal-owner').value = t.owner;
      document.getElementById('modal-status').value = t.status || 'todo';
      document.getElementById('modal-progress').value = t.progressPercent || 0;
      document.getElementById('modal-actual-hours').value = t.actualHours || t.hours;
      document.getElementById('modal-pr').value = t.prLink || '';
      document.getElementById('modal-notes').value = t.notes || '';

      document.getElementById('modal-overlay').classList.add('active');
    }

    closeModal() {
      document.getElementById('modal-overlay').classList.remove('active');
    }

    saveTaskFromModal() {
      const tid = document.getElementById('modal-task-id').value;
      const updates = {
        status: document.getElementById('modal-status').value,
        progressPercent: parseInt(document.getElementById('modal-progress').value, 10) || 0,
        actualHours: parseFloat(document.getElementById('modal-actual-hours').value) || 0,
        prLink: document.getElementById('modal-pr').value.trim(),
        notes: document.getElementById('modal-notes').value.trim()
      };

      window.ProjectModel.updateTask(tid, updates);
      this.closeModal();
      this.renderActiveView();
      this.showToast(`Đã lưu cập nhật cho task ${tid}!`);
    }

    showToast(msg) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `${window.Icons.get('check-circle', 'text-emerald')} <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    setupEventListeners() {
      // Gateway tabs
      document.querySelectorAll('.gateway-mode-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.gateway-mode-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const mode = tab.dataset.mode;
          document.getElementById('gateway-mode-claim').style.display = (mode === 'claim') ? 'block' : 'none';
          document.getElementById('gateway-mode-code').style.display = (mode === 'code') ? 'block' : 'none';
        };
      });

      // Claim Role Button
      document.getElementById('btn-claim-role')?.addEventListener('click', () => {
        const name = document.getElementById('reg-name-input').value.trim() || 'Thành viên Nhóm Ba Khỉ';
        const mssv = document.getElementById('reg-mssv-input').value.trim() || 'INT4211';
        const memberId = window.GatewayView.selectedRole;
        const member = window.ProjectModel.members.find(m => m.id === memberId) || window.ProjectModel.members[0];

        const user = window.UserModel.claimRole(memberId, name, mssv, window.ProjectModel.members);
        window.GatewayView.showDigitalPass(user, member, () => {
          this.checkAuthAndRender();
          this.showToast(`Chào mừng ${name} với vai trò ${member.id}!`);
        });
      });

      // Copy Pass Code Button
      document.getElementById('btn-copy-pass-code')?.addEventListener('click', () => {
        const code = document.getElementById('pass-code-display').textContent;
        navigator.clipboard.writeText(code).then(() => this.showToast("Đã sao chép mã code!"));
      });

      // Code Login Button
      document.getElementById('btn-submit-code')?.addEventListener('click', () => {
        const code = document.getElementById('input-access-code').value;
        const user = window.UserModel.authenticateByCode(code, window.ProjectModel.members);
        if (user) {
          this.showToast(`Đăng nhập thành công với mã ${code}!`);
          this.checkAuthAndRender();
        } else {
          alert(`Mã truy cập "${code}" không hợp lệ! Vui lòng dùng: BK-TV01, BK-TV02, BK-TV03 hoặc BK-TV04.`);
        }
      });

      // Quick Code Buttons
      document.querySelectorAll('.btn-quick-code').forEach(btn => {
        btn.onclick = () => {
          const user = window.UserModel.authenticateByCode(btn.dataset.code, window.ProjectModel.members);
          if (user) {
            this.showToast(`Đăng nhập nhanh ${btn.dataset.code}!`);
            this.checkAuthAndRender();
          }
        };
      });

      // Logout Button
      document.getElementById('btn-logout')?.addEventListener('click', () => {
        if (confirm("Bạn có muốn đăng xuất và đổi sang vai trò khác?")) {
          window.UserModel.clearSession();
          this.checkAuthAndRender();
        }
      });

      // Toggle View (Personal vs Team)
      document.getElementById('btn-toggle-view')?.addEventListener('click', () => {
        this.currentView = (this.currentView === 'PERSONAL') ? 'TEAM' : 'PERSONAL';
        const btn = document.getElementById('btn-toggle-view');
        btn.innerHTML = this.currentView === 'PERSONAL'
          ? `${window.Icons.get('users')} Xem Bảng Toàn Đội`
          : `${window.Icons.get('user-check')} Về Dashboard Của Tôi`;

        document.getElementById('view-personal').style.display = (this.currentView === 'PERSONAL') ? 'block' : 'none';
        document.getElementById('view-team').style.display = (this.currentView === 'TEAM') ? 'block' : 'none';
      });

      // Team Nav Tabs
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const targetEl = document.getElementById(tab.dataset.target);
          if (targetEl) targetEl.classList.add('active');
        };
      });

      // Theme toggle
      document.getElementById('btn-theme-toggle')?.addEventListener('click', () => this.toggleTheme());

      // Add Commit
      document.getElementById('btn-add-commit')?.addEventListener('click', () => {
        const user = window.UserModel.currentUser;
        if (!user) return;
        const hash = prompt("Nhập mã hash commit hoặc mã PR (ví dụ: a1b2c3d hoặc PR #12):");
        if (!hash) return;
        const message = prompt("Nhập nội dung commit (ví dụ: [T002] Them auth middleware JWT va bcrypt):");
        if (!message) return;

        window.UserModel.addCommit(user.memberId, hash, message);
        this.renderActiveView();
        this.showToast("Đã ghi nhận commit thành công!");
      });

      // Filters
      document.getElementById('filter-member')?.addEventListener('change', (e) => {
        this.filters.member = e.target.value;
        this.renderTeamViews();
      });

      document.getElementById('filter-week')?.addEventListener('change', (e) => {
        this.filters.week = e.target.value;
        this.renderTeamViews();
      });

      document.getElementById('filter-status')?.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.renderTeamViews();
      });

      document.getElementById('search-task')?.addEventListener('input', (e) => {
        this.filters.keyword = e.target.value;
        this.renderTeamViews();
      });

      // Modal Form
      document.getElementById('btn-modal-close')?.addEventListener('click', () => this.closeModal());
      document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') this.closeModal();
      });
      document.getElementById('form-edit-task')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromModal();
      });

      // Report
      document.getElementById('btn-generate-report')?.addEventListener('click', () => {
        const week = parseInt(document.getElementById('select-report-week').value, 10);
        const member = document.getElementById('select-report-member').value;
        window.ReportView.generate(week, member, window.ProjectModel.tasks);
        this.showToast(`Đã sinh báo cáo Tuần ${week}!`);
      });

      document.getElementById('btn-copy-report')?.addEventListener('click', () => {
        const text = document.getElementById('report-output-text').value;
        if (!text) { alert("Vui lòng bấm 'Tạo Báo Cáo' trước!"); return; }
        navigator.clipboard.writeText(text).then(() => this.showToast("Đã sao chép nội dung báo cáo tuần!"));
      });

      // Export JSON
      document.getElementById('btn-export-json')?.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
          project: "INT4211_De25",
          exportedAt: new Date().toISOString(),
          tasks: window.ProjectModel.tasks,
          commits: window.UserModel.commits,
          criteriaC1: window.ProjectModel.criteriaC1,
          criteriaC2: window.ProjectModel.criteriaC2,
          seedQuota: window.ProjectModel.seedQuota
        }, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", `TienDo_De25_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.showToast("Đã xuất file tiến độ JSON!");
      });

      // Import JSON
      const fileInput = document.getElementById('input-import-file');
      document.getElementById('btn-import-json')?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            if (data.tasks) window.ProjectModel.tasks = data.tasks;
            if (data.commits) window.UserModel.commits = data.commits;
            if (data.criteriaC1) window.ProjectModel.criteriaC1 = data.criteriaC1;
            if (data.criteriaC2) window.ProjectModel.criteriaC2 = data.criteriaC2;
            window.ProjectModel.save();
            window.UserModel.saveCommits();
            this.renderActiveView();
            this.showToast("Đã nạp file dữ liệu tiến độ thành công!");
          } catch (err) { alert("File JSON không hợp lệ!"); }
        };
        reader.readAsText(file);
      });

      // Reset
      document.getElementById('btn-reset-baseline')?.addEventListener('click', () => {
        if (confirm("Khôi phục toàn bộ tiến độ về kế hoạch ban đầu (0%)?")) {
          window.ProjectModel.resetBaseline();
          this.renderActiveView();
          this.showToast("Đã khôi phục kế hoạch ban đầu!");
        }
      });
    }
  }

  window.AppController = new AppController();
})();
