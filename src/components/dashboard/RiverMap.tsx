import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getWaterQualityColor, getWaterQualityLabel } from '../../data/constants';
import type { MonitoringStation } from '../../data/constants';

function StationPopupContent({ station }: { station: MonitoringStation }) {
  const quality = getWaterQualityColor(station.ph, station.tds, station.turbidity);
  const colorMap = { blue: 'var(--good)', yellow: 'var(--river)', red: 'var(--critical)' };

  const isStp = !!station.outletReadings;

  return (
    <div className="min-w-[220px] space-y-1.5 text-sm text-[var(--river)]">
      <h4 className="font-semibold text-base text-[var(--river)] m-0 leading-tight">{station.name}</h4>
      <p className="text-xs text-muted-foreground m-0">{station.river} · {station.city}</p>
      
      {isStp ? (
        <>
          <div className="flex justify-between items-center mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              station.status === 'Live' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
              station.status === 'Delay' ? 'text-amber-700 bg-amber-50 border border-amber-100' :
              'text-slate-500 bg-slate-50 border border-slate-200'
            }`}>
              {station.status || 'Offline'}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">{station.capacity} MLD</span>
          </div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 pt-2 text-[10px] border-t border-slate-100 mt-2 font-medium">
            <span className="text-muted-foreground font-bold uppercase">Param</span>
            <span className="text-muted-foreground font-bold uppercase text-right">Inlet</span>
            <span className="text-muted-foreground font-bold uppercase text-right">Outlet</span>
            
            <span className="text-slate-600">pH</span>
            <span className="text-slate-400 text-right">{station.inletReadings?.ph ?? 'N/A'}</span>
            <span className="font-bold text-[var(--river)] text-right">{station.outletReadings?.ph ?? 'N/A'}</span>

            <span className="text-slate-600">BOD</span>
            <span className="text-slate-400 text-right">{station.inletReadings?.bod ?? 'N/A'}</span>
            <span className="font-bold text-[var(--river)] text-right">{station.outletReadings?.bod ?? 'N/A'}</span>

            <span className="text-slate-600">COD</span>
            <span className="text-slate-400 text-right">{station.inletReadings?.cod ?? 'N/A'}</span>
            <span className="font-bold text-[var(--river)] text-right">{station.outletReadings?.cod ?? 'N/A'}</span>

            <span className="text-slate-600">TSS</span>
            <span className="text-slate-400 text-right">{station.inletReadings?.tss ?? 'N/A'}</span>
            <span className="font-bold text-[var(--river)] text-right">{station.outletReadings?.tss ?? 'N/A'}</span>
          </div>
        </>
      ) : (
        <>
          <div className="font-semibold text-xs mt-1" style={{ color: colorMap[quality] }}>
            {getWaterQualityLabel(quality)}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-xs border-t border-slate-100 mt-2">
            <span className="text-muted-foreground">pH:</span><span className="font-medium text-[var(--river)]">{station.ph}</span>
            <span className="text-muted-foreground">TDS:</span><span className="font-medium text-[var(--river)]">{station.tds} ppm</span>
            <span className="text-muted-foreground">Turbidity:</span><span className="font-medium text-[var(--river)]">{station.turbidity} NTU</span>
            <span className="text-muted-foreground">Temp:</span><span className="font-medium text-[var(--river)]">{station.temperature}°C</span>
            {station.do_level !== undefined && (
              <>
                <span className="text-muted-foreground">DO:</span><span className="font-medium text-[var(--river)]">{station.do_level} mg/L</span>
              </>
            )}
            {station.bod !== undefined && (
              <>
                <span className="text-muted-foreground">BOD:</span><span className="font-medium text-[var(--river)]">{station.bod} mg/L</span>
              </>
            )}
            {station.cod !== undefined && (
              <>
                <span className="text-muted-foreground">COD:</span><span className="font-medium text-[var(--river)]">{station.cod} mg/L</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface RiverMapProps {
  stations: MonitoringStation[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
}

export default function RiverMap({ stations, selectedStationId, onSelectStation }: RiverMapProps) {
  const markerColor = (quality: 'blue' | 'yellow' | 'red') => {
    const map = { blue: 'var(--good)', yellow: 'var(--moderate)', red: 'var(--critical)' };
    return map[quality] === 'var(--good)' ? '#22c55e' : map[quality] === 'var(--moderate)' ? '#eab308' : '#ef4444';
  };

  return (
    <div className="rounded-2xl overflow-hidden h-[400px] sm:h-[500px] shadow-[var(--shadow-card)] ring-1 ring-black/5">
      <MapContainer
        center={[22.5, 79.0]}
        zoom={5}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {stations.map((station) => {
          const quality = getWaterQualityColor(station.ph, station.tds, station.turbidity);
          const isSelected = selectedStationId === station.id;
          return (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lng]}
              radius={isSelected ? 13 : 9}
              pathOptions={{
                color: markerColor(quality),
                fillColor: markerColor(quality),
                fillOpacity: isSelected ? 0.95 : 0.75,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => onSelectStation(station.id) }}
            >
              <Popup>
                <StationPopupContent station={station} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
