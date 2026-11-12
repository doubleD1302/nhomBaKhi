// Views: WBS 64 Task Table View
(function() {
  class WbsView {
    render(tasks, members, onUpdateStatus, onEditTask) {
      const tbody = document.getElementById('wbs-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      tasks.forEach(t => {
        const member = members.find(m => m.id === t.owner) || { avatarColor: '#0D9488' };
        const claim = window.UserModel ? window.UserModel.isRoleClaimed(t.owner) : { isClaimed: false };
        const tr = document.createElement('tr');
        const isMilestone = ["T026", "T028", "T030", "T032", "T047", "T057", "T058"].includes(t.id);
        const isDone = t.status === 'done';

        const ownerChipHtml = (claim.isClaimed && claim.owner)
          ? `<span class="task-badge-owner" style="background:${member.avatarColor}" title="${t.owner} — ${claim.owner.name} (${claim.owner.mssv})">${t.owner} · ${claim.owner.name.split(' ').pop()}</span>`
          : `<span class="task-badge-owner" style="background:${member.avatarColor}">${t.owner}</span>`;

        tr.className = isDone ? 'task-row-done' : '';
        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" ${isDone ? 'checked' : ''} class="task-cb" title="Đánh dấu hoàn thành" />
          </td>
          <td style="font-weight:700; color:var(--primary); text-align:center;">
            <span class="task-code-chip">${t.id}</span>
          </td>
          <td>
            <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:2px;">
              ${isMilestone ? `${window.Icons.get('flag', 'icon-sm text-rose')} ` : ''}${t.name}
            </div>
            <div class="task-deliverable-chip">
              <strong>Sản phẩm bàn giao (DoD):</strong> ${t.done}
            </div>
          </td>
          <td style="text-align:center;">
            ${ownerChipHtml}
          </td>
          <td style="text-align:center;">
            <span class="week-pill ${t.start === 11 ? 'week-11-graded' : ''}">Tuần ${t.start}</span>
          </td>
          <td style="text-align:center; font-weight:700;">${t.hours}h</td>
          <td style="text-align:center;">
            <select class="select-input select-status-pill ${t.status || 'todo'}">
              <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Chưa bắt đầu</option>
              <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Đang thực hiện</option>
              <option value="review" ${t.status === 'review' ? 'selected' : ''}>Chờ review</option>
              <option value="done" ${t.status === 'done' ? 'selected' : ''}>Hoàn thành</option>
            </select>
          </td>
          <td style="text-align:center;">
            ${t.prLink ? `<a href="${t.prLink}" target="_blank" class="pr-link-badge">${window.Icons.get('git-pull-request', 'icon-sm')} PR</a>` : '<span style="color:var(--text-subtle);">—</span>'}
          </td>
          <td style="text-align:center;">
            <button class="btn btn-outline btn-edit" style="padding:4px 8px; font-size:11.5px;">
              ${window.Icons.get('edit', 'icon-sm')} Sửa
            </button>
          </td>
        `;

        tr.querySelector('.task-cb').onchange = (e) => {
          if (onUpdateStatus) onUpdateStatus(t.id, e.target.checked ? 'done' : 'todo');
        };

        tr.querySelector('select').onchange = (e) => {
          if (onUpdateStatus) onUpdateStatus(t.id, e.target.value);
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
        case 'in_progress': return 'Đang thực hiện';
        case 'review': return 'Chờ review';
        case 'done': return 'Hoàn thành';
        default: return st;
      }
    }
  }

  window.WbsView = new WbsView();
})();
