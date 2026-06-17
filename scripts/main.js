/* =================================================================
   AĒSTEC DUBAI — Main script
   FAQ, results carousel, smooth-scroll, nav theme switching,
   GSAP scroll animations (highlight text, slide-up, image reveal).
   ================================================================= */

(function () {
  'use strict';

  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ----------------------------------------------------------------
     FAQ — aria-expanded mirror for screen readers
     ---------------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var summary = item.querySelector('.faq-summary');
    if (!summary) return;
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', item.open ? 'true' : 'false');
    item.addEventListener('toggle', function () {
      summary.setAttribute('aria-expanded', item.open ? 'true' : 'false');
    });
  });


  /* ----------------------------------------------------------------
     RESULTS — mobile carousel cycling
     ---------------------------------------------------------------- */
  var resultsGrid = document.querySelector('.results-grid');
  var prevBtn = document.querySelector('.results-arrow-prev');
  var nextBtn = document.querySelector('.results-arrow-next');
  if (resultsGrid && prevBtn && nextBtn) {
    var cards = Array.from(resultsGrid.querySelectorAll('.result-card'));
    var index = 0;
    var mobileQuery = window.matchMedia('(max-width: 640px)');
    function showCard(i) {
      if (!mobileQuery.matches) {
        cards.forEach(function (c) { c.style.display = ''; });
        return;
      }
      cards.forEach(function (c, idx) { c.style.display = idx === i ? '' : 'none'; });
    }
    prevBtn.addEventListener('click', function () {
      index = (index - 1 + cards.length) % cards.length;
      showCard(index);
    });
    nextBtn.addEventListener('click', function () {
      index = (index + 1) % cards.length;
      showCard(index);
    });
    mobileQuery.addEventListener('change', function () { showCard(index); });
    showCard(index);
  }


  /* ----------------------------------------------------------------
     SMOOTH SCROLL for anchor links
     ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = link.getAttribute('href');
      if (target.length > 1) {
        var el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });


  /* ----------------------------------------------------------------
     BOOK-A-CONSULT FLOATING CTA
     Trigger toggles .is-open on the container; options stagger in
     via CSS transitions. Closes on outside click or Escape.
     ---------------------------------------------------------------- */
  var bookCta = document.getElementById('bookCta');
  if (bookCta) {
    var bookTrigger = bookCta.querySelector('.book-cta__trigger');
    var bookMenu = bookCta.querySelector('.book-cta__menu');

    function setOpen(open) {
      bookCta.classList.toggle('is-open', open);
      if (bookTrigger) bookTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (bookMenu) bookMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    if (bookTrigger) {
      bookTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!bookCta.classList.contains('is-open'));
      });
    }

    document.addEventListener('click', function (e) {
      if (!bookCta.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }


  /* ----------------------------------------------------------------
     NAV THEME SWITCHING
     Default = dark glass (over hero / footer).
     Adds .is-light when nav crosses any section with data-theme="light".
     ---------------------------------------------------------------- */
  var navPill = document.getElementById('nav');
  var lightSections = document.querySelectorAll('[data-theme="light"]');
  if (navPill && lightSections.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var navHeight = navPill.getBoundingClientRect().height + 32;
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      navPill.classList.toggle('is-light', visible.size > 0);
    }, {
      rootMargin: '-' + navHeight + 'px 0px -' + (window.innerHeight - navHeight - 1) + 'px 0px',
      threshold: 0
    });
    lightSections.forEach(function (s) { navObserver.observe(s); });
  }


  /* ----------------------------------------------------------------
     GSAP — HIGHLIGHT TEXT REVEAL
     Splits target text into words and fades each from muted to ink
     color as the section enters the viewport.
     ---------------------------------------------------------------- */
  function splitWords(el) {
    if (el.dataset.split === 'true') return Array.from(el.querySelectorAll('.word'));
    var raw = el.innerHTML;
    var parts = raw.split(/(\s+|<br\s*\/?>)/);
    el.innerHTML = parts.map(function (p) {
      if (/^\s+$/.test(p)) return ' ';
      if (/^<br/.test(p)) return p;
      return '<span class="word">' + p + '</span>';
    }).join('');
    el.dataset.split = 'true';
    return Array.from(el.querySelectorAll('.word'));
  }

  if (hasGSAP && !reduceMotion) {
    document.querySelectorAll('[data-anim="highlight"]').forEach(function (el) {
      var words = splitWords(el);
      gsap.fromTo(words,
        { color: 'rgba(18, 18, 18, 0.22)' },
        {
          color: 'rgba(18, 18, 18, 1)',
          stagger: 0.04,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            end: 'top 30%',
            scrub: 0.6
          }
        }
      );
    });
  }


  /* ----------------------------------------------------------------
     GSAP — SLIDE-UP TEXT REVEAL
     Targets headings and paragraphs with [data-anim="slide-up"].
     Also auto-applies to all section pre-headlines, section-headlines,
     paragraphs inside .standard-text, .heritage-paragraph, etc.
     ---------------------------------------------------------------- */
  if (hasGSAP && !reduceMotion) {
    var slideTargets = document.querySelectorAll(
      '[data-anim="slide-up"], ' +
      '.pre-headline:not(.pre-headline-light), ' +
      '.section-headline:not([data-anim="highlight"]), ' +
      '.heritage-headline, ' +
      '.heritage-paragraph, ' +
      '.standard-title, .standard-body, ' +
      '.block-title, .block-body, ' +
      '.faq-question, ' +
      '.contact-header > *, ' +
      '.about-statement:not([data-anim="highlight"]), ' +
      '.stat'
    );

    slideTargets.forEach(function (el) {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }


  /* ----------------------------------------------------------------
     GSAP — IMAGE REVEAL (clip-path wipe)
     ---------------------------------------------------------------- */
  if (hasGSAP && !reduceMotion) {
    var revealTargets = document.querySelectorAll(
      '.ultrasound-image, ' +
      '.heritage-image-large, ' +
      '.heritage-image-small, ' +
      '.contact-image, ' +
      '.treatment-card'
    );

    revealTargets.forEach(function (el) {
      gsap.fromTo(el,
        {
          clipPath: 'inset(0 100% 0 0)',
          webkitClipPath: 'inset(0 100% 0 0)'
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          webkitClipPath: 'inset(0 0% 0 0)',
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }


  /* ----------------------------------------------------------------
     HERO — content slide-up on load (no scroll trigger)
     Uses fromTo with explicit end state + clearProps so elements
     are guaranteed to settle at their natural rendering.
     ---------------------------------------------------------------- */
  if (hasGSAP && !reduceMotion) {
    gsap.fromTo('.hero-content > *',
      { y: 36, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1, ease: 'power3.out',
        stagger: 0.12, delay: 0.2,
        clearProps: 'transform,opacity'
      }
    );
    gsap.fromTo('.hero-review-glass',
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1, ease: 'power3.out',
        delay: 0.6,
        clearProps: 'transform,opacity'
      }
    );
    gsap.fromTo('.nav-pill',
      { y: -20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power3.out',
        delay: 0.1,
        clearProps: 'transform,opacity'
      }
    );
  }

})();


/* ----------------------------------------------------------------
   MOBILE MENU — hamburger drawer
   ---------------------------------------------------------------- */
(function () {
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('navMobile');
  if (!burger || !menu) return;
  function setOpen(open) {
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();


/* ----------------------------------------------------------------
   TREATMENTS — mobile carousel tabs (auto-built from card names)
   ---------------------------------------------------------------- */
(function () {
  var rows = document.querySelectorAll('.treatments-row, .tx-overview__row');
  rows.forEach(function (row) {
    var cards = Array.prototype.slice.call(row.children).filter(function (c) { return c.querySelector && c.querySelector('.treatment-name'); });
    if (cards.length < 2) return;
    var tabs = document.createElement('div');
    tabs.className = 'card-tabs';
    var tabEls = [];
    cards.forEach(function (card, i) {
      var name = card.querySelector('.treatment-name').textContent.trim();
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'card-tab' + (i === 0 ? ' is-active' : '');
      b.textContent = name;
      b.addEventListener('click', function () { card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }); });
      tabs.appendChild(b);
      tabEls.push(b);
    });
    row.parentNode.insertBefore(tabs, row);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var idx = cards.indexOf(e.target);
            tabEls.forEach(function (t, j) { t.classList.toggle('is-active', j === idx); });
          }
        });
      }, { root: row, threshold: 0.6 });
      cards.forEach(function (c) { io.observe(c); });
    }
  });
})();


/* ----------------------------------------------------------------
   MOBILE CAROUSELS — swipe + arrows/dots for testimonials & results
   ---------------------------------------------------------------- */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;

  function arrow(dir) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carousel-arrow';
    b.setAttribute('aria-label', dir < 0 ? 'Previous' : 'Next');
    b.innerHTML = dir < 0
      ? '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4L6 8l4 4"/></svg>'
      : '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>';
    return b;
  }

  function carousel(scrollEl, itemSel, navParent, useDots) {
    if (!scrollEl || !navParent) return;
    var items = Array.prototype.slice.call(scrollEl.querySelectorAll(itemSel))
      .filter(function (it) { return getComputedStyle(it).display !== 'none'; });
    if (items.length < 2) return;

    var nav = document.createElement('div');
    nav.className = 'carousel-nav';
    var prev = arrow(-1), next = arrow(1), dots = null;
    nav.appendChild(prev);
    if (useDots) {
      dots = document.createElement('div');
      dots.className = 'carousel-dots';
      items.forEach(function (_, i) {
        var d = document.createElement('span');
        d.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dots.appendChild(d);
      });
      nav.appendChild(dots);
    }
    nav.appendChild(next);
    navParent.appendChild(nav);

    function current() {
      var c = scrollEl.getBoundingClientRect(), cx = c.left + c.width / 2, best = 0, bd = 1e9;
      items.forEach(function (it, i) {
        var r = it.getBoundingClientRect(), d = Math.abs((r.left + r.width / 2) - cx);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function go(i) {
      i = Math.max(0, Math.min(items.length - 1, i));
      items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    prev.addEventListener('click', function () { go(current() - 1); });
    next.addEventListener('click', function () { go(current() + 1); });
    function sync() {
      var i = current();
      if (dots) Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('is-active', j === i); });
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
    }
    scrollEl.addEventListener('scroll', function () { window.requestAnimationFrame(sync); });
    sync();
  }

  carousel(document.querySelector('.testimonials-marquee'), '.testimonial-card', document.querySelector('.testimonials'), false);
  carousel(document.querySelector('.results-grid'), '.result-card', document.querySelector('.results-carousel'), true);
})();
