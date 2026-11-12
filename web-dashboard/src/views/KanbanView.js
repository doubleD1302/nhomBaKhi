// Views: Kanban Board View
(function() {
  class KanbanView {
    render(tasks, members, onUpdateStatus, onEditTask) {
      const cols = {
        todo: document.getElementById('kanban-cards-todo'),
        in_progress: document.getElementById('kanban-cards-in_progress'),
        review: document.getElementById('kanban-cards-review'),
        done: document.getElementById('kanban-cards-done')
      };
      if (!cols.todo) return;

      Object.values(cols).forEach(c => c.innerHTML = '');

      const counts = { todo: 0, in_progress: 0, review: 0, done: 0 };

      tasks.forEach(t => {
        const st = t.status || 'todo';
        if (counts[st] !== undefined) counts[st]++;
        const member = members.find(m => m.id === t.owner) || { avatarColor: '#0D9488' };
        const claim = window.UserModel ? window.UserModel.isRoleClaimed(t.owner) : { isClaimed: false };

        const el = document.createElement('div');
        el.className = `task-card ${st === 'done' ? 'card-done' : ''}`;
        el.draggable = true;
        el.dataset.id = t.id;

        const isGraded = ["T026", "T028", "T030", "T032"].includes(t.id);
        const ownerNameTag = (claim.isClaimed && claim.owner) ? ` · ${claim.owner.name.split(' ').pop()}` : '';

        el.innerHTML = `
          <div class="task-meta-top">
            <span class="task-id">${t.id}</span>
            <span class="task-badge-owner" style="background:${member.avatarColor}">${t.owner}${ownerNameTag}</span>
          </div>
          <div class="task-name">${isGraded ? `${window.Icons.get('flag', 'icon-sm text-rose')} ` : ''}${t.name}</div>
          <div class="task-deliverable">${t.done}</div>
          <div class="task-footer">
            <span class="week-pill ${t.start === 11 ? 'week-11-graded' : ''}">Tuần ${t.start}</span>
            <span style="display:flex; align-items:center; gap:4px; font-weight:700; font-size:11.5px; color:var(--text-secondary);">
              ${window.Icons.get('clock', 'icon-sm')} ${t.hours}h
            </span>
          </div>
        `;

        el.onclick = () => { if (onEditTask) onEditTask(t.id); };

        if (cols[st]) cols[st].appendChild(el);
      });

      document.getElementById('count-todo').textContent = counts.todo;
      document.getElementById('count-in_progress').textContent = counts.in_progress;
      document.getElementById('count-review').textContent = counts.review;
      document.getElementById('count-done').textContent = counts.done;

      this.setupDragAndDrop(onUpdateStatus);
    }

    setupDragAndDrop(onUpdateStatus) {
      const cards = document.querySelectorAll('.task-card');
      const cols = document.querySelectorAll('.kanban-cards');

      cards.forEach(card => {
        card.ondragstart = (e) => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', card.dataset.id);
        };
        card.ondragend = () => card.classList.remove('dragging');
      });

      cols.forEach(col => {
        col.ondragover = (e) => {
          e.preventDefault();
          col.style.background = 'rgba(13, 148, 136, 0.05)';
        };
        col.ondragleave = () => col.style.background = '';
        col.ondrop = (e) => {
          e.preventDefault();
          col.style.background = '';
          const taskId = e.dataTransfer.getData('text/plain');
          const parentCol = col.closest('.kanban-col');
          const newStatus = parentCol ? parentCol.dataset.status : col.dataset.status;
          if (taskId && newStatus && onUpdateStatus) {
            onUpdateStatus(taskId, newStatus);
          }
        };
      });
    }
  }

  window.KanbanView = new KanbanView();
})();
