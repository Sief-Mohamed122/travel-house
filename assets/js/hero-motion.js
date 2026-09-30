/* =========================================================
   TRAVEL HOUSE — Homepage hero motion (English homepage only)
   Rotating destination word + crossfading backdrop + active
   collage card, animated flight path, pointer parallax.
   ========================================================= */
(function () {
  'use strict';

  const hero = document.querySelector('.hero--motion');
  if (!hero) return;
  // CSS already disables the intro animations for reduced motion; skip all JS-driven motion too.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const INTRO = 2600;    // ms until the intro choreography settles
  const INTERVAL = 4500; // ms per destination
  const FADE = 1600;     // must match .hero__slide opacity transition

  const slides = hero.querySelectorAll('.hero__slide');
  const words = hero.querySelectorAll('.hero__word > span');
  const cards = hero.querySelectorAll('.float-card[data-dest]');
  const collage = hero.querySelector('.hero__collage');
  const flight = hero.querySelector('.hero__flight');

  /* ---- Load the extra backdrops only after the page (and the LCP image) has loaded ---- */
  const loadSlides = () => {
    hero.querySelectorAll('.hero__slide img[data-src]').forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  };
  if (document.readyState === 'complete') loadSlides();
  else window.addEventListener('load', loadSlides, { once: true });

  /* ---- Destination rotation ---- */
  let current = 0;
  let bg = 0;

  const setWord = (i) => {
    words.forEach((w, j) => {
      w.classList.toggle('is-leaving', j === current);
      w.classList.toggle('is-active', j === i);
    });
  };

  const setCards = (i) => {
    cards.forEach((c) => c.classList.toggle('is-active', +c.dataset.dest === i));
    if (collage) collage.classList.toggle('has-active', i > 0);
  };

  const setBg = (i) => {
    const img = slides[i] && slides[i].querySelector('img');
    // not loaded yet (or failed): keep the current backdrop rather than fading to nothing
    if (!img || !img.complete || !img.naturalWidth || i === bg) return;
    const prev = slides[bg];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    slides[i].classList.add('is-active');
    setTimeout(() => prev.classList.remove('is-leaving'), FADE);
    bg = i;
  };

  const tick = () => {
    const next = (current + 1) % words.length;
    setWord(next);
    setCards(next);
    setBg(next);
    current = next;
  };

  /* ---- Only run while the hero is on screen and the tab is visible ---- */
  let timer = null;
  let introDone = false;
  let onScreen = true;

  const sync = () => {
    const run = introDone && onScreen && !document.hidden;
    if (run && !timer && words.length > 1) timer = setInterval(tick, INTERVAL);
    if (!run && timer) { clearInterval(timer); timer = null; }
    if (flight && flight.classList.contains('is-flying')) {
      run ? flight.unpauseAnimations() : flight.pauseAnimations();
    }
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);

  /* ---- Plane takes off once the flight path has drawn in ---- */
  setTimeout(() => {
    if (flight) {
      const motion = flight.querySelector('animateMotion');
      if (motion && motion.beginElement) {
        flight.classList.add('is-flying');
        motion.beginElement();
      }
    }
    introDone = true;
    sync();
  }, INTRO);

  /* ---- Pointer parallax (uses the `translate` property so it composes with the float animations) ---- */
  if (matchMedia('(pointer: fine)').matches) {
    const layers = hero.querySelectorAll('[data-depth]');
    let x = 0, y = 0, raf = 0;
    const apply = () => {
      raf = 0;
      layers.forEach((l) => {
        const d = +l.dataset.depth;
        l.style.translate = (x * d).toFixed(1) + 'px ' + (y * d).toFixed(1) + 'px';
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
      queue();
    });
    hero.addEventListener('pointerleave', () => { x = 0; y = 0; queue(); });
  }
})();
