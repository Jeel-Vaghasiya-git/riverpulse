import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Droplets, Thermometer, Activity, Gauge, Radio, MapPin, ChevronDown } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { SPRING_CONFIG, LAKES_DATA } from '../data/constants';

interface SensorReading {
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  timestamp: number;
}

export default function WaterBodiesMonitoring() {
  const [selectedLake, setSelectedLake] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<Record<string, SensorReading>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [filterIot, setFilterIot] = useState<boolean | null>(null);

  // Subscribe to all live sensors in Realtime Database
  useEffect(() => {
    const sensorsRef = ref(db, 'sensors');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const parsed: Record<string, SensorReading> = {};
        Object.entries(val).forEach(([lakeId, deviceData]) => {
          const typedDevice = deviceData as any;
          if (typedDevice && typedDevice.latest) {
            const latest = typedDevice.latest;
            parsed[lakeId] = {
              ph: Number(latest.ph),
              tds: Math.round(Number(latest.tds)),
              turbidity: Number(latest.turbidity),
              temperature: Number(latest.temperature),
              timestamp: Number(latest.timestamp)
            };
          }
        });
        setSensorData(parsed);
      } else {
        setSensorData({});
      }
    }, (err) => {
      console.warn("Realtime database sensors read failed:", err);
    });

    return () => unsubscribe();
  }, []);

  const zones = useMemo(() => {
    const unique = new Set(LAKES_DATA.map(l => l.zone));
    return Array.from(unique).sort();
  }, []);

  // Filter lakes dynamically based on database state
  const filteredLakes = useMemo(() => {
    return LAKES_DATA.filter(lake => {
      const matchesSearch = lake.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone ? lake.zone === selectedZone : true;
      
      const data = sensorData[lake.id];
      const isLive = !!(data && data.timestamp && (Date.now() - data.timestamp < 300000));
      
      const matchesIot = filterIot === null ? true : filterIot ? isLive : !isLive;
      return matchesSearch && matchesZone && matchesIot;
    });
  }, [searchTerm, selectedZone, filterIot, sensorData]);

  const selected = LAKES_DATA.find(l => l.id === selectedLake);
  const selectedData = selectedLake ? sensorData[selectedLake] : null;
  const isSelectedLakeLive = !!(selectedData && selectedData.timestamp && (Date.now() - selectedData.timestamp < 300000));

  const activeIoTCount = useMemo(() => {
    return Object.values(sensorData).filter(
      (data) => data && data.timestamp && (Date.now() - data.timestamp < 300000)
    ).length;
  }, [sensorData]);

  return (
    <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--aqua)]">Section 04</p>
          <h1 className="mt-2 text-4xl font-bold text-[var(--river)] md:text-5xl">Water Bodies Live Monitoring</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            IoT lake telemetry dashboard showcasing real-time hardware sensor readings deployed at selected water bodies.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--river)] px-3 py-1 text-xs font-medium text-white shadow-sm">
            <Radio className="h-3 w-3 animate-pulse text-[var(--aqua)]" /> {activeIoTCount} IoT Nodes Active
          </div>
        </header>

        {/* Search & Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-[var(--shadow-card)] ring-1 ring-black/5 items-end mb-8 relative z-10 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search Lakes</span>
            <input
              type="text"
              placeholder="Search by lake name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2 text-sm outline-none ring-[var(--aqua)] focus:ring-2 dark:bg-slate-900/50 dark:border-slate-800"
            />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Zone Filter</span>
            <div className="relative mt-1">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] dark:text-white outline-none ring-[var(--aqua)] focus:ring-2 cursor-pointer dark:bg-slate-900/50 dark:border-slate-800"
              >
                <option value="">All Zones</option>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)] dark:text-white" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Telemetry Status</span>
            <div className="relative mt-1">
              <select
                value={filterIot === null ? 'all' : filterIot ? 'iot' : 'offline'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') setFilterIot(null);
                  else if (val === 'iot') setFilterIot(true);
                  else setFilterIot(false);
                }}
                className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] dark:text-white outline-none ring-[var(--aqua)] focus:ring-2 cursor-pointer dark:bg-slate-900/50 dark:border-slate-800"
              >
                <option value="all">All Lakes</option>
                <option value="iot">Live Telemetry Only</option>
                <option value="offline">Not Active Only</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)] dark:text-white" />
            </div>
          </div>
        </div>

        {/* Lake Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredLakes.map((lake, i) => {
            const data = sensorData[lake.id];
            const isLive = !!(data && data.timestamp && (Date.now() - data.timestamp < 300000));
            const isSelected = selectedLake === lake.id;

            return (
              <motion.button
                key={lake.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...SPRING_CONFIG, delay: Math.min(0.5, 0.01 * i) }}
                onClick={() => setSelectedLake(isSelected ? null : lake.id)}
                className={`bg-white rounded-xl p-4 text-left transition hover:-translate-y-0.5 shadow-[var(--shadow-card)] ring-1 ring-black/5 border cursor-pointer ${
                  isSelected ? 'border-[var(--aqua)] ring-2 ring-[var(--aqua)]/20' : isLive ? 'border-[var(--good)]/30' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm leading-tight text-[var(--river)] pr-2">{lake.name}</h4>
                  {isLive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--good)]/10 text-[var(--good)] shrink-0">
                      <Wifi size={10} /> LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold uppercase shrink-0">
                      <WifiOff size={10} /> NOT ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin size={10} className="text-muted-foreground" /> {lake.zone} Zone · {lake.ward}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{lake.area_acres} acres</span>
                  <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">ID: {lake.id}</span>
                </div>

                {isLive && data && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">pH</span>
                      <div className="font-bold text-[var(--river)]">{data.ph}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">TDS</span>
                      <div className="font-bold text-[var(--river)]">{data.tds}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Temp</span>
                      <div className="font-bold text-[var(--river)]">{data.temperature}°</div>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {filteredLakes.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-card)] mb-8">
            <p className="text-slate-500 font-medium">No lakes found matching your filters.</p>
          </div>
        )}

        {/* Selected Lake Detail */}
        {selected && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={SPRING_CONFIG}
            className="mb-8 p-6 bg-white rounded-xl shadow-[var(--shadow-card)] ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[var(--river)]">{selected.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.zone} Zone · {selected.area_acres} acres · Lake ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">{selected.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedLake(null)}
                className="text-xs px-3 py-1.5 rounded-lg border border-input text-muted-foreground hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

            {isSelectedLakeLive && selectedData ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Gauge, label: 'pH Level', value: selectedData.ph, unit: 'pH', safe: selectedData.ph >= 6.5 && selectedData.ph <= 8.5 },
                    { icon: Activity, label: 'TDS', value: selectedData.tds, unit: 'ppm', safe: selectedData.tds <= 300 },
                    { icon: Droplets, label: 'Turbidity', value: selectedData.turbidity, unit: 'NTU', safe: selectedData.turbidity <= 25 },
                    { icon: Thermometer, label: 'Temperature', value: selectedData.temperature, unit: '°C', safe: selectedData.temperature <= 30 },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-white rounded-xl p-4 border shadow-sm flex flex-col justify-between"
                      style={{ borderLeft: `4px solid ${m.safe ? 'var(--good)' : 'var(--critical)'}` }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <m.icon size={12} className="text-muted-foreground" />
                          <span className="font-semibold">{m.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold text-[var(--river)]">{m.value}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground">{m.unit}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.safe ? 'bg-[var(--good)]/10 text-[var(--good)]' : 'bg-[var(--critical)]/10 text-[var(--critical)]'}`}>
                          {m.safe ? 'SAFE' : 'ALERT'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[var(--slate-soft)] rounded-lg text-center text-xs text-muted-foreground">
                  <p>Last transmission received: {new Date(selectedData.timestamp).toLocaleString('en-IN')}</p>
                  <p className="mt-1 opacity-75">Configured Node: hardware sensor stream synced via Firebase Realtime Database path: <code className="font-mono bg-white px-1.5 py-0.5 rounded">sensors/{selected.id}/latest</code></p>
                </div>
              </>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed rounded-xl text-center">
                <WifiOff className="mx-auto mb-3 text-muted-foreground" size={36} />
                <h4 className="font-semibold text-sm text-[var(--river)] mb-1">No Active Telemetry Connection</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                  This lake is currently inactive. Setup your IoT hardware device to upload live water telemetry to this station.
                </p>
                <div className="max-w-md mx-auto text-left bg-white p-4 rounded-lg border text-xs text-[var(--river)] space-y-2.5">
                  <p className="font-bold border-b pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">IoT Setup Instructions</p>
                  <p>1. Target Realtime Database Endpoint: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">https://riverpulse-e15de-default-rtdb.asia-southeast1.firebasedatabase.app</code></p>
                  <p>2. Upload Path: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">sensors/{selected.id}/latest</code></p>
                  <p>3. Required JSON Payload Fields:</p>
                  <pre className="bg-slate-800 text-slate-200 p-2.5 rounded-md font-mono text-[10px] overflow-x-auto">
{`{
  "ph": 7.35,
  "tds": 220,
  "turbidity": 12.4,
  "temperature": 26.5,
  "timestamp": 1780900000000
}`}
                  </pre>
                  <p className="text-[10px] text-muted-foreground mt-1">Note: <code className="font-mono">timestamp</code> should be epoch milliseconds (e.g. from NTP server).</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
