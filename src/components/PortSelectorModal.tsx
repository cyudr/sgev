import React from 'react';
import { Station, ChargingBay } from '../types/charging';
import { ChargeSGLogo } from './ChargeSGLogo';

interface PortSelectorModalProps {
  station: Station;
  onSelectBayToCharge: (bay: ChargingBay) => void;
  onClose: () => void;
}

export const PortSelectorModal: React.FC<PortSelectorModalProps> = ({
  station,
  onSelectBayToCharge,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1c2f]/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-[#dde9ff] max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChargeSGLogo size="xs" showBadge={false} />
            <span className="material-symbols-outlined text-[#006948] text-[20px]">tune</span>
            <h3 className="text-base font-bold text-[#0d1c2f]">Select Charger Port</h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#3d4a42] hover:bg-[#dde9ff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-[#3d4a42]">
          Choose the charging gun you have plugged into your vehicle at{' '}
          <span className="font-bold text-[#0d1c2f]">{station.name}</span>.
        </p>

        <div className="flex flex-col gap-2.5">
          {station.bays.map((bay) => {
            const isAvailable = bay.status === 'available';

            return (
              <div
                key={bay.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isAvailable
                    ? 'border-[#dde9ff] bg-white hover:border-[#006948]'
                    : 'border-[#dde9ff]/50 bg-[#eff4ff] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isAvailable
                        ? 'bg-[#85f8c4] text-[#002114]'
                        : 'bg-[#d5e3fd] text-[#3d4a42]'
                    }`}
                  >
                    {bay.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0d1c2f]">
                        {bay.powerKw} kW {bay.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dde9ff] text-[#0d1c2f] font-semibold">
                        {bay.connectorType}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#3d4a42]">
                      {bay.hasPublishedTariff && bay.pricePerKwh !== undefined ? (
                        <span className="text-[#006948] font-bold">
                          S${bay.pricePerKwh.toFixed(3)}/kWh (Live) •{' '}
                        </span>
                      ) : (
                        <span className="text-amber-800 font-bold">
                          ~S${(bay.pricePerKwh || (bay.category.includes('DC') ? 0.65 : 0.55)).toFixed(3)}/kWh (Nominal) •{' '}
                        </span>
                      )}
                      {isAvailable ? 'Ready' : 'Currently Occupied'}
                    </span>
                  </div>
                </div>

                {isAvailable ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBayToCharge(bay);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#006948] text-white text-xs font-bold active:scale-95 transition-transform hover:bg-[#00855d] cursor-pointer"
                  >
                    Start Bay {bay.code}
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-[#ba1a1a] px-2 py-1 rounded bg-[#ffdad6]">
                    In Use
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
