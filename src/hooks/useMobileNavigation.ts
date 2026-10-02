import { useEffect, useState, useRef, useCallback } from 'react';

export function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;
  const isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;

  return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
}

interface UseMobileNavigationOptions {
  appFlowMode: 'launch' | 'routing_nearest' | 'explore';
  isDetailsView: boolean;
  currentTab: 'map' | 'saved' | 'activity' | 'profile';
  hasOpenModal: boolean;
  onCloseOpenModal: () => void;
  onBackToMap: () => void;
  onBackToLaunch: () => void;
  onSetTab: (tab: 'map' | 'saved' | 'activity' | 'profile') => void;
}

export function useMobileNavigation({
  appFlowMode,
  isDetailsView,
  currentTab,
  hasOpenModal,
  onCloseOpenModal,
  onBackToMap,
  onBackToLaunch,
  onSetTab,
}: UseMobileNavigationOptions) {
  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Keep latest refs to actions to prevent stale closures in popstate and touch handlers
  const stateRef = useRef({
    appFlowMode,
    isDetailsView,
    currentTab,
    hasOpenModal,
  });

  const actionsRef = useRef({
    onCloseOpenModal,
    onBackToMap,
    onBackToLaunch,
    onSetTab,
  });

  useEffect(() => {
    stateRef.current = {
      appFlowMode,
      isDetailsView,
      currentTab,
      hasOpenModal,
    };
  }, [appFlowMode, isDetailsView, currentTab, hasOpenModal]);

  useEffect(() => {
    actionsRef.current = {
      onCloseOpenModal,
      onBackToMap,
      onBackToLaunch,
      onSetTab,
    };
  }, [onCloseOpenModal, onBackToMap, onBackToLaunch, onSetTab]);

  // Handle mobile detection and resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main internal back navigation resolver (returns true if an in-app back step was consumed)
  const handleInternalBack = useCallback((): boolean => {
    const current = stateRef.current;
    const actions = actionsRef.current;

    // 1. If any modal is open, close that modal first
    if (current.hasOpenModal) {
      actions.onCloseOpenModal();
      return true;
    }

    // 2. If viewing Station Details, back out to the map view
    if (current.isDetailsView) {
      actions.onBackToMap();
      return true;
    }

    // 3. If in emergency/nearest routing mode, back out to the launch screen
    if (current.appFlowMode === 'routing_nearest') {
      actions.onBackToLaunch();
      return true;
    }

    // 4. If in another tab (Saved, Activity, Profile), back out to Map Explore tab
    if (current.currentTab !== 'map') {
      actions.onSetTab('map');
      return true;
    }

    // 5. If in Explore mode on the map tab, back out to the Launch screen
    if (current.appFlowMode === 'explore') {
      actions.onBackToLaunch();
      return true;
    }

    // Already at root launch screen
    return false;
  }, []);

  // Browser History Management (popstate handler)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure there is an initial baseline state in the browser history
    if (!window.history.state || !window.history.state.chargeSgApp) {
      window.history.replaceState({ chargeSgApp: true, level: 0, view: 'root' }, '');
    }

    const handlePopState = (_e: PopStateEvent) => {
      // User performed browser swipe-back gesture or pressed Android back button
      const handled = handleInternalBack();

      // If an in-app step was handled, push a sentinel state so future back swipes
      // stay safely inside the site rather than exiting the web app
      if (handled) {
        window.history.pushState({ chargeSgApp: true, level: 1, view: 'in_app' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleInternalBack]);

  // Push history state whenever user dives deeper into cards, views, or modals
  const pushNavState = useCallback((targetName: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.history.pushState(
        { chargeSgApp: true, level: 1, target: targetName, timestamp: Date.now() },
        ''
      );
    } catch (_e) {
      // Safe fallback if history API is restricted in sandboxed iframes
    }
  }, []);

  // Touch Navigation Gesture Detection (Swipe-Right from edge or across card on mobile)
  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchStartRef.current = null;
        return;
      }
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const duration = Date.now() - touchStartRef.current.time;
      const startX = touchStartRef.current.x;

      touchStartRef.current = null;

      // Gesture criteria:
      // 1. Rightward horizontal swipe (deltaX >= 65px)
      // 2. Predominantly horizontal (|deltaX| > |deltaY| * 1.4)
      // 3. Fast flick gesture (duration < 450ms)
      // 4. Starts from the left side (startX < window.innerWidth * 0.45 or edge startX < 70px)
      const isSwipeRight =
        deltaX > 65 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.4 &&
        duration < 450 &&
        (startX < 75 || stateRef.current.isDetailsView || stateRef.current.hasOpenModal);

      if (isSwipeRight) {
        const consumed = handleInternalBack();
        if (consumed) {
          // Prevent any default back navigation bounce
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleInternalBack]);

  return {
    isMobile,
    pushNavState,
    handleInternalBack,
  };
}
