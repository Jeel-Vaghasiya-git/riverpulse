import { useState, useEffect, useCallback, useRef } from 'react';
import type { MonitoringStation, TimeSeriesPoint, Alert } from '../data/constants';

// Target URL using the Vite development proxy we configured to bypass CORS
const GANGA_PULSE_API_PREFIX = '/gangapulse-api';

interface ParameterReading {
  parameter_id: string;
  value: number;
  timestamp: number;
}

// Utility to parse the nested last_data structure
function parseLastData(lastDataField: any) {
  let list: any[] = [];
  if (typeof lastDataField === 'string') {
    try {
      list = JSON.parse(lastDataField);
    } catch (e) {
      list = [];
    }
  } else if (Array.isArray(lastDataField)) {
    list = lastDataField;
  }
  
  let outlet: Record<string, number> = {};
  let inlet: Record<string, number> = {};
  
  if (Array.isArray(list)) {
    list.forEach((item: any) => {
      if (item && item.Outlet && item.Outlet.readings) {
        outlet = { ...outlet, ...item.Outlet.readings };
      }
      if (item && item.Inlet && item.Inlet.readings) {
        inlet = { ...inlet, ...item.Inlet.readings };
      }
    });
  }
  
  return { outlet, inlet };
}

export function useStpRealTimeData(pollIntervalMs = 8000) {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [timeSeries, setTimeSeries] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gangapulse_access_token'));
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Authenticate and obtain JWT token
  const authenticate = useCallback(async () => {
    try {
      // Auto-populate localStorage with permanent credentials if not set
      if (!localStorage.getItem('gangapulse_username')) {
        localStorage.setItem('gangapulse_username', 'jeelv2006@gmail.com');
      }
      if (!localStorage.getItem('gangapulse_password')) {
        localStorage.setItem('gangapulse_password', 'p9ZWs7XxMSMr@4j');
      }

      const username = localStorage.getItem('gangapulse_username') || 'jeelv2006@gmail.com';
      const password = localStorage.getItem('gangapulse_password') || 'p9ZWs7XxMSMr@4j';

      const response = await fetch(`${GANGA_PULSE_API_PREFIX}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Authentication failed');
      const data = await response.json();
      
      if (data.access) {
        setToken(data.access);
        localStorage.setItem('gangapulse_access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('gangapulse_refresh_token', data.refresh);
        }
        setError(null);
        return data.access;
      }
    } catch (err: any) {
      console.warn('GangaPulse Auth Error:', err.message);
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch STPs list from the protected endpoint
  const fetchStations = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(`${GANGA_PULSE_API_PREFIX}/public/public-stp/?page_size=250`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired, re-auth
        const newToken = await authenticate();
        if (newToken) fetchStations(newToken);
        return;
      }

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (data && Array.isArray(data.results)) {
        const mapped: MonitoringStation[] = data.results.map((stp: any) => {
          const { outlet, inlet } = parseLastData(stp.last_data);
          
          // Map real parameters to backwards-compatible parameters
          const ph = outlet.pH !== undefined && outlet.pH !== null ? outlet.pH : 7.2;
          const tds = outlet.BOD !== undefined && outlet.BOD !== null ? outlet.BOD : 10;
          const turbidity = outlet.TSS !== undefined && outlet.TSS !== null ? outlet.TSS : 8;
          const temperature = outlet.COD !== undefined && outlet.COD !== null ? outlet.COD : 25;
          const waterLevel = 3.5;
          const flowRate = stp.capacity || 45;

          return {
            id: stp.uuid,
            name: stp.name,
            state: stp.state || 'Uttar Pradesh',
            city: stp.city || stp.district || 'Varanasi',
            river: 'Ganga',
            lat: stp.latitude || 25.31,
            lng: stp.longitude || 83.01,
            ph,
            tds,
            turbidity,
            temperature,
            waterLevel,
            flowRate,
            capacity: stp.capacity || 0,
            status: stp.status || 'Offline',
            lastSeen: stp.last_seen || '',
            inletSiteUuid: stp.inlet_site_uuid || '',
            outletSiteUuid: stp.outlet_site_uuid || '',
            outletReadings: {
              ph: outlet.pH !== undefined && outlet.pH !== null ? outlet.pH : null,
              tss: outlet.TSS !== undefined && outlet.TSS !== null ? outlet.TSS : null,
              cod: outlet.COD !== undefined && outlet.COD !== null ? outlet.COD : null,
              bod: outlet.BOD !== undefined && outlet.BOD !== null ? outlet.BOD : null,
            },
            inletReadings: {
              ph: inlet.pH !== undefined && inlet.pH !== null ? inlet.pH : null,
              tss: inlet.TSS !== undefined && inlet.TSS !== null ? inlet.TSS : null,
              cod: inlet.COD !== undefined && inlet.COD !== null ? inlet.COD : null,
              bod: inlet.BOD !== undefined && inlet.BOD !== null ? inlet.BOD : null,
            }
          };
        });
        
        if (mountedRef.current) {
          setStations(mapped);

          // Update time series point
          setTimeSeries((prev) => {
            const nextSeries = { ...prev };
            mapped.forEach((stn) => {
              const currentSeries = nextSeries[stn.id] ? [...nextSeries[stn.id]] : [];
              const timeLabel = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
              
              currentSeries.push({
                time: timeLabel,
                ph: stn.ph,
                tds: stn.tds,
                turbidity: stn.turbidity,
                temperature: stn.temperature,
                waterLevel: stn.waterLevel,
                flowRate: stn.flowRate,
              });
              
              nextSeries[stn.id] = currentSeries.slice(-30);
            });
            return nextSeries;
          });

          // Detect alerts from real data
          const newAlerts: Alert[] = [];
          mapped.forEach((stn) => {
            const outletPh = stn.outletReadings?.ph;
            const outletBod = stn.outletReadings?.bod;
            const outletTss = stn.outletReadings?.tss;

            if (outletPh !== null && outletPh !== undefined && (outletPh < 6.5 || outletPh > 9.0)) {
              newAlerts.push({
                id: `${stn.id}-ph-${Date.now()}`,
                stationId: stn.id,
                stationName: stn.name,
                type: 'ph',
                severity: 'critical',
                message: `STP Alert: ${stn.name} outlet pH is outside safe threshold (${outletPh})`,
                timestamp: new Date().toISOString(),
                acknowledged: false,
              });
            }
            if (outletBod !== null && outletBod !== undefined && outletBod > 30) {
              newAlerts.push({
                id: `${stn.id}-bod-${Date.now()}`,
                stationId: stn.id,
                stationName: stn.name,
                type: 'pollution',
                severity: 'critical',
                message: `STP Alert: ${stn.name} outlet BOD exceeds safe limit (${outletBod} mg/L)`,
                timestamp: new Date().toISOString(),
                acknowledged: false,
              });
            }
            if (outletTss !== null && outletTss !== undefined && outletTss > 50) {
              newAlerts.push({
                id: `${stn.id}-tss-${Date.now()}`,
                stationId: stn.id,
                stationName: stn.name,
                type: 'pollution',
                severity: 'warning',
                message: `STP Alert: ${stn.name} outlet TSS is high (${outletTss} mg/L)`,
                timestamp: new Date().toISOString(),
                acknowledged: false,
              });
            }
          });

          if (newAlerts.length > 0) {
            setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch STPs list:', err.message);
      setError(`Failed to retrieve STPs: ${err.message}`);
    }
  }, [authenticate]);

  // Main poll sequence updates all stations
  const poll = useCallback(async () => {
    let currentToken = token;
    if (!currentToken) {
      currentToken = await authenticate();
    }
    if (!currentToken) return;

    await fetchStations(currentToken);
  }, [token, authenticate, fetchStations]);

  useEffect(() => {
    mountedRef.current = true;
    if (isPolling) {
      poll();
      pollTimerRef.current = setInterval(poll, pollIntervalMs);
    }
    return () => {
      mountedRef.current = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isPolling, poll, pollIntervalMs]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const togglePolling = useCallback(() => {
    setIsPolling((prev) => !prev);
  }, []);

  return { stations, timeSeries, alerts, isPolling, togglePolling, acknowledgeAlert, error, authenticate };
}
