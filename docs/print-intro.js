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

  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reducedMotion.matches && !entry.target.contains(document.activeElement)) {
        impression(entry.target, Math.min(order++,5)*55);
      }
    }
  });
  const targets = document.querySelectorAll('main h1, main h2, main h3, main p, main dt, main dd, .timeline-date, .current-role > span, .service-list li');
  for (const element of targets) observer.observe(element);

  // Focus, print and viewport changes must immediately reveal the original type.
  function finishPasses() {
    for (const motion of active.values()) motion.cancel();
    active.clear();
  }
  document.addEventListener('focusin', event => {
    for (const [element,motion] of active) if (element.contains(event.target)) motion.cancel();
  });
  window.addEventListener('beforeprint', finishPasses);
  window.addEventListener('resize', finishPasses, {passive:true});
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      observer.disconnect();
      finishPasses();
    }
  });
})();
