const body = document.body;
const cursor = document.querySelector(".cursor");
const cursorTrail = document.querySelector(".cursor-trail");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const scrollProgress = document.querySelector(".scroll-progress");
const mobileNavItems = document.querySelectorAll(".mobile-bottom-nav a");
const canvas = document.querySelector("#particle-canvas");
const ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let particles = [];
let sparks = [];
let mouse = { x: -999, y: -999 };
let trail = { x: -999, y: -999 };
let animationTick = 0;

const resizeCanvas = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(130, Math.max(46, Math.floor(width / 14)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.52,
    vy: (Math.random() - 0.5) * 0.52,
    radius: Math.random() * 1.9 + 0.7,
    hue: Math.random() > 0.45 ? 196 : 268,
    pulse: Math.random() * Math.PI * 2,
  }));
};

const drawParticles = () => {
  animationTick += 0.012;
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    const mouseDistance = Math.hypot(mouse.x - particle.x, mouse.y - particle.y);
    if (mouseDistance < 150) {
      particle.x -= (mouse.x - particle.x) * 0.003;
      particle.y -= (mouse.y - particle.y) * 0.003;
    }

    const glowSize = particle.radius * (6 + Math.sin(animationTick + particle.pulse) * 1.6);
    const gradient = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      glowSize
    );
    gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 66%, 0.92)`);
    gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 66%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 135) {
        ctx.strokeStyle = `rgba(115, 132, 255, ${0.18 - distance / 880})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  sparks = sparks.filter((spark) => spark.life > 0);
  sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life -= 0.018;
    ctx.fillStyle = `rgba(236, 92, 255, ${spark.life})`;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!reducedMotion) requestAnimationFrame(drawParticles);
};

const updateScrollEffects = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;

  document.querySelectorAll(".floating-badge").forEach((element, index) => {
    const offset = Math.sin(progress * Math.PI * 4 + index) * 10;
    element.style.setProperty("--parallax-y", `${offset}px`);
  });

  const sections = [
    { id: "top", element: document.querySelector(".hero") },
    { id: "services", element: document.querySelector("#services") },
    { id: "work", element: document.querySelector("#work") },
    { id: "contact", element: document.querySelector("#contact") },
  ];
  const activeSection = sections.reduce((active, section) => {
    if (!section.element) return active;
    const top = section.element.getBoundingClientRect().top;
    return top <= window.innerHeight * 0.42 ? section.id : active;
  }, "top");

  mobileNavItems.forEach((item) => {
    item.classList.toggle("is-active", item.getAttribute("href") === `#${activeSection}`);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  revealObserver.observe(element);
});

menuToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("mousemove", (event) => {
  mouse = { x: event.clientX, y: event.clientY };
  body.style.setProperty("--spot-x", `${event.clientX}px`);
  body.style.setProperty("--spot-y", `${event.clientY}px`);
  if (cursor) {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  }

  if (Math.random() > 0.78 && sparks.length < 26 && !reducedMotion) {
    sparks.push({
      x: event.clientX,
      y: event.clientY,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      radius: Math.random() * 2 + 0.8,
      life: 0.8,
    });
  }
});

document.querySelectorAll("a, button, input, textarea").forEach((element) => {
  element.addEventListener("mouseenter", () => cursor?.classList.add("is-active"));
  element.addEventListener("mouseleave", () => cursor?.classList.remove("is-active"));
});

document.querySelectorAll(".service-card, .project-card, .subbrand-card, .profile-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    card.style.setProperty("--card-x", `${x}px`);
    card.style.setProperty("--card-y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.01)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.removeProperty("--card-x");
    card.style.removeProperty("--card-y");
    card.style.transform = "";
  });
});

document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("mousemove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
    button.style.setProperty("--magnet-x", `${x}px`);
    button.style.setProperty("--magnet-y", `${y}px`);
  });

  button.addEventListener("mouseleave", () => {
    button.style.setProperty("--magnet-x", "0px");
    button.style.setProperty("--magnet-y", "0px");
  });
});

document.querySelectorAll(".glass-panel, .brand-console, .contact-form").forEach((panel) => {
  panel.addEventListener("mousemove", (event) => {
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    panel.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll(".image-3d-frame, .brand-image-3d, .subbrand-image-3d").forEach((frame) => {
  frame.addEventListener("mousemove", (event) => {
    const rect = frame.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;

    frame.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  frame.addEventListener("mouseleave", () => {
    frame.style.transform = "";
  });
});

const moveCursorTrail = () => {
  trail.x += (mouse.x - trail.x) * 0.12;
  trail.y += (mouse.y - trail.y) * 0.12;
  if (cursorTrail) {
    cursorTrail.style.transform = `translate(${trail.x}px, ${trail.y}px) translate(-50%, -50%)`;
  }
  if (!reducedMotion) requestAnimationFrame(moveCursorTrail);
};

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateScrollEffects, { passive: true });
resizeCanvas();
updateScrollEffects();

if (!reducedMotion) {
  drawParticles();
  moveCursorTrail();
} else {
  ctx.clearRect(0, 0, width, height);
}
