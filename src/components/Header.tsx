import React, { useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { ChargeSGLogo } from './ChargeSGLogo';

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

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f9ff]/90 dark:bg-[#071711]/95 backdrop-blur-md border-b border-[#dde9ff] dark:border-[#1b4434] shrink-0 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between">
        {/* Left: Brand logo & name linked to launch page */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {currentScreen === 'details' && onBackToMap && (
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

        {/* Right: Optimized & Decluttered Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* One-Click Install Button (Auto-hides if installed) */}
          <PWAInstallButton variant="header" />

          {/* High-priority "nearest!" urgent button */}
          <button
            type="button"
            onClick={handleLowBatteryClick}
            title="Find and navigate to nearest available charger"
            className="px-3 py-1.5 rounded-full bg-[#ffdad6] dark:bg-[#3b1219] text-[#ba1a1a] dark:text-[#ffb4ab] hover:bg-[#ffb4ab] dark:hover:bg-[#4d1620] active:scale-95 transition-all text-xs font-black flex items-center gap-1.5 cursor-pointer border border-[#ba1a1a]/25 dark:border-[#ffb4ab]/30 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px] animate-pulse text-[#ba1a1a] dark:text-[#ff897d]">
              bolt
            </span>
            <span className="font-extrabold tracking-tight">nearest!</span>
          </button>
        </div>
      </div>
    </header>
  );
};
