import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Beaker, Eye, Waves, Gauge, CheckCircle2, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import MetricsCard from '../components/dashboard/MetricsCard';
import RealTimeChart from '../components/dashboard/RealTimeChart';
import AlertPanel from '../components/dashboard/AlertPanel';
import RiverMap from '../components/dashboard/RiverMap';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { SPRING_CONFIG, getWaterQualityColor, getWaterQualityLabel, THRESHOLDS } from '../data/constants';

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

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  percentage: number;
  color: string;
  glow?: boolean;
  children?: React.ReactNode;
}

function CircularProgress({ size, strokeWidth, percentage, color, glow = true, children }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  const glowId = `glow-${color.replace('#', '')}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.25" />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={glow ? `url(#${glowId})` : undefined}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--river)] dark:text-white">
        {children}
      </div>
    </div>
  );
}

export default function RiverBasinsMonitoring() {
  const { stations, isLoading, timeSeries, alerts, isPolling, togglePolling, acknowledgeAlert } = useRealTimeData(15000);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBasin, setSelectedBasin] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const states = useMemo(() => {
    const unique = new Set(stations.map(s => s.state).filter(Boolean));
    return Array.from(unique).sort();
  }, [stations]);

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const unique = new Set(
      stations
        .filter(s => s.state === selectedState)
        .map(s => s.city)
        .filter(Boolean)
    );
    return Array.from(unique).sort();
  }, [stations, selectedState]);

  const basins = useMemo(() => {
    if (!selectedState || !selectedCity) return [];
    const unique = new Set(
      stations
        .filter(s => s.state === selectedState && s.city === selectedCity)
        .map(s => s.name)
        .filter(Boolean)
    );
    return Array.from(unique).sort();
  }, [stations, selectedState, selectedCity]);

  const filteredStations = useMemo(() => {
    let result = stations;
    if (selectedState) result = result.filter((s) => s.state === selectedState);
    if (selectedCity) result = result.filter((s) => s.city === selectedCity);
    if (selectedBasin) result = result.filter((s) => s.name === selectedBasin);
    return result;
  }, [stations, selectedState, selectedCity, selectedBasin]);

  const selectedStation = useMemo(() => stations.find((s) => s.id === selectedStationId) ?? null, [stations, selectedStationId]);
  const selectedSeries = useMemo(() => selectedStationId ? (timeSeries[selectedStationId] ?? []) : [], [timeSeries, selectedStationId]);

  const avgMetrics = useMemo(() => {
    if (!filteredStations.length) return { ph: 0, tds: 0, temperature: 0, waterLevel: 0, do_level: 0 };
    
    let phSum = 0, phCount = 0;
    let tdsSum = 0, tdsCount = 0;
    let tempSum = 0, tempCount = 0;
    let wlSum = 0, wlCount = 0;
    let doSum = 0, doCount = 0;

    filteredStations.forEach((s) => {
      if (s.ph !== undefined) { phSum += s.ph; phCount++; }
      if (s.tds !== undefined) { tdsSum += s.tds; tdsCount++; }
      if (s.temperature !== undefined) { tempSum += s.temperature; tempCount++; }
      if (s.waterLevel !== undefined) { wlSum += s.waterLevel; wlCount++; }
      if (s.do_level !== undefined) { doSum += s.do_level; doCount++; }
    });

    return {
      ph: phCount ? Number((phSum / phCount).toFixed(1)) : 0,
      tds: tdsCount ? Math.round(tdsSum / tdsCount) : 0,
      temperature: tempCount ? Number((tempSum / tempCount).toFixed(1)) : 0,
      waterLevel: wlCount ? Number((wlSum / wlCount).toFixed(1)) : 0,
      do_level: doCount ? Number((doSum / doCount).toFixed(1)) : 0,
    };
  }, [filteredStations]);

  const qualityCounts = useMemo(() => {
    const counts = { blue: 0, yellow: 0, red: 0 };
    filteredStations.forEach((s) => { counts[getWaterQualityColor(s.ph, s.tds, 0)]++; });
    return counts;
  }, [filteredStations]);

  return (
    <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--aqua)]">Section 02</p>
          <h1 className="mt-2 text-4xl font-bold text-[var(--river)] md:text-5xl">River Basins Live Monitoring</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Real-time water quality monitoring network across India's major river basins.
            Select State → District → River Basin monitoring station to see live pH, TDS and turbidity readings.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--river)] px-3 py-1 text-xs font-medium text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--aqua)] animate-pulse" /> Live · Source: cpcb.gov.in
          </div>
        </header>

        {/* Cascading filters */}
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-black/5 md:grid-cols-4 items-end mb-8">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select State</span>
            <div className="relative mt-1">
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedBasin(''); }}
                className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 cursor-pointer"
              >
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select District</span>
            <div className="relative mt-1">
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setSelectedBasin(''); }}
                disabled={!selectedState}
                className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 disabled:opacity-50 cursor-pointer"
              >
                <option value="">All Districts</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Select River Basin</span>
            <div className="relative mt-1">
              <select
                value={selectedBasin}
                onChange={(e) => setSelectedBasin(e.target.value)}
                disabled={!selectedCity}
                className="w-full appearance-none rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--river)] outline-none ring-[var(--aqua)] focus:ring-2 disabled:opacity-50 cursor-pointer"
              >
                <option value="">All River Basins</option>
                {basins.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--river)]" />
            </div>
          </div>

          <button
            onClick={() => { setSelectedState(''); setSelectedCity(''); setSelectedBasin(''); setSelectedStationId(null); }}
            className="w-full h-[42px] inline-flex items-center justify-center rounded-lg border border-input bg-white hover:bg-slate-50 text-xs font-semibold text-[var(--river)] shadow-sm transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>



        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 mb-8">
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-[var(--aqua)] animate-spin mb-4" />
            <p className="text-sm font-bold text-[var(--river)]">Fetching CPCB Live Telemetry...</p>
            <p className="text-xs text-muted-foreground mt-1">Connecting to CPCB RTWQMS database at rtwqmsdb1.cpcb.gov.in</p>
          </div>
        ) : (
          <>
            {/* Quality status tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--good)]/10 border border-[var(--good)]/20">
                <CheckCircle2 size={16} className="text-[var(--good)]" />
                <span className="text-sm font-semibold text-[var(--good)]">{qualityCounts.blue} Safe / Pristine</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--moderate)]/10 border border-[var(--moderate)]/20">
                <TrendingUp size={16} className="text-[var(--river)]" />
                <span className="text-sm font-semibold text-[var(--river)]">{qualityCounts.yellow} Moderate / Attention</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--critical)]/10 border border-[var(--critical)]/20">
                <AlertTriangle size={16} className="text-[var(--critical)]" />
                <span className="text-sm font-semibold text-[var(--critical)]">{qualityCounts.red} Alert / Critical</span>
              </div>
            </div>

            {/* Average Metrics Cards */}
            {selectedBasin && filteredStations.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <MetricsCard icon={Beaker} label="pH Level" value={avgMetrics.ph} unit="pH" target="6.5 - 8.5" status={getMetricStatus(avgMetrics.ph, THRESHOLDS.ph.min, THRESHOLDS.ph.max)} trend={getTrend(avgMetrics.ph, 7.0)} />
                <MetricsCard icon={Eye} label="TDS" value={avgMetrics.tds} unit="ppm" target="< 300 ppm" status={getMetricStatus(avgMetrics.tds, undefined, THRESHOLDS.tds.max, undefined, THRESHOLDS.tds.criticalMax)} trend={getTrend(avgMetrics.tds, 300)} />
                <MetricsCard icon={Thermometer} label="Temperature" value={avgMetrics.temperature} unit="°C" target="18 - 30°C" status={getMetricStatus(avgMetrics.temperature, THRESHOLDS.temperature.min, THRESHOLDS.temperature.max)} trend={getTrend(avgMetrics.temperature, 25)} />
                <MetricsCard icon={Waves} label="Water Level" value={avgMetrics.waterLevel} unit="m" target="< 8m" status={getMetricStatus(avgMetrics.waterLevel, undefined, THRESHOLDS.waterLevel.max, undefined, THRESHOLDS.waterLevel.criticalMax)} trend={getTrend(avgMetrics.waterLevel, 4.0)} />
                {avgMetrics.do_level > 0 && (
                  <MetricsCard icon={Activity} label="Avg DO" value={avgMetrics.do_level} unit="mg/L" target="> 5.0 mg/L" status={avgMetrics.do_level >= 5.0 ? 'safe' : 'warning'} trend={getTrend(avgMetrics.do_level, 6.0)} />
                )}
              </div>
            )}

            {/* Station Detail Panel */}
            {selectedStation && (() => {
              const wlVal = selectedStation.waterLevel !== undefined ? selectedStation.waterLevel : 1.3;
              const tempVal = selectedStation.temperature !== undefined ? selectedStation.temperature : 23.0;

              // Convert units to match mockup (meters to ft, °C to °F)
              const waterLevelFt = Number((wlVal * 3.28084).toFixed(1));
              const tempF = Number((tempVal * 1.8 + 32).toFixed(1));

              // Simulated/scaled values
              const flowCfs = Math.round(wlVal * 450 + 100);
              const floodStagePct = Math.min(100, Math.max(0, Math.round((wlVal / 8.0) * 100)));
              const flowPercentage = Math.min(100, Math.max(5, Math.round((flowCfs / 2500) * 100)));
              const waterLevelPercentage = Math.min(100, Math.max(5, Math.round((wlVal / 8.0) * 100)));
              const tempPercentage = Math.min(100, Math.max(5, Math.round((tempF / 110) * 100)));

              const wlStatus = getMetricStatus(
                wlVal,
                undefined,
                THRESHOLDS.waterLevel.max,
                undefined,
                THRESHOLDS.waterLevel.criticalMax
              );

              const wlTrend = (() => {
                if (selectedSeries.length < 2) return { text: 'Falling', icon: '↘' }; // Default to match screenshot
                const last = selectedSeries[selectedSeries.length - 1].waterLevel;
                const prev = selectedSeries[selectedSeries.length - 2].waterLevel;
                if (last > prev) return { text: 'Rising', icon: '↗' };
                if (last < prev) return { text: 'Falling', icon: '↘' };
                return { text: 'Stable', icon: '→' };
              })();

              const change24h = (() => {
                if (selectedSeries.length < 2) {
                  const stnHash = selectedStation.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const mockVal = (stnHash % 12) + 2.5;
                  const isUp = (stnHash % 2) === 0;
                  return { value: `${mockVal.toFixed(0)}%`, isUp }; // Keep it simple without decimal like "705%" or "12%"
                }
                const last = selectedSeries[selectedSeries.length - 1].waterLevel;
                const first = selectedSeries[0].waterLevel;
                const diff = last - first;
                const pct = first > 0 ? (diff / first) * 100 : 0;
                return { value: `${Math.round(Math.abs(pct))}%`, isUp: pct >= 0 };
              })();

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={SPRING_CONFIG} 
                  className="mb-8 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 text-[var(--river)] dark:text-white relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Live Station Diagnostics</span>
                      <h3 className="text-xl font-bold text-[var(--river)] dark:text-white mt-0.5">
                        {selectedStation.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{selectedStation.river} basin · {selectedStation.city}, {selectedStation.state}</p>
                    </div>
                    <button
                      onClick={() => setSelectedStationId(null)}
                      className="text-xs px-3.5 py-2 rounded-lg border border-input text-muted-foreground hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition shadow-sm cursor-pointer"
                    >
                      Close Details
                    </button>
                  </div>

                  {/* Chemical & Biological Analysis banner (Light/Dark version) */}
                  {(selectedStation.do_level !== undefined || selectedStation.bod !== undefined || selectedStation.cod !== undefined) && (
                    <div className="mb-10 p-5 rounded-2xl bg-[var(--slate-soft)] dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 flex flex-wrap gap-8 items-center relative z-10 shadow-inner">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--river)] dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pr-8">
                        Chemical & Biological Analysis
                      </div>
                      {selectedStation.do_level !== undefined && (
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[9px] text-muted-foreground dark:text-slate-400 uppercase block font-bold tracking-wider">Dissolved Oxygen</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xl font-extrabold text-[var(--river)] dark:text-white">{selectedStation.do_level}</span> 
                              <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium">mg/L</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-500/20">Target &gt; 5.0</span>
                        </div>
                      )}
                      {selectedStation.bod !== undefined && (
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[9px] text-muted-foreground dark:text-slate-400 uppercase block font-bold tracking-wider">BOD</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xl font-extrabold text-[var(--river)] dark:text-white">{selectedStation.bod}</span> 
                              <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium">mg/L</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-500/20">Target &lt; 3.0</span>
                        </div>
                      )}
                      {selectedStation.cod !== undefined && (
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[9px] text-muted-foreground dark:text-slate-400 uppercase block font-bold tracking-wider">COD</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xl font-extrabold text-[var(--river)] dark:text-white">{selectedStation.cod}</span> 
                              <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium">mg/L</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-rose-500/10 dark:text-rose-400 font-bold border border-blue-100 dark:border-rose-500/20">Target &lt; 250</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PREMIUM INSTRUMENT DIALS CARD */}
                  <div className="bg-slate-50/60 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center relative z-10">
                    {/* Header brand */}
                    <div className="text-center mb-8">
                      <h4 className="text-sm font-black tracking-[0.3em] text-[#ff7a00]">RIVERPULSE</h4>
                      <p className="text-[10px] text-muted-foreground dark:text-slate-400 tracking-wider font-semibold uppercase mt-1">{selectedStation.name}</p>
                    </div>

                    {/* Gauges row */}
                    <div className="flex flex-row items-center justify-center gap-6 md:gap-10 lg:gap-14 flex-wrap w-full py-4">
                      
                      {/* 1. FLOOD STAGE (Far Left - Small) */}
                      <div className="flex flex-col items-center">
                        <CircularProgress size={76} strokeWidth={5} percentage={floodStagePct} color="#10b981">
                          <Waves className="w-5 h-5 text-emerald-500" />
                        </CircularProgress>
                        <div className="text-center mt-3.5">
                          <div className="text-emerald-600 font-black text-sm">{floodStagePct}%</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1">FLOOD STAGE</div>
                        </div>
                      </div>

                      {/* 2. FLOW (Middle Left - Medium) */}
                      <div className="flex flex-col items-center">
                        <CircularProgress size={120} strokeWidth={7} percentage={flowPercentage} color="#ef4444">
                          <span className="text-2xl font-black text-[var(--river)] dark:text-white">{flowCfs}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider -mt-1">cfs</span>
                        </CircularProgress>
                        <div className="text-center mt-3.5">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest">FLOW</div>
                        </div>
                      </div>

                      {/* 3. WATER LEVEL (Center - Large) */}
                      <div className="flex flex-col items-center">
                        <CircularProgress size={164} strokeWidth={9} percentage={waterLevelPercentage} color="#f97316">
                          <span className="text-4xl font-black text-[var(--river)] dark:text-white tracking-tighter">{waterLevelFt}</span>
                          <span className="text-xs text-slate-400 font-bold tracking-wider mt-0.5">ft</span>
                        </CircularProgress>
                        <div className="text-center mt-4 flex flex-col items-center">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold tracking-widest">WATER LEVEL</div>
                          
                          {/* Trend status */}
                          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-bold text-xs">
                            {wlTrend.icon === '↗' ? (
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            ) : wlTrend.icon === '↘' ? (
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            )}
                            <span className="capitalize tracking-wider">{wlTrend.text}</span>
                          </div>

                          {/* Safe conditions badge */}
                          <div className={`mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            wlStatus === 'safe' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' 
                              : wlStatus === 'warning'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                                : 'bg-rose-55 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                          }`}>
                            {wlStatus === 'safe' ? (
                              <CheckCircle2 size={11} className="text-emerald-600" />
                            ) : (
                              <AlertTriangle size={11} className={wlStatus === 'warning' ? 'text-amber-600' : 'text-rose-600'} />
                            )}
                            <span>{wlStatus === 'safe' ? 'Safe conditions' : wlStatus === 'warning' ? 'Flood Watch' : 'Flood Warning'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. TEMP (Middle Right - Medium) */}
                      <div className="flex flex-col items-center">
                        <CircularProgress size={120} strokeWidth={7} percentage={tempPercentage} color="#fbbf24">
                          <span className="text-2xl font-black text-[var(--river)] dark:text-white">{tempF}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider -mt-1">°F</span>
                        </CircularProgress>
                        <div className="text-center mt-3.5">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest">TEMP</div>
                        </div>
                      </div>

                      {/* 5. 24H TREND (Far Right - Small) */}
                      <div className="flex flex-col items-center">
                        <CircularProgress size={76} strokeWidth={5} percentage={35} color="#10b981">
                          <Gauge className="w-5 h-5 text-emerald-500" />
                        </CircularProgress>
                        <div className="text-center mt-3.5">
                          <div className="text-emerald-600 font-black text-sm">{change24h.value}</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1 flex items-center justify-center gap-0.5">
                            <span>24H</span>
                            {change24h.isUp ? (
                              <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7" />
                              </svg>
                            ) : (
                              <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Station Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {filteredStations.map((station, i) => {
                const quality = getWaterQualityColor(station.ph, station.tds, 0);
                const borderColors = { blue: 'border-[var(--good)]/30', yellow: 'border-[var(--moderate)]/30', red: 'border-[var(--critical)]/30' };
                const labelColors = { blue: 'text-[var(--good)] bg-[var(--good)]/10', yellow: 'text-[var(--river)] bg-[var(--moderate)]/10', red: 'text-[var(--critical)] bg-[var(--critical)]/10' };
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${labelColors[quality]}`}>
                        {getWaterQualityLabel(quality).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{station.river} · {station.city}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">pH</span>
                        <div className="font-bold text-[var(--river)]">{station.ph}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">TDS</span>
                        <div className="font-bold text-[var(--river)]">{station.tds} <span className="text-[9px] font-normal text-muted-foreground">ppm</span></div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">DO</span>
                        <div className="font-bold text-[var(--river)]">
                          {station.do_level !== undefined ? `${station.do_level}` : '—'} <span className="text-[8px] font-normal text-muted-foreground">{station.do_level !== undefined && 'mg/L'}</span>
                        </div>
                      </div>
                    </div>
                    {(station.bod !== undefined || station.cod !== undefined) && (
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5 mt-2.5">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">BOD</span>
                          <div className="font-bold text-[var(--river)]">
                            {station.bod !== undefined ? `${station.bod}` : '—'} <span className="text-[8px] font-normal text-muted-foreground">{station.bod !== undefined && 'mg/L'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">COD</span>
                          <div className="font-bold text-[var(--river)]">
                            {station.cod !== undefined ? `${station.cod}` : '—'} <span className="text-[8px] font-normal text-muted-foreground">{station.cod !== undefined && 'mg/L'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Geospatial Map */}
            <div className="bg-white rounded-2xl p-5 shadow-[var(--shadow-card)] ring-1 ring-black/5 mb-8">
              <h3 className="text-lg font-bold text-[var(--river)] mb-4">River Basin Telemetry Map</h3>
              <RiverMap stations={filteredStations} selectedStationId={selectedStationId} onSelectStation={setSelectedStationId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
