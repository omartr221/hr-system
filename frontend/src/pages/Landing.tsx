import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Briefcase, Zap, Shield, BarChart3, Users, ChevronRight,
  Star, ArrowRight, Sparkles, Check, Play, Globe, Clock, Target,
} from 'lucide-react';

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count}{suffix}</>;
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Evaluation',
    desc: 'Advanced AI analyzes every resume against job requirements and gives detailed scoring with strengths & weaknesses.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    desc: 'Automated background processing evaluates applications as they arrive — no manual screening needed.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Real-time dashboard with hiring metrics, AI scores, and pipeline tracking at a glance.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'Cloud-hosted infrastructure with encrypted data storage and role-based access control.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: Globe,
    title: 'Shareable Job Links',
    desc: 'Generate public application links for each job — share them anywhere and collect CVs automatically.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Target,
    title: 'Detailed Recommendations',
    desc: 'Get clear hire/reject recommendations backed by specific strengths and weakness analysis.',
    gradient: 'from-indigo-500 to-blue-600',
  },
];

const stats = [
  { value: 95, suffix: '%', label: 'Screening Accuracy' },
  { value: 10, suffix: 'x', label: 'Faster Than Manual' },
  { value: 500, suffix: '+', label: 'Resumes Per Hour' },
  { value: 0, suffix: '$', label: 'Setup Cost', prefix: '' },
];

const steps = [
  { num: '01', title: 'Create a Job', desc: 'Add your job posting with title, description, and requirements.' },
  { num: '02', title: 'Share the Link', desc: 'Get a unique application link to share with candidates.' },
  { num: '03', title: 'AI Evaluates', desc: 'Our AI reads every CV and scores it against your requirements.' },
  { num: '04', title: 'Hire the Best', desc: 'Review AI recommendations and hire top candidates with confidence.' },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              HireAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-cyan-600/10 to-purple-600/10 rounded-full blur-3xl"
            style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI-Powered HR Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
              Hire Smarter.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Hire Faster.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop spending hours screening resumes manually.
            Our AI evaluates every candidate in seconds — giving you
            <span className="text-white font-medium"> detailed scores, strengths, and recommendations</span> instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 rounded-full text-lg font-semibold transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Try Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all text-lg"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white">
                  <AnimatedCounter end={value} suffix={suffix} />
                </p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything you need
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete AI-powered hiring pipeline — from posting to hiring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, gradient }) => (
              <div
                key={title}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                How it works
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Four simple steps to revolutionize your hiring.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative text-center">
                <div className="text-6xl font-black bg-gradient-to-b from-white/10 to-transparent bg-clip-text text-transparent mb-4">
                  {num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-3xl" />
            <div className="relative m-[1px] bg-[#0a0f1e] rounded-3xl p-10 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Live Demo Available
              </div>

              <h2 className="text-3xl md:text-5xl font-black mb-4">
                See it in action
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                Explore the full platform with pre-loaded jobs, applications, and
                <span className="text-white font-medium"> real AI evaluations</span>.
                No signup required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/demo-login"
                  className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 rounded-full text-lg font-semibold transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  Launch Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all text-lg"
                >
                  Admin Login
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> No signup needed</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Full features</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Real AI results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">HireAI</span>
          </div>
          <p className="text-sm text-gray-500">
            Built with AI. Designed for modern HR teams.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>© 2024 HireAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
