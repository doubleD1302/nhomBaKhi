// Model: Project Model
(function() {
  const STORAGE_KEY = 'INT4211_DE25_STATE';

  class ProjectModel {
    constructor() {
      this.tasks = [];
      this.members = [];
      this.milestones = [];
      this.criteriaC1 = [];
      this.criteriaC2 = [];
      this.seedQuota = [];
      this.techHighlights = [];
      this.theme = 'light';
    }

    init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      const base = window.PROJECT_DATA || {};

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.tasks = parsed.tasks || base.tasks || [];
          this.members = parsed.members || base.members || [];
          this.milestones = parsed.milestones || base.milestones || [];
          this.criteriaC1 = parsed.criteriaC1 || base.criteriaC1 || [];
          this.criteriaC2 = parsed.criteriaC2 || base.criteriaC2 || [];
          this.seedQuota = parsed.seedQuota || base.seedQuota || [];
          this.techHighlights = base.techHighlights || [];
          this.theme = parsed.theme || 'light';
          return;
        } catch (e) {
          console.error("ProjectModel state parse error", e);
        }
      }

      this.tasks = JSON.parse(JSON.stringify(base.tasks || []));
      this.members = JSON.parse(JSON.stringify(base.members || []));
      this.milestones = JSON.parse(JSON.stringify(base.milestones || []));
      this.criteriaC1 = JSON.parse(JSON.stringify(base.criteriaC1 || []));
      this.criteriaC2 = JSON.parse(JSON.stringify(base.criteriaC2 || []));
      this.seedQuota = JSON.parse(JSON.stringify(base.seedQuota || []));
      this.techHighlights = base.techHighlights || [];
      this.theme = 'light';
    }

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: this.tasks,
        members: this.members,
        milestones: this.milestones,
        criteriaC1: this.criteriaC1,
        criteriaC2: this.criteriaC2,
        seedQuota: this.seedQuota,
        theme: this.theme
      }));
    }

    updateTask(taskId, updates) {
      const t = this.tasks.find(x => x.id === taskId);
      if (!t) return null;
      Object.assign(t, updates);
      this.save();
      return t;
    }

    updateTaskStatus(taskId, status) {
      const updates = { status };
      if (status === 'done') updates.progressPercent = 100;
      return this.updateTask(taskId, updates);
    }

    filterTasks({ member = 'ALL', week = 'ALL', status = 'ALL', keyword = '' }) {
      return this.tasks.filter(t => {
        if (member !== 'ALL' && t.owner !== member) return false;
        if (week !== 'ALL') {
          const w = parseInt(week, 10);
          if (t.start !== w) return false;
        }
        if (status !== 'ALL') {
          const st = t.status || 'todo';
          if (st !== status) return false;
        }
        if (keyword) {
          const kw = keyword.toLowerCase().trim();
          const match = t.id.toLowerCase().includes(kw) ||
                        t.name.toLowerCase().includes(kw) ||
                        (t.done && t.done.toLowerCase().includes(kw));
          if (!match) return false;
        }
        return true;
      });
    }

    getStats(memberId = null) {
      let taskList = this.tasks;
      if (memberId) {
        taskList = this.tasks.filter(t => t.owner === memberId);
      }

      const total = taskList.length;
      const done = taskList.filter(t => t.status === 'done').length;
      const inProgress = taskList.filter(t => t.status === 'in_progress').length;
      const review = taskList.filter(t => t.status === 'review').length;
      const todo = taskList.filter(t => t.status === 'todo').length;

      let plannedHours = 0;
      let actualHours = 0;
      let completedHours = 0;

      taskList.forEach(t => {
        plannedHours += t.hours || 0;
        actualHours += parseFloat(t.actualHours || 0);
        if (t.status === 'done') completedHours += t.hours || 0;
      });

      const percent = total ? Math.round((done / total) * 100) : 0;

      return {
        total,
        done,
        inProgress,
        review,
        todo,
        percent,
        plannedHours,
        actualHours,
        completedHours
      };
    }

    resetBaseline() {
      localStorage.removeItem(STORAGE_KEY);
      this.init();
    }

    applyRemoteSync(remoteRecords) {
      if (!Array.isArray(remoteRecords) || remoteRecords.length === 0) return 0;
      let updatedCount = 0;
      for (const record of remoteRecords) {
        const t = this.tasks.find(x => x.id === record.task_id);
        if (t) {
          if (record.status) t.status = record.status;
          if (record.progress_percent !== undefined && record.progress_percent !== null) {
            t.progressPercent = parseInt(record.progress_percent, 10);
          }
          if (record.actual_hours !== undefined && record.actual_hours !== null) {
            t.actualHours = parseFloat(record.actual_hours);
          }
          if (record.pr_link !== undefined) t.prLink = record.pr_link;
          if (record.notes !== undefined) t.notes = record.notes;
          if (record.updated_at) t.updatedAt = record.updated_at;
          if (record.updated_by) t.updatedBy = record.updated_by;
          updatedCount++;
        }
      }
      this.save();
      return updatedCount;
    }
  }

  window.ProjectModel = new ProjectModel();
})();
