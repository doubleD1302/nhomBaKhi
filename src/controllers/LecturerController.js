(function () {
  const Model = window.LecturerProgressModel;
  const escape = Model.escape;
  const $ = id => document.getElementById(id);
  const date = value => {
    const parsed = new Date(value);
    return value && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa có cập nhật';
  };

  class LecturerController {
    constructor() {
      this.model = new Model(window.PROJECT_DATA || {});
      this.filters = { member: 'ALL', week: 'ALL', status: 'ALL', keyword: '' };
      this.loading = false;
    }

    init() {
      window.CloudSyncService.init();
      $('lecturer-member').insertAdjacentHTML('beforeend', this.model.members.map(m => `<option value="${escape(m.id)}">${escape(m.id)} · ${escape(this.model.identity(m).name)}</option>`).join(''));
      const weeks = [...new Set(this.model.tasks.flatMap(t => Array.from({ length: Number(t.end || t.start) - Number(t.start) + 1 }, (_, i) => Number(t.start) + i)))].sort((a, b) => a - b);
      $('lecturer-week').insertAdjacentHTML('beforeend', weeks.map(w => `<option value="${w}">Tuần ${w}</option>`).join(''));
      for (const [id, field] of [['lecturer-member', 'member'], ['lecturer-week', 'week'], ['lecturer-status', 'status'], ['lecturer-search', 'keyword']]) {
        $(id).addEventListener(id === 'lecturer-search' ? 'input' : 'change', event => {
          this.filters[field] = event.target.value;
          this.renderMembers();
          this.renderTasks();
        });
      }
      $('lecturer-filters').addEventListener('submit', event => event.preventDefault());
      $('lecturer-clear').addEventListener('click', () => {
        $('lecturer-filters').reset();
        this.filters = { member: 'ALL', week: 'ALL', status: 'ALL', keyword: '' };
        this.renderMembers();
        this.renderTasks();
      });
      $('lecturer-refresh').addEventListener('click', () => this.refresh());
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.refresh(); });
      this.render();
      this.refresh();
      this.interval = setInterval(() => { if (!document.hidden) this.refresh(); }, 15000);
    }

    async refresh() {
      if (this.loading) return;
      this.loading = true;
      $('lecturer-refresh').disabled = true;
      $('lecturer-refresh').textContent = 'Đang cập nhật…';
      try {
        const cloud = window.CloudSyncService;
        if (!cloud.isConfigured()) throw new Error('Chưa cấu hình kết nối Cloud');
        // Only GET and only fields needed for review; do not request role access codes.
        const columns = 'task_id,status,progress_percent,actual_hours,pr_link,notes,updated_at';
        const response = await fetch(`${cloud.url}/rest/v1/bang_cong_viec?select=${columns}`, {
          method: 'GET', headers: cloud.getHeaders(), signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) throw new Error(`Cloud trả về lỗi ${response.status}`);
        const records = await response.json();
        if (!Array.isArray(records)) throw new Error('Dữ liệu tiến độ không hợp lệ');
        const signature = JSON.stringify([...records].sort((a, b) => String(a.task_id).localeCompare(String(b.task_id))));
        const changed = signature !== this.lastSignature;
        this.model.applySnapshot(records);
        this.lastSignature = signature;
        const stats = this.model.summary();
        this.setSyncState('connected', 'Đã cập nhật dữ liệu chung từ Cloud', `Lần đồng bộ: ${date(this.model.lastSync)} · ${stats.synced}/${stats.total} nhiệm vụ có bản ghi Cloud. Các nhiệm vụ còn lại hiển thị kế hoạch trong repository. Tự cập nhật mỗi 15 giây.`);
        if (changed) this.render();
      } catch (error) {
        const source = this.model.lastSync ? `Đang giữ dữ liệu đã tải lúc ${date(this.model.lastSync)}.` : 'Đang hiển thị kế hoạch trong repository; chưa xác nhận tiến độ từ Cloud.';
        this.setSyncState('error', 'Chưa tải được tiến độ mới', `${source} ${error.name === 'TimeoutError' ? 'Kết nối quá thời gian chờ.' : error.message} Bấm “Cập nhật ngay” để thử lại.`);
      } finally {
        this.loading = false;
        $('lecturer-refresh').disabled = false;
        $('lecturer-refresh').textContent = 'Cập nhật ngay';
      }
    }

    setSyncState(state, title, detail) {
      $('lecturer-sync-status').textContent = title;
      $('lecturer-sync-detail').textContent = detail;
      document.querySelector('.lecturer-sync-panel').dataset.state = state;
    }

    render() {
      const stats = this.model.summary();
      $('lecturer-overall').innerHTML = [
        ['Tỷ lệ nhiệm vụ hoàn thành', `${stats.percent}%`, `<progress class="lecturer-progress" value="${stats.percent}" max="100" aria-label="Tỷ lệ nhiệm vụ hoàn thành toàn dự án"></progress>`],
        ['Nhiệm vụ hoàn thành', `${stats.done}<span style="font-size:20px;color:#64748b"> / ${stats.total}</span>`, `${stats.todo} chưa bắt đầu`],
        ['Đang thực hiện / chờ review', `${stats.in_progress} / ${stats.review}`, 'Theo trạng thái do nhóm cập nhật'],
        ['Giờ thực tế / kế hoạch', `${stats.actual.toFixed(1)}<span style="font-size:20px;color:#64748b"> / ${stats.planned}h</span>`, 'Giờ thực tế do nhóm ghi nhận']
      ].map(([label, value, note]) => `<article class="lecturer-metric"><p class="lecturer-metric-label">${label}</p><p class="lecturer-metric-value">${value}</p><small>${note}</small></article>`).join('');
      this.model.members.forEach(m => {
        const option = $('lecturer-member').querySelector(`option[value="${m.id}"]`);
        if (option) option.textContent = `${m.id} · ${this.model.identity(m).name}`;
      });
      this.renderMembers();
      this.renderTasks();
    }

    renderMembers() {
      $('lecturer-members').innerHTML = this.model.members.map(member => {
        const who = this.model.identity(member);
        const stats = this.model.summary(this.model.tasks.filter(t => t.owner === member.id));
        return `<article class="lecturer-member-card ${this.filters.member === member.id ? 'selected' : ''}">
          <span class="lecturer-member-id">${escape(member.id)}</span><h3>${escape(who.name)}</h3><small>MSSV: ${escape(who.mssv)}</small>
          <p class="lecturer-member-role">${escape(member.shortTitle)}</p>
          <p class="lecturer-member-percent">${stats.percent}% <small style="font-size:12px;font-weight:500">· ${stats.done}/${stats.total} hoàn thành</small></p>
          <progress class="lecturer-progress" max="100" value="${stats.percent}" aria-label="Tiến độ ${escape(who.name)}"></progress>
          <p class="lecturer-state-counts">${stats.in_progress} đang làm · ${stats.review} chờ review · ${stats.todo} chưa bắt đầu</p>
          <small>${stats.actual.toFixed(1)}h thực tế / ${stats.planned}h kế hoạch</small>
          <button type="button" class="btn btn-outline" data-member="${escape(member.id)}" aria-pressed="${this.filters.member === member.id}">Xem ${stats.total} nhiệm vụ</button>
        </article>`;
      }).join('');
      $('lecturer-members').querySelectorAll('[data-member]').forEach(button => button.addEventListener('click', () => {
        // A member card always shows the full assignment, regardless of earlier filters.
        this.filters = { member: button.dataset.member, week: 'ALL', status: 'ALL', keyword: '' };
        $('lecturer-filters').reset();
        $('lecturer-member').value = this.filters.member;
        this.renderMembers();
        this.renderTasks();
        $('tasks-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
    }

    renderTasks() {
      const tasks = this.model.filter(this.filters);
      const stats = this.model.summary(tasks);
      $('lecturer-task-count').textContent = `${tasks.length}/${this.model.tasks.length} nhiệm vụ`;
      $('lecturer-filter-summary').textContent = `Kết quả đang xem: ${stats.done} hoàn thành · ${stats.in_progress} đang thực hiện · ${stats.review} chờ review · ${stats.todo} chưa bắt đầu.`;
      $('lecturer-task-body').innerHTML = tasks.map(task => {
        const member = this.model.members.find(m => m.id === task.owner);
        const who = member ? this.model.identity(member).name : task.owner;
        const url = Model.evidenceUrl(task.prLink);
        return `<tr><td><span class="lecturer-task-id">${escape(task.id)}</span><span class="lecturer-task-name">${escape(task.name)}</span>
          <details><summary>Tiêu chí hoàn thành & ghi chú</summary><p><strong>Tiêu chí:</strong> ${escape(task.done || 'Chưa có')}</p><p><strong>Ghi chú:</strong> ${escape(task.notes || 'Chưa có ghi chú')}</p><p><strong>Cập nhật:</strong> ${escape(date(task.updatedAt))}</p><p><strong>Tiến độ nhóm ghi nhận:</strong> ${task.status === 'done' ? 100 : task.progressPercent}%</p></details>
          ${url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">Xem minh chứng ↗</a>` : '<span class="lecturer-task-source">Chưa gắn liên kết minh chứng</span>'}
          <span class="lecturer-task-source">${task.synced ? 'Dữ liệu Cloud' : 'Theo kế hoạch trong repository'}</span></td>
          <td>${escape(task.owner)}<br>${escape(who)}</td><td>${escape(task.start)}${task.end && task.end !== task.start ? `–${escape(task.end)}` : ''}</td>
          <td><span class="lecturer-status ${escape(task.status)}">${escape(Model.statuses[task.status] || 'Chưa bắt đầu')}</span></td>
          <td>${task.actualHours.toFixed(1)} / ${Number(task.hours) || 0}h</td></tr>`;
      }).join('') || '<tr><td colspan="5" class="lecturer-empty">Không có nhiệm vụ phù hợp. Thử đổi hoặc xóa bộ lọc.</td></tr>';
    }
  }

  window.LecturerController = new LecturerController();
  window.LecturerController.init();
})();
