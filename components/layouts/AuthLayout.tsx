import app from '@/lib/app';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 font-inter flex flex-col justify-center relative overflow-hidden px-6 py-20 transition-colors duration-300">
      {/* Background soft glowing blur elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-orange-100/40 dark:bg-orange-950/15 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-amber-100/30 dark:bg-zinc-900/10 blur-[130px] pointer-events-none" />

      {/* Styled font references for Outfit */}
      <style jsx global>{`
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex flex-col items-center group mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="font-outfit text-2xl font-extrabold tracking-tight mt-3 text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Taskiyo
          </span>
        </Link>

        {heading && (
          <h2 className="text-center text-3xl font-black font-outfit tracking-tight text-gray-900 dark:text-white">
            {t(heading)}
          </h2>
        )}
        {description && (
          <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-zinc-400">
            {t(description)}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl shadow-orange-500/5 hover:shadow-orange-500/10 transition-all duration-300 backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  );
}
