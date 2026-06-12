// ═══════════════════════════════════════════════════════════════
// RiverPulseIndia — Constants & Data
// ═══════════════════════════════════════════════════════════════

export const SPRING_CONFIG = { stiffness: 100, damping: 15 };

// ── Cascading filter data ──────────────────────────────────
export const STATES_DATA: Record<string, { cities: Record<string, string[]> }> = {
  'Uttarakhand': {
    cities: {
      'Haridwar': ['Ganga at Har Ki Pauri', 'Ganga at Rishikesh', 'Alaknanda at Devprayag'],
      'Rishikesh': ['Ganga at Lakshman Jhula', 'Ganga at Shivpuri'],
    },
  },
  'Uttar Pradesh': {
    cities: {
      'Varanasi': ['Ganga at Dashashwamedh Ghat', 'Ganga at Assi Ghat', 'Ganga at Raj Ghat'],
      'Kanpur': ['Ganga at Jajmau', 'Ganga at Bithoor'],
      'Allahabad': ['Ganga at Sangam', 'Yamuna at Sangam'],
      'Lucknow': ['Gomti at Lakshman Mela Ground', 'Gomti at Shaheed Smarak'],
    },
  },
  'Bihar': {
    cities: {
      'Patna': ['Ganga at Gandhi Ghat', 'Ganga at Danapur'],
      'Bhagalpur': ['Ganga at Vikramshila'],
    },
  },
  'West Bengal': {
    cities: {
      'Kolkata': ['Hooghly at Howrah', 'Hooghly at Garden Reach', 'Ganga at Diamond Harbour'],
      'Howrah': ['Hooghly at Shibpur'],
    },
  },
  'Madhya Pradesh': {
    cities: {
      'Jabalpur': ['Narmada at Bhedaghat', 'Narmada at Gwarighat'],
      'Hoshangabad': ['Narmada at Sethani Ghat'],
    },
  },
  'Gujarat': {
    cities: {
      'Ahmedabad': ['Sabarmati at Nehru Bridge', 'Sabarmati at Gandhinagar'],
      'Vadodara': ['Vishwamitri at Sayaji Garden'],
    },
  },
  'Rajasthan': {
    cities: {
      'Jaipur': ['Banas at Sawai Madhopur'],
      'Udaipur': ['Berach at Udai Sagar'],
    },
  },
  'Maharashtra': {
    cities: {
      'Mumbai': ['Mithi at Mahim Creek', 'Ulhas at Vasai Creek'],
      'Pune': ['Mula-Mutha at Sangamwadi'],
    },
  },
  'Tamil Nadu': {
    cities: {
      'Chennai': ['Cooum at Napier Bridge', 'Adyar at Ekkaduthangal'],
      'Trichy': ['Kaveri at Srirangam'],
    },
  },
  'Karnataka': {
    cities: {
      'Bengaluru': ['Vrishabhavathi at Byramangala', 'Arkavathi at Tippagondanahalli'],
      'Mysuru': ['Kaveri at Krishnaraja Sagar'],
    },
  },
};

// ── Monitoring station types ───────────────────────────────
export interface MonitoringStation {
  id: string;
  name: string;
  state: string;
  city: string;
  river: string;
  lat: number;
  lng: number;
  ph: number;
  tds: number;
  turbidity?: number;
  temperature: number;
  waterLevel: number;
  flowRate?: number;
  do_level?: number;
  bod?: number;
  cod?: number;
  capacity?: number;
  status?: string;
  lastSeen?: string;
  inletSiteUuid?: string;
  outletSiteUuid?: string;
  outletReadings?: {
    ph: number | null;
    tss: number | null;
    cod: number | null;
    bod: number | null;
  };
  inletReadings?: {
    ph: number | null;
    tss: number | null;
    cod: number | null;
    bod: number | null;
  };
}

export interface TimeSeriesPoint {
  time: string;
  ph: number;
  tds: number;
  turbidity?: number;
  temperature: number;
  waterLevel: number;
  flowRate?: number;
  do_level?: number;
  bod?: number;
  cod?: number;
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  type: 'flood' | 'pollution' | 'temperature' | 'ph';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// ── Thresholds ─────────────────────────────────────────────
export const THRESHOLDS = {
  ph: { min: 6.5, max: 8.5, criticalMin: 5.5, criticalMax: 9.5 },
  tds: { max: 300, criticalMax: 700 },
  turbidity: { max: 25, criticalMax: 70 },
  temperature: { min: 10, max: 30, criticalMax: 35 },
  waterLevel: { max: 8, criticalMax: 10 },
  flowRate: { max: 2500, criticalMax: 3500 },
} as const;

// ── Monitoring stations ────────────────────────────────────
export const MONITORING_STATIONS: MonitoringStation[] = [
  { id: 's1', name: 'Ganga at Har Ki Pauri', state: 'Uttarakhand', city: 'Haridwar', river: 'Ganga', lat: 29.95, lng: 78.17, ph: 7.2, tds: 180, turbidity: 12, temperature: 22, waterLevel: 3.2, flowRate: 850 },
  { id: 's2', name: 'Ganga at Dashashwamedh Ghat', state: 'Uttar Pradesh', city: 'Varanasi', lat: 25.31, lng: 83.01, river: 'Ganga', ph: 7.8, tds: 320, turbidity: 45, temperature: 26, waterLevel: 4.8, flowRate: 1200 },
  { id: 's3', name: 'Ganga at Jajmau', state: 'Uttar Pradesh', city: 'Kanpur', lat: 26.46, lng: 80.35, river: 'Ganga', ph: 8.2, tds: 580, turbidity: 78, temperature: 28, waterLevel: 5.1, flowRate: 1450 },
  { id: 's4', name: 'Ganga at Gandhi Ghat', state: 'Bihar', city: 'Patna', lat: 25.61, lng: 85.14, river: 'Ganga', ph: 7.5, tds: 290, turbidity: 38, temperature: 27, waterLevel: 6.3, flowRate: 1800 },
  { id: 's5', name: 'Hooghly at Howrah', state: 'West Bengal', city: 'Kolkata', lat: 22.58, lng: 88.34, river: 'Hooghly', ph: 7.9, tds: 410, turbidity: 52, temperature: 29, waterLevel: 5.6, flowRate: 1600 },
  { id: 's6', name: 'Narmada at Bhedaghat', state: 'Madhya Pradesh', city: 'Jabalpur', lat: 23.13, lng: 79.82, river: 'Narmada', ph: 7.1, tds: 150, turbidity: 8, temperature: 24, waterLevel: 2.8, flowRate: 720 },
  { id: 's7', name: 'Sabarmati at Nehru Bridge', state: 'Gujarat', city: 'Ahmedabad', lat: 23.03, lng: 72.57, river: 'Sabarmati', ph: 8.5, tds: 620, turbidity: 65, temperature: 30, waterLevel: 2.1, flowRate: 380 },
  { id: 's8', name: 'Yamuna at Sangam', state: 'Uttar Pradesh', city: 'Allahabad', lat: 25.43, lng: 81.89, river: 'Yamuna', ph: 7.6, tds: 350, turbidity: 42, temperature: 26, waterLevel: 4.2, flowRate: 1100 },
  { id: 's9', name: 'Mithi at Mahim Creek', state: 'Maharashtra', city: 'Mumbai', lat: 19.04, lng: 72.84, river: 'Mithi', ph: 5.8, tds: 890, turbidity: 110, temperature: 31, waterLevel: 8.5, flowRate: 2800 },
  { id: 's10', name: 'Cooum at Napier Bridge', state: 'Tamil Nadu', city: 'Chennai', lat: 13.07, lng: 80.27, river: 'Cooum', ph: 6.2, tds: 750, turbidity: 95, temperature: 32, waterLevel: 3.5, flowRate: 450 },
  { id: 's11', name: 'Ganga at Lakshman Jhula', state: 'Uttarakhand', city: 'Rishikesh', lat: 30.09, lng: 78.32, river: 'Ganga', ph: 7.0, tds: 120, turbidity: 5, temperature: 18, waterLevel: 2.4, flowRate: 920 },
  { id: 's12', name: 'Kaveri at Srirangam', state: 'Tamil Nadu', city: 'Trichy', lat: 10.86, lng: 79.08, river: 'Kaveri', ph: 7.3, tds: 200, turbidity: 15, temperature: 28, waterLevel: 3.8, flowRate: 1050 },
  { id: 's13', name: 'Vrishabhavathi at Byramangala', state: 'Karnataka', city: 'Bengaluru', lat: 12.97, lng: 77.59, river: 'Vrishabhavathi', ph: 6.0, tds: 680, turbidity: 82, temperature: 29, waterLevel: 1.8, flowRate: 210 },
  { id: 's14', name: 'Ganga at Assi Ghat', state: 'Uttar Pradesh', city: 'Varanasi', lat: 25.29, lng: 83.01, river: 'Ganga', ph: 7.7, tds: 310, turbidity: 40, temperature: 26, waterLevel: 4.6, flowRate: 1150 },
  { id: 's15', name: 'Gomti at Lakshman Mela Ground', state: 'Uttar Pradesh', city: 'Lucknow', lat: 26.85, lng: 80.95, river: 'Gomti', ph: 7.4, tds: 270, turbidity: 35, temperature: 27, waterLevel: 3.9, flowRate: 680 },
];

// ── Water quality utils ────────────────────────────────────
export function getWaterQualityColor(ph: number, tds: number, turbidity?: number): 'blue' | 'yellow' | 'red' {
  const isGoodPh = ph >= THRESHOLDS.ph.min && ph <= THRESHOLDS.ph.max;
  const isGoodTds = tds <= THRESHOLDS.tds.max;
  const isGoodTurb = turbidity === undefined || turbidity <= THRESHOLDS.turbidity.max;
  if (isGoodPh && isGoodTds && isGoodTurb) return 'blue';
  const isModeratePh = ph >= 6.0 && ph <= 9.0;
  const isModerateTds = tds <= THRESHOLDS.tds.criticalMax;
  const isModerateTurb = turbidity === undefined || turbidity <= THRESHOLDS.turbidity.criticalMax;
  if (isModeratePh && isModerateTds && isModerateTurb) return 'yellow';
  return 'red';
}

export function getWaterQualityLabel(color: 'blue' | 'yellow' | 'red'): string {
  const labels = { blue: 'Safe / Pristine', yellow: 'Requires Attention', red: 'Hazardous' };
  return labels[color];
}

// ── Quotes ─────────────────────────────────────────────────
export const RIVER_QUOTES = [
  { text: 'The Ganga is the river of India, beloved of her people, around which are intertwined her memories, her hopes and fears, her songs of triumph, her victories and her defeats.', author: 'Jawaharlal Nehru' },
  { text: 'A river is more than an amenity, it is a treasure.', author: 'Oliver Wendell Holmes' },
  { text: 'The river is everywhere at the same time, at the source and at the mouth, at the waterfall, at the ferry, at the current, in the ocean and in the mountains, everywhere.', author: 'Hermann Hesse' },
  { text: 'No man ever steps in the same river twice, for it is not the same river and he is not the same man.', author: 'Heraclitus' },
  { text: 'Rivers are the arteries of our planet, and India must heal hers to survive.', author: 'Rajendra Singh' },
  { text: 'We do not inherit rivers from our ancestors — we borrow them from our children.', author: 'Ancient Proverb' },
  { text: 'A drop of clean water is a vote cast for the next generation.', author: 'RiverPulseIndia' },
  { text: 'The pulse of a nation is measured in the health of its rivers.', author: 'RiverPulseIndia' },
];

// ── River images for gallery ───────────────────────────────
export const RIVER_IMAGES = [
  { url: 'https://images.pexels.com/photos/847392/pexels-photo-847392.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Ghats of Varanasi', description: 'The ancient ghats of Varanasi stretch along the western bank of the Ganges. For millennia, pilgrims have descended these steps to perform sacred ablutions at dawn.', direction: 'left' as const },
  { url: 'https://images.pexels.com/photos/239984/pexels-photo-239984.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Himalayan River Origins', description: 'India\'s rivers are born in the mighty Himalayas, where glacial meltwater cascades through pristine valleys before beginning its journey across the subcontinent.', direction: 'right' as const },
  { url: 'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Sacred Bridges & Crossings', description: 'Bridges across India\'s rivers connect communities and cultures, standing as testament to the vital role waterways play in the nation\'s infrastructure.', direction: 'left' as const },
  { url: 'https://images.pexels.com/photos/301930/pexels-photo-301930.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Dawn on the Ganges', description: 'The first rays of dawn illuminate the Ganges, creating a golden pathway on the water. This daily spectacle has inspired poets and saints for centuries.', direction: 'right' as const },
];

// ── Complaints sample data ─────────────────────────────────
export type ComplaintStatus = 'active' | 'escalated' | 'resolved';

export interface Complaint {
  id: string;
  name: string;
  location: string;
  district: string;
  date: string;
  status: ComplaintStatus;
  description: string;
  image?: string;
}

export const COMPLAINTS_DATA: Complaint[] = [
  { id: 'GRV-001', name: 'Arjun Sharma', location: 'Dashashwamedh Ghat, Varanasi', district: 'Varanasi', date: '2026-06-01', status: 'active', description: 'Industrial effluent discharge visible near the ghat during early morning hours.' },
  { id: 'GRV-002', name: 'Priya Patel', location: 'Jajmau, Kanpur', district: 'Kanpur', date: '2026-06-02', status: 'escalated', description: 'Severe foam and chemical smell from tannery runoff into Ganga.' },
  { id: 'GRV-003', name: 'Rahul Singh', location: 'Mithi River, Mahim Creek, Mumbai', district: 'Mumbai', date: '2026-05-30', status: 'active', description: 'Sewage overflow into Mithi river causing health hazards in nearby slums.' },
  { id: 'GRV-004', name: 'Anonymous', location: 'Sabarmati River, Ahmedabad', district: 'Ahmedabad', date: '2026-06-04', status: 'active', description: 'Foul odor and discolored water near Nehru Bridge stretch.' },
  { id: 'GRV-005', name: 'Meera Krishnan', location: 'Cooum River, Chennai', district: 'Chennai', date: '2026-06-03', status: 'active', description: 'Encroachment and waste dumping narrowing the river channel.' },
  { id: 'GRV-006', name: 'Vikram Reddy', location: 'Vrishabhavathi, Bengaluru', district: 'Bengaluru', date: '2026-05-28', status: 'escalated', description: 'Industrial discharge from Peenya area causing toxic foam.' },
  { id: 'GRV-007', name: 'Sunita Devi', location: 'Ganga Ghat, Patna', district: 'Patna', date: '2026-06-05', status: 'active', description: 'Plastic waste accumulation along the riverbank near Gandhi Ghat.' },
  { id: 'GRV-008', name: 'Anonymous', location: 'Gomti River, Lucknow', district: 'Lucknow', date: '2026-06-05', status: 'resolved', description: 'Drain overflow into Gomti near Lakshman Mela Ground.' },
];

// ── BBMP Lake data for Water Bodies ────────────────────────
export interface Lake {
  id: string;
  name: string;
  zone: string;
  ward: string;
  area_acres: number;
  lat: number;
  lng: number;
  iot_enabled: boolean;
}

export const LAKES_DATA: Lake[] = [
  { id: 'lk-036', name: 'Abbigere Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 17, lat: 12.924, lng: 77.54, iot_enabled: false },
  { id: 'lk-086', name: 'Agara Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 117, lat: 13.024, lng: 77.665, iot_enabled: true },
  { id: 'lk-067', name: 'Agrahara Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 234, lat: 12.978, lng: 77.6925, iot_enabled: false },
  { id: 'lk-079', name: 'Allalasandra Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 68, lat: 12.986, lng: 77.6225, iot_enabled: false },
  { id: 'lk-184', name: 'Ambalipura Kelagina kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 53, lat: 12.956, lng: 77.51, iot_enabled: false },
  { id: 'lk-193', name: 'Amblipura melina kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 116, lat: 13.062, lng: 77.7075, iot_enabled: false },
  { id: 'lk-063', name: 'Amruthahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 206, lat: 13.042, lng: 77.6325, iot_enabled: false },
  { id: 'lk-175', name: 'Anjanapura lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 240, lat: 13.05, lng: 77.5625, iot_enabled: false },
  { id: 'lk-142', name: 'Annappanakere', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 259, lat: 12.928, lng: 77.505, iot_enabled: false },
  { id: 'lk-066', name: 'Arekere Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 227, lat: 12.944, lng: 77.615, iot_enabled: false },
  { id: 'lk-093', name: 'Attur Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 166, lat: 13.062, lng: 77.7075, iot_enabled: false },
  { id: 'lk-087', name: 'Avalahalli  Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 124, lat: 13.058, lng: 77.7425, iot_enabled: false },
  { id: 'lk-179', name: 'B. Narayanapura Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 18, lat: 12.986, lng: 77.6225, iot_enabled: false },
  { id: 'lk-042', name: 'Bagalaguntte Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 59, lat: 12.928, lng: 77.505, iot_enabled: true },
  { id: 'lk-124', name: 'Basapura Lake - 1', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 133, lat: 12.916, lng: 77.61, iot_enabled: false },
  { id: 'lk-129', name: 'Basapura Lake - 2', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 168, lat: 13.086, lng: 77.7475, iot_enabled: false },
  { id: 'lk-097', name: 'Basavanapura Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 194, lat: 12.998, lng: 77.5175, iot_enabled: false },
  { id: 'lk-115', name: 'Bayyapanapalya Kunte Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 70, lat: 13.01, lng: 77.6625, iot_enabled: false },
  { id: 'lk-134', name: 'Begur Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 203, lat: 13.056, lng: 77.635, iot_enabled: false },
  { id: 'lk-049', name: 'Bellahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 108, lat: 12.966, lng: 77.5475, iot_enabled: false },
  { id: 'lk-076', name: 'Bettahalli lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 47, lat: 13.084, lng: 77.64, iot_enabled: false },
  { id: 'lk-181', name: 'Bhattarahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 32, lat: 13.054, lng: 77.5275, iot_enabled: false },
  { id: 'lk-211', name: 'Bheemana Katte kere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 242, lat: 13.074, lng: 77.6025, iot_enabled: false },
  { id: 'lk-159', name: 'Bhimana Kuppe kere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 128, lat: 12.906, lng: 77.5725, iot_enabled: false },
  { id: 'lk-196', name: 'Bhoganahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 137, lat: 12.964, lng: 77.69, iot_enabled: true },
  { id: 'lk-096', name: 'Busegowdana lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 187, lat: 12.964, lng: 77.69, iot_enabled: false },
  { id: 'lk-032', name: 'Byrasandra Lake (Chikkapete Lake)', zone: 'South', ward: 'South Division', area_acres: 239, lat: 12.988, lng: 77.73, iot_enabled: false },
  { id: 'lk-160', name: 'Challakere Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 135, lat: 12.94, lng: 77.65, iot_enabled: false },
  { id: 'lk-135', name: 'Chikka Begur Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 210, lat: 13.09, lng: 77.7125, iot_enabled: false },
  { id: 'lk-143', name: 'Chikkabasavanapura Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 16, lat: 12.962, lng: 77.5825, iot_enabled: false },
  { id: 'lk-214', name: 'Chikkabasthi lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 263, lat: 12.976, lng: 77.585, iot_enabled: false },
  { id: 'lk-180', name: 'Chikkabellandur Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 25, lat: 13.02, lng: 77.7, iot_enabled: true },
  { id: 'lk-109', name: 'Chikkagowdanapaly lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 28, lat: 13.006, lng: 77.6975, iot_enabled: false },
  { id: 'lk-103', name: 'Chikkammanahalli Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 236, lat: 13.002, lng: 77.7325, iot_enabled: false },
  { id: 'lk-206', name: 'Chinnappanahalli lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 207, lat: 12.904, lng: 77.715, iot_enabled: false },
  { id: 'lk-068', name: 'Chokkanahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 241, lat: 13.012, lng: 77.52, iot_enabled: false },
  { id: 'lk-140', name: 'Chowdeshwari layout Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 245, lat: 13.06, lng: 77.6, iot_enabled: true },
  { id: 'lk-117', name: 'Chunchaghatta Kere', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 84, lat: 13.078, lng: 77.5675, iot_enabled: false },
  { id: 'lk-045', name: 'Dasarahalli Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 80, lat: 13.03, lng: 77.7375, iot_enabled: false },
  { id: 'lk-041', name: 'Deepanjali Lake', zone: 'South', ward: 'South Division', area_acres: 52, lat: 13.094, lng: 77.6775, iot_enabled: false },
  { id: 'lk-200', name: 'Devarabeesanahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 165, lat: 12.9, lng: 77.5, iot_enabled: false },
  { id: 'lk-148', name: 'Devarakere Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 51, lat: 12.932, lng: 77.72, iot_enabled: false },
  { id: 'lk-157', name: 'Devsandra kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 114, lat: 13.038, lng: 77.6675, iot_enabled: false },
  { id: 'lk-031', name: 'Doddabidarakallu Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 232, lat: 12.954, lng: 77.6525, iot_enabled: false },
  { id: 'lk-058', name: 'Doddabommasandra Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 171, lat: 13.072, lng: 77.745, iot_enabled: false },
  { id: 'lk-161', name: 'Doddakallsandra Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 142, lat: 12.974, lng: 77.7275, iot_enabled: false },
  { id: 'lk-202', name: 'Doddakanenahalli kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 179, lat: 12.968, lng: 77.655, iot_enabled: false },
  { id: 'lk-201', name: 'Doddanekundi lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 172, lat: 12.934, lng: 77.5775, iot_enabled: false },
  { id: 'lk-150', name: 'Dorekere Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 65, lat: 13, lng: 77.625, iot_enabled: false },
  { id: 'lk-102', name: 'Dubasipalay lake (Valagerahalli)', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 229, lat: 12.968, lng: 77.655, iot_enabled: false },
  { id: 'lk-105', name: 'Gandhinagar Hosakere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 250, lat: 13.07, lng: 77.6375, iot_enabled: false },
  { id: 'lk-172', name: 'Gangashetty Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 219, lat: 12.948, lng: 77.58, iot_enabled: false },
  { id: 'lk-203', name: 'Garudachar Palya (Goshala) Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 186, lat: 13.002, lng: 77.7325, iot_enabled: false },
  { id: 'lk-205', name: 'Garudachar Palya Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 200, lat: 13.07, lng: 77.6375, iot_enabled: false },
  { id: 'lk-091', name: 'Garveybhavipalya Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 152, lat: 12.994, lng: 77.5525, iot_enabled: false },
  { id: 'lk-127', name: 'Gattigerepalya (Sompura) lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 154, lat: 13.018, lng: 77.5925, iot_enabled: false },
  { id: 'lk-098', name: 'Gottigere Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 201, lat: 13.032, lng: 77.595, iot_enabled: true },
  { id: 'lk-044', name: 'Gowdanapalya Lake', zone: 'South', ward: 'South Division', area_acres: 73, lat: 12.996, lng: 77.66, iot_enabled: false },
  { id: 'lk-158', name: 'Gubbalalu Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 121, lat: 13.072, lng: 77.745, iot_enabled: false },
  { id: 'lk-168', name: 'Gunjur mouji kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 191, lat: 13.012, lng: 77.52, iot_enabled: true },
  { id: 'lk-186', name: 'Gunjur Palya kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 67, lat: 13.024, lng: 77.665, iot_enabled: false },
  { id: 'lk-188', name: 'Gunjuru Karmelaram lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 81, lat: 13.092, lng: 77.57, iot_enabled: false },
  { id: 'lk-118', name: 'H Gollahalli kere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 91, lat: 12.912, lng: 77.645, iot_enabled: false },
  { id: 'lk-152', name: 'Halage vaderahalli Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 79, lat: 13.068, lng: 77.53, iot_enabled: false },
  { id: 'lk-123', name: 'Handrahalli kere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 126, lat: 13.082, lng: 77.5325, iot_enabled: false },
  { id: 'lk-197', name: 'Haraluru kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 144, lat: 12.998, lng: 77.5175, iot_enabled: false },
  { id: 'lk-085', name: 'Harohalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 110, lat: 12.99, lng: 77.5875, iot_enabled: false },
  { id: 'lk-233', name: 'Hebbal Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 146, lat: 13.022, lng: 77.5575, iot_enabled: true },
  { id: 'lk-126', name: 'Herohalli Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 147, lat: 12.984, lng: 77.515, iot_enabled: true },
  { id: 'lk-192', name: 'Hoodi Giddanakere Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 109, lat: 13.028, lng: 77.63, iot_enabled: false },
  { id: 'lk-187', name: 'Hoodi kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 74, lat: 13.058, lng: 77.7425, iot_enabled: false },
  { id: 'lk-173', name: 'Horamavu Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 226, lat: 12.982, lng: 77.6575, iot_enabled: false },
  { id: 'lk-169', name: 'Hormavu Agara Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 198, lat: 13.046, lng: 77.5975, iot_enabled: true },
  { id: 'lk-131', name: 'Hosakerehalli lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 182, lat: 12.954, lng: 77.6525, iot_enabled: false },
  { id: 'lk-061', name: 'Hulimavu Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 192, lat: 12.974, lng: 77.7275, iot_enabled: false },
  { id: 'lk-074', name: 'Ibblur Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 33, lat: 13.016, lng: 77.735, iot_enabled: false },
  { id: 'lk-149', name: 'J.P Park Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 58, lat: 12.966, lng: 77.5475, iot_enabled: false },
  { id: 'lk-065', name: 'Jakkur Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 220, lat: 12.91, lng: 77.5375, iot_enabled: true },
  { id: 'lk-191', name: 'Jimkenahalli Lake/ Varanasi Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 102, lat: 12.994, lng: 77.5525, iot_enabled: false },
  { id: 'lk-121', name: 'Jogi kere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 112, lat: 13.014, lng: 77.6275, iot_enabled: false },
  { id: 'lk-166', name: 'Junnasandra lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 177, lat: 12.944, lng: 77.615, iot_enabled: false },
  { id: 'lk-167', name: 'K R Puram (BEML)/ Benniganahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 184, lat: 12.978, lng: 77.6925, iot_enabled: false },
  { id: 'lk-025', name: 'Kacharakanahalli Lake', zone: 'East', ward: 'East Division', area_acres: 190, lat: 12.95, lng: 77.6875, iot_enabled: false },
  { id: 'lk-223', name: 'Kaggadasapura Lake', zone: 'East', ward: 'East Division', area_acres: 76, lat: 13.082, lng: 77.5325, iot_enabled: false },
  { id: 'lk-194', name: 'Kaigondanahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 123, lat: 13.096, lng: 77.535, iot_enabled: false },
  { id: 'lk-100', name: 'Kalena Agrahara Lake STP', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 215, lat: 12.9, lng: 77.5, iot_enabled: false },
  { id: 'lk-162', name: 'Kalkere Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 149, lat: 13.008, lng: 77.555, iot_enabled: false },
  { id: 'lk-145', name: 'Kalyanikunte lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 30, lat: 13.03, lng: 77.7375, iot_enabled: false },
  { id: 'lk-043', name: 'Kamagondanahalli Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 66, lat: 12.962, lng: 77.5825, iot_enabled: false },
  { id: 'lk-106', name: 'Kammanahalli Lake  (Meenakshi Lake)', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 257, lat: 12.904, lng: 77.715, iot_enabled: false },
  { id: 'lk-212', name: 'Kannali Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 249, lat: 12.908, lng: 77.68, iot_enabled: false },
  { id: 'lk-224', name: 'Kariobanahalli Lake (Narasappanahalli kere)', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 83, lat: 12.916, lng: 77.61, iot_enabled: true },
  { id: 'lk-195', name: 'Kasavanahalli lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 130, lat: 12.93, lng: 77.6125, iot_enabled: false },
  { id: 'lk-075', name: 'Kattigenahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 40, lat: 13.05, lng: 77.5625, iot_enabled: false },
  { id: 'lk-016', name: 'Kelagina Byrasandra Lake', zone: 'East', ward: 'East Division', area_acres: 127, lat: 13.044, lng: 77.74, iot_enabled: false },
  { id: 'lk-163', name: 'Kembattahalli lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 156, lat: 13.042, lng: 77.6325, iot_enabled: false },
  { id: 'lk-024', name: 'Kempambudhi Lake', zone: 'South', ward: 'South Division', area_acres: 183, lat: 12.916, lng: 77.61, iot_enabled: false },
  { id: 'lk-164', name: 'Kenchanapura lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 163, lat: 13.076, lng: 77.71, iot_enabled: false },
  { id: 'lk-095', name: 'Kengeri Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 180, lat: 12.93, lng: 77.6125, iot_enabled: false },
  { id: 'lk-081', name: 'Kodige Singasandra Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 82, lat: 13.054, lng: 77.5275, iot_enabled: false },
  { id: 'lk-210', name: 'Kodigehalli lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 235, lat: 13.04, lng: 77.525, iot_enabled: true },
  { id: 'lk-072', name: 'Kogilu Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 19, lat: 12.948, lng: 77.58, iot_enabled: false },
  { id: 'lk-116', name: 'Konanakunte Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 77, lat: 13.044, lng: 77.74, iot_enabled: false },
  { id: 'lk-137', name: 'Konappana Agrahara Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 224, lat: 12.958, lng: 77.6175, iot_enabled: false },
  { id: 'lk-111', name: 'Konasandra Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 42, lat: 13.074, lng: 77.6025, iot_enabled: false },
  { id: 'lk-113', name: 'Kothanuru Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 56, lat: 12.942, lng: 77.5075, iot_enabled: false },
  { id: 'lk-182', name: 'Kowdenahalli lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 39, lat: 13.088, lng: 77.605, iot_enabled: true },
  { id: 'lk-139', name: 'Kudlu Chikka Kere STP', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 238, lat: 13.026, lng: 77.5225, iot_enabled: false },
  { id: 'lk-138', name: 'Kudlu Doddakere', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 231, lat: 12.992, lng: 77.695, iot_enabled: false },
  { id: 'lk-209', name: 'Kundalahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 228, lat: 13.006, lng: 77.6975, iot_enabled: false },
  { id: 'lk-034', name: 'Lakshmipura Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 253, lat: 13.056, lng: 77.635, iot_enabled: false },
  { id: 'lk-125', name: 'Lingadeeranahalli (handrahalli)', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 140, lat: 12.95, lng: 77.6875, iot_enabled: false },
  { id: 'lk-112', name: 'Lingadeeranahalli-13 Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 49, lat: 12.908, lng: 77.68, iot_enabled: true },
  { id: 'lk-231', name: 'Madiwala Lake', zone: 'South', ward: 'South Division', area_acres: 132, lat: 12.954, lng: 77.6525, iot_enabled: true },
  { id: 'lk-147', name: 'Mahadevapura  Lake-1', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 44, lat: 13.098, lng: 77.6425, iot_enabled: false },
  { id: 'lk-177', name: 'Mahadevapura Lake-2', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 254, lat: 12.918, lng: 77.7175, iot_enabled: false },
  { id: 'lk-027', name: 'Malagala', zone: 'West', ward: 'West Division', area_acres: 204, lat: 13.018, lng: 77.5925, iot_enabled: false },
  { id: 'lk-037', name: 'Mallasandra Gudde Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 24, lat: 12.958, lng: 77.6175, iot_enabled: false },
  { id: 'lk-146', name: 'Mallathahalli lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 37, lat: 13.064, lng: 77.565, iot_enabled: false },
  { id: 'lk-078', name: 'Mangammana Palya Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 61, lat: 12.952, lng: 77.545, iot_enabled: false },
  { id: 'lk-104', name: 'Mangammanahalli lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 243, lat: 13.036, lng: 77.56, iot_enabled: false },
  { id: 'lk-080', name: 'Medi Agrahara Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 75, lat: 13.02, lng: 77.7, iot_enabled: false },
  { id: 'lk-038', name: 'Mesthripalya Lake', zone: 'South', ward: 'South Division', area_acres: 31, lat: 12.992, lng: 77.695, iot_enabled: false },
  { id: 'lk-204', name: 'Munnekolalu kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 193, lat: 13.036, lng: 77.56, iot_enabled: false },
  { id: 'lk-101', name: 'Mylasandra (Sunnakallu palya) lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 222, lat: 12.934, lng: 77.5775, iot_enabled: false },
  { id: 'lk-156', name: 'Nagarabhavi Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 107, lat: 13.004, lng: 77.59, iot_enabled: true },
  { id: 'lk-171', name: 'Nagareshwara-Nagenahalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 212, lat: 12.914, lng: 77.5025, iot_enabled: false },
  { id: 'lk-232', name: 'Nagavara Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 139, lat: 12.988, lng: 77.73, iot_enabled: false },
  { id: 'lk-185', name: 'Nalluralli tank', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 60, lat: 12.99, lng: 77.5875, iot_enabled: false },
  { id: 'lk-059', name: 'Narasipura Lake-1 (survey no.20)', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 178, lat: 12.906, lng: 77.5725, iot_enabled: false },
  { id: 'lk-060', name: 'Narasipura Lake-2 (survey no.26)', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 185, lat: 12.94, lng: 77.65, iot_enabled: false },
  { id: 'lk-022', name: 'Nayandahalli Lake', zone: 'West', ward: 'West Division', area_acres: 169, lat: 13.048, lng: 77.705, iot_enabled: false },
  { id: 'lk-040', name: 'Nelagadarenahalli Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 45, lat: 13.06, lng: 77.6, iot_enabled: false },
  { id: 'lk-110', name: 'Nyanappanahalli Lake ( Akshayanagara Lake)', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 35, lat: 13.04, lng: 77.525, iot_enabled: true },
  { id: 'lk-073', name: 'Palanahalli Lake (Kattigenahalli)', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 26, lat: 12.982, lng: 77.6575, iot_enabled: false },
  { id: 'lk-190', name: 'Panathur lake -1', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 95, lat: 12.96, lng: 77.725, iot_enabled: false },
  { id: 'lk-189', name: 'Panathur lake-2', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 88, lat: 12.926, lng: 77.6475, iot_enabled: false },
  { id: 'lk-136', name: 'Parappana Agrahara lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 217, lat: 12.924, lng: 77.54, iot_enabled: false },
  { id: 'lk-133', name: 'Pattanagere/ Kenchenhalli lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 196, lat: 13.022, lng: 77.5575, iot_enabled: false },
  { id: 'lk-178', name: 'Pattandur agrahara -54 Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 261, lat: 12.952, lng: 77.545, iot_enabled: false },
  { id: 'lk-176', name: 'Pattandur agrahara lake-124', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 247, lat: 13.084, lng: 77.64, iot_enabled: false },
  { id: 'lk-071', name: 'Puttenahalli Lake (Bommanahalli)', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 262, lat: 12.914, lng: 77.5025, iot_enabled: false },
  { id: 'lk-062', name: 'Rachenahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 199, lat: 13.008, lng: 77.555, iot_enabled: true },
  { id: 'lk-089', name: 'Ramagondanahalli  Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 138, lat: 12.926, lng: 77.6475, iot_enabled: false },
  { id: 'lk-170', name: 'Rampura kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 205, lat: 13.08, lng: 77.675, iot_enabled: false },
  { id: 'lk-198', name: 'Sadaramangala Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 151, lat: 13.032, lng: 77.595, iot_enabled: false },
  { id: 'lk-021', name: 'Sankey Lake', zone: 'West', ward: 'West Division', area_acres: 162, lat: 13.014, lng: 77.6275, iot_enabled: true },
  { id: 'lk-069', name: 'Sarakki Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 248, lat: 13.046, lng: 77.5975, iot_enabled: false },
  { id: 'lk-207', name: 'Shilavanthana kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 214, lat: 12.938, lng: 77.5425, iot_enabled: false },
  { id: 'lk-077', name: 'Shivanahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 54, lat: 12.918, lng: 77.7175, iot_enabled: false },
  { id: 'lk-039', name: 'Shivapura Lake', zone: 'Dasarahalli', ward: 'Dasarahalli Division', area_acres: 38, lat: 13.026, lng: 77.5225, iot_enabled: false },
  { id: 'lk-208', name: 'Siddapura Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 221, lat: 12.972, lng: 77.62, iot_enabled: false },
  { id: 'lk-154', name: 'Sigehalli Lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 93, lat: 12.936, lng: 77.685, iot_enabled: true },
  { id: 'lk-047', name: 'Singapura Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 94, lat: 13.098, lng: 77.6425, iot_enabled: false },
  { id: 'lk-083', name: 'Singasandra Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 96, lat: 12.922, lng: 77.6825, iot_enabled: false },
  { id: 'lk-183', name: 'Sitaram Palya lake', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 46, lat: 12.922, lng: 77.6825, iot_enabled: false },
  { id: 'lk-088', name: 'Somasundra Palya Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 131, lat: 13.092, lng: 77.57, iot_enabled: false },
  { id: 'lk-128', name: 'Sompura Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 161, lat: 13.052, lng: 77.67, iot_enabled: false },
  { id: 'lk-213', name: 'Soolikere', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 256, lat: 12.942, lng: 77.5075, iot_enabled: false },
  { id: 'lk-199', name: 'Sowl kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 158, lat: 13.066, lng: 77.6725, iot_enabled: false },
  { id: 'lk-132', name: 'Srigandadakaval lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 189, lat: 12.988, lng: 77.73, iot_enabled: false },
  { id: 'lk-228', name: 'Srinivasapura Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 111, lat: 13.052, lng: 77.67, iot_enabled: false },
  { id: 'lk-099', name: 'Subbarayana Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 208, lat: 13.066, lng: 77.6725, iot_enabled: false },
  { id: 'lk-122', name: 'Subedarana Kere', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 119, lat: 13.048, lng: 77.705, iot_enabled: false },
  { id: 'lk-153', name: 'Subramanyapura Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 86, lat: 12.902, lng: 77.6075, iot_enabled: false },
  { id: 'lk-119', name: 'Swarnakunte Gudda Kere', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 98, lat: 12.946, lng: 77.7225, iot_enabled: false },
  { id: 'lk-114', name: 'Talghatapura Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 63, lat: 12.976, lng: 77.585, iot_enabled: false },
  { id: 'lk-070', name: 'Thirumenahalli Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 255, lat: 13.08, lng: 77.675, iot_enabled: true },
  { id: 'lk-120', name: 'Ullala lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 105, lat: 12.98, lng: 77.55, iot_enabled: false },
  { id: 'lk-221', name: 'Ulsoor lake', zone: 'East', ward: 'East Division', area_acres: 62, lat: 13.014, lng: 77.6275, iot_enabled: true },
  { id: 'lk-155', name: 'Uttarahalli Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 100, lat: 12.97, lng: 77.5125, iot_enabled: false },
  { id: 'lk-082', name: 'Vaderahalli lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 89, lat: 13.088, lng: 77.605, iot_enabled: false },
  { id: 'lk-107', name: 'Varahasandra Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 264, lat: 12.938, lng: 77.5425, iot_enabled: false },
  { id: 'lk-144', name: 'Vasantpura Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 23, lat: 12.996, lng: 77.66, iot_enabled: false },
  { id: 'lk-090', name: 'Veerasagara Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 145, lat: 12.96, lng: 77.725, iot_enabled: true },
  { id: 'lk-174', name: 'Vengaiahna kere /K.R.Puram Tank', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 233, lat: 13.016, lng: 77.735, iot_enabled: false },
  { id: 'lk-064', name: 'Venkateshpura Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 213, lat: 13.076, lng: 77.71, iot_enabled: false },
  { id: 'lk-165', name: 'Vibhuthipura kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 170, lat: 12.91, lng: 77.5375, iot_enabled: false },
  { id: 'lk-151', name: 'Vijanapura kere', zone: 'Mahadevapura', ward: 'Mahadevapura Division', area_acres: 72, lat: 13.034, lng: 77.7025, iot_enabled: false },
  { id: 'lk-130', name: 'Vishwaneedum Lake', zone: 'R.R.Nagar', ward: 'R.R.Nagar Division', area_acres: 175, lat: 12.92, lng: 77.575, iot_enabled: false },
  { id: 'lk-084', name: 'Yalahanka Lake', zone: 'Yelahanka', ward: 'Yelahanka Division', area_acres: 103, lat: 12.956, lng: 77.51, iot_enabled: true },
  { id: 'lk-048', name: 'Yediyur Lake', zone: 'South', ward: 'South Division', area_acres: 101, lat: 12.932, lng: 77.72, iot_enabled: false },
  { id: 'lk-108', name: 'Yelenahalli Lake', zone: 'Bommanahalli', ward: 'Bommanahalli Division', area_acres: 21, lat: 12.972, lng: 77.62, iot_enabled: false }
];

