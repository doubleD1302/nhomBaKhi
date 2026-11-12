// Model / Service: CloudSyncService (Supabase Cloud REST Integration)
// Phục vụ đồng bộ tiến độ 64 tasks giữa 4 thành viên qua Supabase REST API (Free Tier)
(function() {
  const CONFIG_KEY = 'INT4211_DE25_CLOUD_CONFIG';

const DEFAULT_PROJECT_URL = 'https://ffcmzleqrddcqrznmwqu.supabase.co';
  const DEFAULT_ANON_KEY = 'sb_publishable_V57AzV8f3E92WPVyUb5NqA_FMNRcx3K';

  class CloudSyncService {
    constructor() {
      this.url = DEFAULT_PROJECT_URL;
      this.anonKey = DEFAULT_ANON_KEY;
      this.status = 'connected'; // 'unconfigured' | 'connected' | 'error' | 'syncing'
      this.lastSyncTime = null;
      this.listeners = [];
    }

    init() {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) {
        try {
          const cfg = JSON.parse(saved);
          this.url = (cfg.url || DEFAULT_PROJECT_URL).trim().replace(/\/$/, '');
          this.anonKey = (cfg.anonKey || DEFAULT_ANON_KEY).trim();
        } catch (e) {
          console.error("Cloud config parse error", e);
          this.url = DEFAULT_PROJECT_URL;
          this.anonKey = DEFAULT_ANON_KEY;
        }
      } else {
        this.url = DEFAULT_PROJECT_URL;
        this.anonKey = DEFAULT_ANON_KEY;
      }

      this.status = (this.url && this.anonKey) ? 'connected' : 'unconfigured';
      if (this.status === 'connected') {
        setTimeout(() => this.testConnection(true), 500);
      }
    }

    saveConfig(url, anonKey) {
      this.url = (url || '').trim().replace(/\/$/, '');
      this.anonKey = (anonKey || '').trim();
      const hasCredentials = Boolean(this.url && this.anonKey);
      this.status = hasCredentials ? 'connected' : 'unconfigured';
      
      localStorage.setItem(CONFIG_KEY, JSON.stringify({
        url: this.url,
        anonKey: this.anonKey
      }));

      this.notifyListeners();
    }

    isConfigured() {
      return Boolean(this.url && this.anonKey);
    }

    getHeaders() {
      return {
        'apikey': this.anonKey,
        'Authorization': `Bearer ${this.anonKey}`,
        'Content-Type': 'application/json'
      };
    }

    async testConnection(silent = false) {
      if (!this.isConfigured()) {
        this.status = 'unconfigured';
        if (!silent) this.notifyListeners();
        return { success: false, message: 'Chưa điền đầy đủ Supabase URL và Anon Public Key!' };
      }

      try {
        const endpoint = `${this.url}/rest/v1/bang_cong_viec?select=task_id&limit=1`;
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (res.ok) {
          this.status = 'connected';
          this.lastSyncTime = new Date();
          this.notifyListeners();
          return { success: true, message: 'Kết nối Supabase thành công và xác thực hợp lệ!' };
        } else {
          const errText = await res.text();
          this.status = 'error';
          this.notifyListeners();
          return { success: false, message: `Lỗi máy chủ Supabase (${res.status}): ${errText}` };
        }
      } catch (err) {
        this.status = 'error';
        this.notifyListeners();
        return { success: false, message: `Không thể kết nối tới Supabase: ${err.message}` };
      }
    }

    async pushTask(task, memberName = '') {
      if (!this.isConfigured()) {
        return { success: false, offline: true };
      }

      try {
        const payload = [{
          task_id: task.id,
          status: task.status || 'todo',
          progress_percent: parseInt(task.progressPercent, 10) || 0,
          actual_hours: parseFloat(task.actualHours) || parseFloat(task.hours) || 0,
          pr_link: task.prLink || '',
          notes: task.notes || '',
          updated_at: new Date().toISOString(),
          updated_by: memberName || 'Anonymous'
        }];

        const res = await fetch(`${this.url}/rest/v1/bang_cong_viec`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          this.status = 'connected';
          this.lastSyncTime = new Date();
          this.notifyListeners();
          return { success: true };
        } else {
          this.status = 'error';
          this.notifyListeners();
          return { success: false, status: res.status };
        }
      } catch (err) {
        this.status = 'error';
        this.notifyListeners();
        return { success: false, error: err.message };
      }
    }

    async pushAllTasks(tasks, memberName = '') {
      if (!this.isConfigured()) {
        return { success: false, message: 'Chưa cấu hình Supabase URL và Key.' };
      }

      try {
        this.status = 'syncing';
        this.notifyListeners();

        const payload = tasks.map(t => ({
          task_id: t.id,
          status: t.status || 'todo',
          progress_percent: parseInt(t.progressPercent, 10) || 0,
          actual_hours: parseFloat(t.actualHours) || parseFloat(t.hours) || 0,
          pr_link: t.prLink || '',
          notes: t.notes || '',
          updated_at: new Date().toISOString(),
          updated_by: memberName || 'Khởi tạo hàng loạt'
        }));

        const res = await fetch(`${this.url}/rest/v1/bang_cong_viec`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          this.status = 'connected';
          this.lastSyncTime = new Date();
          this.notifyListeners();
          return { success: true, count: payload.length };
        } else {
          const errText = await res.text();
          this.status = 'error';
          this.notifyListeners();
          return { success: false, message: `Lỗi Supabase (${res.status}): ${errText}` };
        }
      } catch (err) {
        this.status = 'error';
        this.notifyListeners();
        return { success: false, message: `Lỗi kết nối: ${err.message}` };
      }
    }

    async pullTasks() {
      if (!this.isConfigured()) {
        return { success: false, message: 'Chưa cấu hình Supabase URL và Key.' };
      }

      try {
        this.status = 'syncing';
        this.notifyListeners();

        const res = await fetch(`${this.url}/rest/v1/bang_cong_viec?select=*`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (res.ok) {
          const records = await res.json();
          this.status = 'connected';
          this.lastSyncTime = new Date();
          this.notifyListeners();
          return { success: true, data: records };
        } else {
          const errText = await res.text();
          this.status = 'error';
          this.notifyListeners();
          return { success: false, message: `Lỗi Supabase (${res.status}): ${errText}` };
        }
      } catch (err) {
        this.status = 'error';
        this.notifyListeners();
        return { success: false, message: `Lỗi kết nối: ${err.message}` };
      }
    }

    async fetchClaimedRoles() {
      if (!this.isConfigured()) return {};
      try {
        const res = await fetch(`${this.url}/rest/v1/bang_cong_viec?task_id=like.ROLE_*`, {
          method: 'GET',
          headers: this.getHeaders()
        });
        if (res.ok) {
          const list = await res.json();
          const claims = {};
          list.forEach(r => {
            const roleId = r.task_id.replace('ROLE_', '');
            claims[roleId] = {
              name: r.notes || '',
              mssv: r.pr_link || '',
              code: r.updated_by || '',
              claimedAt: r.updated_at
            };
          });
          return claims;
        }
      } catch (err) {
        console.error("fetchClaimedRoles error:", err);
      }
      return {};
    }

    async pushClaimedRole(claimData) {
      if (!this.isConfigured()) return { success: false };
      try {
        const payload = [{
          task_id: `ROLE_${claimData.roleId}`,
          status: 'claimed',
          progress_percent: 100,
          actual_hours: 0,
          notes: claimData.name,
          pr_link: claimData.mssv,
          updated_by: claimData.code,
          updated_at: new Date().toISOString()
        }];

        const res = await fetch(`${this.url}/rest/v1/bang_cong_viec`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });
        return { success: res.ok };
      } catch (err) {
        console.error("pushClaimedRole error:", err);
        return { success: false, error: err.message };
      }
    }

    onStatusChange(fn) {
      this.listeners.push(fn);
    }

    notifyListeners() {
      for (const fn of this.listeners) {
        try { fn(this.status, this); } catch (e) { console.error("Listener error", e); }
      }
    }
  }

  window.CloudSyncService = new CloudSyncService();
})();
