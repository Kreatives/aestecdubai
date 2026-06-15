/* =================================================================
   AĒSTEC DUBAI — Subpage script
   Loaded after main.js. Adds: results/before-after filtering and the
   register-interest typeform flow. Guards every block so a single
   file can be shared across all pages.
   ================================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     BEFORE & AFTER — filter by treatment type
     ---------------------------------------------------------------- */
  var baFilter = document.querySelector('.ba-filter');
  var baGrid = document.querySelector('.ba-grid');
  if (baFilter && baGrid) {
    var buttons = Array.from(baFilter.querySelectorAll('.ba-filter__btn'));
    var cards = Array.from(baGrid.querySelectorAll('.ba-card'));

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        buttons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        cards.forEach(function (card) {
          var show = filter === 'all' || card.dataset.type === filter;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }


  /* ----------------------------------------------------------------
     REGISTER INTEREST — typeform flow
     One question per screen, keyboard + button navigation,
     progress bar, basic validation, completion screen.
     ---------------------------------------------------------------- */
  var typeform = document.querySelector('.typeform');
  if (typeform) {
    var steps = Array.from(typeform.querySelectorAll('.tf-step'));
    var done = typeform.querySelector('.tf-done');
    var barFill = typeform.querySelector('.typeform__bar-fill');
    var prevBtn = typeform.querySelector('[data-tf="prev"]');
    var nextBtn = typeform.querySelector('[data-tf="next"]');
    var current = 0;

    function isAnswered(step) {
      if (step.dataset.optional === 'true') return true;
      var input = step.querySelector('input, textarea');
      if (input) return input.value.trim().length > 0;
      var selected = step.querySelector('.tf-option.is-selected');
      if (step.querySelector('.tf-option')) return !!selected;
      return true;
    }

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === current && !typeform.classList.contains('is-done')); });
      var pct = ((current) / steps.length) * 100;
      if (typeform.classList.contains('is-done')) pct = 100;
      if (barFill) barFill.style.width = pct + '%';
      if (prevBtn) prevBtn.disabled = current === 0;

      var active = steps[current];
      if (active && !typeform.classList.contains('is-done')) {
        var focusable = active.querySelector('input, textarea');
        if (focusable) setTimeout(function () { focusable.focus(); }, 120);
      }
    }

    function goNext() {
      if (typeform.classList.contains('is-done')) return;
      var step = steps[current];
      if (!isAnswered(step)) {
        var field = step.querySelector('input, textarea');
        if (field) { field.focus(); field.style.borderColor = '#c0392b'; }
        return;
      }
      if (current < steps.length - 1) {
        current++;
        render();
      } else {
        finish();
      }
    }

    function goPrev() {
      if (current > 0) { current--; render(); }
    }

    function finish() {
      typeform.classList.add('is-done');
      steps.forEach(function (s) { s.classList.remove('is-active'); });
      if (done) done.classList.add('is-active');
      if (barFill) barFill.style.width = '100%';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
    }

    /* option selection */
    typeform.querySelectorAll('.tf-step').forEach(function (step) {
      var opts = Array.from(step.querySelectorAll('.tf-option'));
      opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
          opts.forEach(function (o) { o.classList.toggle('is-selected', o === opt); });
          setTimeout(goNext, 260);
        });
      });
    });

    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);

    /* explicit per-step continue buttons */
    typeform.querySelectorAll('[data-tf="continue"]').forEach(function (btn) {
      btn.addEventListener('click', goNext);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        var active = steps[current];
        if (active && active.querySelector('textarea') === document.activeElement && !e.metaKey) return;
        e.preventDefault();
        goNext();
      }
    });

    render();
  }

})();


/* ----------------------------------------------------------------
   BEFORE / AFTER SLIDER — drag the handle to wipe between halves
   ---------------------------------------------------------------- */
(function () {
  var sliders = document.querySelectorAll('[data-ba-slider]');
  sliders.forEach(function (el) {
    var dragging = false;
    function setPos(clientX) {
      var r = el.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      el.style.setProperty('--pos', pct + '%');
    }
    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      setPos(e.clientX);
    });
    el.addEventListener('pointermove', function (e) {
      if (dragging) setPos(e.clientX);
    });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
    el.style.setProperty('--pos', '50%');
  });
})();


/* ----------------------------------------------------------------
   VIDEO LIGHTBOX — open hero video large, close on x / backdrop / Esc
   ---------------------------------------------------------------- */
(function () {
  var modal = document.getElementById('videoModal');
  var openers = document.querySelectorAll('[data-video-open]');
  if (!modal || !openers.length) return;
  var player = modal.querySelector('video');
  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (player) { try { player.currentTime = 0; player.play(); } catch (e) {} }
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (player) player.pause();
  }
  openers.forEach(function (b) { b.addEventListener('click', open); });
  modal.querySelectorAll('[data-video-close]').forEach(function (b) { b.addEventListener('click', close); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();


/* ----------------------------------------------------------------
   CAREERS — filter open positions by department
   ---------------------------------------------------------------- */
(function () {
  var filter = document.querySelector('.positions__filter');
  var list = document.querySelector('.position-list');
  if (!filter || !list) return;
  var btns = Array.from(filter.querySelectorAll('.ba-filter__btn'));
  var items = Array.from(list.querySelectorAll('.position'));
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      items.forEach(function (it) {
        it.classList.toggle('is-hidden', !(f === 'all' || it.dataset.type === f));
      });
    });
  });
})();
