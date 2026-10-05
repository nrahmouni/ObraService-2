import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  History, 
  Radio, 
  Clock, 
  HardHat, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Building2,
  Users,
  Layers,
  Cpu,
  Laptop,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { PresentationModernBackdrop } from './PresentationModernBackdrop';
import { PresentationLiveDemoConsole } from './PresentationLiveDemoConsole';
import { 
  BrokenWorkflowSchematic, 
  SiteCloudOfficeDiagram, 
  RoleHierarchySchema, 
  GeofenceRadarDiagram 
} from './PresentationSchematics';
import { presentationAudio } from '../../utils/presentationAudio';
import { PresentationLang, PRESENTATION_I18N } from './presentationI18n';

interface ImmersivePresentationProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo: () => void;
}

export const ImmersivePresentation: React.FC<ImmersivePresentationProps> = ({
  isOpen,
  onClose,
  onLaunchDemo,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [selectedTechPill, setSelectedTechPill] = useState('react19');
  const [currentLang, setCurrentLang] = useState<PresentationLang>('es');
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const t = PRESENTATION_I18N[currentLang];
  const chapters = t.chapters;

  // Trigger opening audio chime on mount
  useEffect(() => {
    if (isOpen) {
      presentationAudio.playOpening();
    }
  }, [isOpen]);

  // Keyboard navigation (Keynote style: Left/Right arrows, Spacebar, Escape, F for fullscreen)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToChapter(Math.min(chapters.length - 1, currentChapter + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToChapter(Math.max(0, currentChapter - 1));
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentChapter, chapters.length, onClose]);

  // Lenis Smooth Inertia Scroll
  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current.firstElementChild as HTMLElement,
      duration: 1.0,
      easing: (val) => Math.min(1, 1.001 - Math.pow(2, -10 * val)),
      smoothWheel: !isReducedMotion,
      touchMultiplier: 1.3,
    });

    const onScroll = () => {
      if (!scrollContainerRef.current) return;
      const el = scrollContainerRef.current;
      const total = el.scrollHeight - el.clientHeight;
      const progress = total > 0 ? el.scrollTop / total : 0;
      setScrollProgress(progress);

      const chapterIdx = Math.min(
        chapters.length - 1,
        Math.floor(progress * chapters.length + 0.08)
      );
      if (chapterIdx !== currentChapter) {
        setCurrentChapter(chapterIdx);
        presentationAudio.playTick();
      }
    };

    scrollContainerRef.current.addEventListener('scroll', onScroll, { passive: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      scrollContainerRef.current?.removeEventListener('scroll', onScroll);
    };
  }, [isOpen, isReducedMotion, currentChapter, chapters.length]);

  const goToChapter = (idx: number) => {
    const el = document.getElementById(`chapter-slide-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
      presentationAudio.playTransition();
    }
  };

  const handleSwitchLang = (lang: PresentationLang) => {
    setCurrentLang(lang);
    presentationAudio.playTick();
  };

  const triggerCtaBurst = (e: React.MouseEvent<HTMLButtonElement>) => {
    presentationAudio.playTransition();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      color: ['#f59e0b', '#f97316', '#fbbf24', '#ffffff', '#38bdf8'][i % 5],
    }));
    setBurstParticles(newParticles);

    setTimeout(() => {
      onClose();
      onLaunchDemo();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(12px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-[#09090b] text-[#f5f5f7] flex flex-col overflow-hidden select-none font-sans"
        role="dialog"
        aria-modal="true"
        aria-label="Presentación Ejecutiva Keynote"
      >
        {/* Modern Clean Architectural Backdrop */}
        <PresentationModernBackdrop
          activeChapter={currentChapter}
          scrollProgress={scrollProgress}
          isReducedMotion={isReducedMotion}
        />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-30" />

        {/* Particle Burst Elements on Launch */}
        {burstParticles.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{
              x: p.x + (Math.cos((idx / burstParticles.length) * Math.PI * 2) * 150) + (Math.random() - 0.5) * 30,
              y: p.y + (Math.sin((idx / burstParticles.length) * Math.PI * 2) * 150) + (Math.random() - 0.5) * 30,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed w-2 h-2 rounded-full pointer-events-none z-50 shadow-lg"
            style={{ backgroundColor: p.color }}
          />
        ))}

        {/* =========================================================
            2. TOP FLOATING DOCK (ENTERPRISE MINIMAL CHROME)
           ========================================================= */}
        <header className="relative z-40 flex items-center justify-between px-3.5 sm:px-8 py-3 sm:py-4 backdrop-blur-2xl bg-[#09090b]/90 border-b border-white/[0.08] shrink-0 gap-2">
          {/* Logo & Category */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/25 shrink-0">
              <HardHat className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white truncate">ObraService Pro</span>
              <span className="text-[11px] text-[#86868b] font-medium hidden md:inline">•</span>
              <span className="text-[11px] text-[#86868b] font-medium hidden md:inline truncate">{t.nav.brandSubtitle}</span>
            </div>
          </div>

          {/* Chapter Scrubber Tabs (Hidden on small mobile) */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#18181b]/90 border border-white/10 backdrop-blur-xl">
            {chapters.map((chap, i) => (
              <button
                key={chap.num}
                onClick={() => goToChapter(i)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                  currentChapter === i
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[#86868b] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="font-mono">{chap.num}</span>
                <span>{chap.navTitle}</span>
              </button>
            ))}
          </div>

          {/* Action Controls & i18n Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Multi-Language Segmented Switcher (ES | EN | NL) */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl">
              {(['es', 'en', 'nl'] as PresentationLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleSwitchLang(lang)}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    currentLang === lang
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                  title={`Cambiar idioma a ${lang.toUpperCase()}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = presentationAudio.toggle();
                setIsAudioActive(next);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#86868b] hover:text-white text-xs transition-colors cursor-pointer"
              title={isAudioActive ? t.nav.soundOn : t.nav.soundOff}
              aria-label="Toggle audio effects"
            >
              {isAudioActive ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#86868b] hover:text-white text-xs transition-colors cursor-pointer hidden sm:inline-flex"
              title="Pantalla Completa [F]"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95"
              aria-label="Close presentation"
            >
              <span>{t.nav.exit}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* =========================================================
            3. MAIN VIEWPORT SCROLL AREA (CONTINUOUS KEYNOTE)
           ========================================================= */}
        <div 
          ref={scrollContainerRef}
          className="relative z-20 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar"
        >
          <div className="w-full">

            {/* SLIDE 01: OVERVIEW & LIVE INTERACTIVE CONSOLE */}
            <section 
              id="chapter-slide-0"
              className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 relative"
            >
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
                {/* Monospace Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181b]/90 border border-white/10 backdrop-blur-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-300 font-bold">
                    {chapters[0].badge}
                  </span>
                </div>

                {/* Monumental Headline */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[0].headlineMain} <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    {chapters[0].headlineGradient}
                  </span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed text-balance">
                  {chapters[0].description}
                </p>

                {/* Live Interactive Product Console Mockup */}
                <div className="pt-4 sm:pt-6 w-full">
                  <PresentationLiveDemoConsole lang={currentLang} />
                </div>
              </div>

              {/* Scroll Down Prompt */}
              <div className="pt-8 flex flex-col items-center gap-1 text-[#86868b] text-[11px] font-mono">
                <span>{chapters[0].navTitle}</span>
                <ChevronDown className="w-4 h-4 animate-bounce text-white/50" />
              </div>
            </section>

            {/* SLIDE 02: THE PROBLEM */}
            <section 
              id="chapter-slide-1"
              className="min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full"
            >
              <div className="space-y-2 sm:space-y-3">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-rose-400">
                  {chapters[1].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[1].headlineMain} <br className="hidden sm:inline" />
                  <span className="text-rose-400">{chapters[1].headlineGradient}</span>
                </h2>
                <p className="text-sm sm:text-base text-[#86868b] max-w-2xl font-normal leading-relaxed text-balance">
                  {chapters[1].description}
                </p>
              </div>

              {/* Before vs After Schematic */}
              <BrokenWorkflowSchematic lang={currentLang} />

              {/* Enterprise Impact Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-rose-400 tracking-tight font-display">{t.problem.stat1}</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-1.5">{t.problem.stat1Label}</div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">{t.problem.stat1Sub}</div>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 tracking-tight font-display">{t.problem.stat2}</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-1.5">{t.problem.stat2Label}</div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">{t.problem.stat2Sub}</div>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">{t.problem.stat3}</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-1.5">{t.problem.stat3Label}</div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">{t.problem.stat3Sub}</div>
                </div>
              </div>
            </section>

            {/* SLIDE 03: THE SOLUTION */}
            <section 
              id="chapter-slide-2"
              className="min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full"
            >
              <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-sky-400">
                  {chapters[2].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[2].headlineMain} <br />
                  <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    {chapters[2].headlineGradient}
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-[#86868b] font-normal leading-relaxed text-balance">
                  {chapters[2].description}
                </p>
              </div>

              {/* Data Flow Diagram */}
              <SiteCloudOfficeDiagram lang={currentLang} />
            </section>

            {/* SLIDE 04: CORE SERVICES */}
            <section 
              id="chapter-slide-3"
              className="min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full"
            >
              <div className="space-y-2 sm:space-y-3">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400">
                  {chapters[3].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[3].headlineMain}
                </h2>
                <p className="text-sm sm:text-base text-[#86868b] max-w-2xl font-normal leading-relaxed text-balance">
                  {chapters[3].description}
                </p>
              </div>

              {/* 6 Clean Modular Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {t.services.items.map((card, i) => {
                  const icons = [FileSpreadsheet, Clock, FileText, ShieldCheck, History, Radio];
                  const Icon = icons[i] || FileSpreadsheet;
                  const colors = ['text-amber-400', 'text-emerald-400', 'text-blue-400', 'text-orange-400', 'text-purple-400', 'text-sky-400'];
                  const color = colors[i] || 'text-amber-400';

                  return (
                    <div
                      key={i}
                      className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl hover:border-amber-500/40 transition-all duration-300 space-y-2.5 sm:space-y-3 group shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[10px] font-mono text-[#86868b] uppercase tracking-wider">{card.tag}</span>
                      </div>

                      <div>
                        <div className={`text-xl sm:text-2xl font-black tracking-tight font-display ${color}`}>{card.metric}</div>
                        <div className="text-[10px] font-mono text-[#86868b] uppercase tracking-wider">{card.metricLabel}</div>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{card.title}</h3>
                        <p className="text-xs text-[#86868b] mt-1 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Haversine Geofence Radar Preview */}
              <div className="pt-2">
                <GeofenceRadarDiagram lang={currentLang} />
              </div>
            </section>

            {/* SLIDE 05: TECH STACK */}
            <section 
              id="chapter-slide-4"
              className="min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full"
            >
              <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-blue-400">
                  {chapters[4].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[4].headlineMain} <br />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {chapters[4].headlineGradient}
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-[#86868b] font-normal leading-relaxed text-balance">
                  {chapters[4].description}
                </p>
              </div>

              {/* Tech Stack Interactive Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {[
                  { id: 'react19', badge: 'FRONTEND', name: 'React 19 SPA', role: 'Vite 8 Concurrent' },
                  { id: 'ts', badge: 'INVARIANTS', name: 'TypeScript', role: 'Pure Domain Rules' },
                  { id: 'firebase', badge: 'REALTIME', name: 'Cloud Firestore', role: 'Live Subscriptions' },
                  { id: 'cloudsql', badge: 'ACID DB', name: 'Cloud SQL', role: 'PostgreSQL & Drizzle' },
                  { id: 'maps', badge: 'GEOSPATIAL', name: 'Maps Platform', role: 'Haversine Polar GPS' },
                  { id: 'gemini', badge: 'AI ENGINE', name: 'Gemini 2.5', role: 'Flash Reasoning' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedTechPill(item.id);
                      presentationAudio.playTick();
                    }}
                    className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTechPill === item.id
                        ? 'bg-blue-500/15 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-[#121215]/80 border-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-blue-400 font-bold block">{item.badge}</span>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{item.name}</div>
                    <div className="text-[10px] text-[#86868b] mt-0.5 truncate">{item.role}</div>
                  </button>
                ))}
              </div>

              {/* Selected Tech Card */}
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                {t.tech.details[selectedTechPill] && (
                  <div className="space-y-1.5 sm:space-y-2 animate-in fade-in">
                    <div className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      {t.tech.details[selectedTechPill].category}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {t.tech.details[selectedTechPill].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                      {t.tech.details[selectedTechPill].desc}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SLIDE 06: BENEFITS & MULTI-TENANT RBAC */}
            <section 
              id="chapter-slide-5"
              className="min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full"
            >
              <div className="space-y-2 sm:space-y-3">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400">
                  {chapters[5].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[5].headlineMain}
                </h2>
                <p className="text-sm sm:text-base text-[#86868b] max-w-2xl font-normal leading-relaxed text-balance">
                  {chapters[5].description}
                </p>
              </div>

              {/* 4 Stakeholder Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {t.benefits.roles.map((role, idx) => {
                  const colors = ['text-amber-400', 'text-sky-400', 'text-emerald-400', 'text-purple-400'];
                  const color = colors[idx] || 'text-amber-400';

                  return (
                    <div key={idx} className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl space-y-2 shadow-xl">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider truncate ${color}`}>{role.role}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">{role.pill}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{role.title}</h3>
                      <p className="text-xs text-[#86868b] leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* RBAC Schema */}
              <div className="pt-2">
                <RoleHierarchySchema lang={currentLang} />
              </div>
            </section>

            {/* SLIDE 07: CLOSING CALL TO ACTION */}
            <section 
              id="chapter-slide-6"
              className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-8 md:px-12 py-12 sm:py-20 relative w-full"
            >
              <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 relative z-10 w-full">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold mx-auto shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                  <HardHat className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] text-white leading-tight text-balance">
                  {chapters[6].headlineMain} <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-white bg-clip-text text-transparent">
                    {chapters[6].headlineGradient}
                  </span>
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-[#86868b] max-w-xl mx-auto font-normal leading-relaxed text-balance">
                  {chapters[6].description}
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full max-w-md mx-auto">
                  <button
                    onClick={triggerCtaBurst}
                    className="w-full sm:w-auto h-12 sm:h-13 px-7 rounded-xl sm:rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.cta.primaryButton}</span>
                  </button>

                  <button
                    onClick={() => {
                      presentationAudio.playTick();
                      onClose();
                    }}
                    className="w-full sm:w-auto h-12 sm:h-13 px-6 rounded-xl sm:rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{t.cta.secondaryButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* =========================================================
            4. BOTTOM CONTROLLER DOCK
           ========================================================= */}
        <footer className="relative z-40 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-2xl bg-[#09090b]/90 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#86868b] shrink-0 font-mono gap-2">
          {/* Chapter Status */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[#f5f5f7] font-bold text-[10px] sm:text-[11px] truncate">
              {chapters[currentChapter]?.num} · {chapters[currentChapter]?.navTitle}
            </span>
          </div>

          {/* Navigation Controls & Keyboard Hints */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => goToChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              className="p-1 sm:p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              title="Capítulo anterior [Flecha Izquierda]"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-1.5 text-[10px] sm:text-[11px] text-[#86868b] font-bold">
              {currentChapter + 1} / {chapters.length}
            </span>

            <button
              onClick={() => goToChapter(Math.min(chapters.length - 1, currentChapter + 1))}
              disabled={currentChapter === chapters.length - 1}
              className="p-1 sm:p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              title="Siguiente capítulo [Flecha Derecha o Espacio]"
              aria-label="Siguiente capítulo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="hidden md:inline text-[10px] text-[#86868b] pl-2 border-l border-white/10">
              {t.nav.keyboardHint}
            </span>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
