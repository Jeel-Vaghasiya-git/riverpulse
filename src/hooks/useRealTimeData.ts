import { useState, useEffect, useRef, useCallback } from 'react';
import { THRESHOLDS } from '../data/constants';
import type { MonitoringStation, TimeSeriesPoint, Alert } from '../data/constants';

function detectAlerts(station: MonitoringStation): Alert[] {
  const alerts: Alert[] = [];
  const ts = new Date().toISOString();

  if (station.waterLevel !== undefined) {
    if (station.waterLevel >= THRESHOLDS.waterLevel.criticalMax) {
      alerts.push({ id: `${station.id}-flood-c`, stationId: station.id, stationName: station.name, type: 'flood', severity: 'critical', message: `Water level at ${station.waterLevel}m - CRITICAL FLOOD RISK`, timestamp: ts, acknowledged: false });
    } else if (station.waterLevel >= THRESHOLDS.waterLevel.max) {
      alerts.push({ id: `${station.id}-flood-w`, stationId: station.id, stationName: station.name, type: 'flood', severity: 'warning', message: `Water level at ${station.waterLevel}m - Flood watch`, timestamp: ts, acknowledged: false });
    }
  }

  if (station.ph !== undefined) {
    if (station.ph < THRESHOLDS.ph.criticalMin || station.ph > THRESHOLDS.ph.criticalMax) {
      alerts.push({ id: `${station.id}-ph-c`, stationId: station.id, stationName: station.name, type: 'ph', severity: 'critical', message: `pH at ${station.ph} - CRITICAL contamination`, timestamp: ts, acknowledged: false });
    } else if (station.ph < THRESHOLDS.ph.min || station.ph > THRESHOLDS.ph.max) {
      alerts.push({ id: `${station.id}-ph-w`, stationId: station.id, stationName: station.name, type: 'ph', severity: 'warning', message: `pH at ${station.ph} - Outside safe range`, timestamp: ts, acknowledged: false });
    }
  }

  if (station.tds !== undefined) {
    if (station.tds >= THRESHOLDS.tds.criticalMax) {
      alerts.push({ id: `${station.id}-tds-c`, stationId: station.id, stationName: station.name, type: 'pollution', severity: 'critical', message: `TDS at ${station.tds} ppm - CRITICAL pollution`, timestamp: ts, acknowledged: false });
    } else if (station.tds >= THRESHOLDS.tds.max) {
      alerts.push({ id: `${station.id}-tds-w`, stationId: station.id, stationName: station.name, type: 'pollution', severity: 'warning', message: `TDS at ${station.tds} ppm - Elevated`, timestamp: ts, acknowledged: false });
    }
  }

  if (station.temperature !== undefined) {
    if (station.temperature >= THRESHOLDS.temperature.criticalMax) {
      alerts.push({ id: `${station.id}-temp-c`, stationId: station.id, stationName: station.name, type: 'temperature', severity: 'critical', message: `Temperature at ${station.temperature}°C - CRITICAL`, timestamp: ts, acknowledged: false });
    }
  }

  return alerts;
}

function cleanStationName(name: string): string {
  const parts = name.split('_');
  let clean = parts.length > 1 ? parts.slice(1).join('_') : name;
  return clean.replace(/\u00a0/g, ' ').trim();
}

function parseRiver(name: string, catchment: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('ganga') || nameLower.includes('ganges')) return 'Ganga';
  if (nameLower.includes('yamuna')) return 'Yamuna';
  if (nameLower.includes('narmada')) return 'Narmada';
  if (nameLower.includes('gomti')) return 'Gomti';
  if (nameLower.includes('hooghly')) return 'Hooghly';
  if (nameLower.includes('cauvery') || nameLower.includes('kaveri')) return 'Kaveri';
  if (nameLower.includes('sabarmati')) return 'Sabarmati';
  if (nameLower.includes('godavari')) return 'Godavari';
  if (nameLower.includes('krishna')) return 'Krishna';
  if (nameLower.includes('cooum')) return 'Cooum';
  
  if (catchment && catchment !== '---') return catchment;
  return 'Ganga';
}

function parseCity(name: string, state: string): string {
  const cleanName = cleanStationName(name);
  const nameParts = cleanName.split(',');
  if (nameParts.length > 1) {
    return nameParts[nameParts.length - 1].replace(/U\/s of|D\/s of|at|near/gi, '').trim();
  }
  
  const lower = cleanName.toLowerCase();
  if (lower.includes('patna')) return 'Patna';
  if (lower.includes('varanasi')) return 'Varanasi';
  if (lower.includes('haridwar')) return 'Haridwar';
  if (lower.includes('kanpur')) return 'Kanpur';
  if (lower.includes('prayagraj') || lower.includes('allahabad')) return 'Prayagraj';
  if (lower.includes('kolkata') || lower.includes('howrah')) return 'Kolkata';
  if (lower.includes('rishikesh')) return 'Rishikesh';
  
  return state || 'Other';
}

export function useRealTimeData(pollIntervalMs = 15000) {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSeries, setTimeSeries] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch CPCB RTWQMS Live Monitoring station list and Layer 10 measurements
  const fetchCpcbData = useCallback(async () => {
    try {
      const headers = { "Accept": "application/json" };
      const stationsRes = await fetch('/cpcb-api/data/internet/stations/stations.json', { headers });
      const layer10Res = await fetch('/cpcb-api/data/internet/layers/10/index.json', { headers });

      if (!stationsRes.ok || !layer10Res.ok) {
        throw new Error(`Failed to load CPCB datasets: stations=${stationsRes.status}, layer10=${layer10Res.status}`);
      }

      const rawStations = await stationsRes.json();
      const rawMeasurements = await layer10Res.json();

      if (Array.isArray(rawStations) && Array.isArray(rawMeasurements)) {
        const mapped: MonitoringStation[] = rawStations.map((stn: any) => {
          const measurements = rawMeasurements.filter((m: any) => m.station_id === stn.station_id);
          
          // Extract specific parameters
          const phVal = measurements.find((m: any) => m.stationparameter_no === 'pH')?.ts_value;
          const wtVal = measurements.find((m: any) => m.stationparameter_no === 'WT')?.ts_value;
          const doVal = measurements.find((m: any) => m.stationparameter_no === 'DO')?.ts_value;
          const bodVal = measurements.find((m: any) => m.stationparameter_no === 'BOD')?.ts_value;
          const codVal = measurements.find((m: any) => m.stationparameter_no === 'COD')?.ts_value;
          const ecVal = measurements.find((m: any) => m.stationparameter_no === 'EC')?.ts_value;
          const depthVal = measurements.find((m: any) => m.stationparameter_no === 'Depth')?.ts_value;

          const ph = phVal !== undefined ? phVal : 7.2;
          const temperature = wtVal !== undefined ? wtVal : 24.0;
          const tds = ecVal !== undefined ? Math.round(ecVal * 0.67) : 180;
          const waterLevel = depthVal !== undefined ? depthVal : 3.2;

          return {
            id: stn.station_id,
            name: cleanStationName(stn.station_name),
            state: (stn.territory_name || 'Uttar Pradesh').trim(),
            city: parseCity(stn.station_name, stn.territory_name).trim(),
            river: parseRiver(stn.station_name, stn.catchment_name).trim(),
            lat: parseFloat(stn.station_latitude) || 25.31,
            lng: parseFloat(stn.station_longitude) || 83.01,
            ph,
            tds,
            temperature,
            waterLevel,
            do_level: doVal,
            bod: bodVal,
            cod: codVal
          };
        });

        if (mountedRef.current && mapped.length > 0) {
          setStations(mapped);
          
          // Append new points to timeSeries if values change
          setTimeSeries((prev) => {
            const next = { ...prev };
            mapped.forEach((stn) => {
              const currentSeries = prev[stn.id] || [];
              const lastPoint = currentSeries[currentSeries.length - 1];
              const nowLabel = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
              
              if (!lastPoint || lastPoint.ph !== stn.ph || lastPoint.tds !== stn.tds || lastPoint.waterLevel !== stn.waterLevel) {
                const newPoint: TimeSeriesPoint = {
                  time: nowLabel,
                  ph: stn.ph,
                  tds: stn.tds,
                  temperature: stn.temperature,
                  waterLevel: stn.waterLevel,
                  turbidity: 0,
                  flowRate: 0,
                  do_level: stn.do_level,
                  bod: stn.bod,
                  cod: stn.cod
                };
                next[stn.id] = [...currentSeries, newPoint].slice(-30);
              }
            });
            return next;
          });
        }
      }
    } catch (err: any) {
      console.warn("CPCB RTWQMS live feeds fetch failed (CORS/SSL): ", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;
    await fetchCpcbData();
  }, [fetchCpcbData]);

  // Load CPCB data on mount
  useEffect(() => {
    fetchCpcbData();
  }, [fetchCpcbData]);

  useEffect(() => {
    mountedRef.current = true;
    if (isPolling) {
      intervalRef.current = setInterval(poll, pollIntervalMs);
    }
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, poll, pollIntervalMs]);

  useEffect(() => {
    if (!mountedRef.current) return;
    setStations((current) => {
      setAlerts(current.flatMap(detectAlerts));
      return current;
    });
  }, [timeSeries]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const togglePolling = useCallback(() => {
    setIsPolling((prev) => {
      if (prev && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return !prev;
    });
  }, []);

  return { stations, isLoading, timeSeries, alerts, isPolling, togglePolling, acknowledgeAlert };
}
