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
  Laptop
} from 'lucide-react';
import { PresentationModernBackdrop } from './PresentationModernBackdrop';
import { PresentationLiveDemoConsole } from './PresentationLiveDemoConsole';
import { ThreePageCanvas } from '../three/ThreePageCanvas';
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

  const t = PRESENTATION_I18N[currentLang];
  const chapters = t.chapters;

  // Trigger opening audio chime on mount
  useEffect(() => {
    if (isOpen) {
      presentationAudio.playOpening();
    }
  }, [isOpen]);

  // Keyboard navigation (Keynote style: Left/Right arrows, Spacebar, Escape)
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
      color: ['#ff6600', '#f97316', '#fbbf24', '#ffffff', '#38bdf8'][i % 5],
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
      >
        {/* =========================================================
            1. THREE.JS FULL-PAGE SPATIAL ENVIRONMENT & BACKDROP
           ========================================================= */}
        <ThreePageCanvas
          activeChapter={currentChapter}
          scrollProgress={scrollProgress}
          isPresentation={true}
          interactive={true}
        />
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
        <header className="relative z-40 flex items-center justify-between px-6 sm:px-10 py-4 backdrop-blur-2xl bg-[#09090b]/80 border-b border-white/[0.08] shrink-0">
          {/* Logo & Category Pill */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white">ObraService Pro</span>
              <span className="text-[11px] text-[#86868b] font-medium hidden sm:inline">•</span>
              <span className="text-[11px] text-[#86868b] font-medium hidden sm:inline">{t.nav.brandSubtitle}</span>
            </div>
          </div>

          {/* Chapter Scrubber Tabs */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-[#18181b]/90 border border-white/10 backdrop-blur-xl">
            {chapters.map((chap, i) => (
              <button
                key={chap.num}
                onClick={() => goToChapter(i)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                  currentChapter === i
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#86868b] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="font-mono">{chap.num}</span>
                <span>{chap.navTitle}</span>
              </button>
            ))}
          </div>

          {/* Action Controls & i18n Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multi-Language Segmented Switcher (ES | EN | NL) */}
            <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl">
              {(['es', 'en', 'nl'] as PresentationLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleSwitchLang(lang)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    currentLang === lang
                      ? 'bg-white text-black shadow-sm'
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
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#86868b] hover:text-white text-xs transition-colors cursor-pointer"
              title={isAudioActive ? t.nav.soundOn : t.nav.soundOff}
              aria-label="Toggle audio effects"
            >
              {isAudioActive ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95"
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

            {/* =====================================================
                SLIDE 01: OVERVIEW & LIVE INTERACTIVE CONSOLE
               ===================================================== */}
            <section 
              id="chapter-slide-0"
              className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 py-20 relative"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Monospace Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181b]/90 border border-white/10 backdrop-blur-xl">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-300 font-bold">
                    {chapters[0].badge}
                  </span>
                </div>

                {/* Monumental Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.04em] text-white leading-[1.02]">
                  {chapters[0].headlineMain} <br />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent">
                    {chapters[0].headlineGradient}
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed">
                  {chapters[0].description}
                </p>

                {/* Live Interactive Product Console Mockup */}
                <div className="pt-6">
                  <PresentationLiveDemoConsole lang={currentLang} />
                </div>
              </div>

              {/* Scroll Down Prompt */}
              <div className="pt-10 flex flex-col items-center gap-1 text-[#86868b] text-[11px] font-mono">
                <span>{chapters[0].navTitle}</span>
                <ChevronDown className="w-4 h-4 animate-bounce text-white/50" />
              </div>
            </section>

            {/* =====================================================
                SLIDE 02: THE PROBLEM (DIAGNÓSTICO DEL PAPEL)
               ===================================================== */}
            <section 
              id="chapter-slide-1"
              className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-8"
            >
              <div className="space-y-3">
                <span className="text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-rose-400">
                  {chapters[1].badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
                  {chapters[1].headlineMain} <br className="hidden sm:inline" />
                  <span className="text-rose-400">{chapters[1].headlineGradient}</span>
                </h2>
                <p className="text-base sm:text-lg text-[#86868b] max-w-2xl font-normal leading-relaxed">
                  {chapters[1].description}
                </p>
              </div>

              {/* Before vs After Schematic */}
              <BrokenWorkflowSchematic lang={currentLang} />

              {/* Enterprise Impact Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-6 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-4xl sm:text-5xl font-black text-rose-400 tracking-tight font-display">{t.problem.stat1}</div>
                  <div className="text-sm font-bold text-white mt-2">{t.problem.stat1Label}</div>
                  <div className="text-xs text-[#86868b] mt-1">{t.problem.stat1Sub}</div>
                </div>

                <div className="p-6 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight font-display">{t.problem.stat2}</div>
                  <div className="text-sm font-bold text-white mt-2">{t.problem.stat2Label}</div>
                  <div className="text-xs text-[#86868b] mt-1">{t.problem.stat2Sub}</div>
                </div>

                <div className="p-6 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">{t.problem.stat3}</div>
                  <div className="text-sm font-bold text-white mt-2">{t.problem.stat3Label}</div>
                  <div className="text-xs text-[#86868b] mt-1">{t.problem.stat3Sub}</div>
                </div>
              </div>
            </section>

            {/* =====================================================
                SLIDE 03: THE SOLUTION (ARQUITECTURA RESILIENTE)
               ===================================================== */}
            <section 
              id="chapter-slide-2"
              className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-8"
            >
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-sky-400">
                  {chapters[2].badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
                  {chapters[2].headlineMain} <br />
                  <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    {chapters[2].headlineGradient}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-[#86868b] font-normal leading-relaxed">
                  {chapters[2].description}
                </p>
              </div>

              {/* Data Flow Diagram (Site ↔ Cloud ↔ Office) */}
              <SiteCloudOfficeDiagram lang={currentLang} />
            </section>

            {/* =====================================================
                SLIDE 04: CORE SERVICES (CAPACIDADES OPERATIVAS)
               ===================================================== */}
            <section 
              id="chapter-slide-3"
              className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-8"
            >
              <div className="space-y-3">
                <span className="text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-orange-400">
                  {chapters[3].badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white">
                  {chapters[3].headlineMain}
                </h2>
                <p className="text-base sm:text-lg text-[#86868b] max-w-2xl font-normal leading-relaxed">
                  {chapters[3].description}
                </p>
              </div>

              {/* 6 Clean Modular Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {t.services.items.map((card, i) => {
                  const icons = [FileSpreadsheet, Clock, FileText, ShieldCheck, History, Radio];
                  const Icon = icons[i] || FileSpreadsheet;
                  const colors = ['text-orange-400', 'text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-purple-400', 'text-sky-400'];
                  const color = colors[i] || 'text-orange-400';

                  return (
                    <div
                      key={i}
                      className="p-6 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl hover:border-orange-500/40 transition-all duration-300 space-y-3 group shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono text-[#86868b] uppercase tracking-wider">{card.tag}</span>
                      </div>

                      <div>
                        <div className={`text-2xl font-black tracking-tight font-display ${color}`}>{card.metric}</div>
                        <div className="text-[10px] font-mono text-[#86868b] uppercase tracking-wider">{card.metricLabel}</div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">{card.title}</h3>
                        <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">{card.desc}</p>
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

            {/* =====================================================
                SLIDE 05: TECH STACK (INGENIERÍA & ARQUITECTURA)
               ===================================================== */}
            <section 
              id="chapter-slide-4"
              className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-8"
            >
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-blue-400">
                  {chapters[4].badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white">
                  {chapters[4].headlineMain} <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent">
                    {chapters[4].headlineGradient}
                  </span>
                </h2>
                <p className="text-base text-[#86868b] font-normal leading-relaxed">
                  {chapters[4].description}
                </p>
              </div>

              {/* Interactive Tech Module Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { id: 'react19', name: 'React 19', role: 'Concurrent UI', badge: 'v19.0' },
                  { id: 'ts', name: 'TypeScript', role: 'Invariants Engine', badge: 'v5.7' },
                  { id: 'firebase', name: 'Firebase Sync', role: 'Realtime Docs', badge: 'Firestore' },
                  { id: 'cloudsql', name: 'Cloud SQL', role: 'PostgreSQL Relational', badge: 'Drizzle' },
                  { id: 'maps', name: 'Google Maps', role: 'GPS Geofencing', badge: 'Platform API' },
                  { id: 'gemini', name: 'Gemini 2.5', role: 'Field AI Engine', badge: '@google/genai' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedTechPill(item.id);
                      presentationAudio.playTick();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTechPill === item.id
                        ? 'bg-blue-500/15 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-[#121215]/80 border-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-blue-400 font-bold block">{item.badge}</span>
                    <div className="text-sm font-bold text-white mt-1">{item.name}</div>
                    <div className="text-[10px] text-[#86868b] mt-0.5">{item.role}</div>
                  </button>
                ))}
              </div>

              {/* Selected Tech Card */}
              <div className="p-8 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                {t.tech.details[selectedTechPill] && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      {t.tech.details[selectedTechPill].category}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {t.tech.details[selectedTechPill].title}
                    </h3>
                    <p className="text-sm text-[#86868b] leading-relaxed">
                      {t.tech.details[selectedTechPill].desc}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =====================================================
                SLIDE 06: BENEFITS & MULTI-TENANT RBAC
               ===================================================== */}
            <section 
              id="chapter-slide-5"
              className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-8"
            >
              <div className="space-y-3">
                <span className="text-[12px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400">
                  {chapters[5].badge}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white">
                  {chapters[5].headlineMain}
                </h2>
                <p className="text-base sm:text-lg text-[#86868b] max-w-2xl font-normal leading-relaxed">
                  {chapters[5].description}
                </p>
              </div>

              {/* 4 Stakeholder Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t.benefits.roles.map((role, idx) => {
                  const colors = ['text-orange-400', 'text-sky-400', 'text-emerald-400', 'text-purple-400'];
                  const color = colors[idx] || 'text-orange-400';

                  return (
                    <div key={idx} className="p-6 rounded-3xl bg-[#121215]/80 border border-white/[0.08] backdrop-blur-2xl space-y-2.5 shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{role.role}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{role.pill}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{role.title}</h3>
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

            {/* =====================================================
                SLIDE 07: CLOSING CALL TO ACTION
               ===================================================== */}
            <section 
              id="chapter-slide-6"
              className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 py-20 relative"
            >
              <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-[0_0_50px_rgba(255,102,0,0.4)]">
                  <HardHat className="w-8 h-8" />
                </div>

                <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.04em] text-white leading-tight">
                  {chapters[6].headlineMain} <br />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent">
                    {chapters[6].headlineGradient}
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-[#86868b] max-w-xl mx-auto font-normal leading-relaxed">
                  {chapters[6].description}
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={triggerCtaBurst}
                    className="h-13 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-all cursor-pointer min-w-[240px] flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.cta.primaryButton}</span>
                  </button>

                  <button
                    onClick={() => {
                      presentationAudio.playTick();
                      onClose();
                    }}
                    className="h-13 px-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-semibold text-sm tracking-wide transition-all cursor-pointer min-w-[200px] flex items-center justify-center gap-2"
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
        <footer className="relative z-40 px-6 py-3.5 backdrop-blur-2xl bg-[#09090b]/80 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#86868b] shrink-0 font-mono">
          {/* Chapter Status */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#f5f5f7] font-bold text-[11px]">
              {chapters[currentChapter]?.num} // {chapters[currentChapter]?.navTitle}
            </span>
          </div>

          {/* Navigation Controls & Keyboard Hints */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              title="Capítulo anterior [Flecha Izquierda]"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-[11px] text-[#86868b] font-bold">
              {currentChapter + 1} / {chapters.length}
            </span>

            <button
              onClick={() => goToChapter(Math.min(chapters.length - 1, currentChapter + 1))}
              disabled={currentChapter === chapters.length - 1}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              title="Siguiente capítulo [Flecha Derecha o Espacio]"
              aria-label="Siguiente capítulo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="hidden sm:inline text-[10px] text-[#86868b] pl-2 border-l border-white/10">
              {t.nav.keyboardHint}
            </span>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
