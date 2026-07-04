(() => {
  "use strict";

  /* ============ ENABLE JS-DEPENDENT ANIMATIONS ============ */
  // Only hide/reveal content once we know JS is actually running.
  // Without this, a script error would leave real content permanently invisible.
  document.documentElement.classList.add("js-ready");

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
