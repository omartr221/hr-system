import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Briefcase, Zap, Shield, BarChart3, Users, ChevronLeft,
  Star, ArrowLeft, Sparkles, Check, Play, Globe, Clock, Target,
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
    title: 'تقييم بالذكاء الاصطناعي',
    desc: 'ذكاء اصطناعي متقدم يحلل كل سيرة ذاتية مقابل متطلبات الوظيفة ويعطي تقييم مفصّل بنقاط القوة والضعف.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'معالجة فورية',
    desc: 'معالجة تلقائية بالخلفية تقيّم الطلبات فور وصولها — بدون فرز يدوي.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'تحليلات ذكية',
    desc: 'لوحة تحكم بالوقت الفعلي مع مقاييس التوظيف ونتائج الذكاء الاصطناعي وتتبع المرشحين.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'آمن وموثوق',
    desc: 'بنية تحتية سحابية مع تشفير البيانات وتحكم بصلاحيات الوصول.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: Globe,
    title: 'روابط وظائف قابلة للمشاركة',
    desc: 'أنشئ روابط تقديم عامة لكل وظيفة — شاركها في أي مكان واجمع السير الذاتية تلقائياً.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Target,
    title: 'توصيات مفصّلة',
    desc: 'احصل على توصيات واضحة بالتوظيف أو الرفض مدعومة بتحليل نقاط القوة والضعف.',
    gradient: 'from-indigo-500 to-blue-600',
  },
];

const stats = [
  { value: 95, suffix: '%', label: 'دقة الفرز' },
  { value: 10, suffix: 'x', label: 'أسرع من اليدوي' },
  { value: 500, suffix: '+', label: 'سيرة ذاتية بالساعة' },
  { value: 0, suffix: '$', label: 'تكلفة الإعداد' },
];

const steps = [
  { num: '01', title: 'أنشئ وظيفة', desc: 'أضف إعلان الوظيفة مع العنوان والوصف والمتطلبات.' },
  { num: '02', title: 'شارك الرابط', desc: 'احصل على رابط تقديم فريد لمشاركته مع المرشحين.' },
  { num: '03', title: 'الذكاء الاصطناعي يقيّم', desc: 'الذكاء الاصطناعي يقرأ كل سيرة ذاتية ويقيّمها مقابل متطلباتك.' },
  { num: '04', title: 'وظّف الأفضل', desc: 'راجع توصيات الذكاء الاصطناعي ووظّف أفضل المرشحين بثقة.' },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden" dir="rtl">
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
            <a href="#features" className="hover:text-white transition-colors">المميزات</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">كيف يعمل</a>
            <a href="#demo" className="hover:text-white transition-colors">تجربة</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              تسجيل دخول
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              ابدأ الآن
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
            منصة موارد بشرية بالذكاء الاصطناعي
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
              وظّف بذكاء.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              وظّف بسرعة.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            توقف عن قضاء ساعات في فرز السير الذاتية يدوياً.
            الذكاء الاصطناعي يقيّم كل مرشح بثوانٍ — ويعطيك
            <span className="text-white font-medium"> نتائج مفصّلة ونقاط قوة وتوصيات</span> فوراً.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 rounded-full text-lg font-semibold transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              جرّب الآن
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all text-lg"
            >
              اعرف المزيد
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
                كل ما تحتاجه
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              منصة توظيف متكاملة بالذكاء الاصطناعي — من نشر الوظيفة حتى التوظيف.
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
                كيف يعمل
              </span>
            </h2>
            <p className="text-gray-400 text-lg">أربع خطوات بسيطة لثورة في عملية التوظيف.</p>
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
                تجربة حية متاحة
              </div>

              <h2 className="text-3xl md:text-5xl font-black mb-4">
                شاهده بالعمل
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                استكشف المنصة الكاملة مع وظائف وطلبات محمّلة مسبقاً و
                <span className="text-white font-medium"> تقييمات ذكاء اصطناعي حقيقية</span>.
                بدون تسجيل.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/demo-login"
                  className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 rounded-full text-lg font-semibold transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  ابدأ التجربة
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all text-lg"
                >
                  دخول المدير
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> بدون تسجيل</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> جميع الميزات</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> نتائج AI حقيقية</span>
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
          <p className="text-sm text-gray-400">
            تم إنشاؤه بواسطة <span className="text-white font-semibold">عمر طرابلسي</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>© 2024 HireAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
