import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Beaker, Eye, Waves, Gauge, CheckCircle2, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import MetricsCard from '../components/dashboard/MetricsCard';
import RealTimeChart from '../components/dashboard/RealTimeChart';
import AlertPanel from '../components/dashboard/AlertPanel';
import RiverMap from '../components/dashboard/RiverMap';
import { useStpRealTimeData } from '../hooks/useStpRealTimeData';
import { SPRING_CONFIG, STATES_DATA, getWaterQualityColor, getWaterQualityLabel, THRESHOLDS } from '../data/constants';

function getMetricStatus(value: number, min?: number, max?: number, _critMin?: number, critMax?: number): 'safe' | 'warning' | 'critical' {
  if (critMax !== undefined && value > critMax) return 'critical';
  if (min !== undefined && value < min) return 'warning';
  if (max !== undefined && value > max) return 'warning';
  return 'safe';
}

function getTrend(current: number, base: number): 'up' | 'down' | 'stable' {
  const diff = current - base;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export default function STPsMonitoring() {
  const { stations, timeSeries, alerts, isPolling, togglePolling, acknowledgeAlert, error, authenticate } = useStpRealTimeData(8000);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const states = useMemo(() => Array.from(new Set(stations.map(s => s.state))).sort(), [stations]);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    return Array.from(new Set(stations.filter(s => s.state === selectedState).map(s => s.city))).sort();
  }, [stations, selectedState]);
  
  const segments = useMemo(() => {
    if (!selectedState || !selectedCity) return [];
    return Array.from(new Set(stations.filter(s => s.state === selectedState && s.city === selectedCity).map(s => s.name))).sort();
  }, [stations, selectedState, selectedCity]);

  const filteredStations = useMemo(() => {
    let result = stations;
    if (selectedState) result = result.filter((s) => s.state === selectedState);
    if (selectedCity) result = result.filter((s) => s.city === selectedCity);
    if (selectedSegment) result = result.filter((s) => s.name === selectedSegment);
    return result;
  }, [stations, selectedState, selectedCity, selectedSegment]);

  const selectedStation = useMemo(() => stations.find((s) => s.id === selectedStationId) ?? null, [stations, selectedStationId]);
  const selectedSeries = useMemo(() => selectedStationId ? (timeSeries[selectedStationId] ?? []) : [], [timeSeries, selectedStationId]);

  const avgMetrics = useMemo(() => {
    if (!filteredStations.length) return { ph: 0, bod: 0, cod: 0, tss: 0, totalCapacity: 0, activeCount: 0 };
    let phSum = 0, phCount = 0;
    let bodSum = 0, bodCount = 0;
    let codSum = 0, codCount = 0;
    let tssSum = 0, tssCount = 0;
    let totalCapacity = 0;
    let activeCount = 0;

    filteredStations.forEach((s) => {
      totalCapacity += s.capacity || 0;
      if (s.status === 'Live') activeCount++;
      
      if (s.outletReadings?.ph !== null && s.outletReadings?.ph !== undefined) {
        phSum += s.outletReadings.ph;
        phCount++;
      }
      if (s.outletReadings?.bod !== null && s.outletReadings?.bod !== undefined) {
        bodSum += s.outletReadings.bod;
        bodCount++;
      }
      if (s.outletReadings?.cod !== null && s.outletReadings?.cod !== undefined) {
        codSum += s.outletReadings.cod;
        codCount++;
      }
      if (s.outletReadings?.tss !== null && s.outletReadings?.tss !== undefined) {
        tssSum += s.outletReadings.tss;
        tssCount++;
      }
    });

    return {
      ph: phCount > 0 ? Number((phSum / phCount).toFixed(2)) : 0,
      bod: bodCount > 0 ? Number((bodSum / bodCount).toFixed(1)) : 0,
      cod: codCount > 0 ? Number((codSum / codCount).toFixed(1)) : 0,
      tss: tssCount > 0 ? Number((tssSum / tssCount).toFixed(1)) : 0,
      totalCapacity: Math.round(totalCapacity),
      activeCount
    };
  }, [filteredStations]);

  const qualityCounts = useMemo(() => {
    const counts = { blue: 0, yellow: 0, red: 0 };
    filteredStations.forEach((s) => { counts[getWaterQualityColor(s.ph, s.tds, s.turbidity)]++; });
    return counts;
  }, [filteredStations]);



  return (
    <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--aqua)]">Section 01</p>
            <h1 className="mt-2 text-4xl font-bold text-[var(--river)] md:text-5xl">STPs Live Monitoring</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Real-time telemetry feeds connected directly to the GangaPulse OCEMS API.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--river)] px-3 py-1 text-xs font-medium text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--aqua)] animate-pulse" /> Live API Link Active · Source: gangapulse.in
            </div>
          </div>
        </header>

        {stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 mb-8">
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-[var(--aqua)] animate-spin mb-4" />
            <p className="text-sm font-bold text-[var(--river)]">Fetching STP Live Telemetry...</p>
            <p className="text-xs text-muted-foreground mt-1">Connecting to GangaPulse API at www.gangapulse.in</p>
          </div>
        ) : (
          <>
            {/* Cascading filters */}
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-black/5 md:grid-cols-4 items-end mb-8">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select State</span>
                <div className="relative mt-1">
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedSegment(''); }}
                    className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 cursor-pointer"
                  >
                    <option value="">All States</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select City</span>
                <div className="relative mt-1">
                  <select
                    value={selectedCity}
                    onChange={(e) => { setSelectedCity(e.target.value); setSelectedSegment(''); }}
                    disabled={!selectedState}
                    className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">All Cities</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select STP</span>
                <div className="relative mt-1">
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    disabled={!selectedCity}
                    className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">All STPs</option>
                    {segments.map((seg) => <option key={seg} value={seg}>{seg}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
                </div>
              </div>

              <button
                onClick={() => { setSelectedState(''); setSelectedCity(''); setSelectedSegment(''); setSelectedStationId(null); }}
                className="w-full h-[42px] inline-flex items-center justify-center rounded-lg border border-input bg-white hover:bg-slate-50 text-xs font-semibold text-[var(--river)] shadow-sm transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>


            {/* Quality status tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--good)]/10 border border-[var(--good)]/20">
                <CheckCircle2 size={16} className="text-[var(--good)]" />
                <span className="text-sm font-semibold text-[var(--good)]">{qualityCounts.blue} Safe / Clean</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--moderate)]/10 border border-[var(--moderate)]/20">
                <TrendingUp size={16} className="text-[var(--river)]" />
                <span className="text-sm font-semibold text-[var(--river)]">{qualityCounts.yellow} Moderate / Review</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--critical)]/10 border border-[var(--critical)]/20">
                <AlertTriangle size={16} className="text-[var(--critical)]" />
                <span className="text-sm font-semibold text-[var(--critical)]">{qualityCounts.red} Alert / Hazardous</span>
              </div>
            </div>

            {/* Average Metrics Cards */}
            {filteredStations.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <MetricsCard icon={CheckCircle2} label="Live / Active" value={`${avgMetrics.activeCount} / ${filteredStations.length}`} unit="" target="All Live" status={avgMetrics.activeCount === filteredStations.length ? 'safe' : 'warning'} trend="stable" />
                <MetricsCard icon={Waves} label="Total Capacity" value={avgMetrics.totalCapacity} unit="MLD" target="Treatment Cap" status="safe" trend="stable" />
                <MetricsCard icon={Beaker} label="Avg pH (Outlet)" value={avgMetrics.ph} unit="pH" target="6.5 - 9.0" status={getMetricStatus(avgMetrics.ph, 6.5, 9.0)} trend={getTrend(avgMetrics.ph, 7.2)} />
                <MetricsCard icon={Activity} label="Avg BOD (Outlet)" value={avgMetrics.bod} unit="mg/L" target="< 30 mg/L" status={getMetricStatus(avgMetrics.bod, undefined, 30, undefined, 50)} trend={getTrend(avgMetrics.bod, 10)} />
                <MetricsCard icon={Thermometer} label="Avg COD (Outlet)" value={avgMetrics.cod} unit="mg/L" target="< 50 mg/L" status={getMetricStatus(avgMetrics.cod, undefined, 50, undefined, 100)} trend={getTrend(avgMetrics.cod, 25)} />
                <MetricsCard icon={Eye} label="Avg TSS (Outlet)" value={avgMetrics.tss} unit="mg/L" target="< 10 mg/L" status={getMetricStatus(avgMetrics.tss, undefined, 10, undefined, 30)} trend={getTrend(avgMetrics.tss, 8)} />
              </div>
            )}

            {/* Station Detail Panel */}
            {selectedStation && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_CONFIG} className="mb-8 p-6 bg-white rounded-xl shadow-[var(--shadow-card)] ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--river)]">
                      {selectedStation.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedStation.river} basin · {selectedStation.city}, {selectedStation.state} · Capacity: {selectedStation.capacity} MLD</p>
                  </div>
                  <button
                    onClick={() => setSelectedStationId(null)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-input text-muted-foreground hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Parameter pH Comparison Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">pH Comparison</span>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Inlet</span>
                        <span className="text-lg font-bold text-slate-500">{selectedStation.inletReadings?.ph ?? 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Outlet</span>
                        <span className="text-xl font-bold text-[var(--river)]">{selectedStation.outletReadings?.ph ?? 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parameter BOD Comparison Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">BOD Treatment</span>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Inlet</span>
                        <span className="text-lg font-bold text-slate-500">{selectedStation.inletReadings?.bod ? `${selectedStation.inletReadings.bod} mg/L` : 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Outlet</span>
                        <span className="text-xl font-bold text-[var(--river)]">{selectedStation.outletReadings?.bod ? `${selectedStation.outletReadings.bod} mg/L` : 'N/A'}</span>
                      </div>
                    </div>
                    {selectedStation.inletReadings?.bod && selectedStation.outletReadings?.bod && selectedStation.inletReadings.bod > selectedStation.outletReadings.bod && (
                      <div className="mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 inline-block">
                        {Math.round(((selectedStation.inletReadings.bod - selectedStation.outletReadings.bod) / selectedStation.inletReadings.bod) * 100)}% BOD Reduction
                      </div>
                    )}
                  </div>

                  {/* Parameter COD Comparison Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">COD Treatment</span>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Inlet</span>
                        <span className="text-lg font-bold text-slate-500">{selectedStation.inletReadings?.cod ? `${selectedStation.inletReadings.cod} mg/L` : 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Outlet</span>
                        <span className="text-xl font-bold text-[var(--river)]">{selectedStation.outletReadings?.cod ? `${selectedStation.outletReadings.cod} mg/L` : 'N/A'}</span>
                      </div>
                    </div>
                    {selectedStation.inletReadings?.cod && selectedStation.outletReadings?.cod && selectedStation.inletReadings.cod > selectedStation.outletReadings.cod && (
                      <div className="mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 inline-block">
                        {Math.round(((selectedStation.inletReadings.cod - selectedStation.outletReadings.cod) / selectedStation.inletReadings.cod) * 100)}% COD Reduction
                      </div>
                    )}
                  </div>

                  {/* Parameter TSS Comparison Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TSS Treatment</span>
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Inlet</span>
                        <span className="text-lg font-bold text-slate-500">{selectedStation.inletReadings?.tss ? `${selectedStation.inletReadings.tss} mg/L` : 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Outlet</span>
                        <span className="text-xl font-bold text-[var(--river)]">{selectedStation.outletReadings?.tss ? `${selectedStation.outletReadings.tss} mg/L` : 'N/A'}</span>
                      </div>
                    </div>
                    {selectedStation.inletReadings?.tss && selectedStation.outletReadings?.tss && selectedStation.inletReadings.tss > selectedStation.outletReadings.tss && (
                      <div className="mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 inline-block">
                        {Math.round(((selectedStation.inletReadings.tss - selectedStation.outletReadings.tss) / selectedStation.inletReadings.tss) * 100)}% TSS Reduction
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <RealTimeChart data={selectedSeries} dataKey="ph" label="Outlet pH Level" color="#328CC1" unit="pH" />
                  <RealTimeChart data={selectedSeries} dataKey="tds" label="Outlet BOD" color="#f59e0b" unit="mg/L" />
                  <RealTimeChart data={selectedSeries} dataKey="turbidity" label="Outlet TSS" color="#ec4899" unit="mg/L" />
                  <RealTimeChart data={selectedSeries} dataKey="temperature" label="Outlet COD" color="#ef4444" unit="mg/L" />
                </div>
              </motion.div>
            )}

            {/* Station Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {filteredStations.map((station, i) => {
                const quality = getWaterQualityColor(station.ph, station.tds, station.turbidity);
                const borderColors = { blue: 'border-[var(--good)]/30', yellow: 'border-[var(--moderate)]/30', red: 'border-[var(--critical)]/30' };
                const isSelected = selectedStationId === station.id;

                return (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.02 * i }}
                    onClick={() => setSelectedStationId(isSelected ? null : station.id)}
                    className={`bg-white rounded-xl p-5 shadow-[var(--shadow-card)] ring-1 ring-black/5 border transition cursor-pointer ${
                      isSelected ? 'border-[var(--aqua)] ring-2 ring-[var(--aqua)]/20' : borderColors[quality]
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm leading-tight text-[var(--river)] pr-2">{station.name}</h4>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          station.status === 'Live' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                          station.status === 'Delay' ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                          'text-slate-500 bg-slate-50 border border-slate-200'
                        }`}>
                          {station.status}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium">{station.capacity} MLD</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{station.river} · {station.city}</p>
                    
                    {/* Inlet vs Outlet Table */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px]">
                      <div className="flex justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-wider pb-0.5">
                        <span>Parameter</span>
                        <div className="flex gap-6">
                          <span>Inlet</span>
                          <span>Outlet</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-500">pH Level</span>
                        <div className="flex gap-6">
                          <span className="text-slate-400 w-10 text-right">{station.inletReadings?.ph ?? 'N/A'}</span>
                          <span className="text-[var(--river)] font-bold w-10 text-right">{station.outletReadings?.ph ?? 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-500">BOD (mg/L)</span>
                        <div className="flex gap-6">
                          <span className="text-slate-400 w-10 text-right">{station.inletReadings?.bod ?? 'N/A'}</span>
                          <span className="text-[var(--river)] font-bold w-10 text-right">{station.outletReadings?.bod ?? 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-500">COD (mg/L)</span>
                        <div className="flex gap-6">
                          <span className="text-slate-400 w-10 text-right">{station.inletReadings?.cod ?? 'N/A'}</span>
                          <span className="text-[var(--river)] font-bold w-10 text-right">{station.outletReadings?.cod ?? 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-500">TSS (mg/L)</span>
                        <div className="flex gap-6">
                          <span className="text-slate-400 w-10 text-right">{station.inletReadings?.tss ?? 'N/A'}</span>
                          <span className="text-[var(--river)] font-bold w-10 text-right">{station.outletReadings?.tss ?? 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Geospatial Map */}
            <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] ring-1 ring-black/5 mb-8">
              <h3 className="text-lg font-bold text-[var(--river)] mb-4">Geospatial Telemetry Map</h3>
              <RiverMap stations={filteredStations} selectedStationId={selectedStationId} onSelectStation={setSelectedStationId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
