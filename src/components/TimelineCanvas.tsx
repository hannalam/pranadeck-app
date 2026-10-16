import Image from 'next/image';

const TIMER_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function TimelineCanvas({
  t, lang, isPro, sequence, setSequence, isSavedMode, setIsSavedMode, isPlaying, setIsPlaying,
  playIndex, playProgress, handleSaveSequence, stopPlayback, removeFromSequence, updateDuration, totalMinutes, remainingSeconds
}: any) {
  return (
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

        {isSavedMode && sequence.length > 0 && (
          <button onClick={() => isPlaying ? stopPlayback() : setIsPlaying(true)} className={`w-full py-2.5 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-md shrink-0 tracking-wide ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {isPlaying ? t.stopPractice : t.startPractice}
          </button>
        )}

        <div className="flex-1 border border-slate-200 bg-white rounded-2xl p-2 overflow-y-auto shadow-inner min-h-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {sequence.map((item: any, index: number) => {
              const isCurrentlyPlaying = isPlaying && playIndex === index;
              return (
                <div key={item.instanceId} className={`aspect-square rounded-xl border relative flex flex-col items-center justify-between p-1 sm:p-1.5 transition shadow-sm ${isCurrentlyPlaying ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 scale-[1.02]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`absolute top-1.5 left-1.5 text-[8px] sm:text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${isCurrentlyPlaying ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{index + 1}</span>
                  {!isSavedMode && (
                    <button onClick={() => removeFromSequence(item.instanceId)} className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-black transition">✕</button>
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
}