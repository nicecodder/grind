// ADMIN PANEL LOGIC

let adminToken = localStorage.getItem('grind_auth_token') || '';
let adminRole = localStorage.getItem('grind_user_role') || '';
let loadedUsers = []; // local cache

document.addEventListener('DOMContentLoaded', () => {
  initConsole();

  // Login handler
  const btnLogin = document.getElementById('btn-admin-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', handleAdminLogin);
  }
  
  // Login input Enter key binds
  const inputEmail = document.getElementById('admin-email');
  const inputPassword = document.getElementById('admin-password');
  [inputEmail, inputPassword].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdminLogin();
      });
    }
  });

  // Logout handler
  const btnLogout = document.getElementById('btn-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleAdminLogout);
  }

  // New Season handler
  const btnNewSeason = document.getElementById('btn-admin-new-season');
  if (btnNewSeason) {
    btnNewSeason.addEventListener('click', handleNewSeason);
  }
  
  // Search input filter bind
  const searchInput = document.getElementById('user-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleUserSearch);
  }
});

function initConsole() {
  const overlay = document.getElementById('admin-login-overlay');
  const dashboard = document.getElementById('admin-dashboard');

  if (adminToken && adminRole === 'admin') {
    if (overlay) overlay.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    // Fetch stats and registry
    fetchAdminStats();
    fetchUsersRegistry();
  } else {
    if (overlay) overlay.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
  }
}

// ADMIN LOGIN HANDLER
function handleAdminLogin() {
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const errorBox = document.getElementById('admin-login-error');
  const btnLogin = document.getElementById('btn-admin-login');

  if (errorBox) errorBox.style.display = 'none';

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email || !password) {
    showLoginError('Email/Username and Password are required.');
    return;
  }

  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = 'Verifying Credential...';
  }

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Log In to Console';
      }
      return res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Login verification failed.');
        return data;
      });
    })
    .then(data => {
      if (data.user.role !== 'admin') {
        throw new Error('Access Denied: Administrator privileges required.');
      }

      // Save credentials
      localStorage.setItem('grind_auth_token', data.token);
      localStorage.setItem('grind_user_role', data.user.role);
      
      adminToken = data.token;
      adminRole = data.user.role;

      // Re-init view
      initConsole();
      showToast('Console Connected', 'Welcome back, Administrator!', 'success');

      // Clear input fields
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    })
    .catch(err => {
      showLoginError(err.message);
    });
}

function showLoginError(msg) {
  const errorBox = document.getElementById('admin-login-error');
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }
}

// ADMIN LOGOUT HANDLER
function handleAdminLogout() {
  if (confirm("Disconnect admin console session?")) {
    localStorage.removeItem('grind_auth_token');
    localStorage.removeItem('grind_user_role');
    adminToken = '';
    adminRole = '';
    
    // Force reload
    window.location.reload();
  }
}

// FETCH STATS METRICS
function fetchAdminStats() {
  fetch('/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to retrieve stats.');
      return res.json();
    })
    .then(stats => {
      document.getElementById('stats-total-users').textContent = stats.totalUsers.toLocaleString();
      document.getElementById('stats-pro-users').textContent = stats.proUsers.toLocaleString();
      document.getElementById('stats-elite-users').textContent = stats.eliteUsers.toLocaleString();
      document.getElementById('stats-total-xp').textContent = stats.totalXP.toLocaleString();
    })
    .catch(err => {
      console.error('Stats query failure:', err);
    });
}

// FETCH USERS REGISTRY TABLE
function fetchUsersRegistry() {
  const tbody = document.getElementById('admin-users-tbody');
  
  fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to query users registry.');
      return res.json();
    })
    .then(users => {
      loadedUsers = users;
      renderUsersTable(users);
    })
    .catch(err => {
      console.error('Users fetch failure:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #ea4335; padding: 20px;">Error Loading Users: ${err.message}</td></tr>`;
      }
    });
}

// HTML Escaping Utility for XSS Prevention
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// DRAW USER TABLE ITEMS
function renderUsersTable(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--color-text-secondary); padding: 30px;">No matching grinders found.</td></tr>`;
    return;
  }

  let html = '';
  users.forEach(u => {
    const formattedDate = new Date(u.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    html += `
      <tr>
        <td style="color: var(--color-text-secondary); font-weight: 600;">${escapeHTML(u.id)}</td>
        <td>
          <span style="font-weight: 700; color: #fff;">${escapeHTML(u.username)}</span>
        </td>
        <td style="color: var(--color-text-secondary);">${escapeHTML(u.email)}</td>
        <td>
          <span class="role-badge ${escapeHTML(u.role)}">${u.role === 'admin' ? 'Admin' : 'User'}</span>
        </td>
        <td>
          <span class="tier-badge ${escapeHTML(u.subscription_plan)}">${escapeHTML(u.subscription_plan)}</span>
        </td>
        <td style="font-weight: 700; color: var(--accent-yellow);">${u.xp.toLocaleString()} XP</td>
        <td style="font-weight: 700; color: var(--accent-orange);">${u.streak} days</td>
        <td style="color: var(--color-text-secondary); font-size: 0.75rem;">${formattedDate}</td>
        <td style="text-align: right;">
          <div class="action-btn-grp">
            <button class="action-btn edit" title="Edit Profile stats" onclick="openEditModal('${u.id}')">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn delete" title="Delete User account" onclick="deleteUser('${u.id}', '${escapeHTML(u.username).replace(/'/g, "\\'")}')">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// DYNAMIC SEARCH FILTERING
function handleUserSearch() {
  const query = document.getElementById('user-search-input').value.toLowerCase().trim();
  if (query === '') {
    renderUsersTable(loadedUsers);
    return;
  }

  const filtered = loadedUsers.filter(u => {
    return u.username.toLowerCase().includes(query) ||
           u.email.toLowerCase().includes(query) ||
           u.role.toLowerCase().includes(query) ||
           u.subscription_plan.toLowerCase().includes(query);
  });

  renderUsersTable(filtered);
}

// EDIT USER MODAL CONTROL
function openEditModal(userId) {
  const u = loadedUsers.find(x => x.id === userId);
  if (!u) return;

  document.getElementById('edit-user-id').value = u.id;
  document.getElementById('edit-username').value = u.username;
  document.getElementById('edit-email').value = u.email;
  document.getElementById('edit-role').value = u.role;
  document.getElementById('edit-subscription').value = u.subscription_plan;
  document.getElementById('edit-xp').value = u.xp;
  document.getElementById('edit-streak').value = u.streak;

  const modal = document.getElementById('edit-user-modal');
  if (modal) modal.classList.add('open');
}

function closeEditModal() {
  const modal = document.getElementById('edit-user-modal');
  if (modal) modal.classList.remove('open');
}

function saveUserEdit() {
  const id = document.getElementById('edit-user-id').value;
  const username = document.getElementById('edit-username').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const role = document.getElementById('edit-role').value;
  const subscription_plan = document.getElementById('edit-subscription').value;
  const xp = document.getElementById('edit-xp').value;
  const streak = document.getElementById('edit-streak').value;

  if (!username || !email) {
    showToast('Input Required', 'Grinder Username and Email cannot be blank.', 'error');
    return;
  }

  fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      username,
      email,
      role,
      subscription_plan,
      xp: parseInt(xp) || 0,
      streak: parseInt(streak) || 0
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Save edits failed.');
      return res.json();
    })
    .then(() => {
      closeEditModal();
      showToast('Grinder Modified', `Stats for ${username} updated successfully.`, 'success');
      
      // Refresh statistics and grid
      fetchAdminStats();
      fetchUsersRegistry();
    })
    .catch(err => {
      showToast('Action Failed', err.message, 'error');
    });
}

// DELETE USER ACTION
function deleteUser(userId, username) {
  if (userId === 1 || userId === '1' || username === 'Administrator') {
    showToast('Restricted Action', 'The root system administrator account cannot be deleted.', 'error');
    return;
  }

  if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete grinder account "${username}"?\nThis action will erase all streaks, XP progress, and achievements. It CANNOT be undone.`)) {
    
    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Account deletion failed.');
        return res.json();
      })
      .then(() => {
        showToast('Grinder Erased', `Account "${username}" was removed from the database.`, 'success');
        
        // Refresh statistics and list
        fetchAdminStats();
        fetchUsersRegistry();
      })
      .catch(err => {
        showToast('Action Failed', err.message, 'error');
      });
  }
}

// TOAST MESSAGING CENTER
function showToast(header, body, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-header">${header}</div>
    <div class="toast-body">${body}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function handleNewSeason() {
  if (confirm("CRITICAL: Are you sure you want to transition to a new season?\nAll registered grinders will drop 70% of their current XP progress. This action cannot be undone.")) {
    const btn = document.getElementById('btn-admin-new-season');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Resetting season...';
    }
    
    fetch('/api/admin/new-season', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    })
      .then(res => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Start New Season';
        }
        return res.json().then(data => {
          if (!res.ok) throw new Error(data.error || 'Failed to trigger new season transition.');
          return data;
        });
      })
      .then(() => {
        showToast('New Season Started 🌟', 'Grinder rankings rolled over. 70% XP reduction applied to all accounts.', 'success');
        fetchAdminStats();
        fetchUsersRegistry();
      })
      .catch(err => {
        showToast('Action Failed', err.message, 'error');
      });
  }
}

// EXPOSE UTILS TO WINDOW FOR INLINE TEMPLATE CALLBACKS
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveUserEdit = saveUserEdit;
window.deleteUser = deleteUser;
