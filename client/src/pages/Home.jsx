import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api';

// ---- Ambient Noise Texture ----
const NoiseBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.015] mix-blend-overlay">
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// ---- Cinematic Fade-Up Wrapper ----
const FadeUp = ({ children, delay = 0, className = '', y = 40 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ---- Reactivated Animated Counter ----
const AnimatedCounter = ({ end, duration = 2.5, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOutExpo * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ---- Magnetic Primary Button ----
const PrimaryButton = ({ to, children, className = '' }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="relative inline-block z-50">
      <Link to={to} className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-neutral-900 dark:bg-white px-8 py-4 text-[15px] font-medium text-white dark:text-neutral-900 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}>
        <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    </motion.div>
  );
};

const SecondaryButton = ({ to, children, className = '' }) => (
  <Link to={to} className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md px-8 py-4 text-[15px] font-medium text-neutral-900 dark:text-white transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 active:scale-[0.98] z-50 ${className}`}>
    {children}
  </Link>
);

// ---- 3D Tilt Job Card ----
const FeaturedJobCard = ({ job }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left - width / 2);
    mouseY.set(clientY - top - height / 2);
  };

  // Convert mouse position to 3D rotation
  const rotateX = useTransform(mouseY, [-200, 200], [10, -10]);
  const rotateY = useTransform(mouseX, [-200, 200], [-10, 10]);
  
  // Dynamic glare effect
  const background = useMotionTemplate`radial-gradient(300px circle at ${useTransform(mouseX, x => x + 200)}px ${useTransform(mouseY, y => y + 200)}px, rgba(77, 141, 255, 0.15), transparent 80%)`;

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-[#4D8DFF]/10"
    >
      <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background }} />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-neutral-100 dark:bg-neutral-800 shadow-inner text-xl font-bold text-neutral-900 dark:text-white transition-transform duration-500 group-hover:scale-110 group-hover:text-[#4D8DFF] group-hover:rotate-3">
            {job.company?.charAt(0) || 'C'}
          </div>
          <span className="rounded-full border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            {job.type}
          </span>
        </div>
        
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors duration-300 group-hover:text-[#4D8DFF]">
          {job.title}
        </h3>
        <p className="mb-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {job.company} <span className="mx-2 opacity-50">•</span> {job.location || 'Remote'}
        </p>
        <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {job.description}
        </p>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <Link to={`/jobs/${job._id}`} className="inline-flex items-center text-[15px] font-semibold text-neutral-900 dark:text-white transition-colors duration-300 hover:text-[#4D8DFF] dark:hover:text-[#4D8DFF]">
          View Opportunity
          <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

// ---- MAIN HOME COMPONENT ----
const Home = () => {
  const { user } = useAuth() || { user: null }; // Fallback for testing
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs?limit=3');
        setFeaturedJobs(res.data.slice(0, 3));
      } catch {
        setFeaturedJobs([
          { _id: '1', title: 'Senior Frontend Engineer', company: 'Linear', location: 'San Francisco, CA', type: 'Full-time', description: 'Help build the next generation of issue tracking. Deep React & WebGL experience preferred.' },
          { _id: '2', title: 'Product Designer', company: 'Vercel', location: 'Remote', type: 'Contract', description: 'Design minimal, developer-focused interfaces that scale seamlessly across the web.' },
          { _id: '3', title: 'Platform Engineer', company: 'Stripe', location: 'New York, NY', type: 'Remote', description: 'Build and maintain highly reliable infrastructure for global financial operations.' },
        ]);
      } finally { setJobsLoading(false); }
    };
    fetchJobs();
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, []);

  const heroHeadline = "Find your next defining opportunity.";
  const words = heroHeadline.split(" ");

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#050505] font-sans selection:bg-[#4D8DFF]/30 selection:text-neutral-900 dark:selection:text-white overflow-hidden">
      <NoiseBackground />

      {/* ---- BREATHING AURORA BACKGROUND ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center overflow-hidden h-[100vh]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] left-[20%] h-[600px] w-[600px] rounded-full bg-[#4D8DFF]/20 blur-[120px] mix-blend-screen dark:mix-blend-lighten"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[10%] right-[20%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen dark:mix-blend-lighten"
        />
      </div>

      {/* ---- HERO SECTION ---- */}
      <motion.section style={{ y: yHero, opacity: opacityHero }} className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-40 text-center mx-auto max-w-[1400px]">
        <div className="max-w-[1000px] mt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <span className="mb-8 inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-800 dark:text-neutral-200 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#4D8DFF] animate-pulse" /> The Standard for Hiring
            </span>
          </motion.div>

          {/* Staggered Cinematic Text Reveal */}
          <h1 className="mb-8 text-[56px] font-semibold leading-[1.05] tracking-[-0.04em] text-neutral-900 dark:text-white md:text-[96px] flex flex-wrap justify-center gap-x-4">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={word === "defining" ? "bg-gradient-to-r from-[#4D8DFF] to-purple-500 bg-clip-text text-transparent italic pr-2 pb-3" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          
          <FadeUp delay={0.6}>
            <p className="mx-auto mb-12 max-w-[550px] text-[18px] leading-[1.6] text-neutral-600 dark:text-neutral-400 font-medium">
              Connect with top-tier companies and hyper-focused talent. An ecosystem designed for precision, speed, and beautiful experiences.
            </p>
          </FadeUp>

          <FadeUp delay={0.8} className="flex flex-col items-center justify-center gap-4 sm:flex-row z-50">
            {!user ? (
              <>
                <PrimaryButton to="/register">Start Hiring or Applying</PrimaryButton>
                <SecondaryButton to="/jobs">Explore Open Roles</SecondaryButton>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <PrimaryButton to={user.role === 'employer' ? "/post-job" : "/jobs"}>
                  {user.role === 'employer' ? "Post a New Job" : "Continue Search"}
                </PrimaryButton>
              </div>
            )}
          </FadeUp>
        </div>
      </motion.section>

      {/* ---- REACTIVATED METRICS DASHBOARD ---- */}
      <section className="relative z-20 mt-10 pb-10 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 md:grid-cols-4 border border-neutral-200 dark:border-neutral-800">
            {[
              { value: 1500, label: 'Active Roles', suffix: '+' },
              { value: 3200, label: 'Hires Made', suffix: '+' },
              { value: 98, label: 'Placement Rate', suffix: '%' },
              { value: 12000, label: 'Global Talents', suffix: '+' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex flex-col bg-white dark:bg-[#0A0A0A] p-10 text-center transition-colors hover:bg-neutral-50 dark:hover:bg-[#111] group">
                <span className="text-[48px] font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-[#4D8DFF] transition-colors duration-300">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="mt-2 text-[13px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURED JOBS ---- */}
      <section className="relative z-10 py-32 bg-white/50 dark:bg-[#0A0A0A]/50 border-y border-neutral-200 dark:border-neutral-900">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <FadeUp>
              <h2 className="text-[40px] font-semibold tracking-tight text-neutral-900 dark:text-white md:text-[56px]">
                Curated Openings
              </h2>
              <p className="mt-4 text-[18px] text-neutral-600 dark:text-neutral-400 font-medium">
                Exceptional roles from companies building the future.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Link to="/jobs" className="group flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 px-6 py-3 text-[15px] font-semibold text-neutral-900 dark:text-white transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800">
                View Entire Directory
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </FadeUp>
          </div>

          {jobsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-[360px] rounded-[24px] bg-neutral-200 dark:bg-neutral-800 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job, idx) => (
                <FadeUp key={job._id} delay={idx * 0.15} y={40} className="h-[360px]">
                  <FeaturedJobCard job={job} />
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section> 

      {/* ---- INTERACTIVE BENTO CATEGORIES ---- */}
      <section className="relative z-10 py-40">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <FadeUp>
            <h2 className="mb-16 text-[40px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              Explore by Discipline
            </h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-20 max-w-[1000px] mx-auto">
            {['Engineering', 'Product Design', 'Marketing', 'Finance', 'Healthcare', 'Sales', 'Operations', 'Data Science'].map((cat, i) => (
              <FadeUp key={cat} delay={i * 0.05} y={20}>
                <Link
                  to={`/jobs?keyword=${cat}`}
                  className="group relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A] transition-all duration-300 hover:border-[#4D8DFF] hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4D8DFF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative z-10 text-[16px] font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-[#4D8DFF]">
                    {cat}
                  </span>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ---- MASSIVE GLOWING CTA ---- */}
      <section className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-[1200px]">
          <FadeUp>
            <div className="relative overflow-hidden rounded-[48px] bg-neutral-900 dark:bg-[#0A0A0A] px-6 py-24 text-center md:px-24 border border-neutral-800 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,141,255,0.3)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
              <div className="absolute -bottom-[50%] -right-[20%] h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />
              
              <h2 className="relative z-10 mb-6 text-[48px] font-semibold tracking-tight text-white md:text-[64px]">
                Ready to elevate your trajectory?
              </h2>
              <p className="relative z-10 mx-auto mb-12 max-w-[500px] text-[20px] text-neutral-400 font-medium">
                Join the exclusive network of top professionals and industry-leading companies.
              </p>
              
              <div className="relative z-50 inline-block">
                {!user ? (
                  <PrimaryButton to="/register" className="!bg-white !text-neutral-900 !px-10 !py-5 !text-lg">
                    Create your profile
                  </PrimaryButton>
                ) : (
                  <PrimaryButton to={user.role === 'employer' ? "/post-job" : "/jobs"} className="!bg-white !text-neutral-900 !px-10 !py-5 !text-lg">
                    {user.role === 'employer' ? "Post an opening" : "Browse directory"}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ---- MINIMAL PREMIUM FOOTER ---- */}
      <footer className="relative z-10 border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#050505] pt-24 pb-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-5 md:gap-8">
            <div className="col-span-2">
              <Link to="/" className="text-[28px] font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#4D8DFF]" /> Hired.
              </Link>
              <p className="mt-6 max-w-[320px] text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium">
                The definitive platform for connecting world-class talent with pioneering companies. Designed with precision.
              </p>
            </div>
            
            {/* Platform Links */}
            <div>
              <h4 className="mb-6 text-[13px] font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/jobs" className="text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#4D8DFF]">Directory</Link></li>
                <li><Link to="/register" className="text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#4D8DFF]">Join Network</Link></li>
              </ul>
            </div>
            {/* Companies Links */}
            <div>
              <h4 className="mb-6 text-[13px] font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">Companies</h4>
              <ul className="space-y-4">
                <li><Link to="/post-job" className="text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#4D8DFF]">Post a Role</Link></li>
                <li><Link to="/register" className="text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#4D8DFF]">Employer Access</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-24 flex flex-col items-center justify-between border-t border-neutral-200 dark:border-neutral-900 pt-8 md:flex-row">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Hired. Built by <span className="font-medium text-indigo-500">Aadesh Kaswan</span>. All rights reserved.
            </p>
            <div className="mt-4 flex gap-6 md:mt-0 relative z-50">

  <a 
    href="https://linkedin.com/in/aadeshkaswan" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-[15px] font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
  >
    LinkedIn
  </a>
  <a 
    href="https://github.com/AadeshKaswan" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-[15px] font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
  >
    GitHub
  </a>
</div>
            
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
