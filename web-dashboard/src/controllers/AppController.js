// Controller: Main Application Controller
// Phục vụ: Dự án Quản lý & Thuê Nhà Trọ Sinh Viên (SmartTro)
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

    async init() {
      window.ProjectModel.init();
      window.UserModel.init();
      window.CloudSyncService.init();

      // Đồng bộ trạng thái vai trò đã khóa từ Supabase Cloud
      if (window.CloudSyncService.isConfigured()) {
        try {
          const claims = await window.CloudSyncService.fetchClaimedRoles();
          if (claims && Object.keys(claims).length > 0) {
            window.UserModel.setClaimedRolesFromCloud(claims);
          }
        } catch (e) {
          console.warn("Could not sync claimed roles on init", e);
        }
      }

      this.setupTheme();
      this.setupEventListeners();
      this.setupCloudSync();
      this.checkAuthAndRender();
    }

    setupCloudSync() {
      window.CloudSyncService.onStatusChange(() => this.updateCloudStatusUI());
      this.updateCloudStatusUI();

      // Kéo dữ liệu khi khởi động
      if (window.CloudSyncService.isConfigured()) {
        setTimeout(async () => {
          await this.performCloudSync(false);
        }, 1200);

        // Bật chu kỳ tự động đồng bộ thời gian thực mỗi 15 giây (Realtime Polling)
        // Đảm bảo khi đồng đội nhận role (như TV04) hoặc cập nhật task, màn hình tự động hiển thị tên & tiến độ mới
        if (!this._syncInterval) {
          this._syncInterval = setInterval(async () => {
            if (window.CloudSyncService.isConfigured() && window.CloudSyncService.status !== 'syncing') {
              await this.performCloudSync(true); // silent background sync
            }
          }, 15000);
        }
      }
    }

    async performCloudSync(silent = false) {
      if (!window.CloudSyncService.isConfigured()) return { success: false };
      try {
        let changed = false;

        // 1. Đồng bộ vai trò thành viên đã pick (để hiển thị tên TV04, MSSV,...)
        const claims = await window.CloudSyncService.fetchClaimedRoles();
        if (claims && Object.keys(claims).length > 0) {
          const prevClaims = JSON.stringify(window.UserModel.claimedRoles);
          window.UserModel.setClaimedRolesFromCloud(claims);
          if (prevClaims !== JSON.stringify(window.UserModel.claimedRoles)) {
            changed = true;
          }
        }

        // 2. Kéo danh sách 64 task
        const res = await window.CloudSyncService.pullTasks();
        if (res.success && res.data && res.data.length > 0) {
          const count = window.ProjectModel.applyRemoteSync(res.data);
          if (count > 0) {
            changed = true;
            if (!silent) this.showToast(`Đã đồng bộ ${count} task từ Supabase Cloud!`);
          }
        }

        if (changed) {
          this.renderActiveView();
          window.GatewayView.render(window.ProjectModel.members);
        }
        return { success: true, changed };
      } catch (err) {
        console.warn("Lỗi đồng bộ nền:", err);
        return { success: false, error: err };
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

      document.getElementById('header-user-avatar').innerHTML = window.Icons.get(member.icon || 'building', 'icon-sm');
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

      // Tự động đẩy task lên Supabase nếu có kết nối
      const updatedTask = window.ProjectModel.tasks.find(t => t.id === taskId);
      if (updatedTask && window.CloudSyncService.isConfigured()) {
        const u = window.UserModel.currentUser;
        window.CloudSyncService.pushTask(updatedTask, u ? u.name : '');
      }
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

      const updated = window.ProjectModel.updateTask(tid, updates);
      this.closeModal();
      this.renderActiveView();
      this.showToast(`Đã lưu cập nhật cho task ${tid}!`);

      if (updated && window.CloudSyncService.isConfigured()) {
        const u = window.UserModel.currentUser;
        window.CloudSyncService.pushTask(updated, u ? u.name : '');
      }
    }

    showToast(msg) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `${window.Icons.get('check-circle', 'text-emerald')} <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3200);
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

      // Refresh claimed roles from cloud button
      document.getElementById('btn-refresh-claimed-roles')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-refresh-claimed-roles');
        if (btn) btn.innerHTML = `${window.Icons.get('refresh-cw')} Đang kiểm tra...`;
        if (window.CloudSyncService.isConfigured()) {
          const claims = await window.CloudSyncService.fetchClaimedRoles();
          if (claims) {
            window.UserModel.setClaimedRolesFromCloud(claims);
            window.GatewayView.render(window.ProjectModel.members);
            this.showToast("Đã cập nhật trạng thái các vai trò từ Cloud!");
          }
        }
        if (btn) btn.innerHTML = `${window.Icons.get('refresh-cw')} Làm mới từ Cloud`;
      });

      // Claim Role Button
      document.getElementById('btn-claim-role')?.addEventListener('click', async () => {
        const nameInput = document.getElementById('reg-name-input');
        const mssvInput = document.getElementById('reg-mssv-input');
        const name = (nameInput ? nameInput.value : '').trim() || 'Thành viên Nhóm Bá Khí';
        const mssv = (mssvInput ? mssvInput.value : '').trim() || 'INT4211';
        const memberId = window.GatewayView.selectedRole;

        if (!memberId) {
          alert("Vui lòng chọn 1 vai trò còn trống trước khi tiếp tục!");
          return;
        }

        const member = window.ProjectModel.members.find(m => m.id === memberId) || window.ProjectModel.members[0];
        const res = window.UserModel.claimRole(memberId, name, mssv, window.ProjectModel.members);

        if (!res.success) {
          alert(res.message);
          window.GatewayView.render(window.ProjectModel.members);
          return;
        }

        // Đẩy vai trò đã khóa lên Supabase Cloud để các thiết bị khác đồng bộ
        if (window.CloudSyncService.isConfigured()) {
          await window.CloudSyncService.pushClaimedRole({
            roleId: memberId,
            name: name,
            mssv: mssv,
            code: res.code
          });
        }

        window.GatewayView.showDigitalPass(res.user, member, () => {
          this.checkAuthAndRender();
          this.showToast(`Chào mừng ${name} nhận vai trò ${member.id}!`);
        });
      });

      // Copy Pass Code Button
      document.getElementById('btn-copy-pass-code')?.addEventListener('click', () => {
        const code = document.getElementById('pass-code-display').textContent;
        navigator.clipboard.writeText(code).then(() => this.showToast("Đã sao chép mã bảo mật độc quyền!"));
      });

      // Code Login Button
      document.getElementById('btn-submit-code')?.addEventListener('click', () => {
        const codeInput = document.getElementById('input-access-code');
        const code = codeInput ? codeInput.value : '';
        const user = window.UserModel.authenticateByCode(code, window.ProjectModel.members);
        if (user) {
          this.showToast(`Đăng nhập thành công với mã ${user.accessCode}!`);
          this.checkAuthAndRender();
        } else {
          alert(`Mã bảo mật "${code}" không chính xác hoặc chưa được đăng ký!\n\nVui lòng kiểm tra lại mã đã được cấp (định dạng TRO-XXX-XXXX-XXXX).`);
        }
      });

      // Logout Button
      document.getElementById('btn-logout')?.addEventListener('click', () => {
        if (confirm("Bạn có muốn đăng xuất khỏi phiên làm việc hiện tại?")) {
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

      // Nút đồng bộ nhanh ở Header
      document.getElementById('btn-quick-sync-now')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-quick-sync-now');
        if (btn) {
          btn.classList.add('loading');
          btn.innerHTML = `${window.Icons.get('refresh-cw', 'spin')} Đang đồng bộ...`;
        }

        const res = await this.performCloudSync(false);
        if (btn) {
          btn.classList.remove('loading');
          btn.innerHTML = `${window.Icons.get('refresh-cw')} Đồng bộ ngay`;
        }

        if (res.success) {
          this.showToast("Đã đồng bộ dữ liệu thời gian thực thành công!");
        } else {
          this.showToast("Đã kiểm tra, chưa có dữ liệu mới từ Cloud.");
        }
      });

      // Cloud Modal
      document.getElementById('btn-cloud-sync')?.addEventListener('click', () => this.openCloudModal());
      document.getElementById('btn-cloud-modal-close')?.addEventListener('click', () => this.closeCloudModal());

      document.getElementById('btn-test-cloud')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-test-cloud');
        if (btn) btn.innerHTML = `${window.Icons.get('refresh-cw')} Đang kiểm tra...`;
        const res = await window.CloudSyncService.testConnection();
        alert(res.message);
        if (btn) btn.innerHTML = `${window.Icons.get('refresh-cw')} Kiểm tra kết nối`;
      });

      document.getElementById('btn-save-cloud-config')?.addEventListener('click', async () => {
        const url = document.getElementById('input-supabase-url').value;
        const key = document.getElementById('input-supabase-key').value;
        window.CloudSyncService.saveConfig(url, key);
        const res = await window.CloudSyncService.testConnection();
        this.showToast(res.message);
        this.closeCloudModal();
      });

      document.getElementById('btn-push-all-cloud')?.addEventListener('click', async () => {
        if (!confirm("Tải toàn bộ 64 đầu việc lên Supabase Cloud để đồng bộ với cả nhóm?")) return;
        const u = window.UserModel.currentUser;
        const res = await window.CloudSyncService.pushAllTasks(window.ProjectModel.tasks, u ? u.name : 'Khởi tạo');
        if (res.success) {
          this.showToast(`Đã tải thành công ${res.count} task lên Supabase Cloud!`);
        } else {
          alert(`Lỗi: ${res.message || res.error}`);
        }
      });

      document.getElementById('btn-pull-cloud')?.addEventListener('click', async () => {
        const res = await window.CloudSyncService.pullTasks();
        if (res.success && res.data) {
          const count = window.ProjectModel.applyRemoteSync(res.data);
          this.renderActiveView();
          this.showToast(`Đã đồng bộ ${count} task từ Supabase Cloud!`);
        } else {
          alert(`Lỗi kéo dữ liệu: ${res.message}`);
        }
      });

      // Add Commit
      document.getElementById('btn-add-commit')?.addEventListener('click', () => {
        const user = window.UserModel.currentUser;
        if (!user) return;
        const hash = prompt("Nhập mã hash commit hoặc mã PR (ví dụ: a1b2c3d hoặc PR #12):");
        if (!hash) return;
        const message = prompt("Nhập nội dung commit (ví dụ: [T002] Tinh toan tien dien nuoc va ma VietQR):");
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
          project: "INT4211_SmartTro_De25",
          exportedAt: new Date().toISOString(),
          tasks: window.ProjectModel.tasks,
          commits: window.UserModel.commits,
          claimedRoles: window.UserModel.claimedRoles,
          criteriaC1: window.ProjectModel.criteriaC1,
          criteriaC2: window.ProjectModel.criteriaC2,
          seedQuota: window.ProjectModel.seedQuota
        }, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", `TienDo_SmartTro_${new Date().toISOString().slice(0, 10)}.json`);
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
            if (data.claimedRoles) window.UserModel.claimedRoles = data.claimedRoles;
            if (data.criteriaC1) window.ProjectModel.criteriaC1 = data.criteriaC1;
            if (data.criteriaC2) window.ProjectModel.criteriaC2 = data.criteriaC2;
            window.ProjectModel.save();
            window.UserModel.saveCommits();
            window.UserModel.saveClaimedRoles();
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
