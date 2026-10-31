import { useEffect, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

interface Props { mode: ThemeMode; theme: 'light' | 'dark'; language: 'cn' | 'en'; onChange: (mode: ThemeMode) => void }
export default function ThemeToggle({ mode, theme, language, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cn = language === 'cn';
  const options = [
    {value:'system' as const, label:cn ? '跟随系统' : 'System', Icon:Monitor},
    {value:'light' as const, label:cn ? '浅色模式' : 'Light', Icon:Sun},
    {value:'dark' as const, label:cn ? '深色模式' : 'Dark', Icon:Moon}
  ];
  useEffect(() => {
    if (!open) return;
    container.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const dismiss = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  return <div ref={container} className="theme-menu" onKeyDown={event => {
    if (event.key === 'Escape') {setOpen(false);trigger.current?.focus();}
    if (open && ['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault();
      const buttons = Array.from(container.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') || []);
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  }}>
    <button ref={trigger} type="button" className="theme-toggle" aria-label={cn ? '主题设置' : 'Theme settings'} title={`${cn ? '主题' : 'Theme'}: ${options.find(option=>option.value===mode)?.label}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
      {theme === 'dark' ? <Moon size={17}/> : <Sun size={17}/>}
      {mode === 'system' && <span className="theme-auto-dot"/>}
    </button>
    {open && <div role="menu" aria-label={cn ? '外观模式' : 'Appearance'} className="theme-options">
      {options.map(({value,label,Icon})=><button key={value} type="button" role="menuitemradio" aria-checked={mode===value} onClick={()=>{onChange(value);setOpen(false);trigger.current?.focus();}}><Icon size={16}/><span>{label}</span>{mode===value && <Check size={14}/>}</button>)}
    </div>}
  </div>;
}
