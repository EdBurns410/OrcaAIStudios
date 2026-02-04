const loginBtn = document.getElementById('login-btn');
const loadBtn = document.getElementById('load-submissions');
const signOutBtn = document.getElementById('sign-out');
const exportBtn = document.getElementById('export-csv');
const statusEl = document.getElementById('admin-status');
const userEl = document.getElementById('admin-user');
const adminSection = document.querySelector('.admin-section');
const tbody = document.getElementById('submissions-body');
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');
const inputsContainer = document.querySelector('.admin-inputs');

let submissionsCache = [];
let authToken = null; // We'll store the password here temporarily

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let isAuth = false;

document.addEventListener('DOMContentLoaded', () => {

  // Render Table
  function renderTable(submissions) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!submissions || submissions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted);">No requests found via Neon DB.</td></tr>';
      return;
    }

    submissions.forEach((sub) => {
      // sub fields: name, email, company, project_type, budget, message, created_at
      const date = new Date(sub.created_at).toLocaleString();

      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${escapeHtml(sub.name)}</td>
          <td>${escapeHtml(sub.email)}</td>
          <td>${escapeHtml(sub.company)}</td>
          <td>${escapeHtml(sub.project_type)}</td>
          <td>${escapeHtml(sub.budget)}</td>
          <td>
            <button class="btn-xs view-details" data-msg="${escapeHtml(sub.message)}">View</button>
          </td>
          <td>${date}</td>
        `;
      tbody.appendChild(tr);
    });

    // Attach listeners
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const msg = e.target.getAttribute('data-msg');
        alert('Message:\n\n' + msg);
      });
    });
  }

  // Auth State Logic
  const setAuthState = (state, email = '') => {
    isAuth = state;
    const displayStyle = state ? 'inline-flex' : 'none';
    const blockStyle = state ? 'block' : 'none';

    if (adminSection) adminSection.style.display = blockStyle;
    if (loadBtn) loadBtn.style.display = displayStyle;
    if (exportBtn) exportBtn.style.display = displayStyle;
    if (signOutBtn) signOutBtn.style.display = displayStyle;

    // Hide login inputs if authed
    if (inputsContainer) inputsContainer.style.display = state ? 'none' : 'flex';

    if (userEl) userEl.textContent = state ? `Signed in as ${email}` : '';
  };

  // Login Function
  const login = () => {
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (email === 'edwardburns210@gmail.com' && password) {
      // Do NOT set state yet. Verify first.
      authToken = password;
      if (statusEl) {
        statusEl.textContent = 'Verifying credentials...';
        statusEl.style.color = 'var(--color-primary)';
      }
      loadSubmissions(email);
    } else {
      if (statusEl) {
        statusEl.textContent = 'Invalid credentials.';
        statusEl.style.color = 'red';
      }
    }
  };

  // Logout Function
  const logout = () => {
    authToken = null;
    if (passwordInput) passwordInput.value = '';
    setAuthState(false);
    renderTable([]);
    if (statusEl) {
      statusEl.textContent = 'Signed out.';
      statusEl.style.color = 'var(--color-text-muted)';
    }
  };

  // Fetch Data
  const loadSubmissions = async (emailForUI) => {
    if (!authToken) {
      if (statusEl) statusEl.textContent = 'Please sign in.';
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/submissions', {
        headers: {
          'x-admin-password': authToken
        }
      });

      // Handle Unauthorized (401/403)
      if (response.status === 401 || response.status === 403) {
        if (statusEl) {
          statusEl.textContent = 'Login Failed: Incorrect Password.';
          statusEl.style.color = 'red';
        }
        const data = await response.json();
        alert(`Login Failed: ${data.error || 'Unauthorized'}`);
        authToken = null; // Clear invalid token
        return;
      }

      // Handle Server Errors (500, etc)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || response.statusText;
        if (statusEl) {
          statusEl.textContent = `Server Error: ${msg}`;
          statusEl.style.color = 'red';
        }
        alert(`Server Error: ${msg}\n\n(Check Netlify Logs if in production)`);
        return;
      }

      // Success! NOW we switch the UI.
      const payload = await response.json();
      submissionsCache = payload.submissions || [];

      // Update UI State ONLY if we are logging in (passed email) or already authed
      if (emailForUI || isAuth) {
        setAuthState(true, emailForUI || (userEl ? userEl.textContent.replace('Signed in as ', '') : ''));
      }

      renderTable(submissionsCache);
      if (statusEl) {
        statusEl.textContent = `Loaded ${submissionsCache.length} request(s).`;
        statusEl.style.color = 'var(--color-primary)';
      }

    } catch (e) {
      console.error(e);
      if (statusEl) {
        statusEl.textContent = `Error: ${e.message}`;
        statusEl.style.color = 'red';
      }
      alert(`Network/Script Error:\n${e.message}`);
    }
  };

  // Export CSV
  const exportCsv = () => {
    if (!submissionsCache.length) {
      alert('No data to export.');
      return;
    }

    const headers = ['id', 'name', 'email', 'company', 'project_type', 'budget', 'message', 'created_at'];
    const rows = submissionsCache.map(sub => {
      return headers.map(key => {
        let val = sub[key] || '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orca_requests.csv';
    link.click();
  };

  // Event Listeners
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (signOutBtn) signOutBtn.addEventListener('click', logout);
  if (loadBtn) loadBtn.addEventListener('click', () => loadSubmissions());
  if (exportBtn) exportBtn.addEventListener('click', exportCsv);

  // Initial State
  setAuthState(false);
});
