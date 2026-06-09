import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Droplets, Thermometer, Beaker, Bell, BellOff, Check } from 'lucide-react';
import { SPRING_CONFIG } from '../../data/constants';
import type { Alert } from '../../data/constants';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  isPolling: boolean;
  onTogglePolling: () => void;
}

const typeConfig = {
  flood: { icon: Droplets, label: 'Flood Risk', color: 'var(--aqua)', bg: 'rgba(50,140,193,0.1)', border: 'rgba(50,140,193,0.2)' },
  pollution: { icon: Beaker, label: 'Pollution', color: 'var(--poor)', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)' },
  temperature: { icon: Thermometer, label: 'Temperature', color: 'var(--poor)', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  ph: { icon: Beaker, label: 'pH Alert', color: 'var(--aqua)', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)' },
};

const severityBadge = {
  warning: { label: 'WARNING', color: 'var(--river)', bg: 'oklch(0.78 0.16 90 / 0.15)' },
  critical: { label: 'CRITICAL', color: 'var(--critical)', bg: 'oklch(0.58 0.22 27 / 0.15)' },
};

export default function AlertPanel({ alerts, onAcknowledge, isPolling, onTogglePolling }: AlertPanelProps) {
  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const criticalCount = unacknowledged.filter((a) => a.severity === 'critical').length;
  const warningCount = unacknowledged.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--critical)]/10 border border-[var(--critical)]/20">
          <AlertTriangle size={16} className="text-[var(--critical)]" />
          <span className="text-sm font-semibold text-[var(--critical)]">{criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--moderate)]/10 border border-[var(--moderate)]/20">
          <AlertTriangle size={16} className="text-[var(--river)]" />
          <span className="text-sm font-semibold text-[var(--river)]">{warningCount} Warnings</span>
        </div>
        <button
          onClick={onTogglePolling}
          className="ml-auto flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            background: isPolling ? 'var(--slate-soft)' : 'white',
            border: `1px solid var(--border)`,
            color: isPolling ? 'var(--aqua)' : 'var(--river)',
          }}
        >
          {isPolling ? <Bell size={14} /> : <BellOff size={14} />}
          {isPolling ? 'Live Feed: ON' : 'Live Feed: OFF'}
        </button>
      </div>

      {unacknowledged.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center shadow-[var(--shadow-card)] ring-1 ring-black/5">
          <Check className="mx-auto mb-2 text-[var(--good)]" size={28} />
          <p className="text-sm text-muted-foreground">All systems within safe parameters</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <AnimatePresence>
            {unacknowledged.slice(0, 5).map((alert) => {
              const tc = typeConfig[alert.type];
              const sc = severityBadge[alert.severity];
              const TypeIcon = tc.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={SPRING_CONFIG}
                  className="bg-white rounded-xl p-4 shadow-[var(--shadow-card)] ring-1 ring-black/5"
                  style={{ borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--critical)' : 'var(--moderate)'}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: tc.bg }}>
                        <TypeIcon size={16} style={{ color: tc.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          <span className="text-xs text-muted-foreground">{tc.label}</span>
                        </div>
                        <p className="text-sm font-medium text-[var(--river)]">{alert.message}</p>
                        <p className="text-xs mt-1 text-muted-foreground">{alert.stationName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-input text-muted-foreground hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
