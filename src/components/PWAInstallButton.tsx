import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'launch';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the button completely
  if (isInstalled) {
    return null;
  }

  // Handle click on Install button
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Desktop Chrome/Edge or browsers without beforeinstallprompt
      setShowIOSGuide(true);
    }
  };

  const isLaunch = variant === 'launch';

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Install ChargeSG App to Home Screen"
        className={`flex items-center gap-1.5 rounded-full font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
          isLaunch
            ? 'px-2.5 py-1 bg-[#85f8c4] text-[#002114] text-[10px] sm:text-xs hover:bg-[#a6ffd6] border border-[#85f8c4]/60'
            : 'px-2.5 py-1 bg-[#006948] text-white text-[10px] sm:text-xs hover:bg-[#00855d] border border-white/20'
        }`}
      >
        <span className="material-symbols-outlined text-[15px] sm:text-[17px]">
          install_mobile
        </span>
        <span>Install App</span>
      </button>

      {/* Guided installation guide dialog for iOS / browsers */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
          <div className="w-full max-w-xs rounded-2xl bg-[#0d1c2f] border border-white/20 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#006948] flex items-center justify-center text-[#85f8c4]">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <h3 className="text-xs font-black">Install ChargeSG</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="py-3 text-[11px] text-slate-300 space-y-2">
              <p className="font-semibold text-white">Add ChargeSG to your home screen for quick offline access:</p>
              <div className="p-2 rounded-xl bg-white/10 flex items-start gap-2">
                <span className="font-bold text-[#85f8c4]">1.</span>
                <span>Tap the <strong className="text-white">Share</strong> button (or menu icon) in your browser bar.</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-start gap-2">
                <span className="font-bold text-[#85f8c4]">2.</span>
                <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-start gap-2">
                <span className="font-bold text-[#85f8c4]">3.</span>
                <span>Tap <strong className="text-white">Add</strong> to launch ChargeSG directly as a standalone app!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
