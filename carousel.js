'use strict';

(() => {
  const carousel = document.querySelector('#research-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('[data-research-slide]')];
  const stage = carousel.querySelector('#carousel-open');
  const status = carousel.querySelector('#carousel-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const categoryNames = { generative: 'Generative audio', representations: 'Representations', inference: 'Efficient inference' };
  let current = 0;
  let timer = null;

  function schedule() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    if (document.visibilityState !== 'hidden') {
      timer = window.setInterval(() => show(current + 1), 8000);
    }
  }

  function show(index, manual = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.inert = i !== current;
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    const slide = slides[current];
    stage.setAttribute('href', `#${slide.dataset.paperId}`);
    stage.setAttribute('aria-label', `View ${slide.dataset.paperName} in Selected research, ${categoryNames[slide.dataset.category]}`);
    carousel.querySelector('#carousel-counter').textContent = `${String(current + 1).padStart(2, '0')} / 05`;
    carousel.querySelector('#carousel-paper-label').textContent = slide.dataset.paperLabel;
    if (manual) {
      status.textContent = slide.getAttribute('aria-label');
      // Give each manually selected paper a full interval before advancing.
      schedule();
    }
  }

  carousel.querySelector('#carousel-prev').addEventListener('click', () => show(current - 1, true));
  carousel.querySelector('#carousel-next').addEventListener('click', () => show(current + 1, true));

  function selectCategory(slide, focus = false) {
    const paper = document.getElementById(slide.dataset.paperId);
    const filter = document.querySelector(`[data-filter="${slide.dataset.category}"]`);
    if (!paper || !filter) return;
    filter.click();
    if (focus) paper.focus({ preventScroll: true });
    return paper;
  }
  stage.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    selectCategory(slides[current], true);
    // The native internal link scrolls to the revealed paper and keeps history.
  });
  function syncHash() {
    const slide = slides.find(item => item.dataset.paperId === window.location.hash.slice(1));
    if (slide) {
      const paper = selectCategory(slide);
      if (paper) paper.scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' });
    }
  }
  window.addEventListener('hashchange', syncHash);
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  show(0);
  syncHash();
  schedule();
})();
