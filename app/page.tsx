'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import poseData from '../src/data/poses.json';

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================
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

const TIMER_OPTIONS = [15, 30, 45, 60, 90, 120];

const CATEGORIES = [
  'All', 'Standing & Balance', 'Seated, Twists & Forward Bends',
  'Backbends & Heart Openers', 'Arm Balances & Core', 'Inversions',
  'Hip Openers & Deep Stretches', 'Reclined (Supine) & Prone', 'Restorative & Cool Down'
];

const CATEGORY_NAMES: Record<string, { en: string; zh_hk: string }> = {
  All: { en: 'All', zh_hk: '全部' },
  'Standing & Balance': { en: 'Standing', zh_hk: '站立' },
  'Seated, Twists & Forward Bends': { en: 'Seated', zh_hk: '坐姿' },
  'Backbends & Heart Openers': { en: 'Backbends', zh_hk: '後彎' },
  'Arm Balances & Core': { en: 'Arm Balances', zh_hk: '手臂支撐' },
  Inversions: { en: 'Inversions', zh_hk: '倒立' },
  'Hip Openers & Deep Stretches': { en: 'Hip Openers', zh_hk: '開髖' },
  'Reclined (Supine) & Prone': { en: 'Reclined', zh_hk: '仰臥' },
  'Restorative & Cool Down': { en: 'Restorative', zh_hk: '修復' },
};

const DICTIONARY = {
  en: {
    appTitle: 'PranaDeck',
    proUnlocked: 'PRO',
    unlockAll: 'Unlock Pro',
    poseLibrary: 'Pose Library',
    searchPlaceholder: 'Search...',
    classBuilder: 'Sequence Canvas',
    totalPracticeTime: 'Total Time:',
    clearAll: 'Clear Flow',
    saveAndDone: 'Save Flow',
    editSequence: 'Edit Flow',
    startPractice: '▶ Play',
    stopPractice: '⏹ Stop',
    downloadPdf: '📄 PDF',
    dropPosesHere: 'Canvas is Empty',
    dragHint: 'Add poses from the library.',
    savedTimeline: 'Active Timeline',
    freeBadge: 'FREE',
    proBadge: 'PRO',
    close: 'Close',
    addToSequence: '+ Add',
    proLockedTitle: 'Unlock 150+ Pro Poses',
    proLockedDesc: 'Get unlimited access to all 207 pose vectors, infinite flows, and PDF export.',
    upgradeNow: 'Upgrade to Pro ($9.99/mo)',
    passPlaceholder: 'Password (try: prana)',
    wrongPass: 'Incorrect password.',
    teaserTitle: '150+ Pro Poses',
    teaserSubtitle: 'Preview & unlock',
    savedSequencesTitle: 'Saved Flows',
    freeLimitBadge: 'Free:',
    limitReachedTitle: 'Saved Limit Reached',
    limitReachedDesc: 'Free tier allows 3 flows. Upgrade to Pro for unlimited saves!',
    newSequence: '+ New Flow',
    playSequence: 'Load',
    sequencePrefix: 'Flow',
    emptySaved: 'No saved flows yet.',
  },
  zh_hk: {
    appTitle: 'PranaDeck',
    proUnlocked: 'PRO',
    unlockAll: '解鎖 Pro',
    poseLibrary: '體式庫',
    searchPlaceholder: '搜尋...',
    classBuilder: '序列畫布',
    totalPracticeTime: '總練習時長：',
    clearAll: '清空',
    saveAndDone: '保存序列',
    editSequence: '編輯序列',
    startPractice: '▶ 播放',
    stopPractice: '⏹ 停止',
    downloadPdf: '📄 PDF',
    dropPosesHere: '畫布為空',
    dragHint: '請由體式庫加入體式。',
    savedTimeline: '播放時間軸',
    freeBadge: '免費',
    proBadge: 'PRO',
    close: '關閉',
    addToSequence: '+ 加入',
    proLockedTitle: '解鎖 150+ 專業體式',
    proLockedDesc: '獲得完整 207 個體式庫、無限儲存位及 PDF 匯出功能。',
    upgradeNow: '升級至 Pro (HK$78/月)',
    passPlaceholder: '輸入密碼 (提示: prana)',
    wrongPass: '密碼錯誤。',
    teaserTitle: '150+ Pro 體式寶庫',
    teaserSubtitle: '點擊解鎖',
    savedSequencesTitle: '已保存序列',
    freeLimitBadge: '免費：',
    limitReachedTitle: '已達免費上限',
    limitReachedDesc: '免費版提供 3 個序列儲存位。升級至 Pro 即可無限建立！',
    newSequence: '+ 新序列',
    playSequence: '載入',
    sequencePrefix: '序列',
    emptySaved: '尚無保存序列。',
  },
};

// ==========================================
// 2. MODULAR UI COMPONENTS
// ==========================================

const Header = ({ t, lang, setLang, isPro, setIsPro, savedSequences, setShowPaywallModal }: any) => (
  <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-sm whitespace-nowrap">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">iP</div>
      <h1 className="text-sm font-black text-slate-800 tracking-tight">{t.appTitle}</h1>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-[10px] px-2 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold hidden sm:flex items-center gap-1">
        <span>{t.freeLimitBadge}</span>
        <span className="text-emerald-700 font-black">{savedSequences.length}/{isPro ? '∞' : '3'}</span>
      </div>
      <button onClick={() => setLang(lang === 'en' ? 'zh_hk' : 'en')} className="px-2 py-1 text-[10px] font-bold rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm">
        🌐 {lang === 'en' ? '繁體中文' : 'EN'}
      </button>
      <button onClick={() => !isPro ? setShowPaywallModal(true) : setIsPro(false)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition shadow-sm ${isPro ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
        {isPro ? t.proUnlocked : `👑 ${t.unlockAll}`}
      </button>
    </div>
  </header>
);

const AssetLibrary = ({ t, lang, isPro, search, setSearch, selectedCategory, setSelectedCategory, filteredPoses, setShowPaywallModal, addPoseToSequence }: any) => (
  <div className="flex flex-col h-full w-full bg-white shrink-0">
    <div className="p-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
          {t.poseLibrary} <span className="text-emerald-600">({filteredPoses.length})</span>
        </h2>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-28 sm:w-36 px-2 py-1 text-[10px] bg-white border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner transition" />
      </div>
      {/* Horizontal scroll for categories on mobile */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition shrink-0 ${selectedCategory === cat ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            {CATEGORY_NAMES[cat] ? CATEGORY_NAMES[cat][lang] : cat}
          </button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-[#FAF8F5]">
      {!isPro && selectedCategory === 'All' && !search && (
        <div onClick={() => setShowPaywallModal(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-3 text-white cursor-pointer flex items-center justify-between shadow-md mb-3 active:scale-[0.98] transition">
          <div>
            <h3 className="text-xs font-black">{t.teaserTitle}</h3>
            <p className="text-[9px] font-bold text-amber-100">{t.teaserSubtitle}</p>
          </div>
          <span className="text-2xl drop-shadow-sm">👑</span>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {filteredPoses.map((pose: any) => (
          <div key={pose.image_filename} onClick={() => addPoseToSequence(pose)} className="bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md rounded-xl p-2 cursor-pointer flex flex-col justify-between transition active:scale-95 group">
            <div className="relative h-16 sm:h-20 w-full bg-slate-50/50 rounded-lg flex items-center justify-center p-1 border border-slate-100">
              <Image src={`/jpgs/${pose.image_filename}`} alt={pose.name_en} fill className="object-contain p-1 mix-blend-multiply group-hover:scale-105 transition" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-800 truncate pr-1">
                {lang === 'en' ? pose.name_en : pose.name_zh_hk}
              </h3>
              <div className="w-5 h-5 bg-slate-100 text-emerald-600 rounded flex items-center justify-center text-xs font-black group-hover:bg-emerald-600 group-hover:text-white transition">+</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TimelineCanvas = ({ t, lang, isPro, sequence, setSequence, isSavedMode, setIsSavedMode, isPlaying, setIsPlaying, playIndex, playProgress, handleSaveSequence, stopPlayback, removeFromSequence, updateDuration, totalMinutes, remainingSeconds }: any) => (
  <div className="flex flex-col h-full w-full bg-white shrink-0">
    <div className="p-2 sm:p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-[10px] sm:text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <span>⏱</span> {isSavedMode ? t.savedTimeline : t.classBuilder}
        </h2>
        <p className="text-[9px] text-slate-500 font-medium mt-0.5">
          {t.totalPracticeTime} <span className="text-emerald-600 font-mono font-black">{totalMinutes}m {remainingSeconds}s</span> ({sequence.length})
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {isSavedMode && isPro && sequence.length > 0 && (
          <button onClick={() => window.print()} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 text-[10px] font-bold shadow-sm transition">
            {t.downloadPdf}
          </button>
        )}
        {!isSavedMode ? (
          <>
            {sequence.length > 0 && <button onClick={() => setSequence([])} className="text-[9px] sm:text-[10px] text-rose-500 font-bold px-2 py-1 rounded hover:bg-rose-50 transition">{t.clearAll}</button>}
            <button disabled={sequence.length === 0} onClick={handleSaveSequence} className="px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-md text-[10px] font-bold transition shadow-sm">
              ✓ {t.saveAndDone}
            </button>
          </>
        ) : (
          <button onClick={() => { setIsSavedMode(false); stopPlayback(); }} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 text-[10px] font-bold shadow-sm transition">
            ✏️ {t.editSequence}
          </button>
        )}
      </div>
    </div>

    <div className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 bg-[#FAF8F5]">
      {/* Big Focus Screen */}
      <div className="h-[45%] bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center relative p-2 overflow-hidden shadow-sm shrink-0">
        {sequence.length > 0 ? (
          <>
            <div className="relative w-full flex-1 min-h-0 bg-slate-50/50 rounded-xl p-2 flex items-center justify-center border border-slate-100">
              <Image src={`/jpgs/${sequence[isPlaying ? playIndex : 0].image_filename}`} alt="Active Pose" fill className="object-contain p-2 mix-blend-multiply" />
            </div>
            <div className="mt-2 text-center shrink-0 mb-1">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {lang === 'en' ? sequence[isPlaying ? playIndex : 0].name_en : sequence[isPlaying ? playIndex : 0].name_zh_hk}
              </h3>
              <p className="text-[10px] text-slate-400 italic font-medium">{sequence[isPlaying ? playIndex : 0].sanskrit_name}</p>
            </div>
            {isPlaying && (
              <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-mono font-black px-2.5 py-0.5 rounded-md shadow-md">
                {playProgress}s / {sequence[playIndex].durationSeconds}s
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center justify-center">
            <span className="text-4xl block mb-2 opacity-30">🧘‍♀️</span>
            <p className="font-bold text-xs text-slate-500">{t.dropPosesHere}</p>
            <p className="text-[10px] mt-1">{t.dragHint}</p>
          </div>
        )}
      </div>

      {/* PLAY BUTTON */}
      {isSavedMode && sequence.length > 0 && (
        <button onClick={() => isPlaying ? stopPlayback() : setIsPlaying(true)} className={`w-full py-2.5 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-md shrink-0 tracking-wide ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
          {isPlaying ? t.stopPractice : t.startPractice}
        </button>
      )}

      {/* PUZZLE GRID */}
      <div className="flex-1 border border-slate-200 bg-white rounded-2xl p-2 overflow-y-auto shadow-inner min-h-0">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {sequence.map((item: any, index: number) => {
            const isCurrentlyPlaying = isPlaying && playIndex === index;
            return (
              <div key={item.instanceId} className={`aspect-square rounded-xl border relative flex flex-col items-center justify-between p-1 sm:p-1.5 transition shadow-sm ${isCurrentlyPlaying ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 scale-[1.02]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                <span className={`absolute top-1.5 left-1.5 text-[8px] sm:text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${isCurrentlyPlaying ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}>{index + 1}</span>
                {!isSavedMode && (
                  <button onClick={() => removeFromSequence(item.instanceId)} className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-black transition shadow-sm">✕</button>
                )}
                <div className="relative w-full flex-1 min-h-0 bg-white rounded-lg p-0.5 mt-5 sm:mt-6 mb-1 flex items-center justify-center border border-slate-100">
                  <Image src={`/jpgs/${item.image_filename}`} alt={item.name_en} fill className="object-contain p-1 mix-blend-multiply" />
                </div>
                {!isSavedMode && (
                  <div className="mt-auto flex items-center bg-white border border-slate-200 rounded-md px-1 w-full justify-center shadow-sm overflow-hidden py-0.5">
                    <input type="number" min="1" value={item.durationSeconds} onChange={(e) => updateDuration(item.instanceId, parseInt(e.target.value) || 0)} className="w-full text-center text-[10px] sm:text-[11px] font-bold text-slate-800 outline-none bg-transparent" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 pr-1">s</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const SavedFlows = ({ t, lang, savedSequences, activeSequenceId, editingSeqId, editSeqTitle, setEditSeqTitle, createNewSequence, loadSavedSequence, saveRename, startEditingRename, deleteSequence }: any) => (
  <div className="flex flex-col h-full w-full bg-slate-50 shrink-0">
    <div className="p-2 sm:p-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
      <h2 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-wide">{t.savedSequencesTitle}</h2>
      <button onClick={createNewSequence} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[9px] font-bold transition shadow-sm">
        {t.newSequence}
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
      {savedSequences.length === 0 ? (
        <p className="text-center text-[10px] text-slate-400 py-8">{t.emptySaved}</p>
      ) : (
        savedSequences.map((seq: any) => (
          <div key={seq.id} onClick={() => { if (editingSeqId !== seq.id) loadSavedSequence(seq); }} className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between bg-white ${activeSequenceId === seq.id ? 'border-emerald-500 shadow-md ring-1 ring-emerald-400' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-1">
              {editingSeqId === seq.id ? (
                <input autoFocus value={editSeqTitle} onChange={(e) => setEditSeqTitle(e.target.value)} onBlur={saveRename} onKeyDown={(e) => e.key === 'Enter' && saveRename()} onClick={(e) => e.stopPropagation()} className="text-[11px] font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded px-1.5 w-full outline-none py-0.5" />
              ) : (
                <h4 className="text-[11px] font-black text-slate-900 truncate flex-1">{seq.title}</h4>
              )}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {editingSeqId !== seq.id && <button onClick={(e) => startEditingRename(e, seq)} className="text-[10px] text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded p-1 transition">✏️</button>}
                <button onClick={(e) => deleteSequence(e, seq.id)} className="text-[10px] text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded p-1 transition">🗑️</button>
              </div>
            </div>
            <div className="flex justify-between mt-1 pt-1.5 border-t border-slate-100 text-[9px] text-slate-500 font-medium">
              <span>{seq.items.length} {lang === 'en' ? 'Poses' : '個體式'}</span>
              <span className="text-emerald-700 font-black">{t.playSequence} ▶</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const MobileTabBar = ({ t, mobileTab, setMobileTab, sequenceLength }: any) => (
  <div className="md:hidden flex h-16 bg-white border-t border-slate-200 shrink-0 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <button onClick={() => setMobileTab('library')} className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors ${mobileTab === 'library' ? 'text-emerald-700 bg-emerald-50/50 border-t-2 border-emerald-600' : 'text-slate-400 border-t-2 border-transparent hover:bg-slate-50'}`}>
      <span className="text-xl leading-none">📚</span>
      {t.poseLibrary}
    </button>
    <button onClick={() => setMobileTab('canvas')} className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors ${mobileTab === 'canvas' ? 'text-emerald-700 bg-emerald-50/50 border-t-2 border-emerald-600' : 'text-slate-400 border-t-2 border-transparent hover:bg-slate-50'}`}>
      <div className="relative">
        <span className="text-xl leading-none">⏱</span>
        {sequenceLength > 0 && (
          <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] px-1 rounded-full">{sequenceLength}</span>
        )}
      </div>
      {t.classBuilder}
    </button>
    <button onClick={() => setMobileTab('saved')} className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors ${mobileTab === 'saved' ? 'text-emerald-700 bg-emerald-50/50 border-t-2 border-emerald-600' : 'text-slate-400 border-t-2 border-transparent hover:bg-slate-50'}`}>
      <span className="text-xl leading-none">💾</span>
      {t.savedSequencesTitle}
    </button>
  </div>
);

// ==========================================
// 3. MAIN COMPONENT (State Management Only)
// ==========================================
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh_hk'>('en');
  const [isPro, setIsPro] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [mobileTab, setMobileTab] = useState<'library' | 'canvas' | 'saved'>('library');
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [isSavedMode, setIsSavedMode] = useState(false);

  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);
  const [editingSeqId, setEditingSeqId] = useState<string | null>(null);
  const [editSeqTitle, setEditSeqTitle] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);

  useEffect(() => { setIsClient(true); }, []);

  const t = DICTIONARY[lang];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && sequence.length > 0) {
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          const currentDuration = sequence[playIndex]?.durationSeconds || 0;
          if (prev + 1 >= currentDuration) {
            if (playIndex + 1 < sequence.length) {
              setPlayIndex((idx) => idx + 1); return 0;
            } else { setIsPlaying(false); return 0; }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playIndex, sequence]);

  const stopPlayback = () => { setIsPlaying(false); setPlayIndex(0); setPlayProgress(0); };

  const allPoses = poseData as Pose[];
  const filteredPoses = allPoses.filter((pose) => {
    if (!pose.is_free && !isPro) return false;
    const matchesCat = selectedCategory === 'All' || pose.category === selectedCategory;
    const q = search.toLowerCase().trim();
    return matchesCat && (!q || pose.name_en.toLowerCase().includes(q) || pose.name_zh_hk.includes(q));
  });

  const addPoseToSequence = (pose: Pose) => {
    if (isSavedMode) { setIsSavedMode(false); stopPlayback(); }
    const newItem: SequenceItem = { ...pose, instanceId: `${pose.image_filename}-${Date.now()}-${Math.random()}`, durationSeconds: 45 };
    setSequence((prev) => [...prev, newItem]);
    setMobileTab('canvas'); // Auto switch to canvas tab to see the addition
  };

  const removeFromSequence = (instanceId: string) => {
    setSequence((prev) => prev.filter((item) => item.instanceId !== instanceId)); stopPlayback();
  };

  const updateDuration = (instanceId: string, seconds: number) => {
    if (isNaN(seconds) || seconds < 1) seconds = 1;
    setSequence((prev) => prev.map((item) => item.instanceId === instanceId ? { ...item, durationSeconds: seconds } : item));
    stopPlayback();
  };

  const handleSaveSequence = () => {
    if (sequence.length === 0) return;
    if (activeSequenceId) {
      setSavedSequences((prev) => prev.map(seq => seq.id === activeSequenceId ? { ...seq, items: [...sequence] } : seq));
      setIsSavedMode(true); return;
    }
    if (!isPro && savedSequences.length >= 3) { setShowPaywallModal(true); return; }
    const newSeq: SavedSequence = { id: `seq-${Date.now()}`, title: `${t.sequencePrefix} #${savedSequences.length + 1}`, items: [...sequence], createdAt: 'Just now' };
    setSavedSequences((prev) => [...prev, newSeq]);
    setActiveSequenceId(newSeq.id);
    setIsSavedMode(true);
    setMobileTab('saved'); // Auto switch to saved tab
  };

  const loadSavedSequence = (seq: SavedSequence) => {
    stopPlayback(); setSequence(seq.items); setActiveSequenceId(seq.id); setIsSavedMode(true); setMobileTab('canvas');
  };

  const createNewSequence = () => {
    if (!isPro && savedSequences.length >= 3) { setShowPaywallModal(true); return; }
    stopPlayback(); setSequence([]); setActiveSequenceId(null); setIsSavedMode(false); setMobileTab('library');
  };

  const deleteSequence = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); setSavedSequences(prev => prev.filter(s => s.id !== id));
    if (activeSequenceId === id) { setActiveSequenceId(null); setSequence([]); setIsSavedMode(false); stopPlayback(); }
  };

  const startEditingRename = (e: React.MouseEvent, seq: SavedSequence) => { e.stopPropagation(); setEditingSeqId(seq.id); setEditSeqTitle(seq.title); };
  const saveRename = () => { if (editingSeqId) { setSavedSequences(prev => prev.map(s => (s.id === editingSeqId ? { ...s, title: editSeqTitle || t.sequencePrefix } : s))); setEditingSeqId(null); } };

  const totalSeconds = sequence.reduce((sum, item) => sum + item.durationSeconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (!isClient) return null;

  return (
    <div className="h-[100dvh] w-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col overflow-hidden">
      <Header t={t} lang={lang} setLang={setLang} isPro={isPro} setIsPro={setIsPro} savedSequences={savedSequences} setShowPaywallModal={setShowPaywallModal} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* DESKTOP: Shows all 3 columns. MOBILE: Only shows the active tab */}
        <div className={`${mobileTab === 'library' ? 'block' : 'hidden'} md:block h-full w-full md:w-[32%] shrink-0 border-r border-slate-200`}>
          <AssetLibrary t={t} lang={lang} isPro={isPro} search={search} setSearch={setSearch} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} filteredPoses={filteredPoses} setShowPaywallModal={setShowPaywallModal} addPoseToSequence={addPoseToSequence} />
        </div>
        <div className={`${mobileTab === 'canvas' ? 'block' : 'hidden'} md:block h-full w-full md:w-[48%] shrink-0 border-r border-slate-200`}>
          <TimelineCanvas t={t} lang={lang} isPro={isPro} sequence={sequence} setSequence={setSequence} isSavedMode={isSavedMode} setIsSavedMode={setIsSavedMode} isPlaying={isPlaying} setIsPlaying={setIsPlaying} playIndex={playIndex} playProgress={playProgress} handleSaveSequence={handleSaveSequence} stopPlayback={stopPlayback} removeFromSequence={removeFromSequence} updateDuration={updateDuration} totalMinutes={totalMinutes} remainingSeconds={remainingSeconds} />
        </div>
        <div className={`${mobileTab === 'saved' ? 'block' : 'hidden'} md:block h-full w-full md:w-[20%] shrink-0`}>
          <SavedFlows t={t} lang={lang} savedSequences={savedSequences} activeSequenceId={activeSequenceId} editingSeqId={editingSeqId} editSeqTitle={editSeqTitle} setEditSeqTitle={setEditSeqTitle} createNewSequence={createNewSequence} loadSavedSequence={loadSavedSequence} saveRename={saveRename} startEditingRename={startEditingRename} deleteSequence={deleteSequence} />
        </div>
      </div>

      <MobileTabBar t={t} mobileTab={mobileTab} setMobileTab={setMobileTab} sequenceLength={sequence.length} />

      {/* MODALS & PRINT */}
      {showPaywallModal && (
        <div onClick={() => setShowPaywallModal(false)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-amber-200 max-w-xs w-full p-5 text-center shadow-2xl">
            <div className="text-3xl mb-2">👑</div>
            <h3 className="text-sm font-black text-slate-900">{t.proLockedTitle}</h3>
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{t.proLockedDesc}</p>
            <div className="mt-4 mb-3 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder={t.passPlaceholder} className="flex-1 px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-md text-slate-800 outline-none" />
              <button onClick={() => { if (passwordInput.toLowerCase() === 'prana') { setIsPro(true); setShowPaywallModal(false); } else { alert(t.wrongPass); } }} className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-md hover:bg-slate-800 shadow-sm transition">Unlock</button>
            </div>
            <button onClick={() => { setIsPro(true); setShowPaywallModal(false); }} className="w-full py-2 bg-amber-400 text-amber-950 rounded-lg text-[11px] font-black hover:bg-amber-500 transition shadow-md border border-amber-500">{t.upgradeNow}</button>
            <button onClick={() => setShowPaywallModal(false)} className="mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600">{t.close}</button>
          </div>
        </div>
      )}

      <div id="printable-pdf-area" className="hidden print:block bg-white text-black p-8 font-sans">
        <h1 className="text-2xl font-black border-b-2 border-black pb-2 mb-6">{savedSequences.find(s => s.id === activeSequenceId)?.title || 'PranaDeck Sequence'}</h1>
        <div className="grid grid-cols-4 gap-6">
          {sequence.map((item) => (
            <div key={item.instanceId} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 relative mb-2"><Image src={`/jpgs/${item.image_filename}`} alt={item.name_en} fill className="object-contain mix-blend-multiply" /></div>
              <p className="text-xs font-bold leading-tight">{lang === 'en' ? item.name_en : item.name_zh_hk}</p>
              <p className="text-[10px] italic text-slate-500">{item.sanskrit_name}</p>
              <p className="text-[10px] font-bold mt-1 border border-black px-2 py-0.5 rounded-full">{item.durationSeconds}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}