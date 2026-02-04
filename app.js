const forms = document.querySelectorAll('form[data-netlify="true"], form[netlify]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (forms.length) {
  forms.forEach((form) => {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const redirectUrl = form.getAttribute('data-redirect');
    const actionUrl = form.getAttribute('action') || '/';
    const offerCards = Array.from(form.querySelectorAll('.offer-card'));
    const customToggle = form.querySelector('[data-custom-toggle]');
    const customBlock = form.querySelector('[data-custom-block]');
    const updateOffers = () => {
      offerCards.forEach((card) => {
        const input = card.querySelector('input[type="radio"]');
        card.classList.toggle('is-selected', Boolean(input && input.checked));
      });
    };
    const updateCustomSpec = () => {
      if (!customToggle || !customBlock) {
        return;
      }
      const isVisible = customToggle.checked;
      customBlock.hidden = !isVisible;
      customBlock.classList.toggle('is-visible', isVisible);
    };

    if (offerCards.length) {
      offerCards.forEach((card) => {
        const input = card.querySelector('input[type="radio"]');
        if (input) {
          input.addEventListener('change', updateOffers);
        }
      });
      updateOffers();
    }

    if (customToggle && customBlock) {
      customToggle.addEventListener('change', updateCustomSpec);
      updateCustomSpec();
    }

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
      if (!formData.has('form-name')) {
        const formName = form.getAttribute('name');
        if (formName) {
          formData.append('form-name', formName);
        }
      }

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
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
        updateOffers();
        updateCustomSpec();
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

const reviewSection = document.querySelector('[data-reviews]');
if (reviewSection) {
  const reviewIndex = reviewSection.querySelector('[data-review-index]');
  const reviewTrack = reviewSection.querySelector('[data-review-track]');
  const reviewCount = reviewSection.querySelector('[data-review-count]');
  const reviewAverage = reviewSection.querySelector('[data-review-average]');
  const reviewPrev = reviewSection.querySelector('[data-review-prev]');
  const reviewNext = reviewSection.querySelector('[data-review-next]');

  if (reviewIndex && reviewTrack) {
    const createStarIcon = (className) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('review-star');
      if (className) {
        svg.classList.add(className);
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        'M12 2l2.82 6.57 7.12.61-5.4 4.69 1.6 7.01L12 17.77 5.86 20.88 7.46 13.87 2.06 9.18l7.12-.61L12 2z'
      );
      svg.appendChild(path);
      return svg;
    };

    const sanitizeValue = (value) => (value && value !== 'N/A' ? value : null);
    const sanitizeText = (value) => (value ? value.replace(/fiverr/gi, 'the platform') : value);

    const loadReviews = () => {
      if (Array.isArray(window.REVIEW_DATA)) {
        return Promise.resolve(window.REVIEW_DATA);
      }
      return fetch('reviews.json').then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load reviews');
        }
        return response.json();
      });
    };

    const keywordMap = {
      'Data Dashboards': ['Data Dashboards & Analysis', 'Business Infographics', 'Research'],
      'Business Plans': ['Research', 'Business Infographics', 'Software Development'],
      'Full Stack Web Applications': ['Full Stack', 'React', 'Internal Tools'],
      'Data Analytics Consultation': ['Data Dashboards & Analysis', 'Research', 'Automation'],
    };

    const globalKeywords = [
      'Advanced UI Software Development',
      'Quick Build',
      'Internal Web Apps',
      'React',
      'Full Stack',
      'Software Development',
    ];

    const reviewImages = {
      'Data Dashboards': [
        'images/data_revenue.png',
        'images/data_sales.png',
        'images/data_trading.png',
        'images/data_social.png',
        'images/data_hair.png',
      ],
      'Business Plans': ['images/brand_identity.png', 'images/treehouse.png'],
      'Full Stack Web Applications': ['images/bmtl_dark.png', 'images/georivals.png'],
      'Data Analytics Consultation': ['images/data_revenue.png', 'images/data_sales.png'],
    };

    const buildKeywords = (review, index) => {
      const set = new Set();
      const mapped = keywordMap[review.category] || [];
      mapped.forEach((item) => set.add(item));
      const start = index % globalKeywords.length;
      for (let i = 0; i < 2; i += 1) {
        set.add(globalKeywords[(start + i) % globalKeywords.length]);
      }
      return Array.from(set).slice(0, 4);
    };

    const hashString = (value) => {
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) % 360;
      }
      return hash;
    };

    const createAvatar = (user) => {
      const avatar = document.createElement('div');
      avatar.className = 'review-avatar';
      const initials = user
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 2)
        .toUpperCase();
      const hue = hashString(user);
      avatar.style.setProperty('--avatar-hue', String(hue));
      const text = document.createElement('span');
      text.textContent = initials || 'U';
      avatar.appendChild(text);
      return avatar;
    };

    const resolveReviewImage = (review, index) => {
      const images = reviewImages[review.category] || [];
      if (!images.length) return null;
      if (index % 4 !== 0) return null;
      return images[index % images.length];
    };

    loadReviews()
      .then((reviews) => {
        if (!Array.isArray(reviews) || !reviews.length) {
          return;
        }

        const ratingSum = reviews.reduce((sum, review) => sum + (parseFloat(review.rating) || 0), 0);
        const ratingAverage = ratingSum / reviews.length;

        if (reviewCount) {
          reviewCount.textContent = reviews.length.toLocaleString();
        }
        if (reviewAverage) {
          reviewAverage.textContent = ratingAverage.toFixed(1);
        }

        reviews.forEach((review, index) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'review-chip';
          chip.dataset.reviewIndex = String(index);

          const chipLabel = document.createElement('span');
          chipLabel.textContent = `@${review.user}`;
          chip.appendChild(chipLabel);

          const chipRating = document.createElement('span');
          chipRating.className = 'review-chip-rating';
          chipRating.appendChild(createStarIcon('review-star--sm'));
          const chipRatingValue = document.createElement('span');
          chipRatingValue.textContent = review.rating;
          chipRating.appendChild(chipRatingValue);
          chip.appendChild(chipRating);
          reviewIndex.appendChild(chip);

          const card = document.createElement('article');
          card.className = 'review-card';
          card.dataset.reviewIndex = String(index);

          const previewImage = resolveReviewImage(review, index);
          if (previewImage) {
            const media = document.createElement('div');
            media.className = 'review-media';
            const img = document.createElement('img');
            img.src = previewImage;
            img.alt = 'Project preview';
            img.loading = 'lazy';
            media.appendChild(img);
            card.appendChild(media);
          }

          const cardTop = document.createElement('div');
          cardTop.className = 'review-card-top';

          const rating = document.createElement('div');
          rating.className = 'review-rating';
          rating.appendChild(createStarIcon());
          const ratingValue = document.createElement('span');
          ratingValue.textContent = review.rating;
          rating.appendChild(ratingValue);
          cardTop.appendChild(rating);

          const time = document.createElement('span');
          time.textContent = review.time;
          cardTop.appendChild(time);
          card.appendChild(cardTop);

          const text = document.createElement('p');
          text.className = 'review-text';
          text.textContent = sanitizeText(review.text);
          card.appendChild(text);

          const meta = document.createElement('div');
          meta.className = 'review-meta';
          meta.appendChild(createAvatar(review.user));
          const user = document.createElement('span');
          user.className = 'review-user';
          user.textContent = `@${review.user}`;
          meta.appendChild(user);

          const country = document.createElement('span');
          country.className = 'review-country';
          country.textContent = review.country;
          meta.appendChild(country);
          card.appendChild(meta);

          const tags = document.createElement('div');
          tags.className = 'review-tags';
          const keywords = buildKeywords(review, index);
          keywords.forEach((value) => {
            const tag = document.createElement('span');
            tag.className = 'review-tag review-tag--accent';
            tag.textContent = value;
            tags.appendChild(tag);
          });
          const tagValues = [sanitizeValue(review.category), sanitizeValue(review.budget), sanitizeValue(review.duration)];
          tagValues.filter(Boolean).forEach((value) => {
            const tag = document.createElement('span');
            tag.className = 'review-tag';
            tag.textContent = value;
            tags.appendChild(tag);
          });
          card.appendChild(tags);
          reviewTrack.appendChild(card);
        });

        const chips = Array.from(reviewIndex.querySelectorAll('.review-chip'));
        const cards = Array.from(reviewTrack.querySelectorAll('.review-card'));
        let activeIndex = 0;

        const scrollTrackToCard = (card) => {
          const trackRect = reviewTrack.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const currentScroll = reviewTrack.scrollLeft;
          const cardOffset = cardRect.left - trackRect.left + currentScroll;
          const target =
            cardOffset - (trackRect.width / 2 - cardRect.width / 2);
          reviewTrack.scrollTo({
            left: Math.max(0, target),
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        };

        const setActive = (index, shouldScroll = true) => {
          if (index < 0 || index >= cards.length) {
            return;
          }
          if (activeIndex === index) {
            return;
          }
          activeIndex = index;
          chips.forEach((chip, i) => chip.classList.toggle('is-active', i === index));
          cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
          if (shouldScroll) {
            scrollTrackToCard(cards[index]);
          }
        };

        const updateActiveFromScroll = () => {
          if (!cards.length) return;
          const trackRect = reviewTrack.getBoundingClientRect();
          const center = trackRect.left + trackRect.width / 2;
          let closestIndex = 0;
          let closestDistance = Number.POSITIVE_INFINITY;
          cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(center - cardCenter);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          });
          setActive(closestIndex, false);
        };

        let scrollRaf = null;
        reviewTrack.addEventListener('scroll', () => {
          if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
          }
          scrollRaf = requestAnimationFrame(updateActiveFromScroll);
        });

        reviewIndex.addEventListener('mouseover', (event) => {
          const target = event.target.closest('.review-chip');
          if (!target) return;
          const index = Number(target.dataset.reviewIndex);
          setActive(index, true);
        });

        reviewIndex.addEventListener('focusin', (event) => {
          const target = event.target.closest('.review-chip');
          if (!target) return;
          const index = Number(target.dataset.reviewIndex);
          setActive(index, true);
        });

        reviewIndex.addEventListener('click', (event) => {
          const target = event.target.closest('.review-chip');
          if (!target) return;
          const index = Number(target.dataset.reviewIndex);
          setActive(index, true);
        });

        if (reviewPrev && reviewNext) {
          const scrollByCard = (direction) => {
            const nextIndex = Math.min(Math.max(activeIndex + direction, 0), cards.length - 1);
            setActive(nextIndex, true);
          };
          reviewPrev.addEventListener('click', () => scrollByCard(-1));
          reviewNext.addEventListener('click', () => scrollByCard(1));
        }

        chips[0]?.classList.add('is-active');
        cards[0]?.classList.add('is-active');
      })
      .catch(() => {
        if (reviewCount) {
          reviewCount.textContent = '200+';
        }
      });
  }
}
