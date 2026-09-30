/* =========================================================
   TRAVEL HOUSE — Interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---- Navbar scroll state ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.toggle('open'));
    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => drawer.classList.remove('open'))
    );
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (target % 1 === 0)
        ? Math.round(val).toLocaleString()
        : val.toFixed(1);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (target % 1 === 0) ? target.toLocaleString() : target.toFixed(1);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // optional data-count-delay on an ancestor holds the count until an intro animation reveals it
          const holder = e.target.closest('[data-count-delay]');
          const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
          const delay = holder && !reduced ? +holder.getAttribute('data-count-delay') : 0;
          setTimeout(() => runCounter(e.target), delay);
          co.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---- Duplicate marquee track for seamless loop ---- */
  document.querySelectorAll('.marquee__track').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const ans = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });

  /* ---- Tabs filter ---- */
  document.querySelectorAll('[data-filter]').forEach((group) => {
    const tabs = group.querySelectorAll('.tab');
    const items = document.querySelectorAll(group.getAttribute('data-filter'));
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.getAttribute('data-cat');
        items.forEach((it) => {
          const match = cat === 'all' || it.getAttribute('data-cat') === cat;
          it.style.display = match ? '' : 'none';
        });
      });
    });
  });

  /* ---- Star rating ---- */
  document.querySelectorAll('.rating').forEach((r) => {
    const stars = r.querySelectorAll('span');
    let set = 0;
    stars.forEach((s, i) => {
      s.addEventListener('mouseenter', () => paint(i + 1));
      s.addEventListener('click', () => { set = i + 1; paint(set); });
      s.addEventListener('mouseleave', () => paint(set));
    });
    function paint(n) {
      stars.forEach((s, i) => s.style.opacity = i < n ? '1' : '.3');
    }
    paint(0);
  });

  /* ---- Form submit (demo, no backend) ---- */
  document.querySelectorAll('form[data-demo]').forEach((f) => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Sent ✓ We will contact you soon!'; btn.disabled = true; }
    });
  });

  /* ---- Lightbox gallery ---- */
  const lb = document.querySelector('.lightbox');
  if (lb) {
    document.querySelectorAll('.gallery img, [data-zoom]').forEach((img) => {
      img.addEventListener('click', () => {
        lb.querySelector('img').src = img.src;
        lb.classList.add('open');
      });
    });
    lb.addEventListener('click', () => lb.classList.remove('open'));
  }

  /* ---- Active nav link based on path ---- */
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/en';
  document.querySelectorAll('.nav__link').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href !== '/' && path.endsWith(href.replace(/^\//, '').replace(/\.html$/, ''))) {
      a.classList.add('active');
    }
  });
})();
