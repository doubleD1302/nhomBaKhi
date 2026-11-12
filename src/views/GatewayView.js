// Views: Gateway & Onboarding Screen (Role Claiming & Cryptographic Access Keys)
// Cơ chế: Khóa vai trò độc quyền (1 người/vai trò) & Mã bảo mật khó đoán TRO-XXX-XXXX-XXXX
(function() {
  class GatewayView {
    constructor() {
      this.selectedRole = null;
    }

    render(members, onSelectRole) {
      const container = document.getElementById('role-cards-container');
      if (!container) return;
      container.innerHTML = '';

      // Tự động tìm vai trò còn trống đầu tiên nếu vai trò hiện tại chưa chọn hoặc đã bị nhận
      if (!this.selectedRole || (window.UserModel && window.UserModel.isRoleClaimed(this.selectedRole).isClaimed)) {
        const firstAvailable = members.find(m => !window.UserModel.isRoleClaimed(m.id).isClaimed);
        this.selectedRole = firstAvailable ? firstAvailable.id : null;
      }

      members.forEach(m => {
        const claimStatus = window.UserModel ? window.UserModel.isRoleClaimed(m.id) : { isClaimed: false };
        const isClaimed = claimStatus.isClaimed;
        const isSelected = !isClaimed && this.selectedRole === m.id;

        const card = document.createElement('div');
        card.className = `role-card ${isClaimed ? 'is-claimed' : 'is-available'} ${isSelected ? 'selected' : ''}`;
        card.dataset.id = m.id;

        const techBadges = (m.techStack || []).map(t => `<span class="tech-tag">${t}</span>`).join('');

        let statusHeaderHtml = '';
        if (isClaimed) {
          const owner = claimStatus.owner || {};
          statusHeaderHtml = `
            <div class="role-status-pill claimed">
              ${window.Icons.get('lock', 'icon-sm')} 
              <span>ĐÃ CÓ NGƯỜI NHẬN: <strong>${owner.name || 'Thành viên'}</strong> (${owner.mssv || 'Đã khóa'})</span>
            </div>
          `;
        } else {
          statusHeaderHtml = `
            <div class="role-status-pill available">
              ${window.Icons.get('unlock', 'icon-sm')} 
              <span>CÒN TRỐNG · SẴN SÀNG NHẬN</span>
            </div>
          `;
        }

        card.innerHTML = `
          ${statusHeaderHtml}
          <div class="role-card-badge" style="background:${m.badgeBg}; color:${m.avatarColor}; border:1px solid ${m.badgeBorder};">
            ${window.Icons.get(m.icon || 'building')} <span>${m.id} · ${m.shortTitle}</span>
          </div>
          <h3>${m.name}</h3>
          <p>${m.role}</p>
          <div class="role-tech-tags">${techBadges}</div>
          <div class="role-hours-footer">
            <span>${window.Icons.get('clock', 'icon-sm')} Kế hoạch: ${m.plannedHours}h</span>
            <span>${window.Icons.get('list-todo', 'icon-sm')} 16 Đầu việc</span>
          </div>
        `;

        card.addEventListener('click', () => {
          if (isClaimed) {
            const owner = claimStatus.owner || {};
            alert(`⚠️ Vai trò ${m.id} (${m.name}) đã được nhận bởi ${owner.name || 'thành viên khác'} (MSSV: ${owner.mssv || 'N/A'}).\n\nTheo quy định độc quyền, mỗi người 1 vai trò, bạn không thể chọn vai trò này. Vui lòng chọn vai trò còn trống!`);
            return;
          }

          this.selectedRole = m.id;
          document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          if (onSelectRole) onSelectRole(m.id);
        });

        container.appendChild(card);
      });

      // Cập nhật trạng thái nút nhận vai trò
      const btnClaim = document.getElementById('btn-claim-role');
      if (btnClaim) {
        if (!this.selectedRole) {
          btnClaim.disabled = true;
          btnClaim.innerHTML = `${window.Icons.get('lock')} Toàn Bộ 4 Vai Trò Đã Được Nhận`;
          btnClaim.style.opacity = '0.5';
          btnClaim.style.cursor = 'not-allowed';
        } else {
          btnClaim.disabled = false;
          btnClaim.innerHTML = `${window.Icons.get('shield-check')} Cấp Mã Bảo Mật & Nhận Vai Trò ${this.selectedRole}`;
          btnClaim.style.opacity = '1';
          btnClaim.style.cursor = 'pointer';
        }
      }
    }

    showDigitalPass(user, member, onEnterDashboard) {
      const passModal = document.getElementById('member-pass-modal');
      if (!passModal) return;

      document.getElementById('pass-member-name').textContent = user.name;
      document.getElementById('pass-member-mssv').textContent = `MSSV: ${user.mssv}`;
      document.getElementById('pass-role-title').textContent = `${member.id} — ${member.name}`;
      document.getElementById('pass-code-display').textContent = user.accessCode;

      passModal.classList.add('active');
      passModal.style.display = 'flex';

      const btnEnter = document.getElementById('btn-enter-dashboard-with-pass');
      if (btnEnter) {
        btnEnter.onclick = () => {
          passModal.classList.remove('active');
          passModal.style.display = 'none';
          if (onEnterDashboard) onEnterDashboard();
        };
      }
    }
  }

  window.GatewayView = new GatewayView();
})();
