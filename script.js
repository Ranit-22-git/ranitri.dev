// ============================================
// RANIT RI — PORTFOLIO SCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initBackgroundParticles();
  initEITRing();
  initMagnetic();
  initReveal();
  initCGPAChart();
  initScrollCue();
});

// --------------------------------------------
// Loader
// --------------------------------------------
function initLoader() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 500);
  });
  // fallback in case load event already fired
  setTimeout(() => loader.classList.add('done'), 2200);
}

// --------------------------------------------
// Custom cursor
// --------------------------------------------
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverables = document.querySelectorAll('a, button, .magnetic');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

// --------------------------------------------
// Nav: scroll state + mobile toggle
// --------------------------------------------
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    navbar.classList.toggle('menu-open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => navbar.classList.remove('menu-open'));
  });
}

// --------------------------------------------
// Ambient particle background (canvas)
// --------------------------------------------
function initBackgroundParticles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 18000));
  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    hue: Math.random() > 0.5 ? '62, 214, 199' : '124, 108, 240',
    a: Math.random() * 0.5 + 0.2
  }));

  function step() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
      ctx.fill();
    });

    // connective lines for nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(62, 214, 199, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    if (!reduced) requestAnimationFrame(step);
  }
  step();
}

// --------------------------------------------
// Hero EIT ring: generate 16 electrodes + pulses
// --------------------------------------------
function initEITRing() {
  const electrodeGroup = document.querySelector('.eit-electrodes');
  const pulseGroup = document.querySelector('.eit-pulses');
  if (!electrodeGroup) return;

  const cx = 200, cy = 200, r = 176;
  const count = 16;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 3.2);
    circle.style.opacity = 0.35 + Math.random() * 0.4;
    electrodeGroup.appendChild(circle);
  }

  // Sequential pulse animation: pick pairs of "active" electrodes
  let active = 0;
  function pulse() {
    const angle = (active / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', x);
    ring.setAttribute('cy', y);
    ring.setAttribute('r', 3.2);
    ring.setAttribute('stroke-width', '1.5');
    pulseGroup.appendChild(ring);

    ring.animate(
      [
        { r: 3.2, opacity: 0.9, strokeWidth: 2 },
        { r: 22, opacity: 0, strokeWidth: 0.5 }
      ],
      { duration: 1400, easing: 'ease-out' }
    ).onfinish = () => ring.remove();

    active = (active + 3) % count;
    setTimeout(pulse, 550);
  }
  pulse();
}

// --------------------------------------------
// Magnetic buttons
// --------------------------------------------
function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;
  const items = document.querySelectorAll('.magnetic');

  items.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.28}px, ${y * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// --------------------------------------------
// Scroll reveal
// --------------------------------------------
function initReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-line');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(t => observer.observe(t));
}

// --------------------------------------------
// CGPA bar chart (from CV data)
// --------------------------------------------
function initCGPAChart() {
  const container = document.getElementById('cgpaBars');
  if (!container) return;

  const data = [
    { label: 'S1', value: 8.20 },
    { label: 'S2', value: 8.74 },
    { label: 'S3', value: 8.60 },
    { label: 'S4', value: 8.10 },
    { label: 'S5', value: 9.37 },
    { label: 'S6', value: 9.67 }
  ];

  const max = 10;

  // Prevent duplicate bars if function runs more than once
  container.innerHTML = '';

  data.forEach((d) => {
    const wrap = document.createElement('div');
    wrap.className = 'cgpa-bar-wrap';

    const percentage = (d.value / max) * 100;

    wrap.innerHTML = `
      <span class="cgpa-value">${d.value.toFixed(2)}</span>

      <div
        class="cgpa-bar"
        data-height="${percentage}"
        data-value="${d.value.toFixed(2)}"
        data-semester="${d.label}"
        role="img"
        aria-label="${d.label}: CGPA ${d.value.toFixed(2)} out of 10"
      ></div>

      <span class="cgpa-label">${d.label}</span>
    `;

    container.appendChild(wrap);
  });

  const bars = container.querySelectorAll('.cgpa-bar');

  // Start with all bars collapsed
  bars.forEach((bar) => {
    bar.style.height = '0%';
  });

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        bars.forEach((bar, index) => {
          setTimeout(() => {
            bar.style.height = `${bar.dataset.height}%`;
          }, index * 100);
        });

        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.3
    }
  );

  observer.observe(container);
}
// --------------------------------------------
// Scroll cue: hide after scrolling
// --------------------------------------------
function initScrollCue() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;
  window.addEventListener('scroll', () => {
    cue.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
}
