const loginBtn = document.getElementById('login-btn');
const loadBtn = document.getElementById('load-submissions');
const signOutBtn = document.getElementById('sign-out');
const exportBtn = document.getElementById('export-csv');
const statusEl = document.getElementById('admin-status');
const userEl = document.getElementById('admin-user');
const adminSection = document.querySelector('.admin-section');
const tbody = document.getElementById('submissions-body');

let submissionsCache = [];
let currentUser = null;

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
const setAuthState = (user) => {
  currentUser = user;
  const isAuthed = Boolean(user);

  if (adminSection) adminSection.style.display = isAuthed ? 'block' : 'none';
  if (loadBtn) loadBtn.style.display = isAuthed ? 'inline-flex' : 'none';
  if (exportBtn) exportBtn.style.display = isAuthed ? 'inline-flex' : 'none';
  if (signOutBtn) signOutBtn.style.display = isAuthed ? 'inline-flex' : 'none';
  if (loginBtn) loginBtn.style.display = isAuthed ? 'none' : 'inline-flex';
  if (userEl) userEl.textContent = isAuthed ? `Signed in as ${user.email}` : '';
};

// Fetch Data
const loadSubmissions = async () => {
  if (!currentUser) {
    statusEl.textContent = 'Please sign in.';
    return;
  }

  statusEl.textContent = 'Loading requests...';

  try {
    const token = await currentUser.jwt();
    const response = await fetch('/.netlify/functions/submissions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      statusEl.textContent = 'Unauthorized access.';
      statusEl.style.color = 'red';
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

  const headers = ['id', 'name', 'email', 'company', 'project_type', 'budget', 'message', 'created_at', 'role'];
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
if (loginBtn) loginBtn.addEventListener('click', () => window.netlifyIdentity && window.netlifyIdentity.open());
if (signOutBtn) signOutBtn.addEventListener('click', () => window.netlifyIdentity && window.netlifyIdentity.logout());
if (loadBtn) loadBtn.addEventListener('click', loadSubmissions);
if (exportBtn) exportBtn.addEventListener('click', exportCsv);

// Init Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    setAuthState(user);
    if (user) loadSubmissions();
  });
  window.netlifyIdentity.on('login', user => {
    setAuthState(user);
    window.netlifyIdentity.close();
    loadSubmissions();
  });
  window.netlifyIdentity.on('logout', () => {
    setAuthState(null);
    renderTable([]);
    statusEl.textContent = '';
  });
  window.netlifyIdentity.init();
}
