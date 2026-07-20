import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import CountUp from 'react-countup';
import {
  Shield,
  Dna,
  Brain,
  BookOpen,
  Trophy,
  CheckCircle2,
  Check,
  ChevronDown,
  UserPlus,
  ClipboardCheck,
  GraduationCap,
  Lock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   DNA HELIX CANVAS COMPONENT
   ================================================================ */
function DnaHelixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 300;

      const numBasePairs = 20;
      const helixHeight = 200 * scale;

      for (let i = 0; i < numBasePairs; i++) {
        const t = i / numBasePairs;
        const y = cy - helixHeight / 2 + t * helixHeight;
        const phase = t * Math.PI * 4 + rotation;
        const x1 = cx + Math.sin(phase) * 60 * scale;
        const x2 = cx + Math.sin(phase + Math.PI) * 60 * scale;

        // Connection line
        const gradient = ctx.createLinearGradient(x1, y, x2, y);
        gradient.addColorStop(0, 'rgba(0,200,83,0.6)');
        gradient.addColorStop(0.5, 'rgba(56,189,248,0.4)');
        gradient.addColorStop(1, 'rgba(0,200,83,0.6)');
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nucleotide spheres
        const glow1 = ctx.createRadialGradient(x1, y, 0, x1, y, 8 * scale);
        glow1.addColorStop(0, 'rgba(0,200,83,1)');
        glow1.addColorStop(1, 'rgba(0,200,83,0)');
        ctx.fillStyle = glow1;
        ctx.beginPath();
        ctx.arc(x1, y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        const glow2 = ctx.createRadialGradient(x2, y, 0, x2, y, 8 * scale);
        glow2.addColorStop(0, 'rgba(56,189,248,1)');
        glow2.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = glow2;
        ctx.beginPath();
        ctx.arc(x2, y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Backbone lines
      for (let side = 0; side < 2; side++) {
        ctx.beginPath();
        const offset = side * Math.PI;
        for (let i = 0; i <= numBasePairs; i++) {
          const t = i / numBasePairs;
          const y = cy - helixHeight / 2 + t * helixHeight;
          const phase = t * Math.PI * 4 + rotation + offset;
          const x = cx + Math.sin(phase) * 60 * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = side === 0 ? 'rgba(0,200,83,0.3)' : 'rgba(56,189,248,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      rotation += 0.02;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ================================================================
   MAIN LANDING PAGE
   ================================================================ */
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP scroll animations
  useGSAP(() => {
    if (!containerRef.current) return;

    // Section reveals
    const revealSections = containerRef.current.querySelectorAll('.reveal-section');
    revealSections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Stats counter trigger
    const statSection = containerRef.current.querySelector('.stats-section');
    if (statSection) {
      gsap.fromTo(
        statSection,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: statSection,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Stagger children
    const staggerContainers = containerRef.current.querySelectorAll('.stagger-children');
    staggerContainers.forEach((container) => {
      const children = container.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Domain cards
    const domainCards = containerRef.current.querySelectorAll('.domain-card');
    domainCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, { scope: containerRef });

  const scrollToSection = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div ref={containerRef} className="bg-baseIndigo">
      <Navbar />

      {/* ============================================================
          SECTION 1: HERO
          ============================================================ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(/hero-gradient-bg.jpg)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, #2D1B69, #0A0C1B)', opacity: 0.8 }}
        />
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Floating DNA Helix */}
        <div className="absolute bottom-0 right-0 md:right-[10%] w-[200px] h-[300px] md:w-[300px] md:h-[450px] opacity-40 md:opacity-60 animate-slow-rotate animate-float pointer-events-none">
          <img
            src="/dna-helix-3d.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-[800px] px-5 text-center pt-20">
          <div className="pill-badge inline-block mb-6 reveal-section">
            AI-Powered Heritage Education
          </div>

          <h1 className="font-display text-[48px] md:text-[80px] font-normal leading-[1.05] text-white mb-6 reveal-section">
            Reconnect Your Child to the Roots That Made Them
          </h1>

          <p className="font-body text-lg md:text-xl text-lightSilver leading-relaxed max-w-[600px] mx-auto mb-8 reveal-section">
            fromGreatness uses DNA insights to build personalized study plans across History, Language, Food, and Dress — helping youth aged 8-15 discover the greatness encoded in their genes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 reveal-section">
            <button
              onClick={() => scrollToSection('#pricing')}
              className="glass-btn flex items-center gap-2"
            >
              Start Your Journey — $75/Year
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('#how-it-works')}
              className="ghost-btn flex items-center gap-2"
            >
              See How It Works
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-mediumGray uppercase tracking-wider reveal-section">
            Heritage-based education, personalized to your child’s ancestry.
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: THE PROBLEM
          ============================================================ */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 100%, #2D1B69, transparent)', opacity: 0.1 }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-3 reveal-section">The Problem</p>
              <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white mb-6 reveal-section">
                A Generation Disconnected from Their Heritage
              </h2>
              <p className="font-body text-lg text-lightSilver leading-relaxed mb-8 reveal-section">
                Millions of young people grow up without meaningful exposure to the history, language, food, and traditions of their ancestors. Schools don't teach it. Popular culture doesn't celebrate it. And parents often lack the tools or time to bridge the gap. The result? A cultural identity crisis that impacts self-esteem, academic motivation, and a sense of belonging.
              </p>

              {/* Stats */}
              <div className="stats-section grid grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <p className="font-display text-4xl text-vibrantGreen mb-1">
                    <CountUp end={67} suffix="%" duration={1.5} enableScrollSpy scrollSpyOnce />
                  </p>
                  <p className="text-xs text-mediumGray uppercase tracking-wider">
                    of youth say they know little about their ancestral culture
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="font-display text-4xl text-vibrantGreen mb-1">4 in 10</p>
                  <p className="text-xs text-mediumGray uppercase tracking-wider">
                    feel disconnected from their family heritage
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="font-display text-4xl text-vibrantGreen mb-1">
                    <CountUp end={82} suffix="%" duration={1.5} enableScrollSpy scrollSpyOnce />
                  </p>
                  <p className="text-xs text-mediumGray uppercase tracking-wider">
                    of parents want to teach culture but don't know where to start
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal-section">
              <img
                src="/family-connection.jpg"
                alt="Parent and child connecting"
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: THE SOLUTION
          ============================================================ */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #2D1B69 0%, #0A0C1B 60%)' }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10">
          <div className="text-center mb-12">
            <p className="section-label mb-3 reveal-section">The Solution</p>
            <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white mb-4 reveal-section">
              Your Child's DNA Becomes Their Personalized Curriculum
            </h2>
            <p className="font-body text-lg text-lightSilver leading-relaxed max-w-[640px] mx-auto reveal-section">
              Upload a DNA file from 23andMe, AncestryDNA, or any raw genetic data. Our AI analyzes their heritage and builds an adaptive study plan that reconnects them to their roots through engaging, age-appropriate content.
            </p>
          </div>

          {/* Phone Mockups */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16 stagger-children">
            <div className="relative">
              <div className="w-[260px] h-[520px] rounded-[40px] bg-[#1a1a2e] border-4 border-[#2a2a3e] shadow-2xl overflow-hidden">
                <img
                  src="/app-screenshot-dashboard.jpg"
                  alt="Parent Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="relative">
              <div className="w-[260px] h-[520px] rounded-[40px] bg-[#1a1a2e] border-4 border-[#2a2a3e] shadow-2xl overflow-hidden">
                <img
                  src="/app-screenshot-learn.jpg"
                  alt="Student Learning Interface"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-[800px] mx-auto stagger-children">
            {[
              { icon: Shield, title: 'COPPA-Compliant & Secure', desc: 'Built with parental consent and enterprise-grade privacy' },
              { icon: Dna, title: 'AI-Powered Analysis', desc: 'Gap analysis between existing identity and genetic heritage' },
              { icon: BookOpen, title: '4 Learning Domains', desc: 'History, Language, Food, and Dress — comprehensive cultural education' },
              { icon: Trophy, title: 'Gamified Learning', desc: 'Badges, streaks, and rewards that keep students engaged' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="liquid-glass p-6 flex items-start gap-4 hover:border-glassHighlight transition-colors"
              >
                <feature.icon className="w-6 h-6 text-vibrantGreen flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-body text-lg font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-mediumGray">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: HOW IT WORKS
          ============================================================ */}
      <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, #7E57C2, #F8BBD0 50%, transparent 70%)', opacity: 0.06 }}
        />
        <div className="relative z-10 mx-auto max-w-[720px] px-5 md:px-10">
          <div className="text-center mb-12">
            <p className="section-label mb-3 reveal-section">How It Works</p>
            <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white reveal-section">
              Five Steps to Cultural Reconnection
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-vibrantGreen via-accentBlue to-transparent" />

            {/* Steps */}
            {[
              { icon: UserPlus, title: 'Register & Subscribe', desc: 'Parents create an account, subscribe for $75/year, and provide consent. Student profiles are set up with age-appropriate configurations.' },
              { icon: ClipboardCheck, title: 'Complete the Assessments', desc: 'Students take three engaging assessments: a personality test, an achievement quiz, and a cultural identity survey (including optional video responses).' },
              { icon: Dna, title: 'Upload DNA Data', desc: 'Upload raw DNA data from 23andMe, AncestryDNA, or any genetic testing service. We support JSON, CSV, and raw file formats.' },
              { icon: Brain, title: 'AI Gap Analysis', desc: 'Our AI compares your child\'s current cultural knowledge and identity against their genetic heritage profile, identifying learning opportunities.' },
              { icon: GraduationCap, title: 'Personalized Study Plans', desc: 'Adaptive study plans are generated across History, Language, Food, and Dress. Students learn through multimedia content while parents track progress.' },
            ].map((step, i) => (
              <div key={step.title} className="relative flex gap-6 md:gap-8 mb-10 last:mb-0 reveal-section">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-baseIndigo border-2 border-vibrantGreen flex items-center justify-center">
                  <step.icon className="w-5 h-5 md:w-6 md:h-6 text-vibrantGreen" />
                </div>
                <div className="liquid-glass p-5 md:p-6 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-mediumGray font-mono">0{i + 1}</span>
                    <h3 className="font-body text-lg md:text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-lightSilver leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: FOUR DOMAINS
          ============================================================ */}
      <section id="domains" className="relative py-20 md:py-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10">
          <div className="text-center mb-12">
            <p className="section-label mb-3 reveal-section">Four Domains of Discovery</p>
            <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white mb-4 reveal-section">
              A Complete Cultural Education
            </h2>
            <p className="font-body text-lg text-lightSilver leading-relaxed max-w-[640px] mx-auto reveal-section">
              Every study plan covers four pillars of cultural identity, tailored to your child's genetic heritage and learning style.
            </p>
          </div>

          {/* Domain Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                img: '/feature-history.jpg',
                title: 'History',
                desc: 'Journey through the historical events, movements, and figures that shaped your ancestral regions. From ancient kingdoms to modern diaspora stories.',
                gradient: 'linear-gradient(135deg, #00C853, #0D47A1)',
                icon: BookOpen,
              },
              {
                img: '/feature-language.jpg',
                title: 'Language',
                desc: 'Learn words, phrases, and linguistic traditions from the languages of your heritage. Interactive pronunciation guides and writing practice.',
                gradient: 'linear-gradient(135deg, #7E57C2, #00C853)',
                icon: Sparkles,
              },
              {
                img: '/feature-food.jpg',
                title: 'Food',
                desc: 'Discover traditional recipes, cooking techniques, and the cultural significance of ancestral cuisine. Step-by-step family-style cooking guides.',
                gradient: 'linear-gradient(135deg, #F59E0B, #00C853)',
                icon: TrendingUp,
              },
              {
                img: '/feature-dress.jpg',
                title: 'Dress',
                desc: 'Explore traditional clothing, textiles, patterns, and the meaning behind ceremonial and everyday dress from your heritage cultures.',
                gradient: 'linear-gradient(135deg, #F8BBD0, #00C853)',
                icon: Shield,
              },
            ].map((domain) => (
              <div
                key={domain.title}
                className="domain-card group relative h-[360px] md:h-[400px] rounded-3xl overflow-hidden cursor-pointer"
              >
                <img
                  src={domain.img}
                  alt={domain.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(10,12,27,0.3) 0%, rgba(10,12,27,0.95) 100%)' }}
                />
                {/* Accent stripe */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: domain.gradient }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <domain.icon className="w-6 h-6 text-vibrantGreen mb-3" />
                  <h3 className="font-body text-xl font-semibold text-white mb-2">
                    {domain.title}
                  </h3>
                  <p className="text-sm text-lightSilver leading-relaxed">
                    {domain.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: SCIENCE & STATS
          ============================================================ */}
      <section id="science" className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 30% 50%, #2D1B69 0%, #0A0C1B 70%)' }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal-section">
              <div className="h-[280px] md:h-[400px]">
                <DnaHelixCanvas />
              </div>
            </div>

            <div>
              <p className="section-label mb-3 reveal-section">The Science</p>
              <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white mb-6 reveal-section">
                Grounded in Research, Powered by AI
              </h2>
              <p className="font-body text-lg text-lightSilver leading-relaxed mb-8 reveal-section">
                Research shows that youth with strong cultural identity have higher self-esteem, better academic outcomes, and greater resilience. fromGreatness combines cutting-edge AI with established educational frameworks to create culturally responsive learning experiences that are both scientifically rigorous and deeply personal.
              </p>

              <div className="stagger-children space-y-4">
                {[
                  'Culturally responsive teaching improves academic performance by up to 30%',
                  'DNA analysis provides precise ancestral region mapping for accurate content curation',
                  'Adaptive learning algorithms personalize content difficulty and pacing to each student',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-vibrantGreen flex-shrink-0 mt-0.5" />
                    <p className="text-lightSilver">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section removed — add real, customer-submitted reviews here once available */}


      {/* ============================================================
          SECTION 8: PRICING
          ============================================================ */}
      <section id="pricing" className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, #7E57C2, #F8BBD0 50%, transparent 70%)', opacity: 0.06 }}
        />
        <div className="relative z-10 mx-auto max-w-[480px] px-5">
          <div className="text-center mb-10">
            <p className="section-label mb-3 reveal-section">Pricing</p>
            <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white reveal-section">
              One Plan. Full Access. Unlimited Potential.
            </h2>
          </div>

          <div className="liquid-glass p-8 reveal-section">
            <h3 className="font-body text-xl font-semibold text-white text-center mb-4">
              fromGreatness Family
            </h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-display text-[64px] text-vibrantGreen leading-none">
                <CountUp end={75} prefix="$" duration={1} enableScrollSpy scrollSpyOnce />
              </span>
              <span className="text-mediumGray text-sm">/year</span>
            </div>
            <p className="text-sm text-mediumGray text-center mb-6">
              Everything your child needs to discover their greatness
            </p>

            <div className="border-t border-glassBorder my-6" />

            <ul className="space-y-3 mb-8">
              {[
                'Full DNA analysis & heritage mapping',
                '4-domain personalized study plans',
                'All 3 assessments (personality, achievement, cultural identity)',
                'Multimedia learning content (video, audio, interactive)',
                'Parent dashboard with progress tracking',
                'Gamified learning with badges & streaks',
                'Up to 3 student profiles per family',
                'COPPA-compliant with parental controls',
                'New content added monthly',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-lightSilver">
                  <Check className="w-4 h-4 text-vibrantGreen flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link to="/auth" className="block">
              <button className="glass-btn w-full text-center justify-center">
                Start Your Family's Journey
              </button>
            </Link>
            <p className="text-xs text-mediumGray text-center mt-4">
              Cancel anytime. 30-day satisfaction guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 9: FAQ
          ============================================================ */}
      <section id="faq" className="relative py-20 md:py-32">
        <div className="mx-auto max-w-[720px] px-5 md:px-10">
          <div className="text-center mb-10">
            <p className="section-label mb-3 reveal-section">FAQ</p>
            <h2 className="font-display text-[28px] md:text-[42px] font-medium leading-tight text-white reveal-section">
              Questions? We've Got Answers.
            </h2>
          </div>

          <div className="reveal-section">
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: 'What DNA data sources do you support?',
                  a: "We accept raw DNA data from 23andMe, AncestryDNA, MyHeritage, FamilyTreeDNA, and Nebula Genomics. You can upload JSON, CSV, or raw text files. Don't have a DNA test? You can still use fromGreatness with manual heritage input based on family history.",
                },
                {
                  q: "Is my child's data safe?",
                  a: 'Absolutely. fromGreatness is fully COPPA-compliant. We use enterprise-grade encryption (AES-256), never sell data to third parties, and parents have full control over what data is stored and shared. All DNA data is processed on-device where possible and stored in encrypted cloud storage.',
                },
                {
                  q: 'What age range is fromGreatness designed for?',
                  a: 'fromGreatness is optimized for youth aged 8\u201315. Content difficulty and presentation adapt automatically based on the student\'s age, assessment results, and progress. Younger students (8\u201310) receive more visual and interactive content, while older students (11\u201315) get deeper analytical material.',
                },
                {
                  q: 'Can I use this for multiple children?',
                  a: 'Yes! Each family subscription includes up to 3 student profiles, each with their own DNA analysis, assessments, and personalized study plans. Additional profiles can be added for $25/year each.',
                },
                {
                  q: 'What if I want to cancel?',
                  a: 'You can cancel anytime from your account settings. We offer a 30-day satisfaction guarantee \u2014 if fromGreatness isn\'t the right fit, contact us for a full refund within your first 30 days.',
                },
                {
                  q: 'How is this different from other educational apps?',
                  a: 'fromGreatness is the only platform that combines genetic heritage analysis with culturally responsive education. While other apps teach generic subjects, we create deeply personal learning journeys rooted in your child\'s actual ancestry. The result is higher engagement, stronger identity formation, and meaningful family conversations.',
                },
                {
                  q: 'Do you offer school or organization pricing?',
                  a: 'Yes! We offer discounted bulk pricing for schools, charter networks, and youth mentoring organizations. Contact our team at schools@fromgreatness.app for custom pricing.',
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="liquid-glass !border-glassBorder px-5 py-1"
                >
                  <AccordionTrigger className="font-body text-base font-semibold text-white hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-lightSilver text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 10: FINAL CTA
          ============================================================ */}
      <section className="relative min-h-[60dvh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(/hero-gradient-bg.jpg)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, #2D1B69, #0A0C1B)', opacity: 0.85 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, #7E57C2, #F8BBD0 50%, transparent 70%)', opacity: 0.1 }}
        />

        <div className="relative z-10 mx-auto max-w-[700px] px-5 text-center">
          <h2 className="font-display text-[36px] md:text-[56px] font-medium leading-tight text-white mb-4 reveal-section">
            Your Child's Greatness Is Written in Their DNA. Let's Read It Together.
          </h2>
          <p className="font-body text-lg text-lightSilver mb-8 reveal-section">
            Discover the power of heritage-based education for your family.
          </p>
          <div className="reveal-section">
            <Link to="/auth">
              <button className="glass-btn text-base px-12 py-4 animate-glow-pulse">
                Start Your Journey — $75/Year
              </button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-accentBlue hover:underline cursor-pointer reveal-section">
            Have questions? Contact us
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-mediumGray reveal-section">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> COPPA Compliant</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> AES-256 Encryption</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 30-Day Guarantee</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
