(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !window.IntersectionObserver || !Element.prototype.animate) return;

  const active = new Map();
  // Read the browser's actual wrap positions. Inline links, italics and bold
  // fragments can share a baseline, so collect them into the same print pass.
  function printLines(element) {
    const bounds = element.getBoundingClientRect();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const bands = [];
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (!text.textContent.trim() || text.parentElement.closest('sup,sub,[aria-hidden="true"]')) continue;
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        const center = (rect.top + rect.bottom) / 2 - bounds.top;
        let band = bands.find(line => Math.abs(line.center - center) < rect.height * 0.45);
        if (!band) {
          band = {center, left:bounds.width, right:0};
          bands.push(band);
        }
        band.left = Math.min(band.left, rect.left - bounds.left);
        band.right = Math.max(band.right, rect.right - bounds.left);
      }
    }
    return bands.sort((a,b) => a.center - b.center);
  }

  function impression(element, delay) {
    const lines = printLines(element);
    if (!lines.length) return;
    const frames = [];
    const height = element.getBoundingClientRect().height;
    const margin = 32; // Allow for the raised affiliation mark and italic overhang.
    function mask(top, bottom, x) {
      return `polygon(-32px -32px, calc(100% + 32px) -32px, calc(100% + 32px) ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, -32px ${bottom}px)`;
    }
    lines.forEach((line,i) => {
      const top = i ? (line.center + lines[i-1].center) / 2 : -margin;
      const bottom = i+1 < lines.length ? (line.center + lines[i+1].center) / 2 : height + margin;
      const steps = Math.max(3, Math.min(32, Math.round((line.right-line.left)/9)));
      frames.push({offset:i/lines.length, clipPath:mask(top,bottom,line.left-margin), easing:`steps(${steps}, end)`});
      frames.push({offset:(i+1)/lines.length, clipPath:mask(top,bottom,line.right+margin)});
    });
    const duration = Math.min(760, 220 + lines.length * 95);
    const motion = element.animate(frames, {duration,delay,fill:'backwards'});
    active.set(element,motion);
    motion.onfinish = motion.oncancel = () => active.delete(element);
  }

  const selector = 'main h1, main h2, main h3, main p, main dt, main dd, .timeline-date, .current-role > span, .service-list li';
  // On Brainwave this script runs in the head, before the body can paint.
  // Opacity preserves wrapping, layout measurements and the accessibility tree.
  const pendingStyle = document.createElement('style');
  pendingStyle.textContent = `@media screen and (prefers-reduced-motion: no-preference) {
    :is(${selector}):not([data-print-started]):not(:focus-within) { opacity: 0; }
  }`;
  document.head.append(pendingStyle);

  let observer;
  function finishPasses() {
    for (const motion of active.values()) motion.cancel();
    active.clear();
  }
  function revealAll() {
    pendingStyle.remove();
    observer?.disconnect();
    finishPasses();
  }

  // On a stalled load, show the text once and skip any late animation.
  const fallback = window.setTimeout(revealAll, 2200);
  function start() {
    if (!pendingStyle.isConnected) return;
    try {
      observer = new IntersectionObserver(entries => {
        if (!pendingStyle.isConnected) return;
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          try {
            if (!reducedMotion.matches && !entry.target.contains(document.activeElement)) {
              impression(entry.target, Math.min(order++,5)*55);
            }
          } catch {
            revealAll();
            return;
          } finally {
            entry.target.setAttribute('data-print-started', '');
          }
        }
        window.clearTimeout(fallback);
      });
      for (const element of document.querySelectorAll(selector)) observer.observe(element);
    } catch {
      revealAll();
    }
  }

  document.addEventListener('focusin', event => {
    const element = event.target.closest(selector);
    if (element) {
      element.setAttribute('data-print-started', '');
      observer?.unobserve(element);
      active.get(element)?.cancel();
    }
  });
  window.addEventListener('beforeprint', revealAll);
  window.addEventListener('resize', finishPasses, {passive:true});
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) revealAll();
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();
