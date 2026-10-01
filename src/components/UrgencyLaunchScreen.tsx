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
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#0d1c2f] via-[#10221e] to-[#002114] text-white flex flex-col justify-between p-4 sm:p-5 max-w-lg mx-auto selection:bg-[#85f8c4] selection:text-[#002114] relative select-none">
      {/* Background Ambient EV Energy Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#006948]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-4 w-60 h-60 bg-[#85f8c4]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding & One-Click Install Button */}
      <div className="relative z-10 flex items-center justify-between pt-2 sm:pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#006948] flex items-center justify-center text-white shadow-lg shadow-[#006948]/30 shrink-0">
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">bolt</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 leading-tight">
              ChargeSG
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[#85f8c4] tracking-normal">
                SG 🇸🇬
              </span>
            </h1>
            <p className="text-[10px] text-slate-300 leading-tight">Singapore EV Charging</p>
          </div>
        </div>

        {/* Top Right: One-Click Install Button (hides automatically if already installed) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton variant="launch" />
        </div>
      </div>

      {/* Centered Interactive Hero Block: Perfectly Centered in Viewport */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-auto w-full max-w-sm mx-auto px-1">
        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight text-center max-w-xs">
          How urgent is your charge?
        </h2>

        {/* Nearest Station Radar Snapshot Card */}
        <div className="mt-4 w-full p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-left shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#85f8c4] text-[#002114] flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[18px]">near_me</span>
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-[#85f8c4] tracking-wider block">
                Nearest Ready Point
              </span>
              <h4 className="text-[11px] font-bold text-white truncate max-w-[155px]">
                {nearestStation ? nearestStation.name : 'Scanning Singapore EV Network...'}
              </h4>
              <p className="text-[9px] text-slate-300 truncate">
                {nearestStation
                  ? `${nearestStation.distanceKm} km away • ${nearestStation.availableBays} bays free now`
                  : 'Locating nearest available charging bays...'}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#85f8c4] shrink-0 pl-1">
            {nearestStation ? `${nearestStation.driveTimeMins}m` : '...'}
          </span>
        </div>

        {/* Centered Action Buttons: FIND NEAREST NOW!! & Show me around */}
        <div className="mt-4 sm:mt-5 flex flex-col gap-2.5 w-full">
          {/* Button 1: FIND NEAREST NOW!! */}
          <button
            type="button"
            onClick={onFindNow}
            className="group relative w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.98] transition-all duration-200 text-white font-black text-sm sm:text-base shadow-[0_8px_24px_rgba(0,105,72,0.5)] flex items-center justify-between border border-[#85f8c4]/40 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 font-black">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <div className="text-left">
                <div className="tracking-wide text-sm sm:text-base font-black">FIND NEAREST NOW!!</div>
                <div className="text-[10px] font-medium text-emerald-200 leading-tight">
                  Route directly to nearest EV point {nearestStation ? `(${nearestStation.distanceKm} km)` : ''}
                </div>
              </div>
            </div>

            <span className="material-symbols-outlined text-[22px] text-[#85f8c4] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>

          {/* Button 2: Show me around */}
          <button
            type="button"
            onClick={onShowMeAround}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] transition-all duration-200 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center justify-between shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div className="text-left">
                <div className="tracking-wide text-xs sm:text-sm font-bold">Show me around</div>
                <div className="text-[10px] font-medium text-slate-300 leading-tight">
                  Explore charging points with filters & attributes
                </div>
              </div>
            </div>

            <span className="material-symbols-outlined text-[20px] text-slate-300">
              travel_explore
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Status Note */}
      <div className="relative z-10 pb-2 text-center text-[10px] text-slate-400 shrink-0">
        <span>Singapore Land Transport Authority (LTA) Live Network</span>
      </div>
    </div>
  );
};
