import React, { useState, useMemo } from 'react';
import { Station } from '../types/charging';
import { PWAInstallButton } from './PWAInstallButton';
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

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-y-auto bg-gradient-to-b from-white via-[#f8fcfa] to-[#eef9f4] text-[#0d1c2f] flex flex-col justify-between selection:bg-[#85f8c4] selection:text-[#002114] relative select-none pb-24 sm:pb-28">
      {/* Background Soft Ambient Light Blurs (Keeping our Singapore Emerald & Mint Colors) */}
      <div className="absolute top-12 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-[#85f8c4]/35 via-[#006948]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-12 w-64 h-64 bg-[#006948]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Logo, Tagline & Burger Action (Reference UI Style) */}
      <header className="relative z-20 w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#006948] to-[#004f35] flex items-center justify-center text-white shadow-md shadow-[#006948]/25 shrink-0">
            <span className="material-symbols-outlined text-[22px] sm:text-[24px] text-[#85f8c4]">bolt</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0d1c2f] leading-none">
                ChargeSG
              </h1>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#e6f8ef] text-[#006948] border border-[#85f8c4]/50">
                SG 🇸🇬
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
              any EV, anywhere, anytime
            </p>
          </div>
        </div>

        {/* Top Right: One-Click Install & Hamburger Pill Action (Matching Reference Header) */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton variant="launch" />
          <button
            type="button"
            onClick={onShowMeAround}
            aria-label="Explore Menu"
            title="Explore Singapore EV Charging Network"
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#006948] to-[#005238] hover:opacity-90 active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#006948]/25 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center py-2 sm:py-4">
        {/* Curved Organic Hero Image Container (Direct Reference UI Architecture) */}
        <div className="relative w-full max-w-xs sm:max-w-sm mx-auto mb-3 sm:mb-4">
          {/* Ambient Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#006948]/20 to-[#85f8c4]/30 rounded-[3rem] blur-xl transform scale-105" />

          {/* Curved Cut Graphic Container */}
          <div className="relative w-full aspect-[4/3] rounded-[2.5rem] rounded-tr-[5rem] rounded-bl-[1.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <img
              src={heroHighwayImg}
              alt="Singapore expressway with electric vehicles and light trails"
              className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Shade on bottom edge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Teardrop Location Marker Pin (Matching Reference UI's Purple Pin) */}
          <div className="absolute -top-3 -left-2 z-20 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full rounded-br-none -rotate-45 bg-gradient-to-br from-[#006948] to-[#004f35] flex items-center justify-center shadow-xl shadow-[#006948]/40 border-2 border-white">
              <span className="w-3.5 h-3.5 rounded-full bg-[#85f8c4] animate-pulse rotate-45 shadow-sm shadow-[#85f8c4]" />
            </div>
            {/* Soft shadow under pin */}
            <div className="w-5 h-1.5 bg-black/20 rounded-full blur-[2px] mt-0.5" />
          </div>

          {/* Live Available Pill Overlay on bottom right of the photo */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#0d1c2f]/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-ping" />
            <span>Live LTA DataMall</span>
          </div>
        </div>

        {/* Text Content Block (Matching Reference Typography & Structure) */}
        <div className="text-left w-full">
          {/* Eyebrow / Overline */}
          <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#006948] uppercase block mb-1">
            Singapore EV Charging Services
          </span>

          {/* Primary Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0d1c2f] leading-[1.15] tracking-tight">
            Charge anything, anywhere, anytime
          </h2>

          {/* Subtext */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-1 sm:mt-1.5 max-w-md">
            When every kilowatt counts, trust us to find live available chargers, lowest tariffs, and fastest routes instantly.
          </p>
        </div>

        {/* Criteria Option Selector: Nearest | Cheapest | Fastest */}
        <div className="mt-3 sm:mt-4 p-1 rounded-2xl bg-white/80 backdrop-blur-md border border-[#dde9ff] shadow-sm flex items-center gap-1 w-full">
          <button
            type="button"
            onClick={() => setSelectedCriteria('nearest')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'nearest'
                ? 'bg-[#006948] text-white shadow-md'
                : 'text-slate-600 hover:text-[#006948] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">near_me</span>
            <span>Nearest</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCriteria('cheapest')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'cheapest'
                ? 'bg-[#006948] text-white shadow-md'
                : 'text-slate-600 hover:text-[#006948] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">payments</span>
            <span>Cheapest</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCriteria('fastest')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              selectedCriteria === 'fastest'
                ? 'bg-[#006948] text-white shadow-md'
                : 'text-slate-600 hover:text-[#006948] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Fastest</span>
          </button>
        </div>

        {/* Dynamic Station Recommendation Preview Card */}
        <div className="mt-2.5 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#dde9ff] shadow-md flex items-center justify-between gap-3 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-[#e6f8ef] text-[#006948] text-[9px] font-bold uppercase tracking-wider">
                {selectedCriteria === 'nearest'
                  ? 'Nearest Ready Point'
                  : selectedCriteria === 'cheapest'
                  ? 'Cheapest Ready Point'
                  : 'Fastest DC Charger'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeStation ? `${activeStation.distanceKm} km · ~${activeStation.driveTimeMins} mins` : '...'}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#0d1c2f] truncate">
              {activeStation ? activeStation.name : 'Scanning Singapore EV network...'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600">
              <span className="font-bold text-[#006948]">
                {activeStation ? `${activeStation.availableBays} bays free` : 'Checking...'}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {selectedCriteria === 'cheapest'
                  ? `$${lowestTariff.toFixed(2)}/kWh`
                  : `${maxPowerKw} kW DC`}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#e6f8ef] text-[#006948] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              {selectedCriteria === 'nearest'
                ? 'directions_car'
                : selectedCriteria === 'cheapest'
                ? 'savings'
                : 'speed'}
            </span>
          </div>
        </div>

        {/* Dual Stacked Action Buttons (Direct Reference UI Layout) */}
        <div className="mt-3.5 sm:mt-4 flex flex-col gap-2 w-full">
          {/* Top Primary Button: Filled Pill (Matching "Talk to an expert" in Reference) */}
          <button
            type="button"
            onClick={handleTakeMeNow}
            className="group relative w-full py-3 sm:py-3.5 px-6 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] hover:from-[#00593d] hover:to-[#007452] active:scale-[0.98] transition-all text-white font-black text-xs sm:text-sm shadow-lg shadow-[#006948]/25 cursor-pointer flex items-center justify-center gap-2 border border-[#85f8c4]/40"
          >
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4] group-hover:scale-110 transition-transform">
              bolt
            </span>
            <span className="tracking-wide">
              TAKE ME THERE NOW!!
            </span>
          </button>

          {/* Bottom Secondary Button: Outlined Pill (Matching "Platform login" in Reference) */}
          <button
            type="button"
            onClick={onShowMeAround}
            className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] transition-all text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 hover:border-[#006948] shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">
              tune
            </span>
            <span>
              Show me around (Explore)
            </span>
          </button>
        </div>
      </main>

      {/* Bottom Subtle Network Note */}
      <footer className="relative z-10 w-full max-w-lg mx-auto pb-1 text-center text-[10px] text-slate-400 font-medium shrink-0">
        <span>Singapore Land Transport Authority (LTA) Live Network</span>
      </footer>
    </div>
  );
};
