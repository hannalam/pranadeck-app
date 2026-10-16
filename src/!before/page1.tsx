'use client';

import { useState } from 'react';
import Image from 'next/image';
import poseData from '../poses.json';

interface Pose {
  image_filename: string;
  category: string;
  name_en: string;
  name_zh_hk: string;
  sanskrit_name: string;
  is_free: boolean;
}

interface SequenceItem extends Pose {
  instanceId: string;
  durationSeconds: number;
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

const TIMER_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function Home() {
  const [lang, setLang] = useState<'en' | 'zh_hk'>('en');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePose, setActivePose] = useState<Pose | null>(null);

  // Sequence state
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [draggedPose, setDraggedPose] = useState<Pose | null>(null);

  // Filter poses by category & search
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

  // Add pose to sequence timeline
  const addPoseToSequence = (pose: Pose) => {
    const newItem: SequenceItem = {
      ...pose,
      instanceId: `${pose.image_filename}-${Date.now()}-${Math.random()}`,
      durationSeconds: 45,
    };
    setSequence((prev) => [...prev, newItem]);
  };

  // Remove pose from sequence
  const removeFromSequence = (instanceId: string) => {
    setSequence((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };

  // Update timer for a specific sequence pose
  const updateDuration = (instanceId: string, seconds: number) => {
    setSequence((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId ? { ...item, durationSeconds: seconds } : item
      )
    );
  };

  // Calculate total sequence duration
  const totalSeconds = sequence.reduce((sum, item) => sum + item.durationSeconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return (
    <div className="h-screen w-screen bg-stone-50/50 text-stone-800 font-sans flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-stone-200/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-stone-800 text-white flex items-center justify-center font-bold text-xs">
            iP
          </div>
          <h1 className="text-base font-bold text-stone-900 tracking-tight">
            iPrana{' '}
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              PranaDeck 50/50
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'zh_hk' : 'en')}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-stone-300 hover:bg-stone-100 transition"
          >
            🌐 {lang === 'en' ? '繁體中文' : 'English'}
          </button>

          <button
            onClick={() => setIsPro(!isPro)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition shadow-sm ${
              isPro
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            👑 {isPro ? 'Pro Unlocked (Demo Mode)' : 'Unlock All Poses'}
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout (50% Left / 50% Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT 50%: Pose Library Collection */}
        <section className="w-1/2 border-r border-stone-200 flex flex-col bg-stone-50/30 overflow-hidden">
          {/* Library Header Controls */}
          <div className="p-4 border-b border-stone-200 bg-white space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                {lang === 'en' ? 'Pose Library' : '體式庫'} ({filteredPoses.length})
              </h2>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'en' ? 'Search pose...' : '搜尋體式...'}
                className="w-48 px-3 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Library Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredPoses.map((pose) => {
                const isLocked = !pose.is_free && !isPro;
                return (
                  <div
                    key={pose.image_filename}
                    draggable={!isLocked}
                    onDragStart={() => setDraggedPose(pose)}
                    onDragEnd={() => setDraggedPose(null)}
                    onClick={() => setActivePose(pose)}
                    className={`group bg-white rounded-xl border border-stone-200/80 p-3 shadow-sm hover:shadow transition cursor-pointer flex flex-col justify-between relative ${
                      isLocked ? 'cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 truncate max-w-[90px]">
                        {pose.category.split(',')[0]}
                      </span>
                      {isLocked ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          🔒
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          FREE
                        </span>
                      )}
                    </div>

                    <div className="my-2 relative h-28 w-full bg-stone-50/50 rounded-lg flex items-center justify-center p-1">
                      <Image
                        src={`/jpgs/${pose.image_filename}`}
                        alt={pose.name_en}
                        fill
                        className={`object-contain p-1 transition group-hover:scale-105 duration-200 ${
                          isLocked ? 'blur-sm opacity-50' : ''
                        }`}
                      />
                      {isLocked && (
                        <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                          <span className="w-6 h-6 rounded-full bg-stone-900/80 text-white flex items-center justify-center text-[10px]">
                            🔒
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="truncate">
                        <h3 className="text-xs font-bold text-stone-900 truncate">
                          {lang === 'en' ? pose.name_en : pose.name_zh_hk}
                        </h3>
                        <p className="text-[10px] text-stone-400 font-serif italic truncate">
                          {pose.sanskrit_name}
                        </p>
                      </div>
                      {!isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addPoseToSequence(pose);
                          }}
                          className="ml-2 w-6 h-6 rounded bg-stone-100 hover:bg-stone-900 hover:text-white transition flex items-center justify-center text-xs font-bold shrink-0"
                          title="Add to Sequence"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT 50%: Sequence Builder & Timeline */}
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedPose && (draggedPose.is_free || isPro)) {
              addPoseToSequence(draggedPose);
            }
          }}
          className="w-1/2 flex flex-col bg-white overflow-hidden"
        >
          {/* Sequence Header Info Bar */}
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span>⏱️</span> {lang === 'en' ? 'Class Sequence Builder' : '課堂序列時間軸'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Total Practice Time:{' '}
                <span className="text-emerald-700 font-bold">
                  {totalMinutes}m {remainingSeconds}s
                </span>{' '}
                ({sequence.length} poses)
              </p>
            </div>

            {sequence.length > 0 && (
              <button
                onClick={() => setSequence([])}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sequence List View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {sequence.length === 0 ? (
              <div className="h-full border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <span className="text-3xl mb-2">🧘‍♀️</span>
                <p className="text-xs font-semibold">Drop Poses Here</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Drag poses from the left library or click <span className="font-bold">+</span> to start building your class sequence.
                </p>
              </div>
            ) : (
              sequence.map((item, index) => (
                <div
                  key={item.instanceId}
                  className="flex items-center justify-between bg-stone-50/80 border border-stone-200 rounded-xl p-2.5 hover:border-stone-300 transition shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-400 w-5 text-center">
                      {index + 1}
                    </span>

                    <div className="relative w-12 h-12 bg-white rounded-lg border border-stone-200 overflow-hidden shrink-0">
                      <Image
                        src={`/jpgs/${item.image_filename}`}
                        alt={item.name_en}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {lang === 'en' ? item.name_en : item.name_zh_hk}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-serif italic">
                        {item.sanskrit_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Timer Selector */}
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-400">Timer:</span>
                      <select
                        value={item.durationSeconds}
                        onChange={(e) => updateDuration(item.instanceId, Number(e.target.value))}
                        className="text-xs font-bold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
                      >
                        {TIMER_OPTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}s
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete Pose */}
                    <button
                      onClick={() => removeFromSequence(item.instanceId)}
                      className="w-6 h-6 rounded-lg bg-stone-200/60 hover:bg-rose-100 text-stone-500 hover:text-rose-600 transition flex items-center justify-center text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal Preview */}
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

            <div className="mt-6 flex gap-2">
              {(activePose.is_free || isPro) && (
                <button
                  onClick={() => {
                    addPoseToSequence(activePose);
                    setActivePose(null);
                  }}
                  className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition"
                >
                  + Add to Sequence
                </button>
              )}
              <button
                onClick={() => setActivePose(null)}
                className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}