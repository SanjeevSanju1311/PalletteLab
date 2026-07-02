import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Copy,
  Download,
  Palette,
  MousePointer2,
  Zap,
  Share2,
  Check,
  ArrowRight,
  Layers,
  Accessibility,
  Code,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Info,
  Users,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { getColor, getPalette } from "colorthief";
import confetti from "canvas-confetti";
import {
  rgbToHex,
  rgbToHsl,
  getContrastColor,
  getColorName,
  getTailwindSuggestion,
  detectGradient,
  cn
} from "./lib/colorUtils";
const FAQ_ITEMS = [
  { q: "How does the color detection work?", a: "We use advanced algorithms to analyze the pixel data of your images directly in your browser. No data is sent to any server, ensuring your privacy." },
  { q: "Can it detect gradients?", a: "Yes! PaletteLab analyzes the color distribution across the image to identify linear gradients and generates the corresponding CSS code." },
  { q: "Is it free to use?", a: "Absolutely. PaletteLab is an open-source tool built for the design and development community." },
  { q: "What image formats are supported?", a: "We support all standard web formats including PNG, JPG, WebP, and SVG." }
];
const STEPS = [
  { title: "Upload", desc: "Drag and drop or paste your image into the workspace.", icon: <Upload className="w-6 h-6" /> },
  { title: "Analyze", desc: "Our engine extracts dominant colors and detects gradients instantly.", icon: <Zap className="w-6 h-6" /> },
  { title: "Refine", desc: "Use the precision picker to sample specific pixels if needed.", icon: <MousePointer2 className="w-6 h-6" /> },
  { title: "Export", desc: "Copy HEX, RGB, or export the entire palette as JSON/CSS.", icon: <Download className="w-6 h-6" /> }
];
const ThemeToggle = ({ theme, toggle }) => <button
  onClick={toggle}
  className="p-2 rounded-xl glass hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95"
  aria-label="Toggle Theme"
>
    {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
  </button>;
const SectionHeader = ({ title, subtitle, id }) => <div id={id} className="text-center mb-16 scroll-mt-24">
    <motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="text-4xl md:text-5xl font-display font-bold mb-4"
>
      {title}
    </motion.h2>
    <motion.p
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.1 }}
  className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg"
>
      {subtitle}
    </motion.p>
  </div>;
const InfiniteScrollText = () => {
  const texts = ["EXTRACT PALETTES", "DETECT GRADIENTS", "ACCESSIBILITY AUDIT", "EXPORT CSS", "DESIGN SMART", "COLOR HARMONY"];
  return <div className="py-14 bg-linear-to-r from-[#124e66] via-[#212a31] to-[#1c4a5c] overflow-hidden flex whitespace-nowrap border-y border-[#d3dadc]/20 shadow-inner relative">
      {
    /* Dynamic ambient background glow */
  }
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
      
      <motion.div
    animate={{ x: [0, -1e3] }}
    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    className="flex gap-16 items-center"
  >
        {[...texts, ...texts, ...texts].map((text, i) => <div key={i} className="flex items-center gap-16">
            <span className={cn(
    "text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter select-none transition-all",
    i % 2 === 0 ? "text-[#f4f6f6] drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]" : "text-transparent [-webkit-text-stroke:1px_rgba(244,246,246,0.4)]"
  )}>
              {text}
            </span>
            <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    className="w-4 h-4 bg-linear-to-tr from-[#748d92] to-[#8ec2d3] border border-white/20 shrink-0 shadow-[0_0_12px_rgba(116,141,146,0.5)] rotate-45"
  />
          </div>)}
      </motion.div>
    </div>;
};
const LoadingScreen = ({ theme }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 32);
    return () => clearInterval(interval);
  }, []);
  const CALIBRATION_COLORS = [
    { hex: "#EF4444", label: "RED-400" },
    { hex: "#F97316", label: "ORN-400" },
    { hex: "#FBBF24", label: "YEL-400" },
    { hex: "#10B981", label: "GRN-400" },
    { hex: "#06B6D4", label: "CYN-400" },
    { hex: "#3B82F6", label: "BLU-400" },
    { hex: "#6366F1", label: "IND-400" },
    { hex: "#8B5CF6", label: "PUR-400" }
  ];
  const isDark = theme === "dark";
  return <motion.div
    key="app-loader"
    initial={{ opacity: 1 }}
    exit={{
      opacity: 0,
      scale: 1.05,
      filter: "blur(8px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }}
    className={cn(
      "fixed inset-0 z-9999 flex flex-col items-center justify-center transition-colors duration-500",
      isDark ? "bg-[#070b0e] text-[#f4f6f6]" : "bg-[#f4f6f6] text-zinc-900"
    )}
  >
      {
    /* Decorative vector background */
  }
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full animate-pulse transition-colors duration-500",
    isDark ? "bg-[radial-gradient(circle_at_center,rgba(18,78,102,0.15),transparent_70%)]" : "bg-[radial-gradient(circle_at_center,rgba(116,141,146,0.15),transparent_70%)]"
  )} />
        
        {
    /* Colorful dynamic auroral gradients floating around */
  }
        <motion.div
    animate={{
      x: [0, 40, -20, 0],
      y: [0, -30, 20, 0],
      rotate: [0, 90, 180, 360]
    }}
    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    className={cn(
      "absolute -top-1/4 -left-1/4 w-[600px] h-[600px] blur-[130px] rounded-full transition-colors duration-500",
      isDark ? "bg-linear-to-tr from-[#124e66]/10 to-[#748d92]/10" : "bg-linear-to-tr from-[#124e66]/5 to-[#748d92]/5"
    )}
  />
        <motion.div
    animate={{
      x: [0, -50, 30, 0],
      y: [0, 40, -30, 0],
      rotate: [360, 180, 90, 0]
    }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    className={cn(
      "absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-500",
      isDark ? "bg-linear-to-bl from-[#8ec2d3]/10 to-[#124e66]/5" : "bg-linear-to-bl from-[#8ec2d3]/5 to-[#124e66]/5"
    )}
  />
      </div>

      {
    /* Decorative Matrix Grid Dots */
  }
      <div
    className={cn(
      "absolute inset-0 pointer-events-none transition-opacity duration-500",
      isDark ? "opacity-[0.03]" : "opacity-[0.04]"
    )}
    style={{
      backgroundImage: `radial-gradient(${isDark ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
      backgroundSize: "24px 24px"
    }}
  />

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
        
        {
    /* --- Custom Prism & Light Refraction Graphic --- */
  }
        <div className="relative w-80 h-48 mb-6 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200">
            {
    /* Incident light beam from the left */
  }
            <motion.line
    x1="10"
    y1="110"
    x2="110"
    y2="85"
    stroke={isDark ? "#ffffff" : "#124e66"}
    strokeWidth="2.5"
    strokeLinecap="round"
    className={isDark ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" : "drop-shadow-[0_0_8px_rgba(18,78,102,0.4)]"}
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
  />
            
            {
    /* Refracted line inside the prism */
  }
            {progress > 15 && <motion.line
    x1="110"
    y1="85"
    x2="130"
    y2="95"
    stroke={isDark ? "rgba(255,255,255,0.7)" : "rgba(18,78,102,0.7)"}
    strokeWidth="2"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.5 }}
  />}

            {
    /* Glowing Refracted Spectrum (Emerging from X=130, Y=95 to X=300 on the right) */
  }
            {
    /* Violet/Indigo Beam (most refracted) */
  }
            <motion.path
    d="M 130,95 Q 210,135 300,165"
    stroke="#8B5CF6"
    strokeWidth={2.5 + progress / 60}
    strokeLinecap="round"
    strokeOpacity={progress > 20 ? Math.min(1, (progress - 20) / 40) : 0}
    className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: progress > 20 ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  />

            {
    /* Blue Beam */
  }
            <motion.path
    d="M 130,95 Q 210,115 300,135"
    stroke="#3B82F6"
    strokeWidth={2.5 + progress / 60}
    strokeLinecap="round"
    strokeOpacity={progress > 35 ? Math.min(1, (progress - 35) / 40) : 0}
    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: progress > 35 ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  />

            {
    /* Green Beam */
  }
            <motion.path
    d="M 130,95 Q 210,100 300,105"
    stroke="#10B981"
    strokeWidth={2.5 + progress / 60}
    strokeLinecap="round"
    strokeOpacity={progress > 50 ? Math.min(1, (progress - 50) / 40) : 0}
    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: progress > 50 ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  />

            {
    /* Orange Beam */
  }
            <motion.path
    d="M 130,95 Q 210,85 300,75"
    stroke="#F97316"
    strokeWidth={2.5 + progress / 60}
    strokeLinecap="round"
    strokeOpacity={progress > 65 ? Math.min(1, (progress - 65) / 35) : 0}
    className="drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: progress > 65 ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  />

            {
    /* Red Beam (least refracted) */
  }
            <motion.path
    d="M 130,95 Q 210,70 300,45"
    stroke="#EF4444"
    strokeWidth={2.5 + progress / 60}
    strokeLinecap="round"
    strokeOpacity={progress > 80 ? Math.min(1, (progress - 80) / 20) : 0}
    className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: progress > 80 ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  />

            {
    /* Glass Prism Triangle */
  }
            <polygon
    points="130,45 175,125 85,125"
    fill="url(#prism-body-grad)"
    stroke={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(18, 78, 102, 0.4)"}
    strokeWidth="2"
    className="drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
  />
            {
    /* Highlight on the prism edge */
  }
            <polyline
    points="130,45 85,125"
    stroke={isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(18, 78, 102, 0.8)"}
    strokeWidth="1.5"
    fill="none"
  />

            <defs>
              <linearGradient id="prism-body-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isDark ? "rgba(18, 78, 102, 0.4)" : "rgba(142, 194, 211, 0.4)"} />
                <stop offset="50%" stopColor={isDark ? "rgba(116, 141, 146, 0.2)" : "rgba(116, 141, 146, 0.15)"} />
                <stop offset="100%" stopColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(18, 78, 102, 0.05)"} />
              </linearGradient>
            </defs>
          </svg>

          {
    /* Glowing dot inside the prism */
  }
          <div className={cn(
    "absolute top-[48%] left-[41%] w-3 h-3 rounded-full blur-[2px] animate-ping",
    isDark ? "bg-white/80" : "bg-[#124e66]/80"
  )} />
        </div>

        {
    /* Brand Display */
  }
        <div className="mb-6">
          <motion.h1
    initial={{ opacity: 0, letterSpacing: "-0.05em" }}
    animate={{ opacity: 1, letterSpacing: "0.02em" }}
    transition={{ duration: 0.8 }}
    className={cn(
      "text-4xl font-display font-extrabold flex items-center justify-center gap-2 transition-colors duration-500",
      isDark ? "text-white" : "text-zinc-900"
    )}
  >
            <Palette className="w-8 h-8 text-[#8ec2d3] animate-pulse" />
            <span>Palette<span className="text-transparent bg-clip-text bg-linear-to-r from-[#8ec2d3] to-blue-500">Lab</span></span>
          </motion.h1>
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.6 }}
    transition={{ delay: 0.2 }}
    className={cn(
      "text-[10px] font-mono tracking-[0.4em] uppercase mt-2 font-semibold transition-colors duration-500",
      isDark ? "text-[#748d92]" : "text-zinc-500"
    )}
  >
            Spectrum Analyzer & Harmonizer
          </motion.p>
        </div>

        {
    /* --- Calibration Matrix Grid --- */
  }
        <div className={cn(
    "grid grid-cols-8 gap-2 w-full max-w-sm mb-6 p-3 rounded-2xl backdrop-blur-md transition-all duration-500",
    isDark ? "bg-zinc-950/40 border border-zinc-850/50" : "bg-white/75 border border-zinc-200 shadow-md"
  )}>
          {CALIBRATION_COLORS.map((col, index) => {
    const isCalibrated = progress >= (index + 1) * 12.5;
    const isCalibrating = progress >= index * 12.5 && progress < (index + 1) * 12.5;
    return <div key={index} className="flex flex-col items-center gap-1">
                <motion.div
      animate={{
        scale: isCalibrating ? [1, 1.15, 1] : 1,
        boxShadow: isCalibrated ? `0 0 10px ${col.hex}60` : "none"
      }}
      transition={{
        repeat: isCalibrating ? Infinity : 0,
        duration: 1.2
      }}
      className={cn(
        "w-full aspect-square rounded-lg border-2 transition-all duration-300",
        isCalibrated ? "border-transparent" : isCalibrating ? "border-[#8ec2d3] scale-105" : isDark ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-100/50"
      )}
      style={{
        backgroundColor: isCalibrated ? col.hex : void 0
      }}
    />
                <span className={cn(
      "text-[8px] font-mono tracking-tight transition-colors duration-500",
      isCalibrated ? isDark ? "text-zinc-300 font-semibold" : "text-zinc-700 font-semibold" : isCalibrating ? "text-[#8ec2d3] font-bold animate-pulse" : isDark ? "text-zinc-600" : "text-zinc-400"
    )}>
                  {isCalibrated ? col.label.split("-")[0] : isCalibrating ? "CAL" : "..."}
                </span>
              </div>;
  })}
        </div>

        {
    /* Progress Info & Bar */
  }
        <div className="w-72 mb-5">
          <div className="flex items-center justify-end mb-1 text-[10px] font-mono transition-colors duration-500">
            <span className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>{progress}%</span>
          </div>
          
          <div className={cn(
    "h-1.5 w-full rounded-full overflow-hidden p-[2px] border transition-all duration-500",
    isDark ? "bg-zinc-900 border-zinc-800/40" : "bg-zinc-200 border-zinc-300"
  )}>
            <motion.div
    className="h-full rounded-full bg-linear-to-r from-red-500 via-amber-400 via-emerald-400 via-blue-500 to-purple-600"
    style={{ width: `${progress}%` }}
    layout
  />
          </div>
        </div>



      </div>
    </motion.div>;
};
const Navbar = ({ onStart, theme, toggleTheme, view }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      const sections = ["home", "about", "services", "steps", "faq"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "steps", label: "How it works" },
    { id: "faq", label: "FAQ" }
  ];
  const isVisible = view === "tool" || isScrolled;
  return <nav className={cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6",
    isVisible ? "translate-y-0 opacity-100 py-3 glass shadow-xl" : "-translate-y-full opacity-0 py-6 bg-transparent pointer-events-none"
  )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div
    className="flex items-center gap-2 cursor-pointer group"
    onClick={() => {
      window.location.hash = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            PaletteLab
          </span>
        </div>

        {
    /* Desktop Nav */
  }
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50">
          {navLinks.map((link) => <a
    key={link.id}
    href={`#${link.id}`}
    className={cn(
      "px-5 py-2 rounded-xl text-sm font-bold transition-all relative group",
      activeSection === link.id ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
    )}
  >
              {link.label}
              {activeSection === link.id && <motion.div
    layoutId="nav-active"
    className="absolute inset-0 rounded-xl border border-blue-500/20 dark:border-blue-400/20"
  />}
            </a>)}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button
    onClick={onStart}
    className="hidden sm:flex px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20 items-center gap-2"
  >
            Launch Tool <Zap className="w-4 h-4" />
          </button>
          
          {
    /* Mobile Menu Toggle */
  }
          <button
    className="lg:hidden p-2 rounded-xl glass"
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={cn("w-full h-0.5 bg-current transition-all", isMobileMenuOpen ? "rotate-45 translate-y-2" : "")} />
              <span className={cn("w-full h-0.5 bg-current transition-all", isMobileMenuOpen ? "opacity-0" : "")} />
              <span className={cn("w-full h-0.5 bg-current transition-all", isMobileMenuOpen ? "-rotate-45 -translate-y-2" : "")} />
            </div>
          </button>
        </div>
      </div>

      {
    /* Mobile Menu */
  }
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="lg:hidden absolute top-full left-0 right-0 glass border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
  >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => <a
    key={link.id}
    href={`#${link.id}`}
    onClick={() => setIsMobileMenuOpen(false)}
    className={cn(
      "text-lg font-bold transition-colors",
      activeSection === link.id ? "text-blue-600" : "text-zinc-500"
    )}
  >
                  {link.label}
                </a>)}
              <button
    onClick={() => {
      onStart();
      setIsMobileMenuOpen(false);
    }}
    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-center"
  >
                Launch Tool
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </nav>;
};
const LandingPage = ({ onStart }) => <div className="min-h-screen overflow-hidden">
    {
  /* Hero Section */
}
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 pb-24 px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden flex justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5" />
            The Designer's Secret Weapon
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold leading-[0.9] mb-8 tracking-tighter">
            Master Your <br />
            <span className="gradient-text">Color Palette</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Extract stunning palettes, detect complex gradients, and ensure perfect accessibility. All in one professional tool, right in your browser.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
  onClick={onStart}
  className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-600/30"
>
              Start Creating <ArrowRight className="w-6 h-6" />
            </button>
            <a
  href="#about"
  className="px-10 py-5 rounded-2xl glass font-bold text-xl flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
>
              Learn More
            </a>
          </div>
        </motion.div>
      </div>
    </section>


    {
  /* About Section */
}
    <section id="about" className="section-padding px-6 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
>
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-8">
            <Info className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for the Modern Web.</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-8 leading-relaxed">
            PaletteLab was born from the need for a faster, more precise way to handle colors in web projects. We believe that color is the soul of design, and extracting it shouldn't be a chore.
          </p>
          <ul className="space-y-4">
            {[
  "Privacy-first: No images ever leave your device.",
  "Developer-focused: Direct export to CSS and JSON.",
  "Designer-friendly: High-fidelity color sampling."
].map((item, i) => <li key={i} className="flex items-center gap-3 font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                {item}
              </li>)}
          </ul>
        </motion.div>
        <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  className="relative"
>
          <div className="aspect-video rounded-[2.5rem] bg-linear-to-br from-blue-600 to-purple-600 p-1 shadow-2xl">
            <div className="w-full h-full rounded-[2.4rem] bg-white dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
              <img src="/image.png" alt="About PaletteLab" className="w-full h-full object-cover rounded-[2.4rem]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {
  /* Services Section */
}
    <section id="services" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
  title="Our Services"
  subtitle="Comprehensive tools designed to streamline your creative workflow."
/>
        <div className="grid md:grid-cols-3 gap-8">
          {[
  { icon: <Palette />, title: "Palette Extraction", desc: "Instantly pull dominant and accent colors from any image." },
  { icon: <Layers />, title: "Gradient Analysis", desc: "Detect complex gradients and get ready-to-use CSS code." },
  { icon: <Accessibility />, title: "Accessibility Audit", desc: "Check WCAG contrast ratios to ensure your designs are inclusive." },
  { icon: <Code />, title: "Developer Export", desc: "Export to JSON, CSS, or Tailwind classes with one click." },
  { icon: <MousePointer2 />, title: "Precision Picking", desc: "Sample specific pixels with our high-zoom color picker." },
  { icon: <Share2 />, title: "Cloud Sharing", desc: "Generate shareable links for your palettes and color findings." }
].map((s, i) => <motion.div
  key={i}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: i * 0.1 }}
  className="p-8 rounded-3xl glass-card hover:border-blue-500/30 transition-all group"
>
              <div className="w-14 h-14 rounded-2xl bg-blue-600/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {React.cloneElement(s.icon, { className: "w-7 h-7 text-blue-600" })}
              </div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>)}
        </div>
      </div>
    </section>

    {
  /* Steps Section */
}
    <section id="steps" className="section-padding px-6 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
  title="How it Works"
  subtitle="Four simple steps to color perfection."
/>
        <div className="grid md:grid-cols-4 gap-12 relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          {STEPS.map((step, i) => <motion.div
  key={i}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: i * 0.1 }}
  className="text-center relative"
>
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-lg text-blue-600 relative z-10">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 md:mb-0">{step.desc}</p>

              {
  /* Desktop Horizontal Animated Flow Arrow */
}
              {i < STEPS.length - 1 && <div className="absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-2rem)] hidden md:flex justify-center items-center pointer-events-none z-20">
                  <div className="flex items-center gap-0.5 bg-white dark:bg-zinc-900 px-2 py-1 rounded-full shadow-md border border-zinc-200/60 dark:border-zinc-800/60">
                    {[0, 1, 2].map((index) => <motion.div
  key={index}
  animate={{
    opacity: [0.25, 1, 0.25],
    x: [0, 3, 0]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    delay: index * 0.2,
    ease: "easeInOut"
  }}
>
                        <ChevronRight className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                      </motion.div>)}
                  </div>
                </div>}

              {
  /* Mobile Vertical Animated Flow Arrow */
}
              {i < STEPS.length - 1 && <div className="flex md:hidden justify-center items-center py-4 pointer-events-none">
                  <div className="flex flex-col items-center gap-0.5 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-md border border-zinc-200/60 dark:border-zinc-800/60">
                    {[0, 1, 2].map((index) => <motion.div
  key={index}
  animate={{
    opacity: [0.25, 1, 0.25],
    y: [0, 3, 0]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    delay: index * 0.2,
    ease: "easeInOut"
  }}
>
                        <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                      </motion.div>)}
                  </div>
                </div>}
            </motion.div>)}
        </div>
      </div>
    </section>

    {
  /* Benefits & Use Cases */
}
    <section className="section-padding px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Users className="w-3 h-3" /> Who Benefits
          </div>
          <h2 className="text-4xl font-display font-bold mb-12">Designed for Creators.</h2>
          <div className="space-y-8">
            {[
  { title: "UI/UX Designers", desc: "Extract palettes from inspiration images to kickstart your next project." },
  { title: "Frontend Developers", desc: "Get exact HEX codes and CSS variables without opening Photoshop." },
  { title: "Content Creators", desc: "Maintain brand consistency across your social media and marketing assets." }
].map((b, i) => <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{b.title}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">{b.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Lightbulb className="w-3 h-3" /> Use Cases
          </div>
          <h2 className="text-4xl font-display font-bold mb-12">Endless Possibilities.</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
  "Brand Identity Design",
  "Website Color Audits",
  "Moodboard Creation",
  "Accessibility Testing",
  "Marketing Collateral",
  "App Theme Generation"
].map((u, i) => <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                {u}
              </div>)}
          </div>
        </div>
      </div>
    </section>

    {
  /* FAQ Section */
}
    <section id="faq" className="section-padding px-6 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
  title="Common Questions"
  subtitle="Everything you need to know about PaletteLab."
/>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => <details key={i} className="group p-6 rounded-3xl glass-card cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-lg list-none">
                {item.q}
                <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {item.a}
              </p>
            </details>)}
        </div>
      </div>
    </section>

    {
  /* CTA Section */
}
    <section className="section-padding px-6">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-linear-to-br from-blue-600 to-purple-700 p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Ready to transform <br /> your workflow?</h2>
        <button
  onClick={onStart}
  className="px-10 py-5 rounded-2xl bg-white text-blue-600 font-bold text-xl hover:bg-zinc-100 transition-all active:scale-95 shadow-xl"
>
          Launch PaletteLab Now
        </button>
      </div>
    </section>
  </div>;
const ColorTool = () => {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [isPicking, setIsPicking] = useState(false);
  const [pickedColor, setPickedColor] = useState(null);
  const [copied, setCopied] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [magnifier, setMagnifier] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const activeColor = pickedColor || results?.dominant;
  const syncCanvas = useCallback(() => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx?.drawImage(img, 0, 0);
    }
  }, []);
  useEffect(() => {
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);
  const processImage = useCallback(async (imgUrl) => {
    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = async () => {
      try {
        const dominantColor = await getColor(img);
        const paletteColors = await getPalette(img, { colorCount: 6 });
        if (!dominantColor || !paletteColors) {
          console.error("Failed to extract colors");
          return;
        }
        const dominantRgb = dominantColor.rgb();
        const dominant = {
          hex: dominantColor.hex(),
          rgb: dominantRgb,
          hsl: dominantColor.hsl(),
          name: getColorName(dominantColor.hex()),
          contrast: getContrastColor(dominantRgb.r, dominantRgb.g, dominantRgb.b),
          tailwind: getTailwindSuggestion(dominantColor.hex())
        };
        const palette = paletteColors.map((c) => {
          const rgb = c.rgb();
          return {
            hex: c.hex(),
            rgb,
            hsl: c.hsl(),
            name: getColorName(c.hex()),
            contrast: getContrastColor(rgb.r, rgb.g, rgb.b),
            tailwind: getTailwindSuggestion(c.hex())
          };
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const gradient = detectGradient(canvas);
          setResults({ dominant, palette, gradient: gradient || void 0 });
        } else {
          setResults({ dominant, palette });
        }
        setImage(imgUrl);
        window.location.hash = dominant.hex;
      } catch (err) {
        console.error("Error processing image:", err);
      } finally {
        setIsLoading(false);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image");
      setIsLoading(false);
    };
  }, []);
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [processImage]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e2) => {
                if (e2.target?.result) {
                  processImage(e2.target.result);
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processImage]);
  const handleCanvasMouseMove = (e) => {
    if (!isPicking || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setMagnifier({ x: e.clientX - rect.left, y: e.clientY - rect.top, color: hex });
    }
  };
  const handleCanvasClick = (e) => {
    if (!isPicking || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      const info = {
        hex,
        rgb: { r: pixel[0], g: pixel[1], b: pixel[2] },
        hsl: rgbToHsl(pixel[0], pixel[1], pixel[2]),
        name: getColorName(hex),
        contrast: getContrastColor(pixel[0], pixel[1], pixel[2]),
        tailwind: getTailwindSuggestion(hex)
      };
      setPickedColor(info);
      setIsPicking(false);
      setMagnifier(null);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: [hex]
      });
    }
  };
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2e3);
  };
  const exportPalette = (format) => {
    if (!results) return;
    if (format === "json") {
      const data = JSON.stringify(results, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palette.json";
      a.click();
    } else if (format === "css") {
      let css = `:root {
`;
      results.palette.forEach((c, i) => {
        css += `  --color-${i + 1}: ${c.hex};
`;
      });
      if (results.gradient) {
        css += `  --gradient: ${results.gradient.css};
`;
      }
      css += `}`;
      const blob = new Blob([css], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palette.css";
      a.click();
    } else if (format === "png") {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cellWidth = canvas.width / results.palette.length;
        results.palette.forEach((c, i) => {
          ctx.fillStyle = c.hex;
          ctx.fillRect(i * cellWidth, 0, cellWidth, 500);
          ctx.fillStyle = c.contrast.text === "white" ? "#ffffff" : "#000000";
          ctx.font = "bold 24px Inter";
          ctx.textAlign = "center";
          ctx.fillText(c.hex.toUpperCase(), i * cellWidth + cellWidth / 2, 450);
        });
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Outfit";
        ctx.textAlign = "left";
        ctx.fillText("PaletteLab Palette", 50, 580);
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "palette.png";
        a.click();
      }
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: results.palette.map((c) => c.hex)
    });
  };
  return <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center relative overflow-hidden">
      {
    /* Dynamic Background */
  }
      {activeColor && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.05 }}
    className="fixed inset-0 -z-10 pointer-events-none"
    style={{ backgroundColor: activeColor.hex }}
  />}

      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <button
    onClick={() => window.location.hash = ""}
    className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors font-bold"
  >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </button>
          {image && <button
    onClick={() => {
      setImage(null);
      setResults(null);
      setPickedColor(null);
      window.location.hash = "";
    }}
    className="px-4 py-2 rounded-xl glass text-sm font-bold hover:bg-red-500/10 hover:text-red-500 transition-all"
  >
              Reset Tool
            </button>}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? <motion.div
    key="loader"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem]"
  >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <Palette className="absolute inset-0 m-auto w-10 h-10 text-blue-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Analyzing Image</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Extracting colors and detecting gradients...</p>
            </motion.div> : !image ? <motion.div
    key="uploader"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-4xl mx-auto"
  >
              <div
    {...getRootProps()}
    className={cn(
      "relative group cursor-pointer rounded-[3rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-12 md:p-20 text-center overflow-hidden",
      isDragActive ? "border-blue-500 bg-blue-500/5 scale-[0.99]" : "border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5"
    )}
  >
                <input {...getInputProps()} />
                <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
                  <div className="relative w-full h-full rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-display font-bold mb-4">Drop your image here</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mb-8">
                  Drag and drop, browse from your files, or simply <span className="text-blue-600 font-bold">paste (Ctrl+V)</span> a screenshot.
                </p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <span className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">PNG</span>
                  <span className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">JPG</span>
                  <span className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">WEBP</span>
                </div>
              </div>
            </motion.div> : <motion.div
    key="results"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid lg:grid-cols-12 gap-8"
  >
              {
    /* Left Column: Image & Picker */
  }
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="glass-card rounded-[2.5rem] p-4 relative overflow-hidden group">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
    ref={imageRef}
    src={image}
    alt="Uploaded"
    className="w-full h-full object-contain"
    onLoad={syncCanvas}
  />
                    <canvas
    ref={canvasRef}
    onClick={handleCanvasClick}
    onMouseMove={handleCanvasMouseMove}
    onMouseLeave={() => setMagnifier(null)}
    className={cn(
      "absolute inset-0 w-full h-full cursor-crosshair",
      isPicking ? "opacity-100 z-10" : "opacity-0 -z-10"
    )}
  />
                    
                    {isPicking && magnifier && <div
    className="absolute pointer-events-none z-20 w-16 h-16 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden"
    style={{
      left: magnifier.x - 32,
      top: magnifier.y - 32,
      backgroundColor: magnifier.color
    }}
  >
                        <div className="w-1 h-1 bg-white rounded-full shadow-sm" />
                      </div>}

                    {isPicking && !magnifier && <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="px-4 py-2 rounded-full bg-black/80 text-white text-xs font-bold backdrop-blur-md">
                          Click anywhere to pick a color
                        </div>
                      </div>}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <button
    onClick={() => setIsPicking(!isPicking)}
    className={cn(
      "px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95",
      isPicking ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "glass hover:bg-zinc-100 dark:hover:bg-zinc-800"
    )}
  >
                      <MousePointer2 className="w-4 h-4" />
                      {isPicking ? "Cancel Picking" : "Pick from Image"}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => exportPalette("json")} className="p-3 rounded-xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" title="Export JSON"><Code className="w-5 h-5" /></button>
                      <button onClick={() => exportPalette("css")} className="p-3 rounded-xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" title="Export CSS"><Layers className="w-5 h-5" /></button>
                      <button onClick={() => exportPalette("png")} className="p-3 rounded-xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" title="Export PNG"><Download className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                {
    /* Palette Grid */
  }
                {results && <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {results.palette.map((color, i) => <motion.button
    key={i}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
    onClick={() => setPickedColor(color)}
    className={cn(
      "aspect-square rounded-2xl border-4 transition-all overflow-hidden relative group",
      activeColor?.hex === color.hex ? "border-blue-500 scale-105 shadow-xl" : "border-transparent hover:scale-105"
    )}
    style={{ backgroundColor: color.hex }}
  >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                      </motion.button>)}
                  </div>}
              </div>

              {
    /* Right Column: Info Panel */
  }
              <div className="lg:col-span-5 flex flex-col gap-6">
                {activeColor && <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="glass-card rounded-[2.5rem] p-8 flex flex-col gap-8"
  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-3xl font-display font-bold mb-1">{activeColor.name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm uppercase tracking-widest">{activeColor.hex}</p>
                      </div>
                      <div
    className="w-16 h-16 rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-800"
    style={{ backgroundColor: activeColor.hex }}
  />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
    onClick={() => copyToClipboard(activeColor.hex, "HEX")}
    className="p-4 rounded-2xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left relative group"
  >
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">HEX</div>
                        <div className="font-mono font-bold">{activeColor.hex}</div>
                        <Copy className="absolute top-4 right-4 w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {copied === "HEX" && <div className="absolute inset-0 bg-green-500 text-white flex items-center justify-center rounded-2xl text-xs font-bold">Copied!</div>}
                      </button>
                      <button
    onClick={() => copyToClipboard(`rgb(${activeColor.rgb.r}, ${activeColor.rgb.g}, ${activeColor.rgb.b})`, "RGB")}
    className="p-4 rounded-2xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left relative group"
  >
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">RGB</div>
                        <div className="font-mono font-bold text-xs">{activeColor.rgb.r}, {activeColor.rgb.g}, {activeColor.rgb.b}</div>
                        <Copy className="absolute top-4 right-4 w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {copied === "RGB" && <div className="absolute inset-0 bg-green-500 text-white flex items-center justify-center rounded-2xl text-xs font-bold">Copied!</div>}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">Tailwind Suggestion</span>
                        <button
    onClick={() => copyToClipboard(activeColor.tailwind, "TW")}
    className="text-blue-500 font-bold hover:underline"
  >
                          {copied === "TW" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 font-mono text-sm border border-zinc-200 dark:border-zinc-800">
                        {activeColor.tailwind}
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 mb-4">
                        <Accessibility className="w-5 h-5 text-blue-600" />
                        <span className="font-bold">Accessibility</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Contrast Ratio</div>
                          <div className="text-2xl font-display font-bold">{activeColor.contrast.ratio}:1</div>
                        </div>
                        <div className={cn(
    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest",
    activeColor.contrast.ratio >= 4.5 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
  )}>
                          {activeColor.contrast.ratio >= 4.5 ? "Pass" : "Fail"}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 dark:border-zinc-800" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">On White</span>
                        </div>
                        <div className="flex-1 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-black border border-zinc-200 dark:border-zinc-800" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">On Black</span>
                        </div>
                      </div>
                    </div>

                    {results?.gradient && <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            <span className="font-bold">Detected Gradient</span>
                          </div>
                          <button
    onClick={() => copyToClipboard(results.gradient.css, "GRAD")}
    className="text-purple-500 font-bold hover:underline text-sm"
  >
                            {copied === "GRAD" ? "Copied!" : "Copy CSS"}
                          </button>
                        </div>
                        <div
    className="h-20 rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-800 mb-3"
    style={{ background: results.gradient.css }}
  />
                        <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 break-all leading-tight">
                          {results.gradient.css}
                        </div>
                      </div>}
                  </motion.div>}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
};
export default function App() {
  const [view, setView] = useState("landing");
  const [theme, setTheme] = useState("light");
  const [isAppLoading, setIsAppLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4e3);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (isAppLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAppLoading]);
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const landingHashes = ["", "#", "#home", "#about", "#services", "#steps", "#faq"];
      if (hash && !landingHashes.includes(hash)) {
        setView("tool");
      } else {
        setView("landing");
      }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const toggleTheme = () => setTheme((prev) => prev === "light" ? "dark" : "light");
  return <>
      <AnimatePresence mode="wait">
        {isAppLoading && <LoadingScreen theme={theme} />}
      </AnimatePresence>

      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <Navbar
    onStart={() => {
      setView("tool");
      window.location.hash = "tool";
    }}
    theme={theme}
    toggleTheme={toggleTheme}
    view={view}
  />
        
        <main>
          <AnimatePresence mode="wait">
            {view === "landing" ? <motion.div
    key="landing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
                <LandingPage onStart={() => {
    setView("tool");
    window.location.hash = "tool";
  }} />
                <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                      <Palette className="w-6 h-6 text-blue-600" />
                      <span className="text-xl font-display font-bold">PaletteLab</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      <a href="#home" className="hover:text-blue-500 transition-colors">Home</a>
                      <a href="#about" className="hover:text-blue-500 transition-colors">About</a>
                      <a href="#services" className="hover:text-blue-500 transition-colors">Services</a>
                      <a href="#steps" className="hover:text-blue-500 transition-colors">How it works</a>
                    </div>
                    <div className="text-zinc-400 text-sm font-medium text-right">
                      © 2026 PaletteLab. All rights reserved.<br />
                      Developed by Sanjeev
                    </div>
                  </div>
                </footer>
              </motion.div> : <motion.div
    key="tool"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
                <ColorTool />
              </motion.div>}
          </AnimatePresence>
        </main>
      </div>
    </>;
}
