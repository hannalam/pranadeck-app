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

interface SavedSequence {
  id: string;
  title: string;
  items: SequenceItem[];
  createdAt: string;
}

// Complete Multilingual Dictionary
const DICTIONARY = {
  en: {
    appTitle: 'PranaDeck',
    proUnlocked: 'Pro Unlocked',
    unlockAll: 'Unlock All Poses',
    poseLibrary: 'Pose Library',
    searchPlaceholder: 'Search pose...',
    classBuilder: 'Active Timeline Builder',
    totalPracticeTime: 'Total Duration:',
    clearAll: 'Clear All',
    saveAndDone: 'Save Sequence',
    editSequence: 'Edit Sequence',
    startPractice: '▶ Start Guided Practice',
    dropPosesHere: 'Drag poses here or click +',
    dragHint: 'Select poses from the left library to build your sequence.',
    savedTimeline: 'Saved Class Timeline',
    freeBadge: 'FREE',
    proBadge: 'PRO',
    timerLabel: 'Timer:',
    close: 'Close',
    addToSequence: '+ Add',
    proLockedTitle: 'Unlock 150+ Professional Poses',
    proLockedDesc: 'Get unlimited access to the complete 207-pose library, advanced inversions, and deep hip openers.',
    upgradeNow: 'Upgrade to Pro ($9.99/mo)',
    teaserTitle: '150+ Pro Poses',
    teaserSubtitle: 'Click to preview & unlock full library',
    savedSequencesTitle: 'My Saved Sequences',
    freeLimitBadge: 'Free Limit:',
    freeSlots: 'Free Slots',
    limitReachedTitle: 'Sequence Limit Reached (3/3)',
    limitReachedDesc: 'Free tier includes 3 sequence slots. Upgrade to Pro to create unlimited class flows!',
    newSequence: '+ New Sequence',
    playSequence: 'Play',
    posesCount: 'Poses',
    sequencePrefix: 'Sequence',
    emptySaved: 'No saved flows yet.',
  },
  zh_hk: {
    appTitle: 'PranaDeck',
    proUnlocked: '已解鎖 Pro',
    unlockAll: '解鎖全庫體式',
    poseLibrary: '瑜伽體式庫',
    searchPlaceholder: '搜尋體式...',
    classBuilder: '當前編排時間軸',
    totalPracticeTime: '總練習時長：',
    clearAll: '清空序列',
    saveAndDone: '保存課堂序列',
    editSequence: '編輯序列',
    startPractice: '▶ 開始引導練習',
    dropPosesHere: '拖放體式至此或點擊 +',
    dragHint: '從左側點擊或拖放體式以自訂您的課堂流程。',
    savedTimeline: '已保存的課堂時間軸',
    freeBadge: '免費',
    proBadge: 'PRO',
    timerLabel: '時長：',
    close: '關閉',
    addToSequence: '+ 加入',
    proLockedTitle: '解鎖 150+ 專業瑜伽體式',
    proLockedDesc: '獲得完整 207 個體式庫、高階倒立及深層開髖體式的無限存取權。',
    upgradeNow: '立即升級 Pro (HK$78/月)',
    teaserTitle: '150+ Pro 體式寶庫',
    teaserSubtitle: '點擊預覽並解鎖完整體式庫',
    savedSequencesTitle: '我的課堂序列',
    freeLimitBadge: '免費額度：',
    freeSlots: '個免費儲存位',
    limitReachedTitle: '已達免費序列上限 (3/3)',
    limitReachedDesc: '免費版本提供 3 個序列儲存位。升級至 Pro 即可建立無限課堂序列！',
    newSequence: '+ 新建序列',
    playSequence: '播放',
    posesCount: '個體式',
    sequencePrefix: '序列',
    emptySaved: '尚無保存的序列。',
  },
};

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

const CATEGORY_NAMES: Record<string, { en: string; zh_hk: string }> = {
  All: { en: 'All Poses', zh_hk: '全部體式' },
  'Standing & Balance': { en: 'Standing & Balance', zh_hk: '站立與平衡' },
  'Seated, Twists & Forward Bends': { en: 'Seated & Twists', zh_hk: '坐姿與扭轉' },
  'Backbends & Heart Openers': { en: 'Backbends', zh_hk: '後彎與開胸' },
  'Arm Balances & Core': { en: 'Arm Balances', zh_hk: '手臂支撐' },
  Inversions: { en: 'Inversions', zh_hk: '倒立體式' },
  'Hip Openers & Deep Stretches': { en: 'Hip Openers', zh_hk: '開髖伸展' },
  'Reclined (Supine) & Prone': { en: 'Reclined & Prone', zh_hk: '仰臥與俯臥' },
  'Restorative & Cool Down': { en: 'Restorative', zh_hk: '修復放鬆' },
};

const TIMER_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function Home() {
  const [lang, setLang] = useState<'en' | 'zh_hk'>('en');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePose, setActivePose] = useState<Pose | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  // Active Draft Sequence
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [draggedPose, setDraggedPose] = useState<Pose | null>(null);
  const [isSavedMode, setIsSavedMode] = useState<boolean>(false);

  // Saved Sequences Storage (3 Free Max)
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);

  // Rename Sequence State
  const [editingSeqId, setEditingSeqId] = useState<string | null>(null);
  const [editSeqTitle, setEditSeqTitle] = useState<string>('');

  const t = DICTIONARY[lang];

  // Filter poses
  const allPoses = poseData as Pose[];
  const filteredPoses = allPoses.filter((pose) => {
    if (!pose.is_free && !isPro) return false;
    const matchesCat = selectedCategory === 'All' || pose.category === selectedCategory;
    const q = search.toLowerCase().trim();
    return (
      matchesCat &&
      (!q ||
        pose.name_en.toLowerCase().includes(q) ||
        pose.name_zh_hk.includes(q) ||
        pose.sanskrit_name.toLowerCase().includes(q))
    );
  });

  const addPoseToSequence = (pose: Pose) => {
    if (isSavedMode) setIsSavedMode(false);
    const newItem: SequenceItem = {
      ...pose,
      instanceId: `${pose.image_filename}-${Date.now()}-${Math.random()}`,
      durationSeconds: 45,
    };
    setSequence((prev) => [...prev, newItem]);
  };

  const removeFromSequence = (instanceId: string) => {
    setSequence((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };

  const updateDuration = (instanceId: string, seconds: number) => {
    setSequence((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId ? { ...item, durationSeconds: seconds } : item
      )
    );
  };

  const handleSaveSequence = () => {
    if (sequence.length === 0) return;
    
    // If editing an existing sequence, just update it
    if (activeSequenceId) {
      setSavedSequences((prev) => prev.map(seq => 
        seq.id === activeSequenceId ? { ...seq, items: [...sequence] } : seq
      ));
      setIsSavedMode(true);
      return;
    }

    // New sequence limit check
    if (!isPro && savedSequences.length >= 3) {
      setShowPaywallModal(true);
      return;
    }

    const newSeq: SavedSequence = {
      id: `seq-${Date.now()}`,
      title: `${t.sequencePrefix} #${savedSequences.length + 1}`,
      items: [...sequence],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSavedSequences((prev) => [...prev, newSeq]);
    setActiveSequenceId(newSeq.id);
    setIsSavedMode(true);
  };

  const loadSavedSequence = (seq: SavedSequence) => {
    setSequence(seq.items);
    setActiveSequenceId(seq.id);
    setIsSavedMode(true);
  };

  const createNewSequence = () => {
    if (!isPro && savedSequences.length >= 3) {
      setShowPaywallModal(true);
      return;
    }
    setSequence([]);
    setActiveSequenceId(null);
    setIsSavedMode(false);
  };

  // Delete & Rename Handlers
  const deleteSequence = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedSequences(prev => prev.filter(s => s.id !== id));
    if (activeSequenceId === id) {
      setActiveSequenceId(null);
      setSequence([]);
      setIsSavedMode(false);
    }
  };

  const startEditingRename = (e: React.MouseEvent, seq: SavedSequence) => {
    e.stopPropagation();
    setEditingSeqId(seq.id);
    setEditSeqTitle(seq.title);
  };

  const saveRename = () => {
    if (editingSeqId) {
      setSavedSequences(prev =>
        prev.map(s => (s.id === editingSeqId ? { ...s, title: editSeqTitle || t.sequencePrefix } : s))
      );
      setEditingSeqId(null);
    }
  };

  const getAccumulatedTime = (index: number) => {
    const elapsedSeconds = sequence
      .slice(0, index)
      .reduce((sum, item) => sum + item.durationSeconds, 0);
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = sequence.reduce((sum, item) => sum + item.durationSeconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return (
    <div className="h-screen w-screen bg-stone-100/70 text-stone-800 font-sans flex flex-col overflow-hidden">
      
      {/* TOP HEADER */}
      <header className="h-14 bg-white border-b border-stone-200 px-4 lg:px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            iP
          </div>
          <h1 className="text-sm font-bold text-stone-900 tracking-tight">
            {t.appTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Free Sequence Counter Badge */}
          <div className="hidden sm:flex text-xs font-medium px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 items-center gap-1.5">
            <span>📚 {t.freeLimitBadge}</span>
            <span className={`font-bold ${savedSequences.length >= 3 && !isPro ? 'text-amber-600' : 'text-stone-900'}`}>
              {savedSequences.length}/{isPro ? '∞' : '3'}
            </span>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'zh_hk' : 'en')}
            className="px-2.5 py-1 text-[11px] lg:text-xs font-medium rounded-lg border border-stone-300 hover:bg-stone-100 transition"
          >
            🌐 {lang === 'en' ? '繁體中文' : 'English'}
          </button>

          <button
            onClick={() => {
              if (!isPro) setShowPaywallModal(true);
              else setIsPro(false);
            }}
            className={`px-3 py-1 text-[11px] lg:text-xs font-semibold rounded-lg border transition shadow-sm ${
              isPro ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            👑 {isPro ? t.proUnlocked : t.unlockAll}
          </button>
        </div>
      </header>

      {/* THREE-AREA DASHBOARD LAYOUT (Responsive: Stack on mobile, side-by-side on lg) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* AREA 1: POSE LIBRARY */}
        <section className="w-full lg:w-[35%] h-[500px] lg:h-full border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col bg-stone-50/50 shrink-0 lg:shrink">
          <div className="p-3.5 border-b border-stone-200 bg-white space-y-2.5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t.poseLibrary} ({filteredPoses.length})
              </h2>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full sm:w-40 px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Scrollable Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide touch-pan-x whitespace-nowrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-full transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {CATEGORY_NAMES[cat] ? CATEGORY_NAMES[cat][lang] : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {/* PRO UNLOCK TEASER CARD */}
              {!isPro && selectedCategory === 'All' && !search && (
                <div
                  onClick={() => setShowPaywallModal(true)}
                  className="group relative bg-gradient-to-br from-amber-500 via-amber-600 to-stone-900 rounded-xl p-3 text-white shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between overflow-hidden border border-amber-400/50 min-h-[140px]"
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-300 text-amber-950 uppercase">PRO PACK</span>
                    <span className="text-[10px]">🔒</span>
                  </div>
                  <div className="my-2 relative h-16 w-full bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                    <div className="grid grid-cols-3 gap-1 opacity-75 blur-[1px] group-hover:blur-0 transition duration-300">
                      <div className="relative w-6 h-6"><Image src="/jpgs/bakasana.jpg" alt="pro" fill className="object-contain" /></div>
                      <div className="relative w-6 h-6"><Image src="/jpgs/hanumanasana.jpg" alt="pro" fill className="object-contain" /></div>
                      <div className="relative w-6 h-6"><Image src="/jpgs/salamba-shirshasana-1.jpg" alt="pro" fill className="object-contain" /></div>
                    </div>
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center font-bold text-[10px]">+157</div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight text-amber-100">{t.teaserTitle}</h3>
                    <p className="text-[9px] text-amber-200/80 truncate mt-0.5">{t.teaserSubtitle}</p>
                  </div>
                </div>
              )}

              {/* FREE POSE CARDS */}
              {filteredPoses.map((pose) => (
                <div
                  key={pose.image_filename}
                  draggable
                  onDragStart={() => setDraggedPose(pose)}
                  onDragEnd={() => setDraggedPose(null)}
                  onClick={() => setActivePose(pose)}
                  className="group bg-white rounded-xl border border-stone-200/80 p-2.5 shadow-sm hover:shadow transition cursor-pointer flex flex-col justify-between relative active:scale-95 min-h-[140px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-stone-100 text-stone-600 truncate max-w-[70px]">
                      {CATEGORY_NAMES[pose.category] ? CATEGORY_NAMES[pose.category][lang] : pose.category}
                    </span>
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{t.freeBadge}</span>
                  </div>

                  <div className="my-1.5 relative h-20 w-full bg-stone-50/50 rounded-lg flex items-center justify-center p-1">
                    <Image src={`/jpgs/${pose.image_filename}`} alt={pose.name_en} fill className="object-contain p-1 group-hover:scale-105 transition" />
                  </div>

                  <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between">
                    <div className="truncate pr-1">
                      <h3 className="text-[11px] font-bold text-stone-900 truncate">
                        {lang === 'en' ? pose.name_en : pose.name_zh_hk}
                      </h3>
                      <p className="text-[9px] text-stone-400 font-serif italic truncate">{pose.sanskrit_name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); addPoseToSequence(pose); }}
                      className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white transition flex items-center justify-center text-xs font-bold shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AREA 2: ACTIVE TIMELINE BUILDER */}
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedPose && !isSavedMode) addPoseToSequence(draggedPose);
          }}
          className="w-full lg:w-[45%] h-[500px] lg:h-full flex flex-col bg-white overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200 shrink-0 lg:shrink"
        >
          <div className="p-3.5 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⏱️</span> {isSavedMode ? t.savedTimeline : t.classBuilder}
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.totalPracticeTime}{' '}
                <span className="text-emerald-700 font-bold">{totalMinutes}m {remainingSeconds}s</span>{' '}
                ({sequence.length} {t.posesCount})
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isSavedMode ? (
                <>
                  {sequence.length > 0 && (
                    <button onClick={() => setSequence([])} className="text-[11px] text-rose-500 hover:text-rose-700 font-medium px-1.5">
                      {t.clearAll}
                    </button>
                  )}
                  <button
                    disabled={sequence.length === 0}
                    onClick={handleSaveSequence}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 text-white rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap"
                  >
                    ✓ {t.saveAndDone}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsSavedMode(false)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition"
                >
                  ✏️ {t.editSequence}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {sequence.length === 0 ? (
              <div className="h-full border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-stone-400">
                <span className="text-3xl mb-2">🧘‍♀️</span>
                <p className="text-xs font-semibold">{t.dropPosesHere}</p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-xs">{t.dragHint}</p>
              </div>
            ) : isSavedMode ? (
              <div className="space-y-3 pb-8">
                <button className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition shadow-sm">
                  {t.startPractice}
                </button>
                <div className="relative pl-5 border-l-2 border-stone-200 space-y-3 my-3">
                  {sequence.map((item, index) => (
                    <div key={item.instanceId} className="relative flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-2.5 shadow-sm">
                      <div className="absolute -left-[27px] w-2.5 h-2.5 rounded-full bg-stone-800 border-2 border-white"></div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{getAccumulatedTime(index)}</span>
                        <div className="relative w-9 h-9 bg-white rounded-lg border border-stone-200 overflow-hidden shrink-0">
                          <Image src={`/jpgs/${item.image_filename}`} alt={item.name_en} fill className="object-contain p-0.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">{lang === 'en' ? item.name_en : item.name_zh_hk}</h4>
                          <p className="text-[9px] text-stone-400 italic">{item.sanskrit_name}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">{item.durationSeconds}s</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              sequence.map((item, index) => (
                <div key={item.instanceId} className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-stone-50/80 border border-stone-200 rounded-xl p-2 hover:border-stone-300 transition shadow-sm gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-stone-400 w-4 text-center">{index + 1}</span>
                    <div className="relative w-10 h-10 bg-white rounded-lg border border-stone-200 overflow-hidden shrink-0">
                      <Image src={`/jpgs/${item.image_filename}`} alt={item.name_en} fill className="object-contain p-0.5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{lang === 'en' ? item.name_en : item.name_zh_hk}</h4>
                      <p className="text-[9px] text-stone-400 font-serif italic truncate">{item.sanskrit_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      <span className="text-[9px] text-stone-400 hidden sm:inline">{t.timerLabel}</span>
                      <select
                        value={item.durationSeconds}
                        onChange={(e) => updateDuration(item.instanceId, Number(e.target.value))}
                        className="text-xs font-bold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
                      >
                        {TIMER_OPTIONS.map((sec) => (<option key={sec} value={sec}>{sec}s</option>))}
                      </select>
                    </div>
                    <button onClick={() => removeFromSequence(item.instanceId)} className="w-6 h-6 rounded bg-stone-200/60 hover:bg-rose-100 text-stone-500 hover:text-rose-600 transition flex items-center justify-center text-xs font-bold">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AREA 3: SAVED SEQUENCES MANAGER */}
        <section className="w-full lg:w-[20%] h-[350px] lg:h-full flex flex-col bg-stone-50/30 overflow-hidden shrink-0 lg:shrink">
          <div className="p-3.5 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">{t.savedSequencesTitle}</h2>
              <p className="text-[10px] text-stone-500 mt-0.5">{savedSequences.length}/3 {t.freeSlots}</p>
            </div>
            <button onClick={createNewSequence} className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-[10px] font-bold transition whitespace-nowrap">
              {t.newSequence}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {!isPro && savedSequences.length >= 3 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[10px] space-y-1">
                <p className="font-bold">{t.limitReachedTitle}</p>
                <p className="text-amber-800/80 leading-tight">{t.limitReachedDesc}</p>
                <button onClick={() => setShowPaywallModal(true)} className="w-full mt-1.5 py-1.5 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition">
                  {t.unlockAll}
                </button>
              </div>
            )}

            {savedSequences.length === 0 ? (
              <p className="text-[11px] text-stone-400 text-center py-8 italic">{t.emptySaved}</p>
            ) : (
              savedSequences.map((seq) => (
                <div
                  key={seq.id}
                  className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                    activeSequenceId === seq.id ? 'bg-white border-emerald-600 shadow-sm' : 'bg-white border-stone-200 hover:border-stone-300 cursor-pointer'
                  }`}
                  onClick={() => { if (editingSeqId !== seq.id) loadSavedSequence(seq); }}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Inline Editing for Name */}
                    {editingSeqId === seq.id ? (
                      <input
                        autoFocus
                        value={editSeqTitle}
                        onChange={(e) => setEditSeqTitle(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-stone-900 bg-stone-100 border border-stone-300 rounded px-1 w-full focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                    ) : (
                      <h4 className="text-xs font-bold text-stone-900 truncate flex-1">{seq.title}</h4>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      {editingSeqId !== seq.id && (
                        <button onClick={(e) => startEditingRename(e, seq)} className="text-stone-400 hover:text-stone-700 p-0.5">✏️</button>
                      )}
                      <button onClick={(e) => deleteSequence(e, seq.id)} className="text-stone-400 hover:text-rose-500 p-0.5">🗑️</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[10px] text-stone-500">
                    <span>{seq.items.length} {t.posesCount}</span>
                    {activeSequenceId === seq.id ? (
                      <span className="font-bold text-emerald-700">{t.playSequence} ▶</span>
                    ) : (
                      <span className="text-[9px]">{seq.createdAt}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* MODALS */}
      {showPaywallModal && (
        <div onClick={() => setShowPaywallModal(false)} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto mb-3">👑</div>
            <h3 className="text-lg font-bold text-stone-900">{t.proLockedTitle}</h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">{t.proLockedDesc}</p>
            <div className="my-5 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-left text-xs space-y-1.5 text-amber-900 font-medium">
              <p>✓ Unlock 207 complete posture vectors</p>
              <p>✓ Unlimited saved class sequence slots</p>
            </div>
            <button onClick={() => { setIsPro(true); setShowPaywallModal(false); }} className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition shadow-md">
              {t.upgradeNow}
            </button>
            <button onClick={() => setShowPaywallModal(false)} className="mt-3 text-xs text-stone-400 hover:text-stone-600 font-medium">{t.close}</button>
          </div>
        </div>
      )}

      {activePose && (
        <div onClick={() => setActivePose(null)} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-100 p-6">
            <div className="relative h-48 w-full bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
              <Image src={`/jpgs/${activePose.image_filename}`} alt={activePose.name_en} fill className="object-contain p-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 py-1 bg-stone-100 rounded-md">
              {CATEGORY_NAMES[activePose.category] ? CATEGORY_NAMES[activePose.category][lang] : activePose.category}
            </span>
            <h3 className="text-lg font-bold text-stone-900 mt-2">{lang === 'en' ? activePose.name_en : activePose.name_zh_hk}</h3>
            <p className="text-xs text-stone-400 font-serif italic mt-0.5">{activePose.sanskrit_name}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => { addPoseToSequence(activePose); setActivePose(null); }} className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition">
                {t.addToSequence}
              </button>
              <button onClick={() => setActivePose(null)} className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-200 transition">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}