import {useEffect, useRef} from 'react';

export function useStoreMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('is-visible'); observer.unobserve(entry.target);}});
    }, {threshold: .12});
    root.querySelectorAll('[data-reveal]').forEach(element => {if (observer) {element.classList.add('will-reveal'); observer.observe(element);}});
    let frame;
    let smoothFrame;
    let target = window.scrollY;
    let lastTime = 0;
    const animateScroll = time => {
      const dt = Math.min(64, time - (lastTime || time - 16));
      lastTime = time;
      const distance = target - window.scrollY;
      window.scrollTo({top: Math.abs(distance) < .5 ? target : window.scrollY + distance * (1 - Math.exp(-dt / 100)), behavior: 'instant'});
      if (Math.abs(distance) > .5) smoothFrame = requestAnimationFrame(animateScroll);
      else {smoothFrame = null; lastTime = 0;}
    };
    const wheel = event => {
      if (!window.matchMedia('(pointer: fine)').matches || event.ctrlKey || event.metaKey || event.deltaMode !== 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.body.style.overflow === 'hidden' || event.target.closest('input, textarea, select, dialog')) return;
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      if ((window.scrollY <= 0 && event.deltaY < 0) || (window.scrollY >= maximum - 1 && event.deltaY > 0)) return;
      event.preventDefault();
      if (!smoothFrame) target = window.scrollY;
      target = Math.max(0, Math.min(maximum, target + event.deltaY));
      if (!smoothFrame) smoothFrame = requestAnimationFrame(animateScroll);
    };
    const stopScroll = () => {cancelAnimationFrame(smoothFrame); smoothFrame = null; lastTime = 0;};
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--hero-scroll', `${Math.min(window.scrollY * .16, 100)}px`);
        root.style.setProperty('--scroll-progress', `${window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100}%`);
        root.querySelectorAll('[data-chapter]').forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight * .55 && rect.bottom > window.innerHeight * .3) {
            root.querySelectorAll('.walkthrough-nav a').forEach(link => link.setAttribute('aria-current', link.hash === `#${section.id}` ? 'step' : 'false'));
          }
        });
      });
    };
    window.addEventListener('scroll', update, {passive: true});
    root.addEventListener('wheel', wheel, {passive: false});
    window.addEventListener('pointerdown', stopScroll);
    window.addEventListener('keydown', stopScroll);
    update();
    return () => {observer?.disconnect(); window.removeEventListener('scroll', update); root.removeEventListener('wheel', wheel); window.removeEventListener('pointerdown', stopScroll); window.removeEventListener('keydown', stopScroll); cancelAnimationFrame(frame); cancelAnimationFrame(smoothFrame);};
  }, []);
  return ref;
}

export function tiltCard(event) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--tilt-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 4}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 4}deg`);
}
export function resetTilt(event) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}
