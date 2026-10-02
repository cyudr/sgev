import React, { useState } from 'react';
import {
  getJsonCookie,
  setJsonCookie,
  COOKIE_KEYS,
  DEFAULT_VEHICLE_PREFS,
  UserVehiclePreferences,
} from '../utils/cookies';

export const ProfileTab: React.FC = () => {
  const [prefs, setPrefs] = useState<UserVehiclePreferences>(() =>
    getJsonCookie<UserVehiclePreferences>(COOKIE_KEYS.VEHICLE_PREFS, DEFAULT_VEHICLE_PREFS)
  );

  const [vehicleModel, setVehicleModel] = useState<string>(prefs.vehicleModel || 'BYD Atto 3');
  const [carPlate, setCarPlate] = useState<string>((prefs as any).carPlate || '');
  const [preferredPlug, setPreferredPlug] = useState<'CCS2' | 'Type 2' | 'CHAdeMO'>(
    (prefs.connectorPreference as 'CCS2' | 'Type 2' | 'CHAdeMO') || 'CCS2'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserVehiclePreferences & { carPlate?: string } = {
      ...prefs,
      vehicleModel,
      carPlate,
      connectorPreference: preferredPlug,
    };
    setPrefs(updated);
    setJsonCookie(COOKIE_KEYS.VEHICLE_PREFS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sgev-prefs-updated', { detail: updated }));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSelectPlug = (plug: 'CCS2' | 'Type 2' | 'CHAdeMO') => {
    setPreferredPlug(plug);
    const updated: UserVehiclePreferences & { carPlate?: string } = {
      ...prefs,
      vehicleModel,
      carPlate,
      connectorPreference: plug,
    };
    setPrefs(updated);
    setJsonCookie(COOKIE_KEYS.VEHICLE_PREFS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sgev-prefs-updated', { detail: updated }));
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 sm:pb-36 max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#0d1c2f]">Driver Profile</h2>
          <p className="text-xs text-[#3d4a42]">Vehicle & Charging Preferences</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
          Singapore EV Network
        </span>
      </div>

      {/* Vehicle Configuration Form */}
      <form onSubmit={handleSave} className="p-4 rounded-3xl bg-white shadow-sm border border-[#dde9ff] flex flex-col gap-3.5">
        <span className="text-xs font-bold text-[#0d1c2f] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#006948] text-[18px]">electric_car</span>
          Vehicle Information
        </span>

        <div>
          <label className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider block mb-1">
            Electric Vehicle Model
          </label>
          <input
            type="text"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="e.g. BYD Atto 3, Tesla Model Y, Hyundai Ioniq 5"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#006948]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider block mb-1">
            Vehicle License Plate (Optional)
          </label>
          <input
            type="text"
            value={carPlate}
            onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
            placeholder="e.g. SNE 1234 A"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#006948] uppercase"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider block mb-1">
            Default Connector Standard (Used by "Preferred" Filter)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPlug('CCS2')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                preferredPlug === 'CCS2'
                  ? 'bg-[#006948] text-white border-[#006948] shadow-sm'
                  : 'bg-[#eff4ff] text-[#3d4a42] border-transparent hover:border-slate-300'
              }`}
            >
              CCS2 (DC)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPlug('Type 2')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                preferredPlug === 'Type 2'
                  ? 'bg-[#006948] text-white border-[#006948] shadow-sm'
                  : 'bg-[#eff4ff] text-[#3d4a42] border-transparent hover:border-slate-300'
              }`}
            >
              Type 2 (AC)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPlug('CHAdeMO')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                preferredPlug === 'CHAdeMO'
                  ? 'bg-[#006948] text-white border-[#006948] shadow-sm'
                  : 'bg-[#eff4ff] text-[#3d4a42] border-transparent hover:border-slate-300'
              }`}
            >
              CHAdeMO
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-[#e6f8ef] text-[#006948] text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Preferences updated successfully!
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-colors"
        >
          Save Preferences
        </button>
      </form>

      {/* Live Data Connection Info */}
      <div className="p-4 rounded-3xl bg-white shadow-sm border border-[#dde9ff] flex flex-col gap-2">
        <span className="text-xs font-bold text-[#0d1c2f] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#006948] text-[18px]">dataset</span>
          LTA DataMall Singapore Feeds
        </span>
        <div className="text-[11px] text-[#3d4a42] flex flex-col gap-1.5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff]">
            <span>1. EVChargingPoints (Postal Code)</span>
            <span className="font-bold text-[#006948]">Active</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff]">
            <span>2. EVCBatch (All Charging Points)</span>
            <span className="font-bold text-[#006948]">Active</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff]">
            <span>3. GeospatialWholeIsland (SHP Layer)</span>
            <span className="font-bold text-[#006948]">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
