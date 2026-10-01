import React from 'react';
import { Station } from '../types/charging';
import { PWAInstallButton } from './PWAInstallButton';

interface UrgencyLaunchScreenProps {
  nearestStation: Station | null;
  onFindNow: () => void;
  onShowMeAround: () => void;
}

export const UrgencyLaunchScreen: React.FC<UrgencyLaunchScreenProps> = ({
  nearestStation,
  onFindNow,
  onShowMeAround,
}) => {
  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#0d1c2f] via-[#10221e] to-[#002114] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-[#85f8c4] selection:text-[#002114] relative select-none">
      {/* Background Ambient EV Energy Glow (Expands to fill desktop viewport) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[28rem] lg:w-[46rem] h-80 sm:h-[28rem] lg:h-[46rem] bg-[#006948]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-8 lg:right-24 w-60 sm:w-80 lg:w-[32rem] h-60 sm:h-80 lg:h-[32rem] bg-[#85f8c4]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding & One-Click Install Button (Full-width scaled for desktop) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pt-2 sm:pt-4 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#006948] flex items-center justify-center text-white shadow-lg shadow-[#006948]/30 shrink-0">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">bolt</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
              ChargeSG
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-[#85f8c4] tracking-normal">
                SG 🇸🇬
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-300 leading-tight">Singapore EV Charging</p>
          </div>
        </div>

        {/* Top Right: One-Click Install Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton variant="launch" />
        </div>
      </div>

      {/* Centered Interactive Hero Block: Scales smoothly on desktop */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-auto w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-2 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight text-center max-w-md">
          How urgent is your charge?
        </h2>

        {/* Nearest Station Radar Snapshot Card (Centralized, desktop-scaled) */}
        <div className="mt-4 sm:mt-5 w-full p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#85f8c4] text-[#002114] flex items-center justify-center font-bold mb-1.5 shadow-md shrink-0">
            <span className="material-symbols-outlined text-[19px] sm:text-[22px]">near_me</span>
          </div>
          <span className="text-[9.5px] sm:text-[11px] uppercase font-extrabold text-[#85f8c4] tracking-wider block">
            Nearest Ready Point
          </span>
          <h4 className="text-xs sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md mt-0.5">
            {nearestStation ? nearestStation.name : 'Scanning Singapore EV Network...'}
          </h4>
          <p className="text-[10.5px] sm:text-xs text-slate-300 mt-0.5">
            {nearestStation
              ? `${nearestStation.distanceKm} km away • ${nearestStation.availableBays} bays free • ~${nearestStation.driveTimeMins} mins drive`
              : 'connecting, do not panic, try again after 1s'}
          </p>
        </div>

        {/* Centered Action Buttons (Scaled for desktop) */}
        <div className="mt-4 sm:mt-6 flex flex-col gap-3 w-full">
          {/* Button 1: FIND NEAREST NOW!! */}
          <button
            type="button"
            onClick={onFindNow}
            className="group relative w-full py-3.5 sm:py-4 lg:py-4.5 px-5 rounded-2xl sm:rounded-3xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.98] transition-all duration-200 text-white font-black shadow-[0_8px_24px_rgba(0,105,72,0.5)] border border-[#85f8c4]/40 cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />

            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[22px] sm:text-[26px] text-[#85f8c4] group-hover:scale-110 transition-transform">
                bolt
              </span>
              <span className="tracking-wide text-sm sm:text-base lg:text-lg font-black">
                FIND NEAREST NOW!!
              </span>
            </div>
            <div className="text-[10.5px] sm:text-xs font-medium text-emerald-200 leading-tight mt-0.5 text-center">
              Route directly to nearest EV point {nearestStation ? `(${nearestStation.distanceKm} km · ~${nearestStation.driveTimeMins}m)` : ''}
            </div>
          </button>

          {/* Button 2: Show me around */}
          <button
            type="button"
            onClick={onShowMeAround}
            className="w-full py-3 sm:py-3.5 lg:py-4 px-5 rounded-2xl sm:rounded-3xl bg-white/10 hover:bg-white/15 active:scale-[0.98] transition-all duration-200 text-white font-bold border border-white/20 shadow-md cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[19px] sm:text-[22px] text-slate-300">
                tune
              </span>
              <span className="tracking-wide text-xs sm:text-sm lg:text-base font-bold">
                Show me around
              </span>
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-300 leading-tight mt-0.5 text-center">
              Explore charging points with filters & attributes
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Status Note */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pb-2 text-center text-[10px] sm:text-xs text-slate-400 shrink-0">
        <span>Singapore Land Transport Authority (LTA) Live Network</span>
      </div>
    </div>
  );
};
