import { useEffect } from 'react';

export function useReveal(page: string, count: number) {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: .06, rootMargin: '0px 0px -24px 0px' });
    elements.forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight - 24) return;
      element.style.setProperty('--reveal-delay', `${(Number(element.dataset.revealIndex || 0) % 4) * 50}ms`);
      element.classList.add('reveal-pending');
      observer.observe(element);
    });
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove('reveal-pending')); };
  }, [page, count]);
}
