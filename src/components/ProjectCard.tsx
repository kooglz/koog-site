import { ArrowUpRight } from 'lucide-react';

interface Props {
  work: { title: string; image: string; category: string };
  index: number;
  label: string;
  onOpen: () => void;
}

export default function ProjectCard({ work, index, label, onOpen }: Props) {
  return <button type="button" className="project-card reveal-item group text-left w-full" data-reveal data-reveal-index={index} onClick={onOpen} aria-label={`${label}: ${work.title}`}>
    <div className="project-card-art aspect-[3/4] overflow-hidden bg-surface-raised rounded-sm border border-line relative">
      <img src={work.image} alt={work.title} loading="lazy" decoding="async" width={1200} height={1600} className="project-card-image w-full h-full object-cover" />
      <span className="project-card-action"><span>{label}</span><ArrowUpRight size={17} aria-hidden="true" /></span>
    </div>
    <div className="space-y-2 pt-4">
      <p className="text-[10px] text-accent uppercase tracking-[0.08em] md:tracking-[0.15em] font-semibold leading-relaxed">{work.category}</p>
      <h4 className="text-base md:text-lg font-bold tracking-tight leading-snug text-ink"><span className="project-card-title">{work.title}</span></h4>
    </div>
  </button>;
}
