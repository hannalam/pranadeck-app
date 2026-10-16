'use client';

import { useState } from 'react';
import Image from 'next/image';
import poseData from '@/poses.json';

interface Pose {
  image_filename: string;
  category: string;
  name_en: string;
  name_zh_hk: string;
  sanskrit_name: string;
  is_free: boolean;
}

const CATEGORIES = [
  'All',
  'Standing & Balance',
  'Seated, Twists & Forward Bends',
  'Backbends & Heart Openers',
  'Arm Balances & Core',
  'Inversions',
  'Hip Openers & Deep Stretches',
  'Reclined (Supine) & Prone',
  'Restorative & Cool Down',
];

export default function Home() {
  const [lang, setLang] = useState<'en' | 'zh_hk'>('en');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePose, setActivePose] = useState<Pose | null>(null);

  const filteredPoses = (poseData as Pose[]).filter((pose) => {
    const matchesCat = selectedCategory === 'All' || pose.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      pose.name_en.toLowerCase().includes(q) ||
      pose.name_zh_hk.includes(q) ||
      pose.sanskrit_name.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-800 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center font-bold text-sm">
              iP
            </div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight">
              iPrana <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">AsanaFlow</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh_hk' : 'en')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-300 hover:bg-stone-100 transition"
            >
              🌐 {lang === 'en' ? '繁體中文' : 'English'}
            </button>

            <button
              onClick={() => setIsPro(!isPro)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition shadow-sm ${
                isPro
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              👑 {isPro ? 'Pro Unlocked (Demo Mode)' : 'Unlock All 207 Poses'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              {lang === 'en' ? 'Pose Library Explorer' : '探索瑜伽體式庫'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {lang === 'en'
                ? '50 Free demo poses available. Upgrade to unlock the full 207 pose library.'
                : '免費體驗 50 個基礎體式。升級解鎖全庫 207 個體式。'}
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search pose name or Sanskrit...' : '搜尋體式名稱或梵文...'}
            className="w-full md:w-80 px-4 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pose Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPoses.map((pose) => {
            const isLocked = !pose.is_free && !isPro;
            return (
              <div
                key={pose.image_filename}
                onClick={() => setActivePose(pose)}
                className="group bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition cursor-pointer flex flex-col justify-between overflow-hidden relative"
              >
                {/* Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    {pose.category.split(',')[0]}
                  </span>
                  {isLocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      🔒 PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      FREE
                    </span>
                  )}
                </div>

                {/* Photo */}
                <div className="my-4 relative h-36 w-full bg-stone-50/50 rounded-xl flex items-center justify-center p-2">
                  <Image
                    src={`/jpgs/${pose.image_filename}`}
                    alt={pose.name_en}
                    fill
                    className={`object-contain p-2 transition group-hover:scale-105 duration-200 ${
                      isLocked ? 'blur-sm opacity-50' : ''
                    }`}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full bg-stone-900/80 text-white flex items-center justify-center text-xs">
                        🔒
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="pt-2 border-t border-stone-100">
                  <h3 className="text-xs font-bold text-stone-900 truncate">
                    {lang === 'en' ? pose.name_en : pose.name_zh_hk}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-serif italic truncate mt-0.5">
                    {pose.sanskrit_name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {activePose && (
        <div
          onClick={() => setActivePose(null)}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-100 p-6"
          >
            <div className="relative h-48 w-full bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
              <Image
                src={`/jpgs/${activePose.image_filename}`}
                alt={activePose.name_en}
                fill
                className={`object-contain p-4 ${
                  !activePose.is_free && !isPro ? 'blur-md opacity-40' : ''
                }`}
              />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 py-1 bg-stone-100 rounded-md">
              {activePose.category}
            </span>
            <h3 className="text-lg font-bold text-stone-900 mt-2">
              {lang === 'en' ? activePose.name_en : activePose.name_zh_hk}
            </h3>
            <p className="text-xs text-stone-400 font-serif italic mt-0.5">
              {activePose.sanskrit_name}
            </p>

            <button
              onClick={() => setActivePose(null)}
              className="mt-6 w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}