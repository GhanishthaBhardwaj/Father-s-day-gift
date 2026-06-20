/* ============================================
   FATHER'S DAY TRIBUTE — SCRIPT
   Vanilla JS. Modular, commented, no dependencies.
   ============================================ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     1. LOADER
     ============================================ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    if (!loader || !fill) return;

    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        setTimeout(() => {
          loader.classList.add('is-hidden');
          document.body.style.overflow = '';
        }, 350);
        return;
      }
      fill.style.width = progress + '%';
      setTimeout(tick, 220);
    };

    document.body.style.overflow = 'hidden';
    setTimeout(tick, 400);
  }

  /* ============================================
     2. CUSTOM CURSOR
     ============================================ */
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    // Smoothed ring follow for a premium lag effect
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Enlarge ring on interactive elements
    const interactiveSelectors = 'a, button, .bento-item, [data-cursor-hover]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.add('is-active');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.remove('is-active');
      }
    });
  }

  /* ============================================
     3. SCROLL PROGRESS BAR
     ============================================ */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================
     4. SCROLL REVEAL (IntersectionObserver)
     ============================================ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  /* ============================================
     5. HERO "BEGIN" BUTTON + SCROLL INDICATOR
     ============================================ */
  function initHeroNav() {
    const beginBtn = document.getElementById('beginBtn');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    const scrollToGallery = () => {
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (beginBtn) beginBtn.addEventListener('click', scrollToGallery);
    if (scrollIndicator) scrollIndicator.addEventListener('click', scrollToGallery);
  }

  /* ============================================
     6. FLOATING PARTICLES / STARS (Canvas)
     ============================================ */
  function initParticles(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const density = options.density || 0.00009; // particles per px²
    let particles = [];
    let width, height, dpr;
    let rafId;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      createParticles();
    }

    function createParticles() {
      const count = Math.max(18, Math.floor(width * height * density));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        speedY: Math.random() * 0.18 + 0.04,
        speedX: (Math.random() - 0.5) * 0.08,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#DCEEFF';

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < -5) p.y = height + 5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
        ctx.globalAlpha = p.opacity * (0.5 + twinkle * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        resize();
        draw();
      }, 200);
    });
  }

  /* ============================================
     7. LIGHTBOX GALLERY
     ============================================ */
  function initLightbox() {
    const items = Array.from(document.querySelectorAll('.bento-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (!items.length || !lightbox || !lightboxImg) return;

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const img = items[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % items.length;
      const img = items[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      const img = items[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    items.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

  /* ============================================
     8. THE LETTER — staggered fade-in per paragraph
     ============================================ */
  function initLetterReveal() {
    const paragraphs = document.querySelectorAll('.letter-para');
    if (!paragraphs.length) return;

    if (prefersReducedMotion) {
      paragraphs.forEach((p) => p.classList.add('is-visible'));
      return;
    }

    // Each paragraph fades in independently as it scrolls into view,
    // creating a natural reading rhythm rather than one synced animation.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -60px 0px' });

    paragraphs.forEach((p) => observer.observe(p));
  }

  /* ============================================
     INIT — run everything once DOM is ready
     ============================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initScrollProgress();
    initScrollReveal();
    initHeroNav();
    initParticles('particlesHero', { density: 0.00012 });
    initParticles('particlesQuote', { density: 0.00009 });
    initLightbox();
    initLetterReveal();
  });

})();