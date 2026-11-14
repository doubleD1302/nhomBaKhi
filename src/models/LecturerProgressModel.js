// A read-only snapshot, independent of member sessions and browser-local edits.
(function () {
  const STATUSES = { todo: 'Chưa bắt đầu', in_progress: 'Đang thực hiện', review: 'Chờ review / test', done: 'Hoàn thành' };
  const number = value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);

  class LecturerProgressModel {
    constructor(base) {
      this.base = base;
      this.members = base.members || [];
      this.tasks = this.snapshot([]);
      this.claims = {};
      this.lastSync = null;
    }

    snapshot(records) {
      const remote = new Map(records.map(r => [r.task_id, r]));
      return (this.base.tasks || []).map(task => {
        const row = remote.get(task.id);
        return {
          ...task,
          status: row && Object.hasOwn(STATUSES, row.status) ? row.status : (task.status || 'todo'),
          progressPercent: row ? Math.min(100, number(row.progress_percent)) : number(task.progressPercent),
          actualHours: row ? number(row.actual_hours) : number(task.actualHours),
          prLink: row ? (row.pr_link || '') : (task.prLink || ''),
          notes: row ? (row.notes || '') : (task.notes || ''),
          updatedAt: row ? row.updated_at : null,
          synced: Boolean(row)
        };
      });
    }

    applySnapshot(records, time = new Date()) {
      if (!Array.isArray(records)) throw new Error('Dữ liệu tiến độ không hợp lệ');
      // Rebuild from the plan on each successful pull: removed Cloud records must
      // not leave stale status behind. Never change task IDs, owners or definitions.
      this.tasks = this.snapshot(records);
      this.claims = {};
      for (const member of this.members) {
        const row = records.find(r => r.task_id === `ROLE_${member.id}`);
        if (row) this.claims[member.id] = { name: row.notes, mssv: row.pr_link };
      }
      this.lastSync = time;
    }

    identity(member) {
      const claim = this.claims[member.id];
      return { name: claim?.name || member.assignedPerson || member.name, mssv: claim?.mssv || member.mssv || '—' };
    }

    summary(tasks = this.tasks) {
      const stats = { total: tasks.length, todo: 0, in_progress: 0, review: 0, done: 0, planned: 0, actual: 0, synced: 0 };
      for (const task of tasks) {
        stats[Object.hasOwn(STATUSES, task.status) ? task.status : 'todo']++;
        stats.planned += number(task.hours);
        stats.actual += number(task.actualHours);
        stats.synced += task.synced ? 1 : 0;
      }
      stats.percent = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
      return stats;
    }

    filter({ member = 'ALL', week = 'ALL', status = 'ALL', keyword = '' } = {}) {
      const query = keyword.trim().toLocaleLowerCase('vi');
      return this.tasks.filter(t =>
        (member === 'ALL' || t.owner === member) &&
        (week === 'ALL' || (Number(t.start) <= Number(week) && Number(t.end || t.start) >= Number(week))) &&
        (status === 'ALL' || t.status === status) &&
        (!query || `${t.id} ${t.name} ${t.done} ${t.notes}`.toLocaleLowerCase('vi').includes(query))
      );
    }

    static escape(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }

    static evidenceUrl(value) {
      try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
      } catch { return ''; }
    }
  }

  LecturerProgressModel.statuses = STATUSES;
  window.LecturerProgressModel = LecturerProgressModel;
})();
