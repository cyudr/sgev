import React from 'react';
import { Station } from '../types/charging';

interface SavedTabProps {
  stations: Station[];
  savedStationIds: string[];
  onSelectStation: (station: Station) => void;
  onOpenDetails: (station: Station) => void;
  onToggleSave: (stationId: string) => void;
}

export const SavedTab: React.FC<SavedTabProps> = ({
  stations,
  savedStationIds,
  onSelectStation,
  onOpenDetails,
  onToggleSave,
}) => {
  const savedStations = stations.filter((s) => savedStationIds.includes(s.id));

  return (
    <div className="flex flex-col w-full pb-32 sm:pb-36 max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#0d1c2f]">Saved Stations</h2>
          <p className="text-xs text-[#3d4a42]">Quick access to your favourite charging hubs in Singapore</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#e6eeff] text-[#0d1c2f] font-bold text-xs">
          {savedStations.length} Saved
        </span>
      </div>

      {savedStations.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-[#dde9ff] flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-[#6d7a72] text-[48px]">bookmark_border</span>
          <h3 className="text-base font-bold text-[#0d1c2f]">No saved stations yet</h3>
          <p className="text-xs text-[#3d4a42] max-w-xs">
            Tap the bookmark icon on any station on the map to save it here for instant availability monitoring.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedStations.map((station) => (
            <div
              key={station.id}
              className="p-4 rounded-3xl bg-white shadow-sm border border-[#dde9ff] flex flex-col gap-3 hover:border-[#006948] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                    {station.provider}
                  </span>
                  <h3
                    onClick={() => onOpenDetails(station)}
                    className="text-base font-bold text-[#0d1c2f] mt-1 cursor-pointer hover:text-[#006948]"
                  >
                    {station.name}
                  </h3>
                  <p className="text-xs text-[#3d4a42]">{station.zone}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSave(station.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6]"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bookmark
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#eff4ff] flex flex-col">
                  <span className="text-[10px] text-[#3d4a42] font-semibold">Available Bays</span>
                  <span className="text-sm font-bold text-[#006948] mt-0.5">
                    {station.availableBays} / {station.totalBays} Open
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#eff4ff] flex flex-col">
                  <span className="text-[10px] text-[#3d4a42] font-semibold">Distance</span>
                  <span className="text-sm font-bold text-[#0d1c2f] mt-0.5">
                    {station.distanceKm} km ({station.driveTimeMins} mins)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenDetails(station)}
                  className="flex-1 py-2.5 rounded-xl bg-[#dde9ff] text-[#0d1c2f] text-xs font-bold hover:bg-[#d5e3fd] transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectStation(station);
                    // Also switch back to map
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-colors cursor-pointer"
                >
                  Show on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
