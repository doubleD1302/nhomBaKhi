// Views: Gateway & Onboarding Screen (Role Claim & Code Login)
(function() {
  class GatewayView {
    constructor() {
      this.selectedRole = 'TV01';
    }

    render(members, onSelectRole) {
      const container = document.getElementById('role-cards-container');
      if (!container) return;
      container.innerHTML = '';

      members.forEach(m => {
        const isSelected = this.selectedRole === m.id;
        const card = document.createElement('div');
        card.className = `role-card ${isSelected ? 'selected' : ''}`;
        card.dataset.id = m.id;

        const techBadges = (m.techStack || []).map(t => `<span class="tech-tag">${t}</span>`).join('');

        card.innerHTML = `
          <div class="role-card-badge" style="background:${m.badgeBg}; color:${m.avatarColor}; border:1px solid ${m.badgeBorder};">
            ${window.Icons.get(m.icon || 'sparkles')} <span>${m.id} · ${m.shortTitle}</span>
          </div>
          <h3>${m.name}</h3>
          <p>${m.role}</p>
          <div class="role-tech-tags">${techBadges}</div>
          <div class="role-hours-footer">
            <span>Kế hoạch: ${m.plannedHours} giờ</span>
            <span>16 Đầu việc</span>
          </div>
        `;

        card.addEventListener('click', () => {
          this.selectedRole = m.id;
          document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          if (onSelectRole) onSelectRole(m.id);
        });

        container.appendChild(card);
      });
    }

    showDigitalPass(user, member, onEnterDashboard) {
      const passModal = document.getElementById('member-pass-modal');
      document.getElementById('pass-member-name').textContent = user.name;
      document.getElementById('pass-member-mssv').textContent = `MSSV: ${user.mssv}`;
      document.getElementById('pass-role-title').textContent = `${member.id} — ${member.name}`;
      document.getElementById('pass-code-display').textContent = user.accessCode;

      passModal.classList.add('active');
      passModal.style.display = 'flex';

      document.getElementById('btn-enter-dashboard-with-pass').onclick = () => {
        passModal.classList.remove('active');
        passModal.style.display = 'none';
        if (onEnterDashboard) onEnterDashboard();
      };
    }
  }

  window.GatewayView = new GatewayView();
})();
