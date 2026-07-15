'use strict';

/* ──────────────────────────────────
   0. THEME TOGGLE (Light / Dark)
────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('themeToggle');
  const icon      = document.getElementById('themeIcon');

  // Set the correct icon on load
  function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
  updateIcon();

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    // Spin animation
    toggleBtn.classList.add('animating');

    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateIcon();
      toggleBtn.classList.remove('animating');
    }, 300);
  });
});

/* ──────────────────────────────────
   1. LOADER
────────────────────────────────── */
const loader = document.getElementById('loader');

// Prevent scrolling while loading
document.body.style.overflow = 'hidden';

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }, 300);
});


/* ──────────────────────────────────
   2. CUSTOM CURSOR (desktop only)
────────────────────────────────── */
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch) {
  const cursor         = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function followCursor() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(followCursor);
  })();

  const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .contact-card, .stat-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
    });
  });
}


/* ──────────────────────────────────
   3. PARTICLE CANVAS (desktop only)
────────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

if (!isMobile && !prefersReducedMotion) {
  (function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx    = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const PARTICLE_COUNT = 20;

    class Particle {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x       = Math.random() * W;
        this.y       = initial ? Math.random() * H : H + 10;
        this.size    = Math.random() * 1.5 + 0.3;
        this.speedY  = -(Math.random() * 0.4 + 0.15);
        this.speedX  = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color   = Math.random() > 0.5 ? '#00e5ff' : '#8b5cf6';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#00e5ff';
            ctx.globalAlpha = (1 - dist / 100) * 0.06;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    }
    animate();
  })();
}


/* ──────────────────────────────────
   4. NAVBAR
────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

// Throttled scroll handler
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // Navbar scroll state
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      // Active section highlight
      highlightActiveSection();
      // Back to top
      backToTopBtn.classList.toggle('visible', window.scrollY > 400);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

function openMenu() {
  navMenu.classList.add('open');
  navOverlay.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', true);
  navOverlay.setAttribute('aria-hidden', false);
}

function closeMenu() {
  navMenu.classList.remove('open');
  navOverlay.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
  navOverlay.setAttribute('aria-hidden', true);
}

hamburger.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeMenu() : openMenu();
});

// Close when clicking the backdrop
navOverlay.addEventListener('click', closeMenu);

navLinks.forEach(link => {
  link.addEventListener('click', () => closeMenu());
});

function highlightActiveSection() {
  let current = '';
  sections.forEach(sec => {
    const top    = sec.offsetTop - 120;
    const bottom = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}


/* ──────────────────────────────────
   5. AOS INIT
────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 500,
      easing: 'ease-out-cubic',
      once: true,
      offset: 20,
      startEvent: 'DOMContentLoaded',
    });
  }
});


/* ──────────────────────────────────
   6. SKILL BAR ANIMATION
────────────────────────────────── */
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillFills.forEach(fill => skillObserver.observe(fill));


/* ──────────────────────────────────
   7. COUNTER ANIMATION
────────────────────────────────── */
const statNumbers = document.querySelectorAll('.stat-number[data-count]');

function animateCount(el) {
  const target    = parseInt(el.dataset.count, 10);
  const dur       = 1600;
  const step      = 16;
  const increment = target / (dur / step);
  let current     = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(n => counterObserver.observe(n));






/* ──────────────────────────────────
   9. BUTTON RIPPLE EFFECT
────────────────────────────────── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect   = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    ripple.classList.add('ripple');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});


/* ──────────────────────────────────
   10. BACK TO TOP
────────────────────────────────── */
const backToTopBtn = document.getElementById('backToTop');

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ──────────────────────────────────
   11. FOOTER YEAR
────────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();


/* ──────────────────────────────────
   12. SMOOTH SCROLL
────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ──────────────────────────────────
   13. SKILL CARD HOVER GLOW
────────────────────────────────── */
if (!isTouch) {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width  * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top)  / rect.height * 100) + '%');
    });
  });


/* ──────────────────────────────────
   14. PROJECT CARD 3D TILT
────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -4;
      const rotateY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  4;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ──────────────────────────────────
   15. AOS REFRESH ON RESIZE
────────────────────────────────── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof AOS !== 'undefined') AOS.refresh();
  }, 200);
}, { passive: true });
