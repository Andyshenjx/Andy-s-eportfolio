const TRANSITION_MS = 420;
const root = document.documentElement;

const updatePointerGlow = (x, y) => {
  root.style.setProperty("--pointer-x", `${x}px`);
  root.style.setProperty("--pointer-y", `${y}px`);
};

window.addEventListener("mousemove", (event) => {
  updatePointerGlow(event.clientX, event.clientY);
  root.style.setProperty("--pointer-glow-opacity", "1");
});

window.addEventListener("mouseleave", () => {
  root.style.setProperty("--pointer-glow-opacity", "0");
});

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-exit");
  document.body.classList.add("page-enter");
});

const autoRevealSelectors = document.body.classList.contains("home-page")
  ? []
  : [
      "main > .page-hero > h1",
      "main > .page-hero > .hero-text",
      ".page-hero .project-hero-copy",
      ".page-hero .project-hero-media",
      ".project-layout > .project-section",
      ".project-layout .project-cluster .project-section",
      ".project-layout .project-cluster .cluster-visual",
      "main > .flow-grid > .flow-item",
      ".contact-card"
    ];

const autoRevealItems = [
  ...new Set(
    autoRevealSelectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].filter((item) => !item.hasAttribute("data-reveal"))
    )
  )
];

autoRevealItems.forEach((item, index) => {
  item.classList.add("auto-reveal");
  item.style.setProperty("--reveal-delay", `${Math.min(index * 0.05, 0.28)}s`);

  if (item.matches(".flow-grid > .flow-item")) {
    const flowGrid = item.closest(".flow-grid");
    const flowItems = flowGrid ? [...flowGrid.querySelectorAll(":scope > .flow-item")] : [];
    const flowIndex = Math.max(flowItems.indexOf(item), 0);
    const flowDelayMs = 70 + flowIndex * 48;

    item.style.setProperty("--reveal-delay", `${Math.min(flowIndex * 0.045, 0.36)}s`);
    item.dataset.revealDelayMs = String(flowDelayMs);
  }
});

const revealItems = [...document.querySelectorAll("[data-reveal], .auto-reveal")];

if (revealItems.length) {
  const revealTimers = new WeakMap();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const activeTimer = revealTimers.get(entry.target);

        if (activeTimer) {
          window.clearTimeout(activeTimer);
          revealTimers.delete(entry.target);
        }

        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.revealDelayMs || 0);

          const timer = window.setTimeout(() => {
            entry.target.classList.add("is-visible");
            revealTimers.delete(entry.target);
          }, delay);

          revealTimers.set(entry.target, timer);
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      revealItems.forEach((item) => revealObserver.observe(item));
    });
  });
}

const scrollTargets = [...document.querySelectorAll("[data-scroll-speed], [data-scroll-scale], [data-scroll-x], [data-fade-scroll]")];
const updateGenericScrollMotion = () => {
  const viewportHeight = window.innerHeight || 1;

  scrollTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
    const progress = centerOffset / viewportHeight;
    let translateY = Number(element.dataset.scrollSpeed || 0) * progress * -180;
    let translateX = Number(element.dataset.scrollX || 0) * progress * 420;
    const scaleOffset = Number(element.dataset.scrollScale || 0) * (1 - Math.min(Math.abs(progress), 1));
    const scale = 1 + scaleOffset;
    const fadeFactor = Number(element.dataset.fadeScroll || 0);
    let opacity = fadeFactor ? Math.max(0, 1 - Math.abs(progress) * fadeFactor * 1.35) : 1;

    element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    element.style.opacity = opacity;
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const mapRange = (value, start, end) => {
  if (start === end) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
};

const setupHomeStage = () => {
  const homeStage = document.querySelector("[data-home-stage]");

  if (!homeStage) {
    return null;
  }

  const updateHomeStage = () => {
    const viewportHeight = window.innerHeight || 1;
    const rect = homeStage.getBoundingClientRect();
    const stageDistance = Math.max(rect.height - viewportHeight, 1);
    const progress = clamp(-rect.top / stageDistance, 0, 1);

    homeStage.style.setProperty("--stage-progress", progress.toFixed(4));
    homeStage.style.setProperty("--hero-exit-progress", mapRange(progress, 0.08, 0.42).toFixed(4));
    homeStage.style.setProperty("--story-progress", mapRange(progress, 0.3, 0.78).toFixed(4));
    homeStage.style.setProperty("--bg-progress", mapRange(progress, 0.34, 0.62).toFixed(4));
  };

  updateHomeStage();
  return updateHomeStage;
};

const homeStageUpdater = setupHomeStage();

const setupReflectionHero = () => {
  const reflectionHero = document.querySelector("[data-reflection-stage]");

  if (!reflectionHero) {
    return null;
  }

  const updateReflectionHero = () => {
    const viewportHeight = window.innerHeight || 1;
    const rect = reflectionHero.getBoundingClientRect();
    const stageDistance = Math.max(rect.height - viewportHeight, 1);
    const progress = clamp(-rect.top / stageDistance, 0, 1);

    reflectionHero.style.setProperty("--reflection-stage-progress", progress.toFixed(4));
    reflectionHero.style.setProperty("--reflection-hero-exit-progress", mapRange(progress, 0.08, 0.58).toFixed(4));
    reflectionHero.style.setProperty("--reflection-bg-progress", mapRange(progress, 0.2, 0.82).toFixed(4));
  };

  updateReflectionHero();
  return updateReflectionHero;
};

const reflectionHeroUpdater = setupReflectionHero();

const updateScrollMotion = () => {
  updateGenericScrollMotion();

  if (homeStageUpdater) {
    homeStageUpdater();
  }

  if (reflectionHeroUpdater) {
    reflectionHeroUpdater();
  }
};

updateScrollMotion();
window.addEventListener("scroll", updateScrollMotion, { passive: true });
window.addEventListener("resize", updateScrollMotion);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");

  if (!link) {
    return;
  }

  const href = link.getAttribute("href");

  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    link.target === "_blank" ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const url = new URL(link.href, window.location.href);

  if (url.origin !== window.location.origin) {
    return;
  }

  if (url.pathname === window.location.pathname && url.hash === window.location.hash) {
    return;
  }

  event.preventDefault();
  document.body.classList.remove("page-enter");
  document.body.classList.add("page-exit");

  window.setTimeout(() => {
    window.location.href = link.href;
  }, TRANSITION_MS);
});
