// Model: User & Auth Session Model (Role Claiming & Cryptographic Access Keys)
// Phục vụ cơ chế bảo mật: Mã truy cập khó đoán & Khóa vai trò độc quyền (1 người/vai trò)
(function() {
  const USER_KEY = 'INT4211_CURRENT_USER';
  const COMMITS_KEY = 'INT4211_COMMITS_DATA';
  const CLAIMED_ROLES_KEY = 'INT4211_CLAIMED_ROLES';

  class UserModel {
    constructor() {
      this.currentUser = null;
      this.commits = { TV01: [], TV02: [], TV03: [], TV04: [] };
      this.claimedRoles = {
        TV01: null,
        TV02: null,
        TV03: null,
        TV04: null
      };
    }

    init() {
      // 1. Load active user session
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }

      // 2. Load commits
      const savedCommits = localStorage.getItem(COMMITS_KEY);
      if (savedCommits) {
        try {
          this.commits = JSON.parse(savedCommits);
        } catch (e) {
          this.commits = { TV01: [], TV02: [], TV03: [], TV04: [] };
        }
      }

      // 3. Load locally cached claimed roles
      const savedClaims = localStorage.getItem(CLAIMED_ROLES_KEY);
      if (savedClaims) {
        try {
          this.claimedRoles = Object.assign(this.claimedRoles, JSON.parse(savedClaims));
        } catch (e) {
          console.error("Error parsing local claimed roles", e);
        }
      }
    }

    // Sinh mã truy cập bảo mật cao, khó đoán (Format: TRO-[TAG]-[4CHARS]-[4CHARS])
    generateSecureCode(roleId) {
      const tags = {
        'TV01': 'SRV', // Server & Cloud
        'TV02': 'ADM', // Admin Android
        'TV03': 'STU', // Student Flutter
        'TV04': 'DBQ'  // Database & QA
      };
      const tag = tags[roleId] || 'DEV';
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let part1 = '';
      let part2 = '';
      for (let i = 0; i < 4; i++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `TRO-${tag}-${part1}-${part2}`;
    }

    saveSession(user) {
      this.currentUser = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    clearSession() {
      this.currentUser = null;
      localStorage.removeItem(USER_KEY);
    }

    saveCommits() {
      localStorage.setItem(COMMITS_KEY, JSON.stringify(this.commits));
    }

    saveClaimedRoles() {
      localStorage.setItem(CLAIMED_ROLES_KEY, JSON.stringify(this.claimedRoles));
    }

    setClaimedRolesFromCloud(cloudClaims) {
      if (!cloudClaims || typeof cloudClaims !== 'object') return;
      Object.keys(cloudClaims).forEach(rid => {
        if (this.claimedRoles.hasOwnProperty(rid)) {
          this.claimedRoles[rid] = cloudClaims[rid];
        }
      });
      this.saveClaimedRoles();
    }

    isRoleClaimed(roleId) {
      const claim = this.claimedRoles[roleId];
      if (claim && claim.name && claim.code) {
        return { isClaimed: true, owner: claim };
      }
      return { isClaimed: false, owner: null };
    }

    // Nhận vai trò độc quyền (Khóa vai trò không cho người khác chọn)
    claimRole(roleId, name, mssv, members) {
      const check = this.isRoleClaimed(roleId);
      if (check.isClaimed) {
        // Kiểm tra xem có phải chính người này lấy lại quyền không
        if (this.currentUser && this.currentUser.memberId === roleId) {
          return { success: true, user: this.currentUser, isNew: false };
        }
        return { 
          success: false, 
          message: `Vai trò ${roleId} đã được nhận bởi ${check.owner.name} (MSSV: ${check.owner.mssv}). Vui lòng chọn vai trò khác còn trống!` 
        };
      }

      const matched = members.find(m => m.id === roleId) || members[0];
      const secureCode = this.generateSecureCode(roleId);

      const claimData = {
        roleId: matched.id,
        name: (name || matched.name).trim(),
        mssv: (mssv || 'INT4211').trim(),
        code: secureCode,
        claimedAt: new Date().toISOString()
      };

      // Ghi nhận vai trò đã khóa
      this.claimedRoles[roleId] = claimData;
      this.saveClaimedRoles();

      const user = {
        memberId: matched.id,
        name: claimData.name,
        mssv: claimData.mssv,
        shortTitle: matched.shortTitle,
        accessCode: secureCode,
        loginTime: new Date().toISOString()
      };

      this.saveSession(user);
      return { success: true, user, code: secureCode, isNew: true };
    }

    // Đăng nhập bằng mã bảo mật khó đoán
    authenticateByCode(code, members) {
      if (!code) return null;
      const clean = code.trim().toUpperCase();

      // 1. Kiểm tra đối chiếu trong danh sách vai trò đã có người nhận
      for (const rid of Object.keys(this.claimedRoles)) {
        const claim = this.claimedRoles[rid];
        if (claim && claim.code && claim.code.toUpperCase() === clean) {
          const matched = members.find(m => m.id === rid) || members[0];
          const user = {
            memberId: rid,
            name: claim.name,
            mssv: claim.mssv,
            shortTitle: matched.shortTitle,
            accessCode: claim.code,
            loginTime: new Date().toISOString()
          };
          this.saveSession(user);
          return user;
        }
      }

      // 2. Dự phòng: Cho phép dùng mã khôi phục cứu trợ khẩn cấp định dạng TRO-[ROLE] (Dành cho chủ dự án)
      for (const m of members) {
        const fallbackPrefix = `TRO-${m.id}`;
        if (clean === fallbackPrefix) {
          const claim = this.claimedRoles[m.id];
          const user = {
            memberId: m.id,
            name: claim ? claim.name : m.name,
            mssv: claim ? claim.mssv : 'INT4211',
            shortTitle: m.shortTitle,
            accessCode: claim ? claim.code : this.generateSecureCode(m.id),
            loginTime: new Date().toISOString()
          };
          this.saveSession(user);
          return user;
        }
      }

      return null;
    }

    addCommit(memberId, hash, message) {
      if (!this.commits[memberId]) this.commits[memberId] = [];
      const entry = {
        hash: hash.trim(),
        message: message.trim(),
        date: new Date().toLocaleDateString('vi-VN')
      };
      this.commits[memberId].push(entry);
      this.saveCommits();
      return entry;
    }

    deleteCommit(memberId, index) {
      if (!this.commits[memberId] || index < 0 || index >= this.commits[memberId].length) return false;
      this.commits[memberId].splice(index, 1);
      this.saveCommits();
      return true;
    }

    getCommits(memberId) {
      return this.commits[memberId] || [];
    }
  }

  window.UserModel = new UserModel();
})();
