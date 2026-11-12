// Views: WBS 64 Task Table View
(function() {
  class WbsView {
    render(tasks, members, onUpdateStatus, onEditTask) {
      const tbody = document.getElementById('wbs-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      tasks.forEach(t => {
        const member = members.find(m => m.id === t.owner) || { avatarColor: '#1B365D' };
        const tr = document.createElement('tr');
        const isMilestone = ["T026", "T028", "T030", "T032", "T047", "T057", "T058"].includes(t.id);

        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} class="task-cb" />
          </td>
          <td style="font-weight:700; color:var(--primary); text-align:center;">${t.id}</td>
          <td>
            <div style="font-weight:600;">${isMilestone ? `${window.Icons.get('flag', 'icon-sm text-amber')} ` : ''}${t.name}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${t.done}</div>
          </td>
          <td style="text-align:center;">
            <span class="task-badge-owner" style="background:${member.avatarColor}">${t.owner}</span>
          </td>
          <td style="text-align:center; font-weight:600;">Tuần ${t.start}</td>
          <td style="text-align:center; font-weight:700;">${t.hours}h</td>
          <td style="text-align:center;">
            <span class="badge-status ${t.status || 'todo'}">${this.getStatusLabel(t.status || 'todo')}</span>
          </td>
          <td style="text-align:center;">
            ${t.prLink ? `<a href="${t.prLink}" target="_blank" style="color:var(--primary); font-weight:600;">${window.Icons.get('git-pull-request', 'icon-sm')} PR</a>` : '—'}
          </td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-edit" style="padding:2px 8px; font-size:11px;">
              ${window.Icons.get('edit', 'icon-sm')} Sửa
            </button>
          </td>
        `;

        tr.querySelector('.task-cb').onchange = (e) => {
          if (onUpdateStatus) onUpdateStatus(t.id, e.target.checked ? 'done' : 'todo');
        };

        tr.querySelector('.btn-edit').onclick = () => {
          if (onEditTask) onEditTask(t.id);
        };

        tbody.appendChild(tr);
      });
    }

    getStatusLabel(st) {
      switch(st) {
        case 'todo': return 'Chưa bắt đầu';
        case 'in_progress': return 'Đang làm';
        case 'review': return 'Chờ review';
        case 'done': return 'Hoàn thành';
        default: return st;
      }
    }
  }

  window.WbsView = new WbsView();
})();
