"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

// --- Reusable Components ---

function FadeInUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {children}
    </div>
  );
}

function Card({
  title,
  description,
  tag,
  index = 0,
}: {
  title: string;
  description: string;
  tag: string;
  index?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
    >
      <div className="text-xs font-medium text-gold/70 uppercase tracking-widest mb-6">{tag}</div>
      <h3 className="text-xl font-semibold text-cream mb-3 group-hover:text-gold-light transition-colors duration-300">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16L16 4M16 4H7M16 4V13" stroke="#c8a45c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  );
}

function FeatureRow({ title, description, reverse = false }: { title: string; description: string; reverse?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: reverse ? 30 : -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 30 : -30 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-12 md:gap-20 items-center py-20`}
    >
      <div className="flex-1">
        <h3 className="text-3xl md:text-4xl font-bold text-cream leading-tight mb-6">{title}</h3>
        <p className="text-white/50 text-lg leading-relaxed">{description}</p>
      </div>
      <div className="flex-1">
        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gold/20 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Section Data ---

const features = [
  {
    title: "Design that speaks",
    description: "We craft visual identities that communicate your brand's essence through deliberate typography, color systems, and motion language.",
  },
  {
    title: "Built for performance",
    description: "Every pixel is optimized. Fast load times, smooth animations, and responsive layouts that feel native on any device.",
    reverse: true,
  },
  {
    title: "Motion that matters",
    description: "Animation isn't decoration—it's communication. We use motion to guide attention, tell stories, and create memorable experiences.",
  },
];

const products = [
  { title: "Brand Identity", description: "Complete visual identity systems including logo, color palette, typography, and brand guidelines.", tag: "Design" },
  { title: "Web Development", description: "High-performance websites built with modern frameworks, optimized for speed and SEO.", tag: "Dev" },
  { title: "Motion Design", description: "Custom animations, micro-interactions, and explainer videos that bring your brand to life.", tag: "Motion" },
  { title: "UI/UX Design", description: "User-centered interface design with research-backed wireframes and interactive prototypes.", tag: "Design" },
  { title: "AI Integration", description: "Smart features powered by AI—chatbots, personalization engines, and automated workflows.", tag: "Tech" },
  { title: "Consulting", description: "Strategic guidance on digital product design, technology stack, and growth roadmap.", tag: "Strategy" },
];

// --- Main Page ---

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 80]);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-sm font-medium text-cream tracking-widest uppercase">Primook</span>
          <div className="flex items-center gap-8 text-sm text-cream/60">
            <a href="#" className="hover:text-cream transition-colors">Work</a>
            <a href="#" className="hover:text-cream transition-colors">Services</a>
            <a href="#" className="hover:text-cream transition-colors">About</a>
            <a href="#" className="px-5 py-2 rounded-full border border-cream/20 text-cream hover:bg-cream hover:text-[#0a0a0a] transition-all duration-300">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background particle effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-block text-xs font-medium text-gold tracking-[0.3em] uppercase mb-8 border border-gold/20 rounded-full px-5 py-2">
              Winter &apos;26 Edition
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            <span className="gradient-text">Where Ideas</span>
            <br />
            <span className="text-cream">Take Shape</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            A creative studio crafting bold digital experiences through design, motion, and technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center gap-4"
          >
            <a href="#" className="px-8 py-3 rounded-full bg-cream text-[#0a0a0a] font-medium text-sm hover:bg-gold-light transition-all duration-300">
              View our work
            </a>
            <a href="#" className="px-8 py-3 rounded-full border border-white/10 text-cream/70 text-sm hover:border-gold/30 hover:text-gold transition-all duration-300">
              Get in touch
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-gold/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <span className="text-xs font-medium text-gold tracking-[0.3em] uppercase">Services</span>
            <h2 className="text-4xl md:text-5xl font-bold text-cream mt-4 mb-4">What we do</h2>
            <p className="text-white/40 text-lg max-w-xl mb-16">
              From brand strategy to full-scale development, we bring your vision to life.
            </p>
          </FadeInUp>

          <StaggerGrid>
            {products.map((item, i) => (
              <Card key={item.title} {...item} index={i} />
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-6">
        <div className="max-w-6xl mx-auto border-t border-white/5">
          {features.map((f, i) => (
            <FeatureRow key={i} title={f.title} description={f.description} reverse={f.reverse} />
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeInUp>
            <span className="text-xs font-medium text-gold tracking-[0.3em] uppercase">Let&apos;s build</span>
            <h2 className="text-4xl md:text-6xl font-bold text-cream mt-6 mb-8 leading-tight">
              Ready to make something<br />
              <span className="gradient-text">remarkable?</span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto mb-12">
              Drop us a message and let&apos;s talk about your next project.
            </p>
            <a
              href="#"
              className="inline-block px-10 py-4 rounded-full bg-cream text-[#0a0a0a] font-medium text-sm hover:bg-gold-light transition-all duration-300"
            >
              Start a project
            </a>
          </FadeInUp>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm text-white/30 tracking-widest uppercase">Primook</span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-cream transition-colors">Twitter</a>
            <a href="#" className="hover:text-cream transition-colors">GitHub</a>
            <a href="#" className="hover:text-cream transition-colors">Dribbble</a>
          </div>
          <span className="text-xs text-white/20">&copy; 2026 Primook. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
