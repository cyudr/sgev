export interface Connector {
  id: string;
  type: 'CCS2 DC' | 'Type 2 AC' | 'Tesla Supercharger' | 'CHAdeMO';
  powerKw: number;
  pricePerKwh?: number;
  priceType?: string;
  hasPublishedTariff: boolean;
  availableCount: number;
  totalCount: number;
}

export interface ChargingBay {
  id: string;
  code: string;
  powerKw: number;
  category: 'Super DC' | 'Rapid DC' | 'Fast AC' | 'Destination AC';
  connectorType: 'CCS2' | 'Type 2' | 'Tesla';
  pricePerKwh?: number;
  hasPublishedTariff: boolean;
  provider: string;
  status: 'available' | 'in_use' | 'reserved' | 'offline';
  currentVehicle?: string;
  batteryPercent?: number;
  minsRemaining?: number;
}

export interface Review {
  id: string;
  author: string;
  vehicle: string;
  timeAgo: string;
  rating: number;
  content: string;
}

export interface Station {
  id: string;
  name: string;
  zone: string;
  pillar: string;
  address: string;
  postalCode: string;
  provider: string;
  providerBadgeClass?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMins: number;
  routeVia: string;
  availableBays: number;
  totalBays: number;
  accessType: string;
  shelterType: string;
  pinCoordinates: {
    x: number;
    y: number;
  };
  pinLabel: string;
  pinType: 'primary' | 'secondary' | 'warning' | 'neutral';
  connectors: Connector[];
  bays: ChargingBay[];
  tariffs: {
    dcPrice?: number;
    acPrice?: number;
    priceType?: string;
    hasPublishedTariff: boolean;
  };
  parkingFee: {
    title: string;
    description: string;
  };
  directions: string[];
  photoUrl: string;
  photoCaption: string;
  amenities: {
    icon: string;
    title: string;
    sub: string;
  }[];
  rating?: number;
  checkInsCount: number;
  reviews: Review[];
}

export interface ActiveChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  bayCode: string;
  connectorType: string;
  maxPowerKw: number;
  currentPowerKw: number;
  startedAt: Date;
  initialSoc: number;
  currentSoc: number;
  targetSoc: number;
  energyDeliveredKwh: number;
  pricePerKwh?: number;
  hasPublishedTariff: boolean;
  voltage: number;
  amperage: number;
}

export interface PastSession {
  id: string;
  stationName: string;
  bayCode: string;
  durationMins: number;
  energyKwh: number;
  totalCostSgd: number;
  dateStr: string;
  co2SavedKg: number;
}
