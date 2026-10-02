import React, { useState, useMemo, useEffect } from 'react';
import { Station } from '../types/charging';
import { PWAInstallButton } from './PWAInstallButton';
import { ChargeSGLogo } from './ChargeSGLogo';
import { useGreenTheme } from '../context/ThemeContext';
import fastChargingImg from '../assets/images/sg_ev_fast_charging_1790916358550.jpg';
import solarCanopyImg from '../assets/images/sg_ev_solar_canopy_1790916371372.jpg';
import nightSuperchargerImg from '../assets/images/sg_ev_night_supercharger_1790916385093.jpg';
import expresswayHubImg from '../assets/images/sg_ev_expressway_hub_1790916396581.jpg';

export type FrontPageCriteria = 'nearest' | 'cheapest' | 'fastest';

interface EVSlide {
  id: string;
  img: string;
  title: string;
  tag: string;
  criteria?: FrontPageCriteria;
}

const EV_SLIDES: EVSlide[] = [
  {
    id: 'fast_charging',
    img: fastChargingImg,
    title: 'High-Power DC Ultra-Fast Hub',
    tag: '⚡ 150kW Dual CCS2 • Live Status',
    criteria: 'fastest',
  },
  {
    id: 'solar_canopy',
    img: solarCanopyImg,
    title: 'Solar Canopy Green Energy Hub',
    tag: '☀️ Eco Off-Peak Tariffs • $0.52/kWh',
    criteria: 'cheapest',
  },
  {
    id: 'night_supercharger',
    img: nightSuperchargerImg,
    title: 'Marina Bay Skyline Night Charger',
    tag: '🌃 24/7 High-Availability Station',
    criteria: 'nearest',
  },
  {
    id: 'expressway_hub',
    img: expresswayHubImg,
    title: 'Express Islandway Quick Charge',
    tag: '🛣️ Rapid Turnkey Bay • PIE Expressway',
    criteria: 'nearest',
  },
];

interface UrgencyLaunchScreenProps {
  stations: Station[];
  nearestStation: Station | null;
  onNavigateToTarget: (station: Station) => void;
  onShowMeAround?: () => void;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export const UrgencyLaunchScreen: React.FC<UrgencyLaunchScreenProps> = ({
  stations,
  nearestStation,
  onNavigateToTarget,
  onRefresh,
  isRefreshing,
}) => {
  const { toggleTheme, isDark } = useGreenTheme();
  const [selectedCriteria, setSelectedCriteria] = useState<FrontPageCriteria>('nearest');
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Pull-down-to-refresh state
  const [pullY, setPullY] = useState<number>(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState<boolean>(false);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);

  const pullStartYRef = React.useRef<number | null>(null);
  const pullStartXRef = React.useRef<number | null>(null);
  const isPullingRef = React.useRef<boolean>(false);

  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef<boolean>(false);

  // Execute Refresh Function
  const executeRefresh = async () => {
    setIsPullRefreshing(true);
    setPullY(54);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
      setRefreshSuccess(true);
      setTimeout(() => {
        setRefreshSuccess(false);
        setIsPullRefreshing(false);
        setPullY(0);
      }, 1100);
    } catch {
      setIsPullRefreshing(false);
      setPullY(0);
    }
  };

  // Pull-down-to-refresh Touch Gesture Handlers
  const handlePageTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      pullStartYRef.current = e.touches[0].clientY;
      pullStartXRef.current = e.touches[0].clientX;
      isPullingRef.current = false;
    }
  };

  const handlePageTouchMove = (e: React.TouchEvent) => {
    if (pullStartYRef.current === null || isPullRefreshing) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - pullStartYRef.current;
    const deltaX = currentX - (pullStartXRef.current || 0);

    // Only engage if pulling strictly downwards
    if (deltaY > 6 && deltaY > Math.abs(deltaX) * 1.1) {
      isPullingRef.current = true;
      const damped = Math.min(85, deltaY * 0.45);
      setPullY(damped);
    }
  };

  const handlePageTouchEnd = () => {
    if (pullY >= 48 && !isPullRefreshing) {
      executeRefresh();
    } else {
      setPullY(0);
    }
    pullStartYRef.current = null;
    pullStartXRef.current = null;
    isPullingRef.current = false;
  };

  // Mouse Drag support for pull-down refresh
  const handlePageMouseDown = (e: React.MouseEvent) => {
    if (e.clientY < window.innerHeight * 0.4) {
      pullStartYRef.current = e.clientY;
      pullStartXRef.current = e.clientX;
      isPullingRef.current = true;
    }
  };

  const handlePageMouseMove = (e: React.MouseEvent) => {
    if (!isPullingRef.current || pullStartYRef.current === null || isPullRefreshing) return;
    const deltaY = e.clientY - pullStartYRef.current;
    const deltaX = e.clientX - (pullStartXRef.current || 0);
    if (deltaY > 6 && deltaY > Math.abs(deltaX)) {
      const damped = Math.min(85, deltaY * 0.45);
      setPullY(damped);
    }
  };

  const handlePageMouseUp = () => {
    if (isPullingRef.current) {
      if (pullY >= 48 && !isPullRefreshing) {
        executeRefresh();
      } else {
        setPullY(0);
      }
    }
    pullStartYRef.current = null;
    pullStartXRef.current = null;
    isPullingRef.current = false;
  };

  // Auto-advance dynamic EV scenes every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % EV_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlideIdx((prev) => (prev + 1) % EV_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIdx((prev) => (prev - 1 + EV_SLIDES.length) % EV_SLIDES.length);
  };

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      setSwipeOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - (touchStartYRef.current || 0);

    // Filter predominantly horizontal gestures
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeOffset(Math.max(-80, Math.min(80, diffX)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartXRef.current;
      const threshold = 35; // Swipe sensitivity threshold

      if (diffX < -threshold) {
        // Swiped Left -> Next slide
        handleNextSlide();
      } else if (diffX > threshold) {
        // Swiped Right -> Previous slide
        handlePrevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setSwipeOffset(0);
  };

  // Mouse Drag Gesture Handlers (for trackpad & desktop dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartXRef.current = e.clientX;
    isDraggingRef.current = true;
    setSwipeOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || touchStartXRef.current === null) return;
    const diffX = e.clientX - touchStartXRef.current;
    setSwipeOffset(Math.max(-80, Math.min(80, diffX)));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current && touchStartXRef.current !== null) {
      const diffX = e.clientX - touchStartXRef.current;
      const threshold = 35;
      if (diffX < -threshold) {
        handleNextSlide();
      } else if (diffX > threshold) {
        handlePrevSlide();
      } else if (Math.abs(diffX) < 5) {
        // Direct tap without dragging -> advance to next
        handleNextSlide();
      }
    }
    isDraggingRef.current = false;
    touchStartXRef.current = null;
    setSwipeOffset(0);
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    touchStartXRef.current = null;
    setSwipeOffset(0);
  };

  const handleSelectCriteria = (crit: FrontPageCriteria) => {
    setSelectedCriteria(crit);
    // Dynamically align EV image to the chosen criteria
    if (crit === 'fastest') {
      setCurrentSlideIdx(0); // Ultra-fast charging
    } else if (crit === 'cheapest') {
      setCurrentSlideIdx(1); // Solar eco off-peak
    } else {
      setCurrentSlideIdx(3); // Express turnkey bay
    }
  };

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
      onTouchStart={handlePageTouchStart}
      onTouchMove={handlePageTouchMove}
      onTouchEnd={handlePageTouchEnd}
      onMouseDown={handlePageMouseDown}
      onMouseMove={handlePageMouseMove}
      onMouseUp={handlePageMouseUp}
      className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none select-none flex flex-col justify-between px-3.5 sm:px-5 pt-2 pb-24 sm:pb-28 md:pb-32 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#06150f] via-[#0c231a] to-[#040e0a] text-white'
          : 'bg-gradient-to-b from-white via-[#f4faf7] to-[#eaf5ef] text-[#0d1c2f]'
      }`}
    >
      {/* Pull Down to Refresh Floating Visual Feedback Pill */}
      <div
        className={`fixed top-3 inset-x-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-300 ${
          pullY > 0 || isPullRefreshing || refreshSuccess
            ? 'opacity-100'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
        style={{
          transform: pullY > 0 ? `translateY(${Math.min(pullY, 70)}px)` : undefined,
        }}
      >
        <div
          className={`px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border transition-all text-xs font-bold ${
            isDark
              ? 'bg-[#0a2419]/95 border-[#1b4434] text-[#85f8c4] shadow-black/60'
              : 'bg-white/95 border-emerald-200 text-[#006948] shadow-emerald-900/15'
          }`}
        >
          {refreshSuccess ? (
            <>
              <span className="material-symbols-outlined text-[17px] text-emerald-400">check_circle</span>
              <span>EV Network & GPS Synced!</span>
            </>
          ) : isPullRefreshing || isRefreshing ? (
            <>
              <span className="material-symbols-outlined text-[17px] animate-spin text-[#85f8c4]">sync</span>
              <span>Refreshing Live Stations...</span>
            </>
          ) : pullY >= 48 ? (
            <>
              <span className="material-symbols-outlined text-[17px] animate-bounce text-[#85f8c4]">arrow_downward</span>
              <span>Release to refresh EV network</span>
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-[17px] transition-transform"
                style={{ transform: `rotate(${pullY * 6}deg)` }}
              >
                sync
              </span>
              <span>Pull down to refresh</span>
            </>
          )}
        </div>
      </div>

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
      <header className="relative z-20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between shrink-0 py-1">
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

      {/* Main Content Area - Fully contained, zero scrolling with spring pull-refresh feedback */}
      <main
        className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex-1 flex flex-col justify-between py-1 sm:py-2 min-h-0 gap-1.5 sm:gap-2.5 transition-transform"
        style={{
          transform: pullY > 0 ? `translateY(${pullY * 0.35}px)` : undefined,
          transition: pullY === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {/* Dynamic Responsive Centerpiece EV Showcase - Scales dynamically with viewport */}
        <div className="relative w-full flex-1 min-h-[140px] max-h-[30vh] sm:max-h-[35vh] md:max-h-[38vh] lg:max-h-[40vh] flex items-center justify-center select-none py-0.5 sm:py-1">
          <div className="relative w-full h-full max-w-[340px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[560px] flex items-center justify-center">
            {/* Ambient Glow Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#006948]/20 to-[#85f8c4]/30 rounded-[2.5rem] blur-xl transform scale-105 pointer-events-none" />

            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className={`relative w-full h-full aspect-[16/10] max-h-[36vh] sm:max-h-[42vh] md:max-h-[46vh] lg:max-h-[48vh] rounded-[2rem] rounded-tr-[4.5rem] rounded-bl-[1.5rem] overflow-hidden shadow-2xl border-2 transition-all cursor-grab active:cursor-grabbing group select-none ${
                isDark ? 'border-[#1b4434] bg-[#071711]' : 'border-white bg-slate-100'
              }`}
              style={{
                touchAction: 'pan-y',
                transform: swipeOffset !== 0 ? `translateX(${swipeOffset * 0.45}px)` : undefined,
                transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
              }}
              title="Swipe left or right, or click to explore Singapore EV charging scenarios"
            >
              {EV_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === currentSlideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.img}
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform scale-102 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                  {/* Dynamic EV Scenario Badge & Title */}
                  <div className="absolute bottom-2.5 sm:bottom-3 inset-x-3 sm:inset-x-4 flex items-end justify-between gap-2 pointer-events-none">
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#85f8c4] text-[9.5px] sm:text-[10.5px] font-bold border border-[#85f8c4]/30 shadow-xs mb-1">
                        {slide.tag}
                      </span>
                      <h3 className="text-white text-xs sm:text-sm font-extrabold tracking-tight truncate drop-shadow-md">
                        {slide.title}
                      </h3>
                    </div>

                    {/* Interactive Slide Dots */}
                    <div className="flex items-center gap-1 shrink-0 pb-1">
                      {EV_SLIDES.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlideIdx(dotIdx);
                          }}
                          aria-label={`Jump to slide ${dotIdx + 1}`}
                          className={`rounded-full transition-all cursor-pointer pointer-events-auto ${
                            dotIdx === currentSlideIdx
                              ? 'w-4 h-1.5 bg-[#85f8c4]'
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Desktop Chevron Navigation Buttons */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevSlide();
                }}
                aria-label="Previous EV scene"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer pointer-events-auto"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextSlide();
                }}
                aria-label="Next EV scene"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer pointer-events-auto"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
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
            onClick={() => handleSelectCriteria('nearest')}
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
            onClick={() => handleSelectCriteria('cheapest')}
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
            onClick={() => handleSelectCriteria('fastest')}
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

        {/* Action Button Container - Elevated with ample clearance from the bottom navigation bar */}
        <div className="w-full shrink-0 mb-3 sm:mb-5">
          {/* Primary Action Button with Dynamic Gradient */}
          <button
            type="button"
            onClick={handleTakeMeNow}
            className={`group w-full py-3 sm:py-3.5 px-5 rounded-full bg-gradient-to-r ${theme.bgGradient} active:scale-[0.98] transition-all text-white font-black text-xs sm:text-sm shadow-xl ${theme.shadow} cursor-pointer flex items-center justify-center gap-2 border ${theme.border}`}
          >
            <span className="material-symbols-outlined text-[19px]">bolt</span>
            <span className="tracking-wide">TAKE ME THERE NOW!!</span>
          </button>
        </div>
      </main>
    </div>
  );
};
