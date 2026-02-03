const loginBtn = document.getElementById('login-btn');
const statusEl = document.getElementById('admin-status');

const openLogin = () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.open();
  }
};

if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', (user) => {
    if (user) {
      window.location.href = '/admin';
    } else {
      openLogin();
    }
  });

  window.netlifyIdentity.on('login', () => {
    window.location.href = '/admin';
  });

  window.netlifyIdentity.on('error', () => {
    statusEl.textContent = 'Sign-in failed. Please try again.';
  });

  window.netlifyIdentity.init();
}

loginBtn.addEventListener('click', openLogin);
