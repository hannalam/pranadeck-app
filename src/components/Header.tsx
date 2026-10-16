/* Top Navbar, Language Toggle & Upgrade CTA */

import React from 'react';

export default function Header({ t, lang, setLang, isPro, setIsPro, savedSequences, setShowPaywallModal }: any) {
  return (
    <header className="h-13 bg-white border-b border-stone-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-black text-xs">iP</div>
        <h1 className="text-xs font-bold text-stone-900 tracking-tight">{t.appTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium">
          {t.freeLimitBadge} <span className="font-bold text-emerald-700">{savedSequences.length}/{isPro ? '∞' : '3'}</span>
        </div>
        <button onClick={() => setLang(lang === 'en' ? 'zh_hk' : 'en')} className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50 transition">
          🌐 {lang === 'en' ? '繁體中文' : 'English'}
        </button>
        <button onClick={() => !isPro ? setShowPaywallModal(true) : setIsPro(false)} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition shadow-sm ${isPro ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
          {isPro ? t.proUnlocked : `👑 ${t.unlockAll}`}
        </button>
      </div>
    </header>
  );
}