/* Pro Unlock & Password Modal */

import React from 'react';

export default function PaywallModal({ t, setShowPaywallModal, passwordInput, setPasswordInput, setIsPro }: any) {
  return (
    <div onClick={() => setShowPaywallModal(false)} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-amber-200 max-w-xs w-full p-5 text-center shadow-xl">
        <div className="text-2xl mb-1">👑</div>
        <h3 className="text-xs font-bold text-stone-900">{t.proLockedTitle}</h3>
        <p className="text-[9px] text-stone-500 mt-1">{t.proLockedDesc}</p>
        
        <div className="mt-3 mb-2 flex items-center gap-1">
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder={t.passPlaceholder} className="flex-1 px-2 py-1 text-[9px] bg-stone-50 border border-stone-200 rounded text-stone-800 outline-none" />
          <button onClick={() => { if (passwordInput.toLowerCase() === 'prana') { setIsPro(true); setShowPaywallModal(false); } else { alert(t.wrongPass); } }} className="px-2 py-1 bg-stone-900 text-white text-[9px] font-bold rounded hover:bg-stone-800">
            Unlock
          </button>
        </div>
        
        <button onClick={() => { setIsPro(true); setShowPaywallModal(false); }} className="w-full mt-1 py-1.5 bg-amber-500 text-white rounded text-[10px] font-bold hover:bg-amber-600 transition">
          {t.upgradeNow}
        </button>
        <button onClick={() => setShowPaywallModal(false)} className="mt-2 text-[9px] text-stone-400 hover:text-stone-600">{t.close}</button>
      </div>
    </div>
  );
}