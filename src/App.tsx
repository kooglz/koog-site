import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, Menu, X, Languages, ChevronLeft, ArrowUpRight
} from 'lucide-react';

// --- 类型定义 ---
interface NavContent {
  home: string;
  works: string;
  services: string;
  inquiry: string;
}

interface HeroContent {
  tag: string;
  title: string[];
  desc: string;
  cta: string;
  stamp: string;
}

interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
  desc: string;
  fullDesc: string;
  client: string;
  year: string;
}

interface FooterContent {
  tagline: string;
  cta: string;
  xhsTitle: string;
  xhsID: string;
  wechatTitle: string;
  wechatID: string;
  scan: string;
  location: string;
}

interface LanguageContent {
  nav: NavContent;
  hero: HeroContent;
  works: {
    title: string;
    subtitle: string;
    back: string;
  };
  footer: FooterContent;
}

type LangMode = 'cn' | 'en';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'works' | 'detail'>('home'); 
  const [selectedProject, setSelectedProject] = useState<WorkItem | null>(null);
  const [language, setLanguage] = useState<LangMode>('cn'); 
  const [logoError, setLogoError] = useState<boolean>(false);
  const [heroSlide, setHeroSlide] = useState<number>(0);
  const [allWorks, setAllWorks] = useState<WorkItem[]>([]);

  // 加载作品数据
  useEffect(() => {
    fetch(getAssetUrl('content/works.json'))
      .then(res => res.json())
      .then(data => setAllWorks(data.works))
      .catch(err => console.error('Failed to load works:', err));
  }, []);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 多语言配置
  const content: Record<LangMode, LanguageContent> = {
    cn: {
      nav: { home: "首页", works: "作品", services: "服务", inquiry: "咨询合作" },
      hero: {
        tag: "全球业务开放中",
        title: ["理性的", "视觉构建者"],
        desc: "15年设计积淀。定义 AI 与 东方美学 的新边界。",
        cta: "浏览作品",
        stamp: "KOOG STUDIO • EST 2011 • DESIGN & ART "
      },
      works: {
        title: "精选项目",
        subtitle: "PORTFOLIO",
        back: "返回列表",
      },
      footer: {
        tagline: "设计并非装饰，而是对世界的理性翻译。",
        cta: "开启下一个项目",
        xhsTitle: "小红书 / RED",
        xhsID: "KOOG_DESIGN",
        wechatTitle: "微信 / WECHAT",
        wechatID: "kooglz",
        scan: "扫码开启合作",
        location: "中国 / 上海 · 北京"
      }
    },
    en: {
      nav: { home: "Home", works: "Works", services: "Services", inquiry: "Inquiry" },
      hero: {
        tag: "Global Inquiries Welcome",
        title: ["Rational", "Visualist"],
        desc: "15 years of design excellence. Defining AIGC & Oriental Aesthetics.",
        cta: "Explore Works",
        stamp: "KOOG STUDIO • EST 2011 • DESIGN & ART "
      },
      works: {
        title: "Selected Projects",
        subtitle: "PORTFOLIO",
        back: "Back",
      },
      footer: {
        tagline: "Design is not decoration, but a rational translation of the world.",
        cta: "Next Project",
        xhsTitle: "Xiaohongshu / RED",
        xhsID: "KOOG_DESIGN",
        wechatTitle: "WeChat",
        wechatID: "kooglz",
        scan: "Scan QR to Start",
        location: "CHINA / SH · BJ"
      }
    }
  };

  const t = content[language];

  // 获取基础路径，自动适配 GitHub Pages 或本地环境
  const baseUrl = import.meta.env.BASE_URL;
  const getAssetUrl = (path: string) => {
    // 移除 path 开头的 /，防止双重斜杠
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${cleanPath}`;
  };

  const heroSlides = [
    { url: getAssetUrl("hero/slide1.jpg"), title: "2026 New Year" },
    { url: getAssetUrl("hero/slide2.jpg"), title: "Geometric Horses" },
    { url: getAssetUrl("hero/slide3.jpg"), title: "Han Dynasty Horses" },
    { url: getAssetUrl("hero/slide4.jpg"), title: "Folk Customs" }
  ];

  const toggleLanguage = () => setLanguage(prev => prev === 'cn' ? 'en' : 'cn');

  const navigateTo = (page: 'home' | 'works' | 'detail', project: WorkItem | null = null) => {
    setCurrentPage(page);
    setSelectedProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const nextHeroSlide = useCallback(() => {
    setHeroSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  }, [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(nextHeroSlide, 5000);
    return () => clearInterval(timer);
  }, [nextHeroSlide]);

  const RotatingStamp: React.FC = () => (
    <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 animate-spin-slow">
        <defs>
          <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
        </defs>
        <text className="text-[8px] uppercase font-bold tracking-[0.22em] fill-neutral-400">
          <textPath href="#circlePath">{t.hero.stamp}</textPath>
        </text>
      </svg>
      <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E61919] rounded-full flex items-center justify-center text-white font-black text-xl shadow-[0_10px_30px_rgba(230,25,25,0.4)] z-10 border-2 border-white/20 transition-transform hover:scale-105 duration-300">
        K.
      </div>
    </div>
  );

  const HomePageContent: React.FC = () => (
    <div className="animate-in fade-in duration-700 w-full">
      {/* Hero Section */}
      <header className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-white w-full">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-full text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
              <span className="w-1 h-1 rounded-full bg-[#E61919] animate-pulse"></span>
              {t.hero.tag}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight text-neutral-900 leading-[1.1]">
                <span className="block mb-2">{t.hero.title[0]}</span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#990000] via-[#E61919] to-[#FF3333] drop-shadow-sm pb-1">
                  {t.hero.title[1]}
                </span>
              </h1>
            </div>
            <p className="text-sm md:text-base text-neutral-500 max-w-sm leading-relaxed font-medium border-l-2 border-[#E61919]/10 pl-6">
              {t.hero.desc}
            </p>
            <div className="flex items-center gap-4 md:gap-10 pt-4">
              <button onClick={() => navigateTo('works')} className="group px-6 md:px-8 py-3 md:py-4 bg-neutral-900 text-white rounded-sm hover:bg-[#E61919] transition-all flex items-center gap-3 font-bold text-[10px] tracking-widest uppercase shadow-xl hover:shadow-[#E61919]/20">
                {t.hero.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="scale-75 md:scale-90 origin-left"><RotatingStamp /></div>
            </div>
          </div>
          <div className="lg:col-span-6 relative h-[50vh] lg:h-[75vh] w-full order-1 lg:order-2 group">
            <div className="absolute inset-0 bg-neutral-100 rounded-sm overflow-hidden shadow-2xl border-[4px] border-white ring-1 ring-neutral-100">
              {heroSlides.map((slide, idx) => (
                <div key={idx} className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${idx === heroSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}>
                  <img src={slide.url} alt={slide.title} className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${idx === heroSlide ? 'scale-110' : 'scale-100'}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Works Section */}
      <section className="py-32 bg-neutral-50 border-y border-neutral-100 w-full">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-1 bg-[#E61919]"></div>
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-neutral-400">{t.works.subtitle}</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-neutral-900">{t.works.title}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {allWorks.map(work => (
              <div key={work.id} className="group cursor-pointer space-y-6" onClick={() => navigateTo('detail', work)}>
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100 rounded-sm shadow-sm border border-neutral-100 relative">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#E61919] uppercase tracking-[0.2em] font-bold">{work.category}</p>
                  <h4 className="text-xl font-bold tracking-tight">{work.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 font-sans selection:bg-[#E61919] selection:text-white antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled || currentPage !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigateTo('home')}>
            <div className="h-8 md:h-11 w-auto">
              {!logoError ? (
                <img src={getAssetUrl("new-logo.png")} alt="KOOG" className="h-full w-auto object-contain transition-transform group-hover:scale-110" onError={() => setLogoError(true)} />
              ) : (
                <div className="h-full aspect-square bg-neutral-900 text-white flex items-center justify-center font-bold px-2">K</div>
              )}
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-4 py-0.5 h-10 md:h-11 justify-between">
              <h2 className="text-xl md:text-2xl font-black tracking-[-0.03em] leading-none text-neutral-900 uppercase">KOOG</h2>
              <div className="flex justify-between w-full">
                {['D','E','S','I','G','N'].map((char, i) => (
                  <span key={i} className="text-[7px] md:text-[8px] font-bold text-[#E61919] leading-none">{char}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-semibold tracking-[0.2em] uppercase">
            <button onClick={() => navigateTo('home')} className={`hover:text-[#E61919] transition-colors ${currentPage === 'home' ? 'text-[#E61919]' : ''}`}>{t.nav.home}</button>
            <button onClick={() => navigateTo('works')} className={`hover:text-[#E61919] transition-colors ${currentPage === 'works' || currentPage === 'detail' ? 'text-[#E61919]' : ''}`}>{t.nav.works}</button>
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-sm hover:border-neutral-900 transition-all">
              <Languages className="w-3 h-3" />
              <span className="font-bold">{language === 'en' ? '中' : 'EN'}</span>
            </button>
            <a href="#contact" className="px-6 py-2.5 bg-neutral-900 text-white rounded-sm hover:bg-[#E61919] transition-all shadow-lg hover:shadow-xl">{t.nav.inquiry}</a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-100 p-6 flex flex-col gap-6 font-bold uppercase tracking-widest text-xs animate-in slide-in-from-top-2 duration-300">
            <button onClick={() => navigateTo('home')} className="text-left">{t.nav.home}</button>
            <button onClick={() => navigateTo('works')} className="text-left">{t.nav.works}</button>
            <button onClick={toggleLanguage} className="text-left text-[#E61919]">{language === 'en' ? '切换中文' : 'SWITCH TO ENGLISH'}</button>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-left px-4 py-3 bg-neutral-900 text-white rounded-sm text-center">{t.nav.inquiry}</a>
          </div>
        )}
      </nav>

      <main className="w-full">
        {currentPage === 'home' && <HomePageContent />}
        {currentPage === 'works' && (
          <div className="pt-40 pb-24 container mx-auto px-6 animate-in fade-in duration-500 w-full">
            <div className="w-12 h-1 bg-[#E61919] mb-6"></div>
            <h2 className="text-5xl font-black tracking-tighter mb-16 uppercase">{t.works.subtitle}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {allWorks.map(work => (
                <div key={work.id} className="group cursor-pointer" onClick={() => navigateTo('detail', work)}>
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-100 mb-6 rounded-sm shadow-sm border border-neutral-100 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  </div>
                  <h4 className="text-xl font-bold group-hover:text-[#E61919] transition-colors tracking-tight">{work.title}</h4>
                  <p className="text-[10px] text-neutral-400 mt-2 uppercase tracking-[0.2em] font-bold">{work.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'detail' && selectedProject && (
          <div className="pt-40 pb-32 container mx-auto px-6 animate-in slide-in-from-bottom-4 duration-700 w-full">
            <button onClick={() => navigateTo('works')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 mb-12 uppercase text-[10px] font-bold tracking-[0.3em]">
              <ChevronLeft className="w-4 h-4" /> {t.works.back}
            </button>
            <div className="grid lg:grid-cols-2 gap-20">
              <div className="space-y-8">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full aspect-video object-cover shadow-2xl rounded-sm border border-neutral-100" />
              </div>
              <div className="space-y-10">
                <div className="border-b border-neutral-100 pb-8">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#E61919] font-bold mb-4">{selectedProject.category}</p>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-neutral-900">{selectedProject.title}</h2>
                </div>
                <p className="text-xl text-neutral-500 font-medium leading-relaxed">{selectedProject.fullDesc}</p>
                <div className="pt-8 grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-neutral-400 tracking-[0.3em] font-bold">Client</p>
                    <p className="font-bold text-lg">{selectedProject.client}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-neutral-400 tracking-[0.3em] font-bold">Year</p>
                    <p className="font-bold text-lg">{selectedProject.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer id="contact" className="relative bg-[#080808] text-white pt-24 pb-12 overflow-hidden border-t border-neutral-900 w-full">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-[#E61919]/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E61919]"></span>
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#E61919]">{t.footer.location}</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-baseline gap-4 group cursor-default">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">{t.footer.cta}</h2>
                  <div className="h-px flex-1 bg-neutral-800/50 group-hover:bg-[#E61919] transition-colors"></div>
                  <ArrowUpRight className="text-[#E61919] w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="group relative inline-block">
                  <a href="mailto:kooglz@foxmail.com" className="text-2xl md:text-3xl font-bold text-neutral-300 hover:text-white transition-colors">
                    kooglz@foxmail.com
                  </a>
                  <div className="mt-1 h-[2px] w-6 group-hover:w-full bg-[#E61919] transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-neutral-500 max-w-sm text-xs leading-relaxed font-medium">{t.footer.tagline}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* WeChat */}
              <div className="group bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-sm hover:border-[#E61919]/30 transition-all flex items-center gap-6">
                <div className="w-16 h-16 bg-white p-1 shrink-0 rounded-sm relative shadow-xl overflow-hidden">
                  <img 
                    src={getAssetUrl("qrcode/wechat.jpg")} 
                    alt="WeChat QR Code" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#E61919]/50 animate-scan opacity-0 group-hover:opacity-100"></div>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase mb-1">{t.footer.wechatTitle}</p>
                  <h4 className="text-sm font-bold tracking-tight">{t.footer.wechatID}</h4>
                </div>
              </div>

              {/* Xiaohongshu (RED) */}
              <div className="group bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-sm hover:border-[#E61919]/30 transition-all flex items-center gap-6">
                <div className="w-16 h-16 bg-white p-1 shrink-0 rounded-sm relative shadow-xl overflow-hidden text-black flex items-center justify-center font-black text-lg">
                  <img 
                    src={getAssetUrl("qrcode/xhs.jpg")} 
                    alt="Xiaohongshu QR Code" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#E61919]/50 animate-scan opacity-0 group-hover:opacity-100"></div>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase mb-1">{t.footer.xhsTitle}</p>
                  <h4 className="text-sm font-bold tracking-tight">2632739343</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900/50 flex justify-between items-center opacity-40">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase tracking-widest font-bold">KOOG STUDIO © 2026</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-spin-slow { animation: spin 30s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
