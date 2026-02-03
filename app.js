const form = document.querySelector('form[data-netlify="true"]');
const statusEl = document.querySelector('.form-status');
const redirectUrl = form ? form.getAttribute('data-redirect') : null;
const actionUrl = form ? form.getAttribute('action') || '/' : '/';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const encode = (data) =>
  Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (statusEl) {
      statusEl.textContent = 'Sending...';
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
          statusEl.textContent = 'Redirecting you to book a call...';
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
      const rotateY = ((x / rect.width) - 0.5) * maxTilt;
      const rotateX = ((y / rect.height) - 0.5) * -maxTilt;
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
