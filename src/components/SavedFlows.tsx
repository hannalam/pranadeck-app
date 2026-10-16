/* Area 3: Saved Projects & Slots */

import React from 'react';

export default function SavedFlows({ t, lang, savedSequences, activeSequenceId, editingSeqId, editSeqTitle, setEditSeqTitle, createNewSequence, loadSavedSequence, saveRename, startEditingRename, deleteSequence }: any) {
  return (
    <section className="order-3 h-[20%] md:h-full md:w-[20%] flex flex-col bg-stone-50/60 shrink-0 border-t md:border-t-0 md:border-l border-stone-200">
      <div className="p-2 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-stone-700 uppercase">{t.savedSequencesTitle}</h2>
        <button onClick={createNewSequence} className="px-2 py-0.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-[9px] font-bold transition">
          {t.newSequence}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {savedSequences.map((seq: any) => (
          <div key={seq.id} onClick={() => { if (editingSeqId !== seq.id) loadSavedSequence(seq); }} className={`p-1.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${activeSequenceId === seq.id ? 'bg-white border-emerald-600 shadow-sm' : 'bg-white/80 border-stone-200 hover:border-stone-300'}`}>
            <div className="flex items-center justify-between">
              {editingSeqId === seq.id ? (
                <input autoFocus value={editSeqTitle} onChange={(e) => setEditSeqTitle(e.target.value)} onBlur={saveRename} onKeyDown={(e) => e.key === 'Enter' && saveRename()} onClick={(e) => e.stopPropagation()} className="text-[9px] font-bold text-stone-900 bg-stone-100 border border-stone-300 rounded px-1 w-full outline-none" />
              ) : (
                <h4 className="text-[9px] font-bold text-stone-900 truncate flex-1">{seq.title}</h4>
              )}
              <div className="flex items-center gap-1 shrink-0">
                {editingSeqId !== seq.id && <button onClick={(e) => startEditingRename(e, seq)} className="text-[8px] text-stone-400 hover:text-stone-700">✏️</button>}
                <button onClick={(e) => deleteSequence(e, seq.id)} className="text-[8px] text-stone-400 hover:text-rose-600">🗑️</button>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[8px] text-stone-500">
              <span>{seq.items.length} {lang === 'en' ? 'Poses' : '個體式'}</span>
              <span className="text-emerald-700 font-bold">{t.playSequence} ▶</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}