// Views: Milestones & Quality Gates Checklists View
(function() {
  class MilestonesView {
    render(milestones, criteriaC1, criteriaC2, onToggleC1, onToggleC2) {
      // Milestones Timeline
      const container = document.getElementById('milestones-timeline');
      if (container) {
        container.innerHTML = milestones.map(m => `
          <div class="timeline-item">
            <div class="timeline-badge ${m.isGraded ? 'graded' : ''}">T${m.week}</div>
            <div class="timeline-content">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h4 style="font-weight:700; font-size:14px; color:${m.isGraded ? 'var(--rose)' : 'var(--primary)'}">
                  ${m.name} ${m.isGraded ? '(MỐC CÓ ĐIỂM 1.0)' : ''}
                </h4>
                <span style="font-size:11.5px; font-weight:600; color:var(--text-muted);">${m.deadline}</span>
              </div>
              <p style="font-size:12.5px; margin-bottom:6px;">${m.deliverable}</p>
              ${m.warning ? `<div style="background:var(--rose-subtle); color:var(--rose); padding:6px 10px; border-radius:4px; font-size:11.5px; font-weight:700; margin-bottom:6px;">${window.Icons.get('alert-triangle', 'icon-sm')} ${m.warning}</div>` : ''}
              <div style="font-size:11px; color:var(--text-muted);">${m.note}</div>
            </div>
          </div>
        `).join('');
      }

      // Checklist C1 Android
      const c1El = document.getElementById('checklist-c1-container');
      if (c1El) {
        c1El.innerHTML = criteriaC1.map((c, i) => `
          <div style="display:flex; align-items:flex-start; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12.5px;">
            <input type="checkbox" id="c1_${i}" ${c.completed ? 'checked' : ''} style="margin-top:3px;" />
            <label for="c1_${i}" style="cursor:pointer; flex:1;">
              <div style="font-weight:600;">${c.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${c.desc}</div>
            </label>
          </div>
        `).join('');
        c1El.querySelectorAll('input').forEach((cb, i) => {
          cb.onchange = (e) => { if (onToggleC1) onToggleC1(i, e.target.checked); };
        });
      }

      // Checklist C2 Flutter
      const c2El = document.getElementById('checklist-c2-container');
      if (c2El) {
        c2El.innerHTML = criteriaC2.map((c, i) => `
          <div style="display:flex; align-items:flex-start; gap:8px; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:12.5px;">
            <input type="checkbox" id="c2_${i}" ${c.completed ? 'checked' : ''} style="margin-top:3px;" />
            <label for="c2_${i}" style="cursor:pointer; flex:1;">
              <div style="font-weight:600;">${c.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${c.desc}</div>
            </label>
          </div>
        `).join('');
        c2El.querySelectorAll('input').forEach((cb, i) => {
          cb.onchange = (e) => { if (onToggleC2) onToggleC2(i, e.target.checked); };
        });
      }
    }
  }

  window.MilestonesView = new MilestonesView();
})();
