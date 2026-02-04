const forms = document.querySelectorAll('form[data-netlify="true"], form[netlify]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const encode = (data) =>
  Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');

if (forms.length) {
  forms.forEach((form) => {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const redirectUrl = form.getAttribute('data-redirect');
    const actionUrl = form.getAttribute('action') || '/';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (statusEl) {
        statusEl.textContent = 'Sending...';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
      }

      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode(payload),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        if (redirectUrl) {
          if (statusEl) {
            statusEl.textContent = 'Success! Redirecting...';
          }
          window.location.assign(redirectUrl);
          return;
        }

        if (statusEl) {
          statusEl.textContent = 'Thanks! Your request has been received.';
        }
        form.reset();
      } catch (error) {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong. Please try again.';
        }
        form.submit();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
        }
      }
    });
  });
}

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

const parallaxItems = document.querySelectorAll('[data-parallax]');
if (!prefersReducedMotion && parallaxItems.length) {
  let ticking = false;
  const updateParallax = () => {
    const viewportHeight = window.innerHeight || 0;
    parallaxItems.forEach((item) => {
      const speed = parseFloat(item.dataset.speed || '0.15');
      const rect = item.getBoundingClientRect();
      const offset = (rect.top - viewportHeight) * speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  updateParallax();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
}

const tiltItems = document.querySelectorAll('[data-tilt]');
if (!prefersReducedMotion && tiltItems.length) {
  const maxTilt = 8;
  const perspective = 900;
  tiltItems.forEach((item) => {
    let rafId;
    const handleMove = (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * maxTilt;
      const rotateX = (y / rect.height - 0.5) * -maxTilt;
      item.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    };

    const reset = () => {
      item.style.transform = '';
    };

    item.addEventListener('mousemove', (event) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => handleMove(event));
    });

    item.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      reset();
    });

    item.addEventListener('blur', reset);
  });
}
