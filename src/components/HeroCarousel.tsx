import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';

export interface HeroSlide { image: string; alt?: string; alt_en?: string; project_id?: string }
interface Props { slides: HeroSlide[]; language: 'cn' | 'en'; onOpen: (id: string) => void }

export default function HeroCarousel({ slides, language, onOpen }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const touchX = useRef(0);
  const count = slides.length;
  const cn = language === 'cn';
  const move = (delta: number) => setActive(i => (i + delta + count) % count);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    const visibility = () => setHidden(document.hidden);
    sync(); visibility();
    query.addEventListener('change', sync);
    document.addEventListener('visibilitychange', visibility);
    return () => { query.removeEventListener('change', sync); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const running = count > 1 && !paused && !hovered && !focused && !reduced && !hidden;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setActive(i => (i + 1) % count), 5000);
    return () => clearTimeout(timer);
  }, [running, active, count]);
  if (!count) return null;
  const current = slides[active];
  return (
    <section className="hero-carousel" aria-roledescription="carousel" aria-label={cn ? '精选作品轮播' : 'Selected projects carousel'}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (event.key === 'ArrowLeft') {event.preventDefault(); move(-1);} if (event.key === 'ArrowRight') {event.preventDefault(); move(1);} }}>
      <div className="hero-carousel-stage" onTouchStart={event => {touchX.current = event.touches[0].clientX;}}
        onTouchEnd={event => { const delta = touchX.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 45) move(delta > 0 ? 1 : -1); }}>
        {slides.map((slide, index) => {
          const position = index === active ? 'active' : index === (active + count - 1) % count ? 'previous' : index === (active + 1) % count ? 'next' : 'hidden';
          return <button key={slide.image} type="button" className={`hero-carousel-card is-${position}`} tabIndex={position === 'active' ? 0 : -1}
            aria-hidden={position !== 'active'} aria-label={slide.alt || (cn ? '查看作品' : 'View project')}
            onClick={() => { if (position === 'previous') move(-1); else if (position === 'next') move(1); else if (slide.project_id) onOpen(slide.project_id); }}>
            <img src={slide.image} alt={slide.alt || ''} width={1200} height={1600} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
            {position === 'active' && slide.project_id && <span className="hero-carousel-open"><ArrowUpRight size={18} /></span>}
          </button>;
        })}
      </div>
      <div className="hero-carousel-caption">
        <div className="min-w-0"><p className="text-[9px] tracking-[0.25em] text-subtle mb-1 font-bold">{cn ? '精选作品' : 'SELECTED WORK'} / {String(active+1).padStart(2,'0')}</p><p className="text-sm font-semibold truncate" aria-live={running ? 'off' : 'polite'}>{current.alt || 'KOOG DESIGN'}</p></div>
        <div className="flex shrink-0 gap-1">
          <button className="carousel-control" type="button" onClick={() => move(-1)} aria-label={cn ? '上一张' : 'Previous slide'}><ArrowLeft size={16}/></button>
          <button className="carousel-control" type="button" onClick={() => setPaused(p=>!p)} aria-label={paused ? (cn ? '播放轮播' : 'Play slideshow') : (cn ? '暂停轮播' : 'Pause slideshow')}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button>
          <button className="carousel-control" type="button" onClick={() => move(1)} aria-label={cn ? '下一张' : 'Next slide'}><ArrowRight size={16}/></button>
        </div>
      </div>
      <div className="hero-carousel-progress" aria-label={cn ? '选择轮播图片' : 'Choose slide'}>
        {slides.map((slide,index)=><button key={slide.image} type="button" aria-label={`${cn ? '切换至' : 'Show'} ${slide.alt || index+1}`} aria-current={index===active ? 'true' : undefined} onClick={()=>setActive(index)}><span className={index===active ? 'is-active' : ''}/></button>)}
      </div>
    </section>
  );
}
