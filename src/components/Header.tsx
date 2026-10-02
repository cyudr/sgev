import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { ChargeSGLogo } from './ChargeSGLogo';
import { useGreenTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentScreen: 'map' | 'details' | 'saved' | 'activity' | 'profile';
  onBackToMap?: () => void;
  onGoToLaunch?: () => void;
  onFindNearestNow?: () => void;
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
  onGoToLaunch,
  onFindNearestNow,
  onOpenNotifications,
  onOpenProfile,
  onOpenUrgency,
  onRefreshApi,
  isLoadingApi,
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  useEffect(() => {
    async function showHealth() {
      const chip = document.getElementById("api-status");
      if (!chip) return;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const r = await fetch("/api/health", { signal: controller.signal });
        const raw = await r.text();
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

  const handleLogoClick = () => {
    if (onGoToLaunch) {
      onGoToLaunch();
    } else if (onOpenUrgency) {
      onOpenUrgency();
    }
  };

  const handleLowBatteryClick = () => {
    if (onFindNearestNow) {
      onFindNearestNow();
    } else if (onOpenUrgency) {
      onOpenUrgency();
    }
  };

  const { toggleTheme, isDark } = useGreenTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f9ff]/90 dark:bg-[#071711]/95 backdrop-blur-md border-b border-[#dde9ff] dark:border-[#1b4434] shrink-0 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between">
        {/* Left: Brand logo & name linked to launch page */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {currentScreen !== 'map' && onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#0d1c2f] dark:text-[#f0fbf6] hover:bg-[#eff4ff] dark:hover:bg-[#143b2c] active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Back to Map"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">arrow_back</span>
            </button>
          )}

          {/* ChargeSG Brand Mark propagated across all pages */}
          <ChargeSGLogo
            size="md"
            textColor="text-[#0d1c2f] dark:text-[#f0fbf6] group-hover:text-[#006948]"
            onClick={handleLogoClick}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Green Theme Toggle: Light vs Dark */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Green theme" : "Switch to Dark Emerald theme"}
            aria-label="Toggle Green Theme"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#3d4a42] dark:text-[#a5d8c3] hover:bg-[#eff4ff] dark:hover:bg-[#143b2c] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#006948] dark:text-[#85f8c4]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* One-Click Install Button (Auto-hides if installed) */}
          <PWAInstallButton variant="header" />

          {/* Low Battery Urgent Icon linked to FIND NEAREST NOW!! */}
          <button
            type="button"
            onClick={handleLowBatteryClick}
            title="TAKE ME THERE NOW!!"
            className="px-2 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] active:scale-95 transition-all text-[10px] font-black flex items-center gap-1 cursor-pointer border border-[#ba1a1a]/20 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px] animate-pulse">battery_alert</span>
            <span className="hidden xs:inline">TAKE ME THERE NOW!!</span>
            <span className="xs:hidden">Take Me There</span>
          </button>

          {/* Refresh Live API */}
          {onRefreshApi && (
            <button
              type="button"
              onClick={onRefreshApi}
              disabled={isLoadingApi}
              title="Refresh live data from LTA DataMall"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[17px] sm:text-[19px] ${isLoadingApi ? 'animate-spin text-[#006948]' : ''}`}
              >
                refresh
              </span>
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] active:scale-95 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[19px]">notifications</span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#006948]" />
          </button>

          {/* Profile */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs hover:bg-[#00855d] active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Vehicle Profile & Settings"
            >
              EV
            </button>
          )}
        </div>
      </div>

      {showNotificationToast && (
        <div className="fixed top-14 right-4 z-50 bg-[#0d1c2f] text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-white/10 animate-in fade-in">
          All Singapore EV charging systems operational · LTA Live Feed Active
        </div>
      )}
    </header>
  );
};
