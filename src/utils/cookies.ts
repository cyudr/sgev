/**
 * Cookie Storage Engine for User Preferences and Data
 * Stores user preferences in browser cookies (with 365-day expiry)
 * and mirrors with localStorage for maximum reliability across browsers.
 */

export function getCookie(name: string, defaultValue = ''): string {
  if (typeof document === 'undefined') return defaultValue;

  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (_e) {
    // Fallback to localStorage
  }

  try {
    const local = localStorage.getItem(name);
    if (local !== null) return local;
  } catch (_e) {
    // Fallback
  }

  return defaultValue;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;

  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieStr;
  } catch (_e) {
    // Cookie blocked
  }

  try {
    localStorage.setItem(name, value);
  } catch (_e) {
    // LocalStorage blocked
  }
}

export function getJsonCookie<T>(name: string, defaultValue: T): T {
  const val = getCookie(name);
  if (!val) return defaultValue;
  try {
    return JSON.parse(val) as T;
  } catch (_e) {
    return defaultValue;
  }
}

export function setJsonCookie<T>(name: string, value: T, days = 365): void {
  try {
    setCookie(name, JSON.stringify(value), days);
  } catch (_e) {
    // Failed JSON serialization
  }
}

// User Preference Keys
export const COOKIE_KEYS = {
  SAVED_STATIONS: 'sgev_saved_stations',
  VEHICLE_PREFS: 'sgev_vehicle_prefs',
  MAP_TYPE: 'sgev_map_type',
  FILTER_PREF: 'sgev_filter_pref',
  PAST_SESSIONS: 'sgev_past_sessions',
  APP_INSTALLED: 'sgev_app_installed',
} as const;

export interface UserVehiclePreferences {
  vehicleModel: string;
  connectorPreference: 'all' | 'CCS2' | 'Type 2' | 'CHAdeMO';
  minPowerKw: number;
  hasSavedPreference?: boolean;
}

export const DEFAULT_VEHICLE_PREFS: UserVehiclePreferences = {
  vehicleModel: 'Tesla Model Y / BYD Atto 3',
  connectorPreference: 'CCS2',
  minPowerKw: 50,
  hasSavedPreference: false,
};
