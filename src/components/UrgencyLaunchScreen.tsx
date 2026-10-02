import React, { useState, useMemo } from 'react';
import { Station } from '../types/charging';
import { PWAInstallButton } from './PWAInstallButton';
import { ChargeSGLogo } from './ChargeSGLogo';
import { useGreenTheme } from '../context/ThemeContext';
import heroHighwayImg from '../assets/images/ev_highway_hero_1790913547161.jpg';

export type FrontPageCriteria = 'nearest' | 'cheapest' | 'fastest';

interface UrgencyLaunchScreenProps {
  stations: Station[];
  nearestStation: Station | null;
  onNavigateToTarget: (station: Station) => void;
  onShowMeAround: () => void;
}

export const UrgencyLaunchScreen: React.FC<UrgencyLaunchScreenProps> = ({
  stations,
  nearestStation,
  onNavigateToTarget,
  onShowMeAround,
}) => {
  const { toggleTheme, isDark } = useGreenTheme();
  const [selectedCriteria, setSelectedCriteria] = useState<FrontPageCriteria>('nearest');

  // Compute Cheapest Station
  const cheapestStation = useMemo(() => {
    if (!stations || stations.length === 0) return nearestStation;
    const available = stations.filter((s) => s.availableBays > 0);
    const pool = available.length > 0 ? available : stations;

    return (
      [...pool].sort((a, b) => {
        const priceA = a.tariffs.dcPrice || a.tariffs.nominalDcPrice || 0.59;
        const priceB = b.tariffs.dcPrice || b.tariffs.nominalDcPrice || 0.59;
        if (priceA !== priceB) return priceA - priceB;
        return a.distanceKm - b.distanceKm;
      })[0] || nearestStation
    );
  }, [stations, nearestStation]);

  // Compute Fastest Station (highest kW DC charger)
  const fastestStation = useMemo(() => {
    if (!stations || stations.length === 0) return nearestStation;
    const available = stations.filter((s) => s.availableBays > 0);
    const pool = available.length > 0 ? available : stations;

    return (
      [...pool].sort((a, b) => {
        const powerA = Math.max(...a.bays.map((b) => b.powerKw), 22);
        const powerB = Math.max(...b.bays.map((b) => b.powerKw), 22);
        if (powerB !== powerA) return powerB - powerA;
        return a.distanceKm - b.distanceKm;
      })[0] || nearestStation
    );
  }, [stations, nearestStation]);

  // Active Station based on selected criteria
  const activeStation = useMemo(() => {
    if (selectedCriteria === 'cheapest') return cheapestStation || nearestStation;
    if (selectedCriteria === 'fastest') return fastestStation || nearestStation;
    return nearestStation;
  }, [selectedCriteria, cheapestStation, fastestStation, nearestStation]);

  const maxPowerKw = useMemo(() => {
    if (!activeStation) return 50;
    return Math.max(...activeStation.bays.map((b) => b.powerKw), 50);
  }, [activeStation]);

  const lowestTariff = useMemo(() => {
    if (!activeStation) return 0.54;
    return (
      activeStation.tariffs.dcPrice ||
      activeStation.tariffs.nominalDcPrice ||
      activeStation.tariffs.acPrice ||
      0.54
    );
  }, [activeStation]);

  const handleTakeMeNow = () => {
    if (activeStation) {
      onNavigateToTarget(activeStation);
    }
  };

  // Dynamic Theme Colors for Nearest (Emerald), Cheapest (Amber), Fastest (Sky/Blue)
  const theme = useMemo(() => {
    switch (selectedCriteria) {
      case 'cheapest':
        return {
          bgGradient: 'from-[#d97706] to-[#b45309]',
          shadow: 'shadow-[#d97706]/25',
          border: 'border-amber-400/50',
          badgeBg: 'bg-amber-100 text-amber-800',
          textAccent: 'text-amber-700',
          iconBox: 'bg-amber-100 text-amber-700',
          pinBg: 'from-[#d97706] to-[#92400e]',
          pinDot: 'bg-amber-300 shadow-amber-300',
        };
      case 'fastest':
        return {
          bgGradient: 'from-[#0284c7] to-[#0369a1]',
          shadow: 'shadow-[#0284c7]/25',
          border: 'border-sky-400/50',
          badgeBg: 'bg-sky-100 text-sky-800',
          textAccent: 'text-sky-700',
          iconBox: 'bg-sky-100 text-sky-700',
          pinBg: 'from-[#0284c7] to-[#075985]',
          pinDot: 'bg-sky-300 shadow-sky-300',
        };
      case 'nearest':
      default:
        return {
          bgGradient: 'from-[#006948] to-[#00855d]',
          shadow: 'shadow-[#006948]/25',
          border: 'border-[#85f8c4]/50',
          badgeBg: 'bg-[#e6f8ef] text-[#006948]',
          textAccent: 'text-[#006948]',
          iconBox: 'bg-[#e6f8ef] text-[#006948]',
          pinBg: 'from-[#006948] to-[#004f35]',
          pinDot: 'bg-[#85f8c4] shadow-[#85f8c4]',
        };
    }
  }, [selectedCriteria]);

  return (
    <div
      className={`w-full h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none touch-none select-none flex flex-col justify-between px-3 sm:px-5 pt-2 pb-16 sm:pb-20 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#06150f] via-[#0c231a] to-[#040e0a] text-white'
          : 'bg-gradient-to-b from-white via-[#f4faf7] to-[#eaf5ef] text-[#0d1c2f]'
      }`}
    >
      {/* Background Soft Ambient Light Glows */}
      <div
        className={`absolute top-8 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors ${
          isDark
            ? 'bg-gradient-to-bl from-[#85f8c4]/20 via-[#006948]/20 to-transparent'
            : 'bg-gradient-to-bl from-[#85f8c4]/30 via-[#006948]/10 to-transparent'
        }`}
      />
      <div
        className={`absolute bottom-1/4 -left-10 w-56 h-56 rounded-full blur-2xl pointer-events-none ${
          isDark ? 'bg-[#006948]/20' : 'bg-[#006948]/10'
        }`}
      />

      {/* Top Header: Brand, Theme Toggle & Install Button (Menu removed) */}
      <header className="relative z-20 w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-between shrink-0 py-1">
        <ChargeSGLogo
          size="md"
          textColor={isDark ? 'text-white group-hover:text-[#85f8c4]' : 'text-[#0d1c2f] group-hover:text-[#006948]'}
        />

        {/* Top Right: Theme Toggle & One-Click Install Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton variant="launch" />
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mint theme" : "Switch to Dark Emerald theme"}
            aria-label="Toggle Theme"
            className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'text-[#85f8c4] bg-[#0e291f] hover:bg-[#143b2c] border border-[#1b4434]'
                : 'text-[#006948] bg-white hover:bg-slate-50 border border-slate-200 shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Fully contained, zero scrolling */}
      <main className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex-1 flex flex-col justify-evenly py-1 min-h-0">
        {/* Curved Organic Hero Image Container */}
        <div className="relative w-full max-w-[260px] sm:max-w-[290px] mx-auto shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#006948]/15 to-[#85f8c4]/25 rounded-[2.5rem] blur-lg transform scale-105" />

          <div
            className={`relative w-full aspect-[16/10] rounded-[2rem] rounded-tr-[4.5rem] rounded-bl-[1.2rem] overflow-hidden shadow-xl border-2 transition-colors ${
              isDark ? 'border-[#1b4434] bg-[#071711]' : 'border-white bg-slate-100'
            }`}
          >
            <img
              src={heroHighwayImg}
              alt="Singapore EV Expressway"
              className="w-full h-full object-cover transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Minimalist Question: Asking for Urgency */}
        <div className="text-center w-full px-1">
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight leading-tight transition-colors ${
              isDark ? 'text-white' : 'text-[#0d1c2f]'
            }`}
          >
            How urgent is your charge?
          </h2>
        </div>

        {/* Distinct Colored Option Selector: Nearest (Emerald) | Cheapest (Amber) | Fastest (Sky Blue) */}
        <div
          className={`w-full p-1 rounded-2xl backdrop-blur-md shadow-sm flex items-center gap-1 shrink-0 transition-colors ${
            isDark
              ? 'bg-[#0a2118]/90 border border-[#1b4434]'
              : 'bg-white/90 border border-slate-200'
          }`}
        >
          {/* Nearest Button (Emerald Green) */}
          <button
            type="button"
            onClick={() => setSelectedCriteria('nearest')}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'nearest'
                ? 'bg-[#006948] text-white shadow-md'
                : isDark
                ? 'text-[#85f8c4] bg-[#0c261c] hover:bg-[#113326] border border-[#164232]'
                : 'text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">near_me</span>
            <span>Nearest</span>
          </button>

          {/* Cheapest Button (Amber Gold) */}
          <button
            type="button"
            onClick={() => setSelectedCriteria('cheapest')}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'cheapest'
                ? 'bg-[#d97706] text-white shadow-md'
                : isDark
                ? 'text-amber-300 bg-[#241705] hover:bg-[#332107] border border-[#4d320b]'
                : 'text-amber-800 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">payments</span>
            <span>Cheapest</span>
          </button>

          {/* Fastest Button (Electric Blue / Sky) */}
          <button
            type="button"
            onClick={() => setSelectedCriteria('fastest')}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'fastest'
                ? 'bg-[#0284c7] text-white shadow-md'
                : isDark
                ? 'text-sky-300 bg-[#071c2c] hover:bg-[#0a263c] border border-[#0d3654]'
                : 'text-sky-800 bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Fastest</span>
          </button>
        </div>

        {/* Minimal Station Recommendation Card */}
        <div
          className={`w-full p-2.5 sm:p-3 rounded-2xl backdrop-blur-md shadow-md flex items-center justify-between gap-2.5 text-left shrink-0 transition-colors ${
            isDark
              ? 'bg-[#0e291f]/95 border border-[#1b4434]'
              : 'bg-white/95 border border-slate-200/80'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark
                    ? selectedCriteria === 'nearest'
                      ? 'bg-[#004f35] text-[#85f8c4] border border-[#006948]'
                      : selectedCriteria === 'cheapest'
                      ? 'bg-[#3b2302] text-amber-300 border border-[#d97706]/40'
                      : 'bg-[#062c47] text-sky-300 border border-[#0284c7]/40'
                    : theme.badgeBg
                }`}
              >
                {selectedCriteria === 'nearest'
                  ? 'Nearest'
                  : selectedCriteria === 'cheapest'
                  ? 'Cheapest'
                  : 'Fastest'}
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeStation ? `${activeStation.distanceKm} km · ~${activeStation.driveTimeMins} mins` : '...'}
              </span>
            </div>

            <h3
              className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                isDark ? 'text-white' : 'text-[#0d1c2f]'
              }`}
            >
              {activeStation ? activeStation.name : 'Scanning EV network...'}
            </h3>

            <div className={`flex items-center gap-2 mt-0.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span
                className={`font-bold ${
                  isDark
                    ? selectedCriteria === 'nearest'
                      ? 'text-[#85f8c4]'
                      : selectedCriteria === 'cheapest'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                    : theme.textAccent
                }`}
              >
                {activeStation ? `${activeStation.availableBays} bays free` : '...'}
              </span>
              <span>•</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {selectedCriteria === 'cheapest'
                  ? `$${lowestTariff.toFixed(2)}/kWh`
                  : `${maxPowerKw} kW DC`}
              </span>
            </div>
          </div>

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
              isDark
                ? selectedCriteria === 'nearest'
                  ? 'bg-[#004f35] text-[#85f8c4]'
                  : selectedCriteria === 'cheapest'
                  ? 'bg-[#3b2302] text-amber-300'
                  : 'bg-[#062c47] text-sky-300'
                : theme.iconBox
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">
              {selectedCriteria === 'nearest'
                ? 'near_me'
                : selectedCriteria === 'cheapest'
                ? 'savings'
                : 'speed'}
            </span>
          </div>
        </div>

        {/* Minimal Action Buttons */}
        <div className="w-full flex flex-col gap-1.5 sm:gap-2 shrink-0">
          {/* Primary Action Button with Dynamic Gradient */}
          <button
            type="button"
            onClick={handleTakeMeNow}
            className={`group w-full py-2.5 sm:py-3 px-5 rounded-full bg-gradient-to-r ${theme.bgGradient} active:scale-[0.98] transition-all text-white font-black text-xs sm:text-sm shadow-md ${theme.shadow} cursor-pointer flex items-center justify-center gap-2 border ${theme.border}`}
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span className="tracking-wide">TAKE ME THERE NOW!!</span>
          </button>

          {/* Secondary Action: Minimal Outlined Button */}
          <button
            type="button"
            onClick={onShowMeAround}
            className={`w-full py-2 px-5 rounded-full active:scale-[0.98] transition-all font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-[#0e291f] hover:bg-[#143b2c] text-[#f0fbf6] border border-[#1b4434]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">map</span>
            <span>Explore map</span>
          </button>
        </div>
      </main>
    </div>
  );
};
