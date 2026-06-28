"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

// ===== Particle Canvas Background =====
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number; hue: number }[] = [];

    const createParticle = () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.5 - 0.1,
      size: Math.random() * 2 + 0.5, alpha: 0, life: 0,
      maxLife: 100 + Math.random() * 200, hue: 35 + Math.random() * 20,
    });

    for (let i = 0; i < 40; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      p.alpha = p.life / p.maxLife;
      particles.push(p);
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Mouse glow
      const grad = ctx.createRadialGradient(
        mouseRef.current.x || w / 2, mouseRef.current.y || h / 2, 0,
        mouseRef.current.x || w / 2, mouseRef.current.y || h / 2, 300
      );
      grad.addColorStop(0, "rgba(200, 164, 92, 0.03)");
      grad.addColorStop(1, "rgba(200, 164, 92, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        p.alpha = p.life < p.maxLife ? Math.min(p.life / 60, 0.4) : p.alpha - 0.01;

        if (p.alpha <= 0 || p.y < -10) { particles[i] = createParticle(); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 40%, 70%, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(200, 164, 92, ${0.03 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    const handleMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.6 }} />;
}

// ===== Floating Geometric Elements =====
function FloatingGeos() {
  const shapes = [
    { top: "15%", left: "8%", size: 60, rotate: 12, dur: 12 },
    { top: "70%", left: "5%", size: 40, rotate: -20, dur: 15 },
    { top: "20%", right: "6%", size: 50, rotate: 45, dur: 10 },
    { top: "60%", right: "10%", size: 35, rotate: -8, dur: 14 },
    { top: "80%", left: "50%", size: 25, rotate: 30, dur: 18 },
  ];

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute border border-gold/10"
          style={{
            top: s.top, left: s.left, right: s.right,
            width: s.size, height: s.size,
            rotate: `${s.rotate}deg`,
            borderRadius: i % 2 === 0 ? "50%" : "8px",
          }}
          animate={{ y: [0, -15, 0], rotate: [s.rotate, s.rotate + 10, s.rotate], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}

// ===== 3D Tilt Card =====
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    el.style.transform = `perspective(1000px) rotateX(${((y - rect.height / 2) / (rect.height / 2)) * -8}deg) rotateY(${((x - rect.width / 2) / (rect.width / 2)) * 8}deg) scale3d(1.02,1.02,1.02)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }, []);
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-200 ease-out ${className}`} style={{ transformStyle: "preserve-3d" }}>{children}</div>;
}

// ===== Counter =====
function Counter({ end, suffix = "+", label = "" }: { end: number; suffix?: string; label?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const duration = 2 * 60;
    const increment = end / duration;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);
  return (
    <div ref={ref} className="text-center">
      <span className="text-5xl md:text-6xl font-bold text-cream tabular-nums tracking-tight">{count}{suffix}</span>
      {label && <p className="text-xs text-cream/30 mt-2 tracking-wide font-mono">{label}</p>}
    </div>
  );
}

// ===== Feature Row =====
function FeatureRow({ badge, title, description, index = 0, hasDemo = false }: {
  badge: string; title: string; description: string; index?: number; hasDemo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border-b border-white/[0.02] py-8 md:py-10 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-gold/[0.02] rounded-full blur-[80px]" />
      </div>
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
        <div className="md:col-span-2">
          <span className="text-[10px] font-mono text-gold tracking-[0.2em] uppercase">{badge}</span>
        </div>
        <div className="md:col-span-6">
          <h3 className="text-xl md:text-2xl font-semibold text-cream leading-tight group-hover:text-gold transition-colors duration-300">{title}</h3>
          <p className="text-sm text-cream/30 mt-2 leading-relaxed max-w-lg">{description}</p>
        </div>
        <div className="md:col-span-4 flex items-start justify-end gap-4">
          {hasDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/10 text-gold/40 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" /> Live demo
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-cream/15 group-hover:text-gold/40 transition-colors duration-300">
            Learn more <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Content Block =====
function ContentBlock({ badge, title, description, reverse = false, index = 0 }: {
  badge: string; title: string; description: string; reverse?: boolean; index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-12 md:gap-20 items-center py-20 md:py-28`}
    >
      <div className="flex-1 space-y-6">
        <span className="inline-block text-[10px] font-mono text-gold uppercase tracking-[0.25em] border border-gold/20 rounded-full px-4 py-1.5">{badge}</span>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream leading-[1.1] tracking-tight">{title}</h3>
        <p className="text-base md:text-lg text-cream/30 leading-relaxed max-w-lg">{description}</p>
      </div>
      <div className="flex-1 w-full">
        <TiltCard>
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gold/[0.02] to-transparent border border-gold/[0.03] flex items-center justify-center overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-gold/[0.01] to-transparent" />
            <div className="grid grid-cols-8 gap-2 p-8 opacity-20">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div key={i} className="aspect-square rounded-sm bg-cream/5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 + index * 0.1, duration: 0.3 }}
                />
              ))}
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-gold/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-3 h-3 bg-gold/40 rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </TiltCard>
      </div>
    </motion.div>
  );
}

// ===== Hero =====
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.1]);
  const bgScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.2]);

  return (
    <div ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ scale: bgScale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b0a] via-[#1a1512] to-[#0d0b0a]" />
        <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,164,92,0.06) 0%, transparent 70%)" }}
          animate={{ x: [0, 30, 0, -20, 0], y: [0, -20, 0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,240,232,0.03) 0%, transparent 70%)" }}
          animate={{ x: [0, -25, 0, 20, 0], y: [0, 20, 0, -25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-[15%] left-[5%] w-[2px] h-32 bg-gradient-to-b from-gold/10 to-transparent" />
        <div className="absolute top-[20%] right-[8%] w-[1px] h-24 bg-gradient-to-b from-cream/5 to-transparent" />
        <div className="absolute bottom-[30%] left-[10%] w-24 h-[1px] bg-gradient-to-r from-gold/5 to-transparent" />
        <div className="absolute bottom-[25%] right-[5%] w-32 h-[1px] bg-gradient-to-l from-cream/5 to-transparent" />
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[60vw] h-[40vh] opacity-[0.015]">
          <svg viewBox="0 0 800 400" fill="none" className="w-full h-full">
            <path d="M100 400 Q100 100 400 100 Q700 100 700 400" stroke="currentColor" strokeWidth="0.5" className="text-cream" />
            <path d="M150 400 Q150 150 400 150 Q650 150 650 400" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
            <path d="M200 400 Q200 200 400 200 Q600 200 600 400" stroke="currentColor" strokeWidth="0.2" className="text-cream" />
          </svg>
        </div>
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 px-6 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="inline-flex items-center gap-2 text-[10px] font-mono text-gold tracking-[0.25em] uppercase mb-10 border border-gold/20 rounded-full px-5 py-2 bg-gold/[0.03] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" /> The Renaissance Edition
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-bold tracking-[-0.02em] leading-[1.05] mb-6">
            <span className="text-cream">A new world of</span><br />
            <motion.span className="gradient-text inline-block" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>creative commerce</motion.span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-cream/30 max-w-xl mx-auto leading-relaxed mb-12 font-mono">
          Design, motion, and technology converging to shape what&apos;s next.<br />150+ updates across the Primook universe.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 flex-wrap">
          <motion.a href="#services" className="px-8 py-3.5 rounded-full bg-cream text-[#0a0a0a] font-medium text-sm relative overflow-hidden group"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span className="relative z-10">Explore what&apos;s new</span>
            <motion.div className="absolute inset-0 bg-gold-light" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
          </motion.a>
          <motion.a href="#contact" className="px-8 py-3.5 rounded-full border border-white/10 text-cream/40 text-sm hover:border-gold/30 hover:text-gold transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Get in touch &rarr;
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-cream/15 tracking-[0.2em] uppercase">Scroll</span>
          <motion.div className="w-[1px] h-8 bg-gradient-to-b from-gold/30 to-transparent" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ===== Side Nav =====
function SideNav() {
  const sections = [
    { id: "hero", label: "The Renaissance Edition" },
    { id: "services", label: "Services" },
    { id: "work", label: "Work" },
    { id: "contact", label: "Contact" },
  ];
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY + 200;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= pos) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="hidden lg:block fixed left-0 top-0 h-full z-40 w-44 pt-28 pl-8">
      <div className="space-y-1">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}
            className={`block text-xs font-mono transition-all duration-300 py-2 tracking-wide ${active === s.id ? "text-gold" : "text-cream/20 hover:text-cream/60"}`}>
            <span className="inline-block w-4 h-[1px] mr-2 align-middle transition-all duration-300"
              style={{ backgroundColor: active === s.id ? "#c8a45c" : "rgba(245,240,232,0.1)", width: active === s.id ? 16 : 8 }} />
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ===== Animated Section =====
function AnimatedSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div ref={ref} id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ===== Main =====
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0b0a] text-cream relative">
      <ParticleCanvas />
      <FloatingGeos />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-5 flex items-center justify-between backdrop-blur-md bg-[#0d0b0a]/30">
          <motion.span className="text-sm font-semibold text-cream tracking-[0.15em] uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>Primook</motion.span>
          <div className="hidden md:flex items-center gap-10 text-sm text-cream/40">
            <a href="#services" className="hover:text-cream transition-colors duration-300 relative group">Services<span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-300" /></a>
            <a href="#work" className="hover:text-cream transition-colors duration-300 relative group">Work<span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-300" /></a>
            <a href="#contact" className="hover:text-cream transition-colors duration-300 relative group">About<span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-300" /></a>
            <motion.a href="#contact" className="px-5 py-2.5 rounded-full border border-cream/10 text-cream/60 hover:bg-cream hover:text-[#0d0b0a] hover:border-cream transition-all duration-300" whileHover={{ scale: 1.05 }}>Get in touch</motion.a>
          </div>
        </div>
      </nav>

      <SideNav />
      <Hero />

      {/* Stats */}
      <section className="relative z-10 py-20 md:py-28 border-t border-white/[0.02]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
            <Counter end={150} label="Projects" />
            <Counter end={48} label="Clients" />
            <Counter end={12} suffix="" label="Team Members" />
            <Counter end={6} suffix="" label="Years" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="relative z-10 py-20 md:py-28 border-t border-white/[0.02]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <AnimatedSection>
            <span className="text-[10px] font-mono text-gold tracking-[0.25em] uppercase">Services</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mt-5 leading-[1.05] tracking-tight mb-16">What we bring to the table</h2>
          </AnimatedSection>
          <div>
            <FeatureRow badge="01 — Design" title="Brand Identity" description="Complete visual identity systems including logo, color palette, typography, and brand guidelines." index={0} />
            <FeatureRow badge="02 — Dev" title="Web Development" description="High-performance websites built with modern frameworks, optimized for speed and SEO." index={1} hasDemo />
            <FeatureRow badge="03 — Motion" title="Motion Design" description="Custom animations, micro-interactions, and explainer videos that bring your brand to life." index={2} />
            <FeatureRow badge="04 — UX" title="UI/UX Design" description="User-centered interface design with research-backed wireframes and prototypes." index={3} hasDemo />
            <FeatureRow badge="05 — AI" title="AI Integration" description="Smart features powered by AI — chatbots, personalization engines, and automated workflows." index={4} />
            <FeatureRow badge="06 — Strategy" title="Consulting" description="Strategic guidance on digital product design, technology stack, and growth roadmap." index={5} />
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="work" className="relative z-10 py-20 md:py-28 border-t border-white/[0.02]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <AnimatedSection>
            <span className="text-[10px] font-mono text-gold tracking-[0.25em] uppercase">Showcase</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mt-5 leading-[1.05] tracking-tight mb-8">What we create</h2>
          </AnimatedSection>
          {[
            { badge: "Design", title: "Identity that transcends", description: "We create visual systems that feel timeless yet modern — blending classical proportion with contemporary sensibility.", reverse: false },
            { badge: "Engineering", title: "Built for speed and scale", description: "Every line of code is optimized for performance. Zero compromise on quality, infinite attention to detail.", reverse: true },
            { badge: "Motion", title: "Animation with soul", description: "Motion that tells a story, guides the eye, and leaves a lasting impression — never just for decoration.", reverse: false },
          ].map((s, i) => <ContentBlock key={i} {...s} index={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative z-10 py-32 md:py-40 border-t border-white/[0.02]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 text-center">
          <AnimatedSection>
            <span className="text-[10px] font-mono text-gold tracking-[0.25em] uppercase">Let&apos;s create</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cream mt-8 mb-6 leading-[1.05] tracking-tight">Ready to build something<br /><span className="gradient-text">extraordinary?</span></h2>
            <p className="text-base md:text-lg text-cream/30 max-w-md mx-auto mb-14 font-mono leading-relaxed">Drop us a message and let&apos;s talk about your next project.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <motion.a href="#" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cream text-[#0d0b0a] font-medium text-sm relative overflow-hidden group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="relative z-10">Start a project</span>
                <svg className="relative z-10" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <motion.div className="absolute inset-0 bg-gold-light" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.02] py-14 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <span className="text-sm font-semibold text-cream/40 tracking-[0.15em] uppercase">Primook</span>
            <div className="flex items-center gap-8 text-sm text-cream/15">
              <a href="#" className="hover:text-cream/40 transition-colors duration-300">Twitter</a>
              <a href="#" className="hover:text-cream/40 transition-colors duration-300">GitHub</a>
              <a href="#" className="hover:text-cream/40 transition-colors duration-300">Dribbble</a>
              <a href="#" className="hover:text-cream/40 transition-colors duration-300">LinkedIn</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-white/[0.01]">
            <span className="text-xs text-cream/8 font-mono">&copy; 2026 Primook. All rights reserved.</span>
            <span className="text-xs text-cream/8 font-mono">Designed with purpose</span>
          </div>
        </div>
      </footer>
    </main>
  );
}