// Model: User & Auth Session Model
(function() {
  const USER_KEY = 'INT4211_CURRENT_USER';
  const COMMITS_KEY = 'INT4211_COMMITS_DATA';

  class UserModel {
    constructor() {
      this.currentUser = null;
      this.commits = { TV01: [], TV02: [], TV03: [], TV04: [] };
    }

    init() {
      // Load session
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }

      // Load commits
      const savedCommits = localStorage.getItem(COMMITS_KEY);
      if (savedCommits) {
        try {
          this.commits = JSON.parse(savedCommits);
        } catch (e) {
          this.commits = { TV01: [], TV02: [], TV03: [], TV04: [] };
        }
      }
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

    authenticateByCode(code, members) {
      if (!code) return null;
      const clean = code.trim().toUpperCase();

      const matched = members.find(m => 
        m.id === clean || 
        m.defaultCode === clean ||
        (m.id === 'TV01' && clean.includes('TV01')) ||
        (m.id === 'TV02' && clean.includes('TV02')) ||
        (m.id === 'TV03' && clean.includes('TV03')) ||
        (m.id === 'TV04' && clean.includes('TV04'))
      );

      if (!matched) return null;

      const user = {
        memberId: matched.id,
        name: matched.name,
        shortTitle: matched.shortTitle,
        accessCode: matched.defaultCode || `BK-${matched.id}`,
        loginTime: new Date().toISOString()
      };
      this.saveSession(user);
      return user;
    }

    claimRole(memberId, name, mssv, members) {
      const matched = members.find(m => m.id === memberId) || members[0];
      const code = matched.defaultCode || `BK-${matched.id}`;

      const user = {
        memberId: matched.id,
        name: name || matched.name,
        mssv: mssv || 'INT4211',
        shortTitle: matched.shortTitle,
        accessCode: code,
        loginTime: new Date().toISOString()
      };
      this.saveSession(user);
      return user;
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

    getCommits(memberId) {
      return this.commits[memberId] || [];
    }
  }

  window.UserModel = new UserModel();
})();
