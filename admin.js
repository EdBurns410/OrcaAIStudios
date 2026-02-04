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

// Render Table
function renderTable(submissions) {
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
const setAuthState = (isAuthed, email = '') => {
  if (adminSection) adminSection.style.display = isAuthed ? 'block' : 'none';
  if (loadBtn) loadBtn.style.display = isAuthed ? 'inline-flex' : 'none';
  if (exportBtn) exportBtn.style.display = isAuthed ? 'inline-flex' : 'none';
  if (signOutBtn) signOutBtn.style.display = isAuthed ? 'inline-flex' : 'none';

  // Hide login inputs if authed
  if (inputsContainer) inputsContainer.style.display = isAuthed ? 'none' : 'flex';

  if (userEl && isAuthed) userEl.textContent = `Signed in as ${email}`;
  else if (userEl) userEl.textContent = '';
};

// Login Function
const login = () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (email === 'edwardburns210@gmail.com' && password) {
    // We set the token to the password for the backend check
    authToken = password;
    setAuthState(true, email);
    loadSubmissions();
  } else {
    statusEl.textContent = 'Invalid credentials.';
    statusEl.style.color = 'red';
  }
};

// Logout Function
const logout = () => {
  authToken = null;
  passwordInput.value = '';
  setAuthState(false);
  renderTable([]);
  statusEl.textContent = 'Signed out.';
  statusEl.style.color = 'var(--color-text-muted)';
};

// Fetch Data
const loadSubmissions = async () => {
  if (!authToken) {
    statusEl.textContent = 'Please sign in.';
    return;
  }

  statusEl.textContent = 'Loading requests...';

  try {
    const response = await fetch('/.netlify/functions/submissions', {
      headers: {
        'x-admin-password': authToken
      }
    });

    if (response.status === 401 || response.status === 403) {
      statusEl.textContent = 'Unauthorized access (wrong password).';
      statusEl.style.color = 'red';
      logout(); // Force logout on bad auth
      return;
    }

    if (!response.ok) throw new Error('Fetch failed');

    const payload = await response.json();
    submissionsCache = payload.submissions || [];
    renderTable(submissionsCache);
    statusEl.textContent = `Loaded ${submissionsCache.length} request(s).`;
    statusEl.style.color = 'var(--color-primary)';

  } catch (e) {
    console.error(e);
    statusEl.textContent = 'Error loading data.';
    statusEl.style.color = 'red';
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
if (loadBtn) loadBtn.addEventListener('click', loadSubmissions);
if (exportBtn) exportBtn.addEventListener('click', exportCsv);

// Initial State
setAuthState(false);
