import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentScreen: 'map' | 'details' | 'saved' | 'activity' | 'profile';
  onBackToMap?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenUrgency?: () => void;
  dataSource?: 'lta-live' | 'lta-batch' | 'cached' | 'empty';
  onRefreshApi?: () => void;
  isLoadingApi?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onBackToMap,
  onOpenNotifications,
  onOpenProfile,
  onOpenUrgency,
  dataSource,
  onRefreshApi,
  isLoadingApi,
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  useEffect(() => {
    async function showHealth() {
      const chip = document.getElementById("api-status");
      if (!chip) return;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // Allow longer 15s timeout
      try {
        const r = await fetch("/api/health", { signal: controller.signal });
        const raw = await r.text();             // text first, never .json()
        if (!r.ok) { throw new Error(r.status + " " + raw.slice(0, 80)); }
        const h = JSON.parse(raw);
        if (h.status !== "ok") { throw new Error("status " + h.status); }
        const asOf = h.model_as_of || h['as-of'] || h.as_of || h.asOf || '';
        chip.textContent = "API ok · " + asOf;
        chip.style.background = "#107850";
      } catch (err: any) {
        chip.textContent = "API down · " + err.message;
        chip.style.background = "#b53a4a";
      } finally {
        clearTimeout(timer);
      }
    }
    showHealth();
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#dde9ff] shrink-0">
      <div className="max-w-lg mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
        {/* Left: Brand & Live API Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {currentScreen !== 'map' && onBackToMap ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#0d1c2f] hover:bg-[#eff4ff] active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">arrow_back</span>
            </button>
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#006948] to-[#00a86b] flex items-center justify-center text-white shadow-sm shadow-[#006948]/20 shrink-0">
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">bolt</span>
            </div>
          )}

          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-[#0d1c2f] leading-none">ChargeSG</h1>
            <p className="text-[10px] font-medium text-[#3d4a42] leading-tight mt-0.5">Singapore EV Charging</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* One-Click Install Button (Auto-hides if installed) */}
          <PWAInstallButton variant="header" />

          {/* Refresh Live API */}
          {onRefreshApi && (
            <button
              type="button"
              onClick={onRefreshApi}
              disabled={isLoadingApi}
              title="Refresh live data from LTA DataMall"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] active:scale-95 transition-all disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[17px] sm:text-[19px] ${isLoadingApi ? 'animate-spin text-[#006948]' : ''}`}
              >
                refresh
              </span>
            </button>
          )}

          {/* Urgent / Emergency Low Battery Finder */}
          {onOpenUrgency && (
            <button
              type="button"
              onClick={onOpenUrgency}
              className="px-2 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] active:scale-95 transition-all text-[10px] font-bold flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">battery_alert</span>
              <span className="hidden xs:inline">Urgent</span>
            </button>
          )}

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNotifications) {
                onOpenNotifications();
              } else {
                setShowNotificationToast(true);
                setTimeout(() => setShowNotificationToast(false), 2500);
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] active:scale-95 transition-all relative"
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[19px]">notifications</span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#006948]" />
          </button>

          {/* Profile */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs hover:bg-[#00855d] active:scale-95 transition-all"
            >
              EV
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {showNotificationToast && (
        <div className="fixed top-14 inset-x-4 z-50 max-w-sm mx-auto bg-[#0d1c2f] text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">check_circle</span>
          <span className="flex-1">Live alerts active: connected to Singapore LTA DataMall.</span>
        </div>
      )}
    </header>
  );
};
