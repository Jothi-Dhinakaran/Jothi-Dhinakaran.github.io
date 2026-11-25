(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ── theme (remembered, defaults to the visitor's system preference) ── */
  let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) { /* blocked */ }
  root.dataset.theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('theme').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* blocked */ } };

  /* ── hero line reveal on load ── */
  requestAnimationFrame(() => setTimeout(() => $$('.hero').forEach((h) => h.classList.add('ready')), 120));

  /* ── reveal on scroll (masked lines + fades) ── */
  $$('.numbers > div, .skills > div, .row, .coursework, .proj').forEach((el) => el.classList.add('fade'));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    if (e.target.classList.contains('numbers')) $$('[data-count]', e.target).forEach(count);
  }), { threshold: 0.15 });
  $$('section:not(.hero) h2, .fade, .numbers').forEach((el) => io.observe(el));

  function count(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    (function step(t) { const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = (to * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); })(t0);
  }

  /* ── statement: words light up as you scroll ── */
  const st = $('statement'); st.innerHTML = st.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', st);

  /* ── scroll handlers ── */
  function onScroll() {
    const d = root, p = d.scrollTop / (d.scrollHeight - d.clientHeight || 1);
    $('progress').style.width = p * 100 + '%'; $('nav').classList.toggle('scrolled', d.scrollTop > 10);
    const r = st.getBoundingClientRect(), k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const n = Math.round(k * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── projects accordion (one open at a time) ── */
  const projs = $$('.proj');
  projs.forEach((p) => p.querySelector('.p-head').addEventListener('click', () => {
    const open = !p.classList.contains('open'); projs.forEach((x) => { x.classList.remove('open'); x.querySelector('.p-head').setAttribute('aria-expanded', 'false'); });
    if (open) { p.classList.add('open'); p.querySelector('.p-head').setAttribute('aria-expanded', 'true'); }
  }));

  /* ── cursor ── */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    const c = $('cursor'); let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; c.style.opacity = 1; });
    (function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', (e) => c.classList.toggle('big', !!e.target.closest('a, button, .p-head')));
  }

  /* ── clock (Coimbatore, IST) ── */
  function clock() { try { $('clock').textContent = 'Coimbatore · ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()) + ' IST'; } catch (e) { /* ignore */ } }
  clock(); setInterval(clock, 30000);

  /* ── mobile menu ── */
  $('burger').onclick = () => { $('burger').classList.toggle('open'); $('links').classList.toggle('open'); };
  $$('#links a').forEach((a) => a.addEventListener('click', () => { $('burger').classList.remove('open'); $('links').classList.remove('open'); }));

  /* ── copy email ── */
  let tt; function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }
  $('copy').onclick = () => { const e = 'jothidhina57@gmail.com'; (navigator.clipboard ? navigator.clipboard.writeText(e) : Promise.reject()).then(() => toast('Email copied ✓'), () => toast(e)); };
  $('year').textContent = new Date().getFullYear();
})();
