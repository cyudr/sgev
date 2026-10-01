import { LtaEvLocation } from './types.ts';
import { Station, Connector, ChargingBay } from '../src/types/charging.ts';

/**
 * Projects Singapore WGS84 lat/lng coordinates to our stylized map SVG canvas (420 x 540)
 */
export function projectLatLngToMap(lat: number, lng: number): { x: number; y: number } {
  const minLat = 1.25;
  const maxLat = 1.47;
  const minLng = 103.65;
  const maxLng = 103.99;

  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 1.284;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 103.85;

  const normX = Math.max(0.05, Math.min(0.95, (safeLng - minLng) / (maxLng - minLng)));
  const normY = Math.max(0.08, Math.min(0.92, 1 - (safeLat - minLat) / (maxLat - minLat)));

  return {
    x: Math.round(normX * 420),
    y: Math.round(normY * 540),
  };
}

/**
 * Clean operator display name without hallucinating
 */
export function formatOperator(raw: string): string {
  if (!raw || raw === '-') return 'EV Charging Operator';
  const upper = raw.toUpperCase();
  if (upper.includes('TOTALENERGIES')) return 'TotalEnergies';
  if (upper.includes('SP MOBILITY') || upper.includes('SINGAPORE POWER') || upper.includes('SP SERVICES')) return 'SP Mobility';
  if (upper.includes('CDG') || upper.includes('ENGIE') || upper.includes('COMFORTDELGRO')) return 'CDG Engie';
  if (upper.includes('SHELL')) return 'Shell Recharge';
  if (upper.includes('CHARGE+')) return 'Charge+';
  if (upper.includes('TESLA')) return 'Tesla Supercharger';
  if (upper.includes('KEPPEL')) return 'Volt Keppel';
  if (upper.includes('TREDENCE')) return 'Tredence';
  return raw.replace(/PTE\.?\s*LTD\.?/i, '').trim();
}

/**
 * Extract postal code from address string (e.g. "129A BUKIT MERAH VIEW SINGAPORE 151129")
 */
export function extractPostalCode(address: string): string {
  if (!address) return '';
  const match = address.match(/\b\d{6}\b/);
  return match ? match[0] : '';
}

/**
 * Transforms an authentic LTA DataMall EV location record into the frontend Station model
 * Follows LTA DataMall API documentation (Section 2.28, pages 50-53)
 * STRICT: Does NOT fabricate or hallucinate prices or consumption stats.
 */
export function adaptLtaLocationToStation(loc: LtaEvLocation, index: number, userCoords?: { lat: number; lng: number }): Station {
  // LTA DataMall documentation p.50 S/N 4 uses attribute 'longtitude'
  const rawLng = typeof loc.longtitude === 'number' ? loc.longtitude : (typeof loc.longitude === 'number' ? loc.longitude : 103.85);
  const rawLat = typeof loc.latitude === 'number' ? loc.latitude : 1.284;

  const coords = projectLatLngToMap(rawLat, rawLng);
  const postal = extractPostalCode(loc.address);

  const connectors: Connector[] = [];
  const bays: ChargingBay[] = [];

  let totalBays = 0;
  let availableBays = 0;
  let primaryOperator = 'EV Charging Operator';

  const chargingPoints = loc.chargingPoints || [];

  chargingPoints.forEach((cp, cpIdx) => {
    if (cp.operator && cp.operator !== '-') {
      primaryOperator = formatOperator(cp.operator);
    }

    const plugTypes = cp.plugTypes || [];

    plugTypes.forEach((pt, ptIdx) => {
      const isDC = pt.powerRating?.toUpperCase() === 'DC' || pt.plugType?.toUpperCase().includes('CCS');
      const speed = typeof pt.chargingSpeed === 'number' ? pt.chargingSpeed : parseFloat(String(pt.chargingSpeed)) || (isDC ? 50 : 22);
      const evIds = pt.evIds || [];
      const evCount = evIds.length > 0 ? evIds.length : 2;
      const typeLabel = (isDC ? 'CCS2 DC' : 'Type 2 AC') as 'CCS2 DC' | 'Type 2 AC';

      // Parse price strictly from API without fabricating defaults
      const parsedPrice = typeof pt.price === 'number' ? pt.price : parseFloat(String(pt.price));
      const hasPublishedTariff = !isNaN(parsedPrice) && parsedPrice > 0;
      const price = hasPublishedTariff ? parsedPrice : undefined;
      const priceType = pt.priceType || '$/kWh';

      // Section 2.28 p.51-53:
      // status: 0 = Occupied, 1 = Available, "" or 100 = Not Available
      let plugAvail = 0;
      if (evIds.length > 0) {
        plugAvail = evIds.filter(e => {
          const s = String(e.status ?? '').trim();
          return s === '1' || s === 'Available';
        }).length;
      } else {
        const cpStat = String(cp.status ?? '').trim();
        plugAvail = cpStat === '1' ? evCount : 0;
      }

      totalBays += evCount;
      availableBays += plugAvail;

      connectors.push({
        id: `conn-${loc.locationId}-${cpIdx}-${ptIdx}`,
        type: typeLabel,
        powerKw: speed,
        pricePerKwh: price,
        priceType,
        hasPublishedTariff,
        availableCount: plugAvail,
        totalCount: evCount,
      });

      for (let i = 0; i < evCount; i++) {
        const evItem = evIds[i];
        let bayStatus: 'available' | 'in_use' | 'offline' = 'in_use';

        if (evItem) {
          const s = String(evItem.status ?? '').trim();
          if (s === '1' || s === 'Available') {
            bayStatus = 'available';
          } else if (s === '' || s === '100' || s === 'Not Available') {
            bayStatus = 'offline';
          } else {
            bayStatus = 'in_use'; // '0' = Occupied
          }
        } else {
          bayStatus = i < plugAvail ? 'available' : 'in_use';
        }

        const code = String.fromCharCode(65 + cpIdx) + (i + 1);

        bays.push({
          id: `bay-${loc.locationId}-${cpIdx}-${i}`,
          code,
          powerKw: speed,
          category: speed >= 100 ? 'Super DC' : isDC ? 'Rapid DC' : 'Fast AC',
          connectorType: isDC ? 'CCS2' : 'Type 2',
          pricePerKwh: price,
          hasPublishedTariff,
          provider: primaryOperator,
          status: bayStatus,
        });
      }
    });
  });

  const maxKw = connectors.length > 0 ? Math.max(...connectors.map((c) => c.powerKw)) : 22;
  const pinType = availableBays === 0 ? 'neutral' : maxKw >= 100 ? 'primary' : availableBays === 1 ? 'warning' : 'secondary';
  const pinLabel = `${maxKw}kW • ${availableBays}/${totalBays} Open`;

  // Calculate distance from user coords if provided, else default to central coordinates
  const refLat = userCoords?.lat ?? 1.29027;
  const refLng = userCoords?.lng ?? 103.851959;

  const R = 6371; // km
  const dLat = (rawLat - refLat) * Math.PI / 180;
  const dLon = (rawLng - refLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(refLat * Math.PI / 180) * Math.cos(rawLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const dist = +(R * c).toFixed(1);

  const primaryCP = chargingPoints[0];
  const operatingHours = primaryCP?.operationHours || primaryCP?.operatingHours || '24 Hours Daily';
  const zoneInfo = primaryCP?.position && primaryCP.position !== '-' ? primaryCP.position : 'EV Carpark Bay';

  const dcConn = connectors.find(c => c.type.includes('DC') && c.hasPublishedTariff);
  const acConn = connectors.find(c => c.type.includes('AC') && c.hasPublishedTariff);
  const hasPublishedTariff = Boolean(dcConn || acConn);

  return {
    id: loc.locationId || `lta-${index}`,
    name: loc.name || 'EV Charging Point',
    zone: zoneInfo,
    pillar: `LTA Location: ${loc.locationId || 'N/A'}`,
    address: loc.address || 'Singapore',
    postalCode: postal,
    provider: primaryOperator,
    lat: rawLat,
    lng: rawLng,
    distanceKm: dist,
    driveTimeMins: Math.max(2, Math.round(dist * 2.2)),
    routeVia: 'via Live Traffic Navigation',
    availableBays,
    totalBays: Math.max(totalBays, 1),
    accessType: operatingHours === '-' ? '24 Hours Daily' : operatingHours,
    shelterType: (loc.name?.toUpperCase().includes('MULTI STOREY') || loc.address?.toUpperCase().includes('CAR PARK')) ? 'Covered Carpark' : 'Open Air Carpark',
    pinCoordinates: coords,
    pinLabel,
    pinType,
    connectors,
    bays,
    tariffs: {
      dcPrice: dcConn?.pricePerKwh,
      acPrice: acConn?.pricePerKwh,
      priceType: dcConn?.priceType || acConn?.priceType || '$/kWh',
      hasPublishedTariff,
    },
    parkingFee: {
      title: 'Carpark Rates',
      description: 'Standard URA / HDB / Commercial Carpark rates apply.',
    },
    directions: [
      `Navigate to ${loc.name || loc.address}.`,
      'Follow EV directional ground markings to charging bays.',
      'Check charger screen to authorize session.',
    ],
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATfx5WA1EWxK-hJQ2Gle12oeAha_D1YRhxGcnzpFsxi_dqXXtygsX_wFW4ZbEkqAMUyc2BWN9qv6Qld15Uo8mdPDTQ0Kv4PB2_leSSuiOX04VSF0astts5c6nsc6cxyklbw1Motm3Pi5SvCcRMjY8cd0URWJJ70Zs5asLwftp1GEXcptx4OsJAgtzKY-5i_R2M8ua5edIfBBEy8Z3oj_Ii5KVJGsf1HUcbBGG1SPG5zb_C0xN0lbmx',
    photoCaption: `${loc.name} • EV Bay`,
    amenities: [
      { icon: 'local_cafe', title: 'Food & Beverage', sub: 'Within 300m' },
      { icon: 'wc', title: 'Restrooms', sub: 'Carpark Level' },
      { icon: 'shield', title: '24/7 Access', sub: operatingHours === '-' ? '24 Hours Daily' : operatingHours },
    ],
    rating: undefined, // Real unhallucinated state
    checkInsCount: 0,
    reviews: [],
  };
}

export default async function handler(req: any, res: any) {
  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', module: 'api-adapter' });
  }
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', module: 'api-adapter' }));
}
