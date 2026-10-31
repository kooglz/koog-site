import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Menu, X, Languages, ChevronLeft, ArrowUpRight, Share2
} from 'lucide-react';
import { flushSync } from 'react-dom';
import ThemeToggle from './components/ThemeToggle';
import ProjectCard from './components/ProjectCard';
import { useReveal } from './hooks/useReveal';
import mediaRevisions from './generated/media-revisions.json';
import ReactMarkdown from 'react-markdown';
import { useTheme } from './hooks/useTheme';
import HeroCarousel, { type HeroSlide } from './components/HeroCarousel';

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
  id: string | number;
  title: string;
  title_en?: string;
  category_en?: string;
  client_en?: string;
  description_en?: string;
  category: string;
  image: string;
  desc?: string;
  description?: string;
  fullDesc?: string;
  client?: string;
  year?: string;
  detail_content?: {
    full_desc?: string;
    full_desc_en?: string;
    images?: { url: string; alt?: string; alt_en?: string; height?: number }[];
  };
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
  copied: string;
  xhsLabel: string;
}

interface ShareContent {
  title: string;
  defaultTitle: string;
  viewDetail: string;
  shareToWechat: string;
  shareToXhs: string;
  copyLink: string;
  linkCopied: string;
}

interface LanguageContent {
  nav: NavContent;
  hero: HeroContent;
  works: {
    title: string;
    subtitle: string;
    back: string;
    viewProject: string;
    client: string;
    year: string;
    category: string;
  };
  footer: FooterContent;
  share: ShareContent;
  meta: {
    siteTitle: string;
    siteDesc: string;
  };
}

type LangMode = 'cn' | 'en';

// 获取基础路径，自动适配 GitHub Pages 或本地环境
const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // 移除 path 开头的 /
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // 获取 Vite 注入的 base url (在 vite.config.ts 中配置)
  const baseUrl = import.meta.env.BASE_URL;

  // 确保 baseUrl 以 / 结尾，cleanPath 不以 / 开头
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const revision = (mediaRevisions as Record<string, string>)[cleanPath.split(/[?#]/)[0]];
  const version = revision ? `${cleanPath.includes('?') ? '&' : '?'}v=${revision}` : '';
  return `${cleanBase}${cleanPath}${version}`;
};

const localizeWork = (work: WorkItem, language: LangMode): WorkItem => language === 'cn' ? work : ({
  ...work,
  title: work.title_en || work.title,
  category: work.category_en || work.category,
  client: work.client_en || work.client,
  description: work.description_en || work.description,
  detail_content: work.detail_content ? {
    ...work.detail_content,
    full_desc: work.detail_content.full_desc_en || work.detail_content.full_desc,
    images: work.detail_content.images?.map(image => ({...image, alt: image.alt_en || image.alt}))
  } : undefined
});

// 动态更新Open Graph meta标签（用于社交分享时的图标和标题）
const updateMetaTags = (title: string, description: string, image: string) => {
  // 更新OG标签
  const updateTag = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  updateTag('og:title', `【KOOG DESIGN】${title}`);
  updateTag('og:description', description);

  // 处理图片路径：相对路径转为绝对URL
  if (image) {
    let imageUrl = image;
    if (!image.startsWith('http')) {
      imageUrl = `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
    }
    updateTag('og:image', imageUrl);
  }

  // 更新Twitter Card标签
  const updateTwitterTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  updateTwitterTag('twitter:title', `【KOOG DESIGN】${title}`);
  updateTwitterTag('twitter:description', description);

  // 更新文档标题
  document.title = title.includes('KOOG DESIGN') ? title : `${title} · KOOG DESIGN`;
};


const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'works' | 'detail'>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [allWorks, setAllWorks] = useState<WorkItem[]>([]);
  const [language, setLanguage] = useState<LangMode>(() => document.documentElement.dataset.lang === 'en' ? 'en' : 'cn');
  const { theme, mode: themeMode, setThemeMode } = useTheme();
  const selectedSource = allWorks.find(work => work.id === selectedProjectId);
  const selectedProject = selectedSource ? localizeWork(selectedSource, language) : null;
  const displayWorks = allWorks.map(work => localizeWork(work, language));
  const [copied, setCopied] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  useReveal(currentPage, allWorks.length);
  const pageTransition = useRef<{ skipTransition: () => void } | null>(null);

  const copyXhsInfo = () => {
    const text = language === 'cn'
      ? '小红书号：2632739343（KOOG插画设计）'
      : 'Xiaohongshu ID: 2632739343 (KOOG Illustration)';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    window.open('https://www.xiaohongshu.com', '_blank');
  };

  const getWorkShareUrl = () => {
    if (!selectedProject) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#work-${selectedProject.id}`;
  };

  // 恢复默认meta标签
  const restoreMetaTags = () => {
    document.title = 'KOOG DESIGN';
    updateMetaTags(
      language === 'cn' ? 'KOOG DESIGN - 创意设计工作室' : 'KOOG DESIGN - Creative Design Studio',
      language === 'cn' ? 'KOOG DESIGN · 专业插画设计与品牌视觉解决方案。精选作品集展示。' : 'KOOG DESIGN · Illustration, character design and brand identities.',
      'https://www.koogdesign.top/apple-touch-icon.png'
    );
  };

  const shareToWechat = () => {
    const shareUrl = getWorkShareUrl();
    const shareText = `【KOOG DESIGN】${selectedProject?.title || (language === 'cn' ? '精选作品' : 'Selected Work')}\n${shareUrl}\n\n${language === 'cn' ? '点击查看完整作品详情' : 'View full project details'}`;

    // 动态更新meta标签以显示正确的图标和标题
    const workTitle = selectedProject?.title || (language === 'cn' ? '精选作品' : 'Selected Work');
    const workDesc = selectedProject?.fullDesc || selectedProject?.description || (language === 'cn' ? `查看${workTitle}完整作品详情` : `View ${workTitle} in detail`);
    const workImage = selectedProject?.image || '';

    updateMetaTags(workTitle, workDesc, workImage);

    // 等待meta标签更新完成后执行分享（iOS Safari需要时间读取新meta）
    setTimeout(() => {
      if (navigator.share && navigator.canShare({ url: shareUrl, text: shareText })) {
        navigator.share({
          title: `【KOOG DESIGN】${workTitle}`,
          text: shareText,
          url: shareUrl,
        }).finally(() => {
          // 分享完成后恢复默认meta标签
          setTimeout(restoreMetaTags, 1000);
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          setShareCopied(true);
          setTimeout(() => {
            setShareCopied(false);
            restoreMetaTags();
          }, 2000);
        });
      }
    }, 100); // 100ms延迟确保DOM更新

    setShowShareMenu(false);
  };

  const shareToXiaohongshu = () => {
    const shareUrl = getWorkShareUrl();
    const shareText = `【KOOG DESIGN】${selectedProject?.title || (language === 'cn' ? '精选作品' : 'Selected Work')}\n${shareUrl}`;

    // 动态更新meta标签
    const workTitle = selectedProject?.title || (language === 'cn' ? '精选作品' : 'Selected Work');
    const workDesc = selectedProject?.fullDesc || selectedProject?.description || (language === 'cn' ? `查看${workTitle}完整作品详情` : `View ${workTitle} in detail`);
    const workImage = selectedProject?.image || '';

    updateMetaTags(workTitle, workDesc, workImage);

    navigator.clipboard.writeText(shareText).then(() => {
      setShareCopied(true);
      setTimeout(() => {
        setShareCopied(false);
        restoreMetaTags();
      }, 2000);
    });
    setTimeout(() => {
      window.open('https://www.xiaohongshu.com', '_blank');
    }, 500);
    setShowShareMenu(false);
  };

  const copyShareLink = () => {
    const shareUrl = getWorkShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
    setShowShareMenu(false);
  };
  const [heroImages, setHeroImages] = useState<HeroSlide[]>([]);
  const [siteSettings, setSiteSettings] = useState<{ logo?: string; nav?: Record<string, string>; hero?: Record<string, string>; footer?: Record<string, string> } | null>(null);

  // 加载作品数据
  useEffect(() => {
    // 加载全局设置
    fetch(getAssetUrl(`content/site.json?v=${new Date().getTime()}`))
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(err => console.error('Failed to load site settings:', err));

    // 添加时间戳防止浏览器缓存 works.json
    fetch(getAssetUrl(`content/works.json?v=${new Date().getTime()}`))
      .then(res => res.json())
      .then(data => {
        if (data.works) {
          // 处理作品图片路径，确保兼容 GitHub Pages
          const processedWorks = data.works.map((work: WorkItem) => ({
            ...work,
            image: work.image.startsWith('http') ? work.image : getAssetUrl(work.image)
          }));
          setAllWorks(processedWorks);
        }
        if (data.hero_images) {
          // 处理轮播图路径
          setHeroImages(data.hero_images.map((item: HeroSlide) => ({
            ...item, image: getAssetUrl(item.image)
          })));
        }
      })
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
      nav: {
        home: siteSettings?.nav?.home_cn || "首页",
        works: siteSettings?.nav?.works_cn || "作品",
        services: siteSettings?.nav?.services_cn || "服务",
        inquiry: siteSettings?.nav?.inquiry_cn || "咨询合作"
      },
      hero: {
        tag: siteSettings?.hero?.tag_cn || "全球业务开放中",
        title: [
          siteSettings?.hero?.title1_cn || "理性的",
          siteSettings?.hero?.title2_cn || "视觉构建者"
        ],
        desc: siteSettings?.hero?.desc_cn || "15年设计积淀。定义 AI 与 东方美学 的新边界。",
        cta: siteSettings?.hero?.cta_cn || "浏览作品",
        stamp: siteSettings?.hero?.stamp_cn || "KOOG STUDIO • EST 2011 • DESIGN & ART "
      },
      works: {
        title: "精选项目",
        subtitle: "PORTFOLIO",
        back: "返回列表",
        viewProject: "查看项目",
        client: "客户",
        year: "年份",
        category: "类别",
      },
      footer: {
        tagline: siteSettings?.footer?.tagline_cn || "设计并非装饰，而是对世界的理性翻译。",
        cta: siteSettings?.footer?.cta_cn || "开启下一个项目",
        xhsTitle: siteSettings?.footer?.xhsTitle_cn || "小红书 / RED",
        xhsID: siteSettings?.footer?.xhsID || "KOOG_DESIGN",
        wechatTitle: siteSettings?.footer?.wechatTitle_cn || "微信 / WECHAT",
        wechatID: siteSettings?.footer?.wechatID || "kooglz",
        scan: "扫码开启合作",
        location: siteSettings?.footer?.location_cn || "中国 / 上海 · 北京",
        copied: "✓ 已复制小红书号！",
        xhsLabel: "小红书：KOOG（插画设计）2632739343",
      },
      share: {
        title: "【KOOG DESIGN】",
        defaultTitle: "精选作品",
        viewDetail: "点击查看完整作品详情",
        shareToWechat: "分享到微信",
        shareToXhs: "分享到小红书",
        copyLink: "复制链接",
        linkCopied: "链接已复制",
      },
      meta: {
        siteTitle: "KOOG DESIGN - 创意设计工作室",
        siteDesc: "KOOG DESIGN · 专业插画设计与品牌视觉解决方案。精选作品集展示。",
      }
    },
    en: {
      nav: {
        home: siteSettings?.nav?.home_en || "Home",
        works: siteSettings?.nav?.works_en || "Works",
        services: siteSettings?.nav?.services_en || "Services",
        inquiry: siteSettings?.nav?.inquiry_en || "Inquiry"
      },
      hero: {
        tag: siteSettings?.hero?.tag_en || "Global Inquiries Welcome",
        title: [
          siteSettings?.hero?.title1_en || "Rational",
          siteSettings?.hero?.title2_en || "Visualist"
        ],
        desc: siteSettings?.hero?.desc_en || "15 years of design excellence. Defining AIGC & Oriental Aesthetics.",
        cta: siteSettings?.hero?.cta_en || "Explore Works",
        stamp: siteSettings?.hero?.stamp_en || "KOOG STUDIO • EST 2011 • DESIGN & ART "
      },
      works: {
        title: "Selected Projects",
        subtitle: "PORTFOLIO",
        back: "Back",
        viewProject: "View Project",
        client: "Client",
        year: "Year",
        category: "Category",
      },
      footer: {
        tagline: siteSettings?.footer?.tagline_en || "Design is not decoration, but a rational translation of the world.",
        cta: siteSettings?.footer?.cta_en || "Next Project",
        xhsTitle: siteSettings?.footer?.xhsTitle_en || "Xiaohongshu / RED",
        xhsID: siteSettings?.footer?.xhsID || "KOOG_DESIGN",
        wechatTitle: siteSettings?.footer?.wechatTitle_en || "WeChat",
        wechatID: siteSettings?.footer?.wechatID || "kooglz",
        scan: "Scan QR to Start",
        location: siteSettings?.footer?.location_en || "CHINA / SH · BJ",
        copied: "✓ Xiaohongshu ID copied!",
        xhsLabel: "Xiaohongshu: KOOG (Illustration) 2632739343",
      },
      share: {
        title: "【KOOG DESIGN】",
        defaultTitle: "Selected Work",
        viewDetail: "Click to view full project details",
        shareToWechat: "Share to WeChat",
        shareToXhs: "Share to Xiaohongshu",
        copyLink: "Copy Link",
        linkCopied: "Link copied",
      },
      meta: {
        siteTitle: "KOOG DESIGN - Creative Design Studio",
        siteDesc: "KOOG DESIGN · Professional illustration and brand visual solutions. Featured portfolio.",
      }
    }
  };

  const t = content[language];
  const heroSubtitleParts = (t.hero.title[1] || '')
    .split('·')
    .map(s => s.trim())
    .filter(Boolean);

  // 切换语言时同步更新 document 的 data-lang 属性（用于字体切换）
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', language);
    document.body.setAttribute('data-lang', language);
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    try { localStorage.setItem('koog-language', language); } catch { /* Keep switching available without storage. */ }
  }, [language]);

  useEffect(() => {
    const title = selectedProject?.title || t.meta.siteTitle;
    const description = selectedProject?.description || t.meta.siteDesc;
    updateMetaTags(title, description, selectedProject?.image || getAssetUrl('og-share.jpg'));
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'en' ? 'en_US' : 'zh_CN');
  }, [language, selectedProject?.title, selectedProject?.description, selectedProject?.image, t.meta.siteTitle, t.meta.siteDesc]);

  const toggleLanguage = () => setLanguage(prev => prev === 'cn' ? 'en' : 'cn');

  const navigateTo = (page: 'home' | 'works' | 'detail', project: WorkItem | null = null) => {
    const update = () => {
      const hash = page === 'detail' && project ? `#work-${project.id}` : page === 'works' ? '#works' : '';
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
      setCurrentPage(page);
      setSelectedProjectId(project?.id ?? null);
      setIsMenuOpen(false);
      setShowShareMenu(false);
      setShareCopied(false);
    };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden) {
      pageTransition.current?.skipTransition();
      const transition = document.startViewTransition(() => {
        flushSync(update);
        window.scrollTo({top: 0, behavior: 'instant'});
      });
      pageTransition.current = transition;
      void transition.finished.catch(() => {});
    } else {
      update();
      requestAnimationFrame(() => window.scrollTo({top: 0, behavior: 'instant'}));
    }
  };

  // Hash路由支持 - 处理 #work-id 格式的深度链接
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#works') { navigateTo('works'); return; }
      if (hash && hash.startsWith('#work-')) {
        const workId = hash.replace('#work-', '');
        const work = allWorks.find(w => w.id === workId);
        if (work) {
          navigateTo('detail', work);

        }
      }
    };

    // 初始加载时检查hash
    handleHashChange();

    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allWorks]);

  const rotatingStamp = (
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

  const homePageContent = (
    <div className="animate-in fade-in duration-700 w-full">
      {/* Hero Section */}
      <header className="site-hero relative min-h-[90vh] lg:min-h-[760px] flex items-center pt-24 pb-16 overflow-hidden bg-surface w-full">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgb(var(--ink)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--ink)) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <div className="hero-copy lg:col-span-5 space-y-8 order-2 lg:order-1 lg:pr-6 relative z-30 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-alt border border-line rounded-full text-[9px] font-bold tracking-widest text-subtle uppercase">
              <span className="w-1 h-1 rounded-full bg-[#E61919] animate-pulse"></span>
              {t.hero.tag}
            </div>
            <div className="inline-block space-y-5 max-w-[34rem] xl:max-w-[38rem] relative z-30">
              <h1 className="hero-title text-[clamp(2.25rem,12vw,3.5rem)] md:text-6xl font-black tracking-tight text-ink leading-[0.9] md:leading-[1.05] antialiased safari-font-fix">
                {t.hero.title[0]}
              </h1>
              <div className="hero-glass w-full relative z-30">
                {heroSubtitleParts.length === 3 ? (
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center px-5 py-2 text-[11px] md:text-xs xl:text-sm font-semibold tracking-[0.22em]">
                    <span className="justify-self-center whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] drop-shadow-sm">
                      {heroSubtitleParts[0]}
                    </span>
                    <span className="justify-self-center select-none text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] opacity-70">
                      |
                    </span>
                    <span className="justify-self-center whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] drop-shadow-sm">
                      {heroSubtitleParts[1]}
                    </span>
                    <span className="justify-self-center select-none text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] opacity-70">
                      |
                    </span>
                    <span className="justify-self-center whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] drop-shadow-sm">
                      {heroSubtitleParts[2]}
                    </span>
                  </div>
                ) : (
                  <div className="px-5 py-2 text-[11px] md:text-xs xl:text-sm font-semibold tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-[#E61919] via-[#E61919] to-[#FF5555] drop-shadow-sm">
                    {t.hero.title[1]}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm md:text-base text-muted max-w-sm leading-relaxed font-medium border-l-2 border-[#E61919]/10 pl-6">
              {t.hero.desc}
            </p>
            <div className="flex items-center justify-start gap-4 md:gap-10 pt-4 relative z-30 w-full">
              <button onClick={() => navigateTo('works')} className="group px-6 md:px-8 py-3 md:py-4 bg-ink text-surface hover:text-white rounded-sm hover:bg-[#E61919] transition-all flex items-center gap-3 font-bold text-[10px] tracking-widest uppercase shadow-xl hover:shadow-[#E61919]/20">
                {t.hero.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="scale-75 md:scale-90 origin-left">{rotatingStamp}</div>
            </div>
          </div>
          <div className="lg:col-span-7 w-full order-1 lg:order-2 relative z-10 min-w-0">
            <HeroCarousel slides={heroImages.map(slide => ({...slide, alt: language === 'en' ? slide.alt_en || slide.alt : slide.alt}))} language={language} onOpen={id => {
              const project = allWorks.find(work => String(work.id) === id);
              if (project) navigateTo('detail', project);
            }} />
          </div>
        </div>
      </header>

      {/* Featured Works Section */}
      <section className="py-16 md:py-24 bg-surface-alt border-y border-line w-full">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 md:mb-12 gap-8">
            <div className="reveal-item space-y-4" data-reveal>
              <div className="w-12 h-1 bg-[#E61919]"></div>
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-subtle">{t.works.subtitle}</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-ink">{t.works.title}</h2>
            </div>
          </div>
          <div className="portfolio-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9 md:gap-x-7 md:gap-y-12">
            {displayWorks.map((work, index) => (
              <ProjectCard key={work.id} work={work} index={index} label={t.works.viewProject} onOpen={() => navigateTo('detail', work)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-surface text-ink font-sans selection:bg-[#E61919] selection:text-white antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || currentPage !== 'home' ? 'bg-surface shadow-[0_2px_20px_rgba(0,0,0,0.1)] border-b border-line py-3' : 'bg-surface/95 backdrop-blur-sm shadow-sm border-b border-line/60 py-4'}`}>
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer group shrink-0" onClick={() => navigateTo('home')}>
            <div className="brand-icon h-8 w-8 md:h-11 md:w-11 shrink-0">
              {!logoError ? (
                <img src={getAssetUrl(siteSettings?.logo || "new-logo.png")} alt="KOOG" className="h-full w-full object-cover" onError={() => setLogoError(true)} />
              ) : (
                <div className="h-full aspect-square bg-ink text-surface hover:text-white flex items-center justify-center font-bold px-2">K</div>
              )}
            </div>
            <div className="flex flex-col border-l border-line pl-2 md:pl-4 justify-center h-8 md:h-10">
              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none text-ink uppercase">KOOG</h2>
              <span className="text-[10px] md:text-[11px] font-bold text-accent leading-none tracking-[0.2em] mt-0.5">DESIGN</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5 lg:gap-8 text-[11px] font-semibold tracking-[0.2em] uppercase">
            <ThemeToggle mode={themeMode} theme={theme} language={language} onChange={setThemeMode} />
            <button onClick={() => navigateTo('home')} className={`hover:text-accent transition-colors ${currentPage === 'home' ? 'text-accent' : ''}`}>{t.nav.home}</button>
            <button onClick={() => navigateTo('works')} className={`hover:text-accent transition-colors ${currentPage === 'works' || currentPage === 'detail' ? 'text-accent' : ''}`}>{t.nav.works}</button>
            <button onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Chinese' : '切换英文'} className="flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-sm hover:border-ink transition-all">
              <Languages className="w-3 h-3" />
              <span className="font-bold">{language === 'en' ? '中' : 'EN'}</span>
            </button>
            <a href="#contact" className="px-6 py-2.5 bg-ink text-surface hover:text-white rounded-sm hover:bg-[#E61919] transition-all shadow-lg hover:shadow-xl">{t.nav.inquiry}</a>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle mode={themeMode} theme={theme} language={language} onChange={setThemeMode} />
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-2 border border-line rounded-sm hover:border-ink transition-all"
              aria-label={language === 'en' ? 'Switch to Chinese' : '切换英文'}
            >
              <Languages className="w-4 h-4 text-body" />
              <span className="text-xs font-bold text-body">{language === 'en' ? '中' : 'EN'}</span>
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label={language === 'cn' ? (isMenuOpen ? '关闭菜单' : '打开菜单') : (isMenuOpen ? 'Close menu' : 'Open menu')} aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-line p-6 flex flex-col gap-6 font-bold uppercase tracking-widest text-xs animate-in slide-in-from-top-2 duration-300">
            <button onClick={() => navigateTo('home')} className="text-left">{t.nav.home}</button>
            <button onClick={() => navigateTo('works')} className="text-left">{t.nav.works}</button>
            <button onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Chinese' : '切换英文'} className="text-left text-accent">{language === 'en' ? 'Switch to Chinese' : '切换英文'}</button>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-left px-4 py-3 bg-ink text-surface hover:text-white rounded-sm text-center">{t.nav.inquiry}</a>
          </div>
        )}
      </nav>

      <main className="page-content w-full">
        {currentPage === 'home' && homePageContent}
        {currentPage === 'works' && (
          <div className="pt-32 pb-24 max-w-[1280px] mx-auto px-6 animate-in fade-in duration-500 w-full">
            <div className="w-12 h-1 bg-[#E61919] mb-6"></div>
            <h2 className="text-5xl font-black tracking-tighter mb-16 uppercase">{t.works.subtitle}</h2>
            <div className="portfolio-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9 md:gap-x-7 md:gap-y-12">
              {displayWorks.map((work, index) => (
              <ProjectCard key={work.id} work={work} index={index} label={t.works.viewProject} onOpen={() => navigateTo('detail', work)} />
            ))}
            </div>
          </div>
        )}

        {currentPage === 'detail' && selectedProject && (
          <div key={selectedProject.id} className="project-detail pt-40 pb-32 container mx-auto px-6 w-full">
            <button onClick={() => navigateTo('works')} className="flex items-center gap-2 text-subtle hover:text-ink mb-12 uppercase text-[10px] font-bold tracking-[0.3em]">
              <ChevronLeft className="w-4 h-4" /> {t.works.back}
            </button>
            <div className="grid lg:grid-cols-2 gap-20">
              <div className="space-y-8">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-auto object-contain shadow-2xl rounded-sm border border-line" />

                {/* 渲染详情图集 */}
                {selectedProject.detail_content?.images && selectedProject.detail_content.images.length > 0 && (
                  <div className="space-y-8 pt-8">
                    {selectedProject.detail_content.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url.startsWith('http') ? img.url : getAssetUrl(img.url)}
                        alt={img.alt || `${selectedProject.title} detail ${idx + 1}`}
                        loading="lazy" decoding="async" width={1600} height={img.height || 1400}
                        className="w-full h-auto shadow-lg rounded-sm border border-line"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-10">
                <div className="border-b border-line pb-8">
                  <p className="text-xs md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.4em] text-accent font-semibold mb-4 leading-relaxed">{selectedProject.category}</p>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] text-ink">{selectedProject.title}</h2>
                </div>
                {/* 优先显示详情内容里的完整描述，如果没有则显示普通描述 */}
                <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none text-muted font-medium leading-relaxed prose-img:w-full prose-img:h-auto prose-img:shadow-lg prose-img:rounded-sm prose-img:border prose-img:border-line prose-img:my-8">
                  <ReactMarkdown>
                    {selectedProject.detail_content?.full_desc || selectedProject.description || selectedProject.fullDesc || ""}
                  </ReactMarkdown>
                </div>
                <div className="pt-8 grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-subtle tracking-[0.3em] font-bold">{t.works.client}</p>
                    <p className="font-bold text-lg">{selectedProject.client}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-subtle tracking-[0.3em] font-bold">{t.works.year}</p>
                    <p className="font-bold text-lg">{selectedProject.year}</p>
                  </div>
                </div>

                {/* 分享功能 - 移动端优化的 Bottom Sheet 设计 */}
                <div className="pt-8 border-t border-line">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full md:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-ink text-surface hover:text-white rounded-xl hover:bg-[#E61919] transition-all font-bold text-[12px] tracking-widest uppercase active:scale-[0.98] touch-manipulation"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{language === 'cn' ? '分享作品' : 'Share project'}</span>
                  </button>

                  {showShareMenu && (
                    <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                      {/* 移动端：垂直堆叠的大按钮 */}
                      <div className="md:hidden space-y-3">
                        <button
                          onClick={shareToWechat}
                          className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-surface border-2 border-line rounded-2xl hover:border-[#07C160] hover:bg-[#07C160]/5 transition-all active:scale-[0.98] touch-manipulation group"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center group-hover:bg-[#07C160]/20 transition-colors">
                            <svg className="w-7 h-7 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-base text-ink">{language === 'cn' ? '微信' : 'WeChat'}</p>
                            <p className="text-xs text-muted mt-0.5">{language === 'cn' ? '发送给好友' : 'Send to a friend'}</p>
                          </div>
                        </button>

                        <button
                          onClick={shareToXiaohongshu}
                          className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-surface border-2 border-line rounded-2xl hover:border-[#FF2442] hover:bg-[#FF2442]/5 transition-all active:scale-[0.98] touch-manipulation group"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#FF2442]/10 flex items-center justify-center group-hover:bg-[#FF2442]/20 transition-colors">
                            <svg className="w-7 h-7 text-[#FF2442]" viewBox="0 0 24 24" fill="#FF2442">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.01 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"/>
                              <path d="M12 7.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
                              <circle cx="12" cy="12" r="1.5" fill="white"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-base text-ink">{language === 'cn' ? '小红书' : 'Xiaohongshu'}</p>
                            <p className="text-xs text-muted mt-0.5">{language === 'cn' ? '发布笔记' : 'Create a post'}</p>
                          </div>
                        </button>

                        <button
                          onClick={copyShareLink}
                          className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-surface border-2 border-line rounded-2xl hover:border-ink hover:bg-surface-alt transition-all active:scale-[0.98] touch-manipulation group"
                        >
                          <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center group-hover:bg-surface-raised transition-colors">
                            <svg className="w-7 h-7 text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-base text-ink">{language === 'cn' ? '复制链接' : 'Copy link'}</p>
                            <p className="text-xs text-muted mt-0.5">{shareCopied ? t.share.linkCopied : (language === 'cn' ? '复制作品链接' : 'Copy project link')}</p>
                          </div>
                        </button>
                      </div>

                      {/* 桌面端：水平排列的紧凑按钮 */}
                      <div className="hidden md:flex items-center gap-3">
                        <button
                          onClick={shareToWechat}
                          className="flex items-center gap-2 px-5 py-3 border border-line rounded-lg hover:border-[#07C160] hover:text-[#07C160] hover:bg-[#07C160]/5 transition-all text-sm font-semibold active:scale-[0.98]"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                          </svg>
                          {language === 'cn' ? '微信' : 'WeChat'}
                        </button>

                        <button
                          onClick={shareToXiaohongshu}
                          className="flex items-center gap-2 px-5 py-3 border border-line rounded-lg hover:border-[#FF2442] hover:text-[#FF2442] hover:bg-[#FF2442]/5 transition-all text-sm font-semibold active:scale-[0.98]"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF2442">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.01 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"/>
                            <path d="M12 7.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
                            <circle cx="12" cy="12" r="1.5" fill="white"/>
                          </svg>
                          {language === 'cn' ? '小红书' : 'Xiaohongshu'}
                        </button>

                        <button
                          onClick={copyShareLink}
                          className="flex items-center gap-2 px-5 py-3 border border-line rounded-lg hover:border-ink hover:bg-surface-alt transition-all text-sm font-semibold active:scale-[0.98]"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          {shareCopied ? t.share.linkCopied : t.share.copyLink}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contact Section */}
      <div id="contact" className="contact-section relative bg-[#080808] text-white pt-24 pb-16 overflow-hidden w-full">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start mb-12">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-[#E61919]/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E61919]"></span>
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-accent">{t.footer.location}</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-baseline gap-4 group cursor-default">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">{t.footer.cta}</h2>
                  <div className="h-px flex-1 bg-neutral-800/50 group-hover:bg-[#E61919] transition-colors"></div>
                  <ArrowUpRight className="text-accent w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="group relative inline-block">
                  <a href="mailto:kooglz@foxmail.com" className="text-2xl md:text-3xl font-bold text-neutral-300 hover:text-white transition-colors">
                    kooglz@foxmail.com
                  </a>
                  <div className="mt-1 h-[2px] w-6 group-hover:w-full bg-[#E61919] transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-muted max-w-sm text-xs leading-relaxed font-medium">{t.footer.tagline}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="group bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-sm hover:border-[#E61919]/30 transition-all flex items-center gap-6">
                <div className="w-16 h-16 bg-white p-1 shrink-0 rounded-sm relative shadow-xl overflow-hidden">
                  <img
                    src={getAssetUrl(siteSettings?.footer?.wechatQR || "qrcode/wechat.jpg")}
                    alt={language === 'cn' ? '微信二维码' : 'WeChat QR code'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#E61919]/50 animate-scan opacity-0 group-hover:opacity-100"></div>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase mb-1">{t.footer.wechatTitle}</p>
                  <h4 className="text-sm font-bold tracking-tight">{t.footer.wechatID}</h4>
                </div>
              </div>

              <div className="group bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-sm hover:border-[#E61919]/30 transition-all flex items-center gap-6">
                <div className="w-16 h-16 bg-white p-1 shrink-0 rounded-sm relative shadow-xl overflow-hidden text-black flex items-center justify-center font-black text-lg">
                  <img
                    src={getAssetUrl(siteSettings?.footer?.xhsQR || "qrcode/xhs.jpg")}
                    alt={language === 'cn' ? '小红书二维码' : 'Xiaohongshu QR code'}
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
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="site-footer w-full bg-[#1a1a1a] py-4 border-t border-neutral-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <button
            onClick={copyXhsInfo}
            className="flex items-center gap-1.5 text-[11px] text-subtle hover:text-accent transition-colors group cursor-pointer bg-transparent border-none"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="#FF2442">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.01 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"/>
              <path d="M12 7.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
            </svg>
            <span>{copied ? t.footer.copied : t.footer.xhsLabel}</span>
            {!copied && <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
          </button>
          <p className="text-[11px] text-muted leading-relaxed">© 2026 koogdesign &nbsp; Nanjing Yuerantu Technology Co., Ltd.</p>
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
