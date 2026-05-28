import Link from 'next/link';
import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from 'types';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import Head from 'next/head';

const Home: NextPageWithLayout = () => {
  const { toggleTheme, selectedTheme } = useTheme();
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'boards' | 'files' | 'chat'>('boards');
  const [scrolled, setScrolled] = useState(false);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Taskiyo | Premium Project & Workspace Task Management</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 font-inter text-gray-800 dark:text-gray-200 transition-colors duration-300 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 dark:bg-orange-950/10 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-200/30 dark:bg-amber-950/5 blur-[150px] pointer-events-none" />

        {/* Global CSS for Animations */}
        <style jsx global>{`
          .font-outfit {
            font-family: 'Outfit', sans-serif;
          }
          .glass-nav {
            backdrop-filter: blur(16px);
            background-color: rgba(255, 255, 255, 0.75);
          }
          .dark .glass-nav {
            background-color: rgba(9, 9, 11, 0.75);
          }
          .glowing-shadow {
            box-shadow: 0 20px 40px -15px rgba(234, 88, 12, 0.15);
          }
          .glowing-shadow-lg {
            box-shadow: 0 30px 60px -20px rgba(234, 88, 12, 0.25);
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          .floating-card {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        {/* Navigation Bar */}
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 sm:px-12 py-4 ${scrolled ? 'glass-nav border-b border-gray-200/50 dark:border-zinc-800/50 shadow-sm' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="font-outfit text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Taskiyo
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {env.darkModeEnabled && (
                <button
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                  onClick={toggleTheme}
                  title="Toggle Theme"
                >
                  <selectedTheme.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors px-4 py-2"
              >
                {t('sign-in')}
              </Link>
              <Link
                href="/auth/join"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-2xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200 scale-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('sign-up')}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-outfit">Introducing Taskiyo 2.0</span>
            </div>
            <h1 className="font-outfit text-5xl sm:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Reimagine How Your Team <br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent">
                Manages Workspace Tasks
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-zinc-400 leading-relaxed font-normal max-w-xl">
              Collaborate project-wise, attach high-res workspace files, organize responsive Kanban boards, and sync team chat details cleanly in one premium, unified space.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/auth/join"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-center px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 scale-100 hover:scale-[1.02]"
              >
                {t('get-started')} — Free Forever
              </Link>
              <Link
                href="#features"
                className="border border-gray-300 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-800 dark:text-zinc-300 font-bold text-center px-8 py-4 rounded-2xl transition-colors shadow-sm"
              >
                Explore Features
              </Link>
            </div>
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200/60 dark:border-zinc-800/60">
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-outfit">45k+</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold tracking-wide uppercase mt-1">Active Teams</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-outfit">1.2M+</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold tracking-wide uppercase mt-1">Tasks Completed</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-outfit">99.9%</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold tracking-wide uppercase mt-1">Uptime SLA</p>
              </div>
            </div>
          </div>

          {/* Interactive Feature Mockup Showcase */}
          <div className="lg:col-span-6 flex flex-col items-stretch relative">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 rounded-3xl p-6 glowing-shadow-lg floating-card relative z-10 w-full">
              {/* Showcase Navbar */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('boards')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'boards' ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}
                  >
                    📂 Boards
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'files' ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}
                  >
                    📁 Files
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'}`}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              {activeTab === 'boards' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Active Board: Marketing Launch</span>
                    <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full dark:bg-orange-950/40 dark:text-orange-400">In Progress</span>
                  </div>
                  {/* Kanban Cards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/60 p-3.5 rounded-2xl space-y-3 cursor-pointer hover:border-orange-200 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md">High</span>
                        <span className="text-[10px] text-gray-400 font-medium">May 28</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">Design Interactive Figma Prototypes</h4>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/40 dark:border-zinc-800/40">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Taskiyo</span>
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px] font-bold">HK</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/60 p-3.5 rounded-2xl space-y-3 cursor-pointer hover:border-orange-200 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md">Low</span>
                        <span className="text-[10px] text-gray-400 font-medium">May 29</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">Sync API and Database Collections</h4>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/40 dark:border-zinc-800/40">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Core</span>
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">AC</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-dashed border-orange-200/50 dark:border-orange-900/30 p-3 rounded-2xl text-center text-xs font-semibold text-orange-600 dark:text-orange-400">
                    + Add New Workspace Task card
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Workspace Attachments (14 Files)</span>
                    <span className="text-xs text-orange-600 font-bold cursor-pointer hover:underline">View All</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-black">PNG</div>
                        <div className="ml-3 truncate">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">landing_mockups.png</p>
                          <p className="text-[10px] text-gray-400">2.4 MB • Uploaded by Hammad Khan</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-200 dark:bg-zinc-700 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-bold">Download</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-black">WAV</div>
                        <div className="ml-3 truncate">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">voice_memo_launch.wav</p>
                          <p className="text-[10px] text-gray-400">1.8 MB • Uploaded by Alex Care</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-200 dark:bg-zinc-700 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-bold">Listen</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Workspace Channel: #general</span>
                    <span className="text-xs text-orange-600 font-bold">3 members online</span>
                  </div>
                  <div className="space-y-3 min-h-[120px] flex flex-col justify-end">
                    <div className="flex items-start space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">HK</div>
                      <div className="bg-gray-100 dark:bg-zinc-800 p-2.5 rounded-2xl rounded-tl-none">
                        <p className="text-xs font-semibold text-gray-500">Hammad Khan</p>
                        <p className="text-xs text-gray-800 dark:text-zinc-200 mt-0.5">Let's finish the final landing assets today!</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5 self-end flex-row-reverse space-x-reverse">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">AC</div>
                      <div className="bg-orange-500 text-white p-2.5 rounded-2xl rounded-tr-none">
                        <p className="text-xs font-semibold text-orange-100">Alex Care (You)</p>
                        <p className="text-xs mt-0.5">Perfect! I just uploaded the layout Figma designs directly into files.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Small absolute overlay pill */}
            <div className="absolute bottom-[-15px] right-[20px] z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
              ✨ 100% Functional App
            </div>
          </div>
        </section>

        {/* Feature Cards Grid Section */}
        <section id="features" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-gray-200/50 dark:border-zinc-800/50">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              One Workspace. Endless Productivity.
            </h2>
            <p className="text-base text-gray-600 dark:text-zinc-400">
              No more switching tabs. Taskiyo combines project organization, visual assets, and internal team coordination into a single unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200/60 dark:border-zinc-800/60 rounded-3xl p-8 hover:border-orange-500/50 dark:hover:border-orange-500/30 hover:scale-[1.02] transition-all duration-300 text-left space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">Workspace Task Boards</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Seamlessly drag and drop tasks across stages. Keep track of priority tags, assignees, dates, and detailed descriptions with interactive project timelines.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200/60 dark:border-zinc-800/60 rounded-3xl p-8 hover:border-orange-500/50 dark:hover:border-orange-500/30 hover:scale-[1.02] transition-all duration-300 text-left space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">Centralized File Hub</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Upload up to 50MB documents, pictures, or voice notes. Filter by category, project, and easily download them directly from the main workspace files manager.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200/60 dark:border-zinc-800/60 rounded-3xl p-8 hover:border-orange-500/50 dark:hover:border-orange-500/30 hover:scale-[1.02] transition-all duration-300 text-left space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l3.416-3.416a2 2 0 012.828 0l3.416 3.416m-9.66 5.433A9.001 9.001 0 1121 12h-3" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">Workspace Chat Sync</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                Real-time conversations with your team members inside dedicated project channels. Image and audio uploads in chat auto-sync directly with your Files system.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Calculator Section */}
        <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-gray-200/50 dark:border-zinc-800/50 text-center">
          <div className="max-w-2xl mx-auto space-y-4 mb-12">
            <h2 className="font-outfit text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Pricing Tailored For Teams</h2>
            <p className="text-base text-gray-600 dark:text-zinc-400">Choose the ideal workspace plan. Scale up as your team grows.</p>
            <div className="flex items-center justify-center space-x-3 pt-3">
              <span className={`text-sm font-bold ${pricingPlan === 'monthly' ? 'text-orange-600' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setPricingPlan((p) => p === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-7 bg-orange-600 rounded-full p-1 transition-colors duration-200 focus:outline-none relative"
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${pricingPlan === 'yearly' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-bold ${pricingPlan === 'yearly' ? 'text-orange-600' : 'text-gray-400'}`}>Yearly (Save 20%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200/60 dark:border-zinc-800/60 rounded-3xl p-10 flex flex-col justify-between text-left shadow-sm">
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 font-outfit">Startup Starter</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-gray-900 dark:text-white font-outfit">$0</span>
                  <span className="text-gray-400 font-semibold ml-2">/ month</span>
                </div>
                <p className="text-sm text-gray-500">Perfect for individuals and small startups looking to structure their workflows.</p>
                <div className="w-full h-px bg-gray-100 dark:bg-zinc-800" />
                <ul className="space-y-3.5 text-sm text-gray-600 dark:text-zinc-300 font-semibold">
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Up to 3 Workspace Projects</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Standard Kanban Boards & Lists</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> 5MB File Upload Capacity</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> General Chat Channels</li>
                </ul>
              </div>
              <Link
                href="/auth/join"
                className="mt-8 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold py-3.5 px-6 rounded-2xl text-center transition-all"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-zinc-900/50 border-2 border-orange-500 rounded-3xl p-10 flex flex-col justify-between text-left shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-red-600 text-white text-[10px] font-black px-6 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-orange-500 font-outfit">Enterprise Growth</h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-gray-900 dark:text-white font-outfit">
                    {pricingPlan === 'monthly' ? '$19' : '$15'}
                  </span>
                  <span className="text-gray-400 font-semibold ml-2">/ month</span>
                </div>
                <p className="text-sm text-gray-500">Accelerate collaboration with unlimited resources, storage, and premium controls.</p>
                <div className="w-full h-px bg-gray-100 dark:bg-zinc-800" />
                <ul className="space-y-3.5 text-sm text-gray-600 dark:text-zinc-300 font-semibold">
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Unlimited Workspace Projects</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Drag-and-Drop Task Sync</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> 50MB Large File uploads</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Real-Time Channel Chat Sync</li>
                  <li className="flex items-center"><span className="text-orange-500 mr-2.5">✓</span> Premium Workspace Settings</li>
                </ul>
              </div>
              <Link
                href="/auth/join"
                className="mt-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3.5 px-6 rounded-2xl text-center shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all scale-100 hover:scale-[1.01]"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ Section */}
        <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto border-t border-gray-200/50 dark:border-zinc-800/50">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-outfit text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Got Questions? We Have Answers.</h2>
            <p className="text-base text-gray-600 dark:text-zinc-400">Everything you need to know about the Taskiyo productivity workspace.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Taskiyo?",
                a: "Taskiyo is a modern, unified task and workspace management system designed for startup and enterprise teams. It organizes your project tasks, keeps your workspace files accessible, and houses real-time team chats in a single clean portal."
              },
              {
                q: "Can I upload large files and assets?",
                a: "Yes! Taskiyo handles file sizes up to 50MB, including images, zip packages, PDF documents, and wav voice recordings. Anything you upload inside task cards or chats automatically propagates to the main Project Files manager."
              },
              {
                q: "How does credentials-only login work?",
                a: "For maximum clarity and protection, Taskiyo restricts login and registration exclusively to secure email-and-password credentials. Unneeded third-party trackers and complex OAuth sign-in options have been fully removed."
              },
              {
                q: "Can I manage multiple teams and workspaces?",
                a: "Yes, you can create and swap between multiple teams and workspaces effortlessly. Dynamic headers automatically coordinate your active workspaces, projects, billing plans, and file allocations."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900/50 border border-gray-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq((prev) => prev === index ? null : index)}
                  className="w-full text-left p-6 flex justify-between items-center focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-gray-900 dark:text-white font-outfit">{faq.q}</span>
                  <span className={`text-orange-500 font-extrabold text-lg transform transition-transform duration-200 ${openFaq === index ? 'rotate-45' : 'rotate-0'}`}>
                    ＋
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${openFaq === index ? 'max-h-[200px] border-t border-gray-100 dark:border-zinc-800' : 'max-h-0'}`}
                >
                  <p className="p-6 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="py-12 bg-white dark:bg-zinc-950 border-t border-gray-200/50 dark:border-zinc-900/80 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="font-outfit text-sm font-bold text-gray-900 dark:text-white">Taskiyo</span>
              <span>© {new Date().getFullYear()} Taskiyo. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/support" className="hover:underline">Support Hub</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  if (env.hideLandingPage) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: true,
      },
    };
  }

  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
