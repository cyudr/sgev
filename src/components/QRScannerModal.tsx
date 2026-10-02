import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../types/charging';
import { ChargeSGLogo } from './ChargeSGLogo';

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
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'error' | 'unsupported'>('requesting');
  const [cameraError, setCameraError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Hardware Camera on Mount
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setCameraState('unsupported');
          setCameraError('Camera API is not supported in this browser.');
        }
        return;
      }

      try {
        setCameraState('requesting');
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // Autoplay policy fallback
          }
        }
        setCameraState('active');
      } catch (err: any) {
        if (isMounted) {
          console.warn('Camera access notice:', err?.message || err);
          setCameraState('error');
          setCameraError(
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Camera permission denied. Allow camera in browser settings or use quick bay select below.'
              : 'Unable to access camera hardware. Use quick bay select below.'
          );
        }
      }
    }

    startCamera();

    // Clean up camera hardware tracks when modal unmounts
    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Torch Toggle
  const handleToggleTorch = async () => {
    if (!streamRef.current) {
      setTorchOn(!torchOn);
      return;
    }
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch {
        setTorchOn(!torchOn);
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  const handleSimulateScan = (code: string) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScanSuccess(code);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1c2f]/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white pt-2 sm:pt-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Scanner"
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="flex flex-col items-center px-2 min-w-0">
          <ChargeSGLogo size="xs" textColor="text-white" showBadge={false} />
          <h3 className="font-extrabold text-sm leading-tight mt-0.5">Scan QR to Charge</h3>
          <p className="text-[11px] text-slate-300 truncate max-w-[180px] sm:max-w-xs">{station.name}</p>
        </div>

        <button
          type="button"
          onClick={handleToggleTorch}
          aria-label="Toggle Torch"
          title={torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
            torchOn ? 'bg-[#85f8c4] text-[#002114]' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {torchOn ? 'flashlight_on' : 'flashlight_off'}
          </span>
        </button>
      </div>

      {/* Central Viewfinder with Live Video */}
      <div className="flex flex-col items-center justify-center my-auto w-full px-2">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-[#85f8c4] flex items-center justify-center overflow-hidden bg-black/60 shadow-[0_0_30px_rgba(0,105,72,0.4)]">
          {/* Live Camera Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraState === 'active' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Fallback States if Camera is Requesting or Inactive */}
          {cameraState === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center z-10 bg-black/50">
              <span className="material-symbols-outlined text-[32px] text-[#85f8c4] animate-spin">
                sync
              </span>
              <span className="text-xs text-white font-medium">Starting camera...</span>
            </div>
          )}

          {(cameraState === 'error' || cameraState === 'unsupported') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center z-10 bg-black/75">
              <span className="material-symbols-outlined text-[36px] text-amber-300">
                videocam_off
              </span>
              <span className="text-xs text-white font-bold">Camera Unavailable</span>
              <p className="text-[10px] text-slate-300 leading-tight">
                {cameraError || 'Please select a bay below to simulate instant QR detection.'}
              </p>
            </div>
          )}

          {/* Scanning Laser Beam */}
          <div
            className={`absolute inset-x-0 h-1 bg-[#85f8c4] shadow-[0_0_15px_#85f8c4] z-20 ${
              scanning ? 'animate-bounce duration-500' : 'animate-pulse'
            }`}
          />

          {/* Viewfinder Target Corner Guides */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg z-20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg z-20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg z-20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg z-20 pointer-events-none" />

          {/* Live Scanner Target Reticle */}
          {cameraState === 'active' && (
            <div className="z-10 opacity-30 pointer-events-none flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-white text-[64px]">filter_center_focus</span>
            </div>
          )}
        </div>

        <p className="text-white text-xs mt-3.5 text-center max-w-xs leading-relaxed">
          {cameraState === 'active'
            ? 'Point camera at the QR code on the charger holster or pillar'
            : 'Tap any available Singapore bay below to initiate plug-in'}
        </p>
      </div>

      {/* Quick Bay Detect Buttons (Immediate one-tap QR simulator) */}
      <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl flex flex-col gap-2 mb-2 border border-white/10 shrink-0">
        <span className="text-[#85f8c4] text-[10.5px] font-extrabold text-center uppercase tracking-wider">
          Quick Bay Select (Singapore Network)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {station.bays.slice(0, 3).map((bay) => (
            <button
              key={bay.id}
              type="button"
              disabled={bay.status !== 'available' || scanning}
              onClick={() => handleSimulateScan(bay.code)}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                bay.status === 'available'
                  ? 'bg-[#006948] text-white hover:bg-[#00855d] active:scale-95 shadow-md border border-[#85f8c4]/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
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
