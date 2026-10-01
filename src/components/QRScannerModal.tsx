import React, { useState } from 'react';
import { Station } from '../types/charging';

interface QRScannerModalProps {
  station: Station;
  onScanSuccess: (bayCode: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  station,
  onScanSuccess,
  onClose,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  const simulateScan = (code: string) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScanSuccess(code);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1c2f]/85 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white pt-3">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="text-center">
          <h3 className="font-bold text-base">Scan QR to Charge</h3>
          <p className="text-xs text-slate-300">{station.name}</p>
        </div>

        <button
          type="button"
          onClick={() => setTorchOn(!torchOn)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            torchOn ? 'bg-[#85f8c4] text-[#002114]' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {torchOn ? 'flashlight_on' : 'flashlight_off'}
          </span>
        </button>
      </div>

      {/* Central Viewfinder */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative w-64 h-64 rounded-3xl border-2 border-[#85f8c4] flex items-center justify-center overflow-hidden bg-black/40 shadow-2xl">
          {/* Laser scanning beam */}
          <div
            className={`absolute inset-x-0 h-1 bg-[#85f8c4] shadow-[0_0_15px_#85f8c4] ${
              scanning ? 'animate-bounce duration-500' : 'animate-pulse'
            }`}
          />

          {/* Corner Guides */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />

          {/* QR Glyph Mockup */}
          <div className="opacity-40 flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-white text-[72px]">qr_code_2</span>
            <span className="text-[10px] text-white font-mono tracking-widest">
              SP-SG-MBS-AA12
            </span>
          </div>
        </div>

        <p className="text-white text-xs mt-4 text-center max-w-xs leading-relaxed">
          Point camera at the QR sticker on the charger pillar beside the connector holster
        </p>
      </div>

      {/* Quick Bay Detect Buttons (For instant seamless testing) */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl flex flex-col gap-2.5 mb-4 border border-white/10">
        <span className="text-white text-[11px] font-semibold text-center uppercase tracking-wider">
          Quick Scan Simulator (Singapore Bays)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {station.bays.slice(0, 3).map((bay) => (
            <button
              key={bay.id}
              type="button"
              disabled={bay.status !== 'available'}
              onClick={() => simulateScan(bay.code)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                bay.status === 'available'
                  ? 'bg-[#006948] text-white hover:bg-[#00855d] active:scale-95'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              Bay {bay.code} ({bay.powerKw}kW)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
