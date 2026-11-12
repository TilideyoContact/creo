/* =========================================================
   Motion Groupe CréO, version immersive
   npm i gsap lenis split-type three
   - Préchargeur en rideau, hero vidéo en WebGL (ondulation souris)
   - Smooth scroll Lenis, titres SplitType, scroll horizontal épinglé avec skew
   - Globe 3D épinglé : le scroll fait voyager de territoire en territoire
   - Curseur personnalisé, boutons magnétiques
   Tout est désactivé si prefers-reduced-motion: reduce.
   ========================================================= */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';
import { territoires } from '../data/territoires';

gsap.registerPlugin(ScrollTrigger);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const desktop = window.matchMedia('(min-width: 961px)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;

/* ---------- Header ---------- */
const hd = $('[data-hd]');
let lastY = 0;
const onScroll = (y) => {
  hd.classList.toggle('is-solid', y > 60);
  hd.classList.toggle('is-hidden', y > 400 && y > lastY && !hd.classList.contains('is-open'));
  lastY = y;
};
const burger = $('[data-burger]');
burger.addEventListener('click', () => {
  const open = hd.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
$$('.hd__nav a').forEach((a) => a.addEventListener('click', () => { hd.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }));

/* ---------- Sélection d'un territoire (onglets, carte, globe) ---------- */
let globe = null, currentId = 'martinique';
const ids = territoires.map((t) => t.id);
const select = (id, { fromScroll = false } = {}) => {
  if (id === currentId && fromScroll) return;
  currentId = id;
  $$('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
  $$('[data-pin]').forEach((p) => p.classList.toggle('is-on', p.dataset.pin === id));
  $$('[data-arc]').forEach((a) => a.classList.toggle('is-on', a.dataset.arc === id));
  $$('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== id));
  $$('[data-steps] i').forEach((s, i) => s.classList.toggle('on', ids[i] === id));
  globe?.focus(id);
  if (!reduce) gsap.fromTo('[data-card]', { y: 16, opacity: .3 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out', overwrite: true });
};
$$('[data-tab]').forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
$$('[data-pin]').forEach((p) => p.addEventListener('click', () => select(p.dataset.pin)));

if (reduce) {
  root.classList.add('no-pre');
  window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
} else {
  run();
}

function run() {
  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ({ scroll }) => { ScrollTrigger.update(); onScroll(scroll); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -40, duration: 1.6 }); }
  }));
  lenis.stop();

  /* ---------- Hero WebGL (chargé à part, repli sur la vidéo simple) ---------- */
  const video = $('[data-hero-video]');
  let heroU = null;
  import('./hero-gl.js').then(({ initHeroGL }) => {
    heroU = initHeroGL({ video, container: $('[data-hero-media]'), gsap });
    if (heroU) $('[data-hero]').classList.add('is-gl');
  }).catch(() => {});

  /* ---------- Préchargeur : compteur puis rideau ---------- */
  const count = $('[data-pre-count]');
  const ready = Promise.all([
    document.fonts.ready,
    new Promise((r) => (video.readyState >= 3 ? r() : (video.addEventListener('canplay', r, { once: true }), setTimeout(r, 2500)))),
  ]);
  const c = { v: 0 };
  const counter = gsap.to(c, { v: 90, duration: 1.4, ease: 'power2.out', onUpdate: () => (count.textContent = Math.round(c.v)) });
  ready.then(() => {
    counter.kill();
    gsap.timeline({ onComplete: () => { $('[data-pre]').remove(); lenis.start(); } })
      .to(c, { v: 100, duration: .35, onUpdate: () => (count.textContent = Math.round(c.v)) })
      .to('.pre__in', { opacity: 0, y: -20, duration: .4, ease: 'power2.in' })
      .to('.pre__panel--a', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<.1')
      .to('.pre__panel--b', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
      .from('[data-hero-media]', { scale: 1.25, duration: 1.6, ease: 'expo.out' }, '<.15')
      .add(heroIntro, '<.35');
  });

  /* ---------- Titres en lignes ---------- */
  let heroWords = [];
  $$('[data-split]').forEach((el) => {
    const split = new SplitType(el, { types: 'lines,words' });
    split.lines.forEach((l) => l.classList.add('line'));
    if (el.classList.contains('hero__title')) { heroWords = split.words; gsap.set(heroWords, { yPercent: 115 }); return; }
    gsap.from(split.words, { yPercent: 115, rotate: 5, duration: 1.1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.set('.hero [data-fade], .hd', { opacity: 0 });
  function heroIntro() {
    gsap.to(heroWords, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .045 });
    gsap.fromTo('.hero [data-fade]', { y: 30 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: .12, delay: .5 });
    gsap.to('.hd', { opacity: 1, duration: .8, delay: .6 });
  }

  // Sortie du hero : le shader « dissout » l'image, le texte remonte plus vite
  ScrollTrigger.create({
    trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (s) => { if (heroU) heroU.uScroll.value = s.progress; },
  });
  gsap.to('.hero__content', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: '30% top', end: 'bottom top', scrub: true } });
  new IntersectionObserver(([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause())).observe(video);

  /* ---------- Compteurs (chiffres sourcés) ---------- */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const fmt = (v) => (el.hasAttribute('data-nosep') ? String(Math.round(v)) : Math.round(v).toLocaleString('fr-FR'));
    const o = { v: end > 1000 ? end - 60 : 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ---------- Manifeste : mots qui s'allument + devise en parallaxe ---------- */
  $$('[data-words]').forEach((el) => {
    const s = new SplitType(el, { types: 'words' });
    s.words.forEach((w) => w.classList.add('w'));
    gsap.to(s.words, { color: '#1a1a1a', stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true } });
  });
  gsap.from('.manif__motto span', { xPercent: -30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.manif', start: 'top 70%' } });
  gsap.fromTo('.manif__motto .pop', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: '.manif', start: 'top 60%', end: 'top 20%', scrub: true } });

  $$('main [data-fade]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Équipage : la vidéo s'ouvre en plein écran, la signature s'écrit ligne à ligne ---------- */
  const crewVid = $('[data-crew-video]');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { crewVid.preload = 'auto'; crewVid.play().catch(() => {}); } else crewVid.pause();
  }, { rootMargin: '200px' }).observe(crewVid);
  gsap.timeline({
    scrollTrigger: { trigger: '[data-crew]', start: 'top top', end: '+=220%', pin: true, scrub: 1, anticipatePin: 1 },
  })
    .fromTo('[data-crew-frame]', { clipPath: 'inset(16% 20% round 32px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
    .fromTo('.crew__video', { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, 0)
    .from('[data-crew-line]', { yPercent: 60, opacity: 0, filter: 'blur(12px)', stagger: .5, duration: .6, ease: 'power3.out' }, .6)
    .to({}, { duration: .5 });

  /* ---------- Pôles : scroll horizontal + skew selon la vitesse + révélation des images ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const track = $('[data-poles-track]');
    const dist = () => track.scrollWidth - window.innerWidth;
    const skewTo = gsap.quickTo('.pole', 'skewX', { duration: .5, ease: 'power3' });
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '[data-poles]', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => skewTo(gsap.utils.clamp(-6, 6, s.getVelocity() / -400)),
        onLeave: () => skewTo(0), onLeaveBack: () => skewTo(0),
      },
    });
    $$('.pole').forEach((pole) => {
      const img = $('img', pole);
      gsap.fromTo($('.pole__img', pole), { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', ease: 'none',
        scrollTrigger: { trigger: pole, containerAnimation: tween, start: 'left 95%', end: 'left 45%', scrub: true },
      });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: pole, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($$('.pole__body > *', pole), { x: 60, opacity: 0, stagger: .08, ease: 'power3.out', duration: .8, scrollTrigger: { trigger: pole, containerAnimation: tween, start: 'left 70%' } });
    });
  });
  mm.add('(max-width: 960px)', () => {
    $$('.pole').forEach((pole) => gsap.fromTo($('.pole__img', pole), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: pole, start: 'top 80%' } }));
  });

  /* ---------- Globe 3D : voyage territoire par territoire au scroll ---------- */
  const mapSec = $('.map');
  ScrollTrigger.create({
    trigger: mapSec, start: 'top 80%', once: true,
    onEnter: () => import('./globe.js').then(async ({ initGlobe }) => {
      mapSec.classList.add('has-globe'); // le conteneur doit être visible pour être mesuré
      globe = await initGlobe({ canvasWrap: $('[data-globe]'), territoires, gsap, onPick: (id) => select(id) });
      if (!globe) { mapSec.classList.remove('has-globe'); return; }
      globe.focus(currentId);
      globe.drawArcs();
      ScrollTrigger.refresh();
    }),
  });
  if (desktop) {
    ScrollTrigger.create({
      trigger: mapSec, start: 'top top', end: () => '+=' + window.innerHeight * 0.6 * ids.length,
      pin: true, anticipatePin: 1,
      onUpdate: (s) => select(ids[Math.min(ids.length - 1, Math.floor(s.progress * ids.length))], { fromScroll: true }),
    });
  }
  gsap.from('[data-card]', { y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: mapSec, start: 'top 60%' } });

  /* ---------- Engagements ---------- */
  gsap.from('.eng__card', { y: 80, rotate: 2, opacity: 0, duration: 1, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.eng__grid', start: 'top 85%' } });
  // Bandeau final : cercle qui grossit au scroll
  gsap.fromTo('.join', { clipPath: 'circle(20% at 50% 60%)' }, { clipPath: 'circle(120% at 50% 60%)', ease: 'none', scrollTrigger: { trigger: '.join', start: 'top bottom', end: 'top 30%', scrub: true } });

  /* ---------- Curseur + boutons magnétiques (souris uniquement) ---------- */
  if (finePointer) {
    root.classList.add('has-cursor');
    const cur = $('[data-cur]'), label = $('[data-cur-label]');
    const dot = $('.cur__dot'), ring = $('.cur__ring');
    const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, [data-globe]');
      cur.classList.toggle('is-label', !!lab);
      cur.classList.toggle('is-link', !lab && !!link);
      label.textContent = lab ? lab.dataset.cursor : '';
    });
    $$('[data-magnetic]').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3);
        yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  $$('.hand').forEach((h) => gsap.from(h, { opacity: 0, scale: .8, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: h, start: 'top 90%' }, delay: .4 }));
}
