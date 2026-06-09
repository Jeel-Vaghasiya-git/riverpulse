export interface Station {
  id: string;
  state: string;
  district: string;
  river: string;
  station: string;
  image: string; // real Unsplash river photo URL
}

// Curated list spanning Indian States + UTs. Real river photos from Unsplash.
const RIVER_IMG = [
  "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600&q=80", // Ganga Varanasi
  "https://images.unsplash.com/photo-1604608672516-f1b9b1d1f1eb?w=1600&q=80",
  "https://images.unsplash.com/photo-1532664189809-02133fee698d?w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=80",
];
const img = (i: number) => RIVER_IMG[i % RIVER_IMG.length];

export const stations: Station[] = [
  // Uttar Pradesh
  { id: "up-vns-gng", state: "Uttar Pradesh", district: "Varanasi", river: "Ganga", station: "Dashashwamedh Ghat", image: img(0) },
  { id: "up-knp-gng", state: "Uttar Pradesh", district: "Kanpur Nagar", river: "Ganga", station: "Jajmau Outfall", image: img(1) },
  { id: "up-agr-ymn", state: "Uttar Pradesh", district: "Agra", river: "Yamuna", station: "Taj Riverfront", image: img(2) },
  { id: "up-mtr-ymn", state: "Uttar Pradesh", district: "Mathura", river: "Yamuna", station: "Vishram Ghat", image: img(3) },
  // Delhi
  { id: "dl-cd-ymn", state: "Delhi", district: "Central Delhi", river: "Yamuna", station: "ITO Barrage", image: img(4) },
  { id: "dl-nd-ymn", state: "Delhi", district: "North Delhi", river: "Yamuna", station: "Wazirabad", image: img(5) },
  // Uttarakhand
  { id: "uk-hrd-gng", state: "Uttarakhand", district: "Haridwar", river: "Ganga", station: "Har Ki Pauri", image: img(6) },
  { id: "uk-rsh-gng", state: "Uttarakhand", district: "Tehri Garhwal", river: "Bhagirathi", station: "Tehri Reservoir", image: img(7) },
  // Bihar
  { id: "br-pat-gng", state: "Bihar", district: "Patna", river: "Ganga", station: "Gandhi Ghat", image: img(8) },
  { id: "br-bgp-gng", state: "Bihar", district: "Bhagalpur", river: "Ganga", station: "Vikramshila Reach", image: img(9) },
  // West Bengal
  { id: "wb-kol-hgl", state: "West Bengal", district: "Kolkata", river: "Hooghly", station: "Babughat", image: img(0) },
  { id: "wb-hwh-hgl", state: "West Bengal", district: "Howrah", river: "Hooghly", station: "Howrah Bridge", image: img(1) },
  // Assam
  { id: "as-guw-brm", state: "Assam", district: "Kamrup Metropolitan", river: "Brahmaputra", station: "Pandu Port", image: img(2) },
  { id: "as-dbr-brm", state: "Assam", district: "Dibrugarh", river: "Brahmaputra", station: "Maijan Ghat", image: img(3) },
  // Maharashtra
  { id: "mh-mum-mth", state: "Maharashtra", district: "Mumbai Suburban", river: "Mithi", station: "Mahim Creek", image: img(4) },
  { id: "mh-nsk-god", state: "Maharashtra", district: "Nashik", river: "Godavari", station: "Ramkund", image: img(5) },
  { id: "mh-png-mul", state: "Maharashtra", district: "Pune", river: "Mula-Mutha", station: "Sangam Bridge", image: img(6) },
  // Gujarat
  { id: "gj-ahd-sbm", state: "Gujarat", district: "Ahmedabad", river: "Sabarmati", station: "Riverfront West", image: img(7) },
  { id: "gj-srt-tap", state: "Gujarat", district: "Surat", river: "Tapi", station: "Hope Bridge", image: img(8) },
  // Madhya Pradesh
  { id: "mp-jbl-nrm", state: "Madhya Pradesh", district: "Jabalpur", river: "Narmada", station: "Bhedaghat", image: img(9) },
  { id: "mp-ujn-shp", state: "Madhya Pradesh", district: "Ujjain", river: "Shipra", station: "Ram Ghat", image: img(0) },
  // Andhra Pradesh
  { id: "ap-vij-krs", state: "Andhra Pradesh", district: "Krishna", river: "Krishna", station: "Prakasam Barrage", image: img(1) },
  { id: "ap-rjm-god", state: "Andhra Pradesh", district: "East Godavari", river: "Godavari", station: "Rajahmundry Reach", image: img(2) },
  // Telangana
  { id: "tg-hyd-msi", state: "Telangana", district: "Hyderabad", river: "Musi", station: "Nagole Bridge", image: img(3) },
  // Karnataka
  { id: "ka-blr-vrt", state: "Karnataka", district: "Bengaluru Urban", river: "Vrishabhavathi", station: "Nayandahalli", image: img(4) },
  { id: "ka-msr-cvr", state: "Karnataka", district: "Mysuru", river: "Kaveri", station: "KRS Reach", image: img(5) },
  // Tamil Nadu
  { id: "tn-trc-cvr", state: "Tamil Nadu", district: "Tiruchirappalli", river: "Kaveri", station: "Srirangam", image: img(6) },
  { id: "tn-chn-coo", state: "Tamil Nadu", district: "Chennai", river: "Cooum", station: "Napier Bridge", image: img(7) },
  // Kerala
  { id: "kl-kcc-prn", state: "Kerala", district: "Ernakulam", river: "Periyar", station: "Aluva Reach", image: img(8) },
  // Odisha
  { id: "od-cut-mhn", state: "Odisha", district: "Cuttack", river: "Mahanadi", station: "Jobra Barrage", image: img(9) },
  // Punjab
  { id: "pb-ldh-stl", state: "Punjab", district: "Ludhiana", river: "Sutlej", station: "Buddha Nullah Confluence", image: img(0) },
  // Haryana
  { id: "hr-pkl-ghg", state: "Haryana", district: "Panchkula", river: "Ghaggar", station: "Sector 20 Bridge", image: img(1) },
  // Rajasthan
  { id: "rj-kot-chm", state: "Rajasthan", district: "Kota", river: "Chambal", station: "Kota Barrage", image: img(2) },
  // Jharkhand
  { id: "jh-rnc-snk", state: "Jharkhand", district: "Ranchi", river: "Subarnarekha", station: "Hatia Reach", image: img(3) },
  // Chhattisgarh
  { id: "cg-ryp-khr", state: "Chhattisgarh", district: "Raipur", river: "Kharun", station: "Mahadev Ghat", image: img(4) },
  // Himachal Pradesh
  { id: "hp-mnd-bea", state: "Himachal Pradesh", district: "Mandi", river: "Beas", station: "Pandoh", image: img(5) },
  // Jammu & Kashmir (UT)
  { id: "jk-sri-jhl", state: "Jammu & Kashmir", district: "Srinagar", river: "Jhelum", station: "Lal Chowk Reach", image: img(6) },
  // Goa
  { id: "ga-pnj-mnd", state: "Goa", district: "North Goa", river: "Mandovi", station: "Panaji Jetty", image: img(7) },
  // Manipur
  { id: "mn-imp-imp", state: "Manipur", district: "Imphal West", river: "Imphal", station: "Minuthong", image: img(8) },
  // Meghalaya
  { id: "ml-shl-umk", state: "Meghalaya", district: "East Khasi Hills", river: "Umkhrah", station: "Shillong Reach", image: img(9) },
  // Tripura
  { id: "tr-agt-hwr", state: "Tripura", district: "West Tripura", river: "Haora", station: "Agartala Reach", image: img(0) },
  // Arunachal Pradesh
  { id: "ar-itn-sng", state: "Arunachal Pradesh", district: "Papum Pare", river: "Siang", station: "Pasighat Reach", image: img(1) },
  // Nagaland
  { id: "nl-dim-dhn", state: "Nagaland", district: "Dimapur", river: "Dhansiri", station: "Dimapur Bridge", image: img(2) },
  // Mizoram
  { id: "mz-aiz-tlw", state: "Mizoram", district: "Aizawl", river: "Tlawng", station: "Sairang", image: img(3) },
  // Sikkim
  { id: "sk-gtk-tst", state: "Sikkim", district: "Gangtok", river: "Teesta", station: "Singtam Reach", image: img(4) },
  // Andaman & Nicobar (UT)
  { id: "an-prb-kln", state: "Andaman & Nicobar Islands", district: "South Andaman", river: "Kalpong Stream", station: "Port Blair Catchment", image: img(5) },
  // Puducherry (UT)
  { id: "py-pdy-arn", state: "Puducherry", district: "Puducherry", river: "Arasalar", station: "Karaikal Reach", image: img(6) },
  // Chandigarh (UT)
  { id: "ch-chd-ghg", state: "Chandigarh", district: "Chandigarh", river: "Patiala Ki Rao", station: "Sector 12 Reach", image: img(7) },
  // Ladakh (UT)
  { id: "la-leh-ind", state: "Ladakh", district: "Leh", river: "Indus", station: "Choglamsar Bridge", image: img(8) },
  // Dadra & Nagar Haveli and Daman & Diu (UT)
  { id: "dn-sil-dmn", state: "Dadra & Nagar Haveli and Daman & Diu", district: "Daman", river: "Daman Ganga", station: "Damanvada Reach", image: img(9) },
  // Lakshadweep (UT) - lagoon proxy
  { id: "ld-kav-lag", state: "Lakshadweep", district: "Kavaratti", river: "Kavaratti Lagoon", station: "Reef Monitor", image: img(0) },
];

export interface Telemetry {
  ph: number;          // 0-14
  tds: number;         // ppm
  turbidity: number;   // NTU
  do: number;          // mg/L
  temp: number;        // °C
}

// Per-station baselines for realistic feel (default applied otherwise)
const baselines: Record<string, Partial<Telemetry>> = {
  "dl-cd-ymn": { ph: 8.9, tds: 1450, turbidity: 220, do: 1.6 },
  "dl-nd-ymn": { ph: 8.4, tds: 1100, turbidity: 180, do: 2.4 },
  "up-knp-gng": { ph: 8.3, tds: 980, turbidity: 160, do: 3.2 },
  "up-vns-gng": { ph: 7.9, tds: 720, turbidity: 95, do: 4.5 },
  "uk-hrd-gng": { ph: 7.5, tds: 220, turbidity: 18, do: 7.6 },
  "mh-mum-mth": { ph: 8.7, tds: 1620, turbidity: 260, do: 1.4 },
  "gj-ahd-sbm": { ph: 8.5, tds: 1180, turbidity: 140, do: 2.7 },
  "tg-hyd-msi": { ph: 8.6, tds: 1320, turbidity: 195, do: 2.0 },
  "ka-blr-vrt": { ph: 8.5, tds: 1240, turbidity: 175, do: 2.2 },
  "tn-chn-coo": { ph: 8.8, tds: 1480, turbidity: 240, do: 1.7 },
};

function jitter(base: number, pct: number) {
  return base * (1 + (Math.random() - 0.5) * pct);
}

export function readTelemetry(id: string): Telemetry {
  const b = baselines[id] ?? {};
  return {
    ph: +jitter(b.ph ?? 7.4, 0.04).toFixed(2),
    tds: Math.round(jitter(b.tds ?? 480, 0.08)),
    turbidity: +jitter(b.turbidity ?? 45, 0.15).toFixed(1),
    do: +jitter(b.do ?? 6.2, 0.1).toFixed(2),
    temp: +jitter(26, 0.05).toFixed(1),
  };
}

export const allStates = Array.from(new Set(stations.map(s => s.state))).sort();
export const districtsOf = (state: string) =>
  Array.from(new Set(stations.filter(s => s.state === state).map(s => s.district))).sort();
export const stationsOf = (state: string, district: string) =>
  stations.filter(s => s.state === state && s.district === district);
