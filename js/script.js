(() => {
  "use strict";

  /* ============ ENABLE JS-DEPENDENT ANIMATIONS ============ */
  // Only hide/reveal content once we know JS is actually running.
  // Without this, a script error would leave real content permanently invisible.
  document.documentElement.classList.add("js-ready");

  /* ============ ANIMATED BACKGROUND (particle network) ============ */
  (function () {
  const canvas = document.getElementById('network-bg');
  const ctx = canvas.getContext('2d');

  // ---- config ----
  const DOT_COLOR = 'rgba(212, 175, 55, 0.85)';   // gold
  const LINE_COLOR = 'rgba(212, 175, 55,';        // gold, alpha added dynamically
  const DOT_RADIUS = 1.8;
  const LINK_DISTANCE = 140;      // max distance to draw a connecting line
  const PARTICLE_DENSITY = 9000;  // lower = more particles (px^2 per particle)
  const SPEED = 0.25;             // drift speed
  const MOUSE_RADIUS = 160;       // how far the cursor pushes/attracts dots

  let width, height, particles, mouse = { x: null, y: null };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((width * height) / PARTICLE_DENSITY);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // move + draw dots
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // gentle mouse influence
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.fill();
    }

    // draw connecting lines between nearby dots
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DISTANCE) {
          const alpha = 1 - dist / LINK_DISTANCE;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = LINE_COLOR + (alpha * 0.35) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resize();
  if (!prefersReducedMotion) {
    requestAnimationFrame(step);
  } else {
    step(); // draw one static frame only
  }
})();

  /* ============ THEME TOGGLE ============ */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ============ MOBILE NAV ============ */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ============ ACTIVE NAV LINK ON SCROLL ============ */
  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-links a[data-nav]");
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => navObserver.observe(s));

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  try {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  } catch (err) {
    // IntersectionObserver unsupported or failed — reveal everything immediately.
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  // Safety net: no matter what happens above, force every element visible
  // after 2.5s so a stuck animation can never hide real content long-term.
  setTimeout(() => {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }, 2500);

  /* ============ SKILL BAR FILL (animate once visible) ============ */
  const skillSection = document.getElementById("skills");
  const fillBars = () => {
    document.querySelectorAll(".bar-fill").forEach(bar => {
      bar.style.width = `${bar.dataset.fill}%`;
    });
  };
  if (skillSection) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fillBars();
          skillObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    skillObserver.observe(skillSection);
  }

  /* ============ ANIMATED STAT COUNTERS ============ */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ============ HERO TERMINAL TYPING EFFECT ============ */
  const typeLineEl = document.getElementById("typeLine");
  const lines = [
    "df = clean(load('data.csv'))",
    "model.fit(X_train, y_train)",
    "insight = explain(model)"
  ];
  let lineIndex = 0, charIndex = 0, deleting = false;

  function typeLoop() {
    if (!typeLineEl) return;
    const current = lines[lineIndex];

    if (!deleting) {
      typeLineEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      typeLineEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }
    setTimeout(typeLoop, deleting ? 30 : 55);
  }
  typeLoop();

  /* ============ FOOTER YEAR ============ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ RESUME BUTTON PLACEHOLDER ============ */
  // EDIT: once you upload your resume PDF (e.g. assets/resume.pdf),
  // update the href below and remove the "add link" note in index.html.
  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", (e) => {
      if (resumeBtn.getAttribute("href") === "#") {
        e.preventDefault();
        alert("Add your resume PDF to /assets and update the link in index.html (#resumeBtn).");
      }
    });
  }
})();
