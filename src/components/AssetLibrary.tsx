import Image from 'next/image';

export default function AssetLibrary({
  t, lang, isPro, search, setSearch, selectedCategory, setSelectedCategory,
  filteredPoses, setShowPaywallModal, addPoseToSequence, CATEGORIES, CATEGORY_NAMES
}: any) {
  return (
    <div className="flex flex-col h-full w-full bg-white shrink-0">
      <div className="p-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            {t.poseLibrary} <span className="text-emerald-600">({filteredPoses.length})</span>
          </h2>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder={t.searchPlaceholder} 
            className="w-28 sm:w-36 px-2 py-1 text-[10px] bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none shadow-inner transition" 
          />
        </div>
        <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 pb-1 scrollbar-hide">
          {CATEGORIES.map((cat: string) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition shrink-0 ${selectedCategory === cat ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
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
}