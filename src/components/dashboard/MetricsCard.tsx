import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SPRING_CONFIG } from '../../data/constants';

interface MetricsCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  target: string;
  status: 'safe' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

const statusStyles = {
  safe: { color: 'var(--good)', bg: 'oklch(0.65 0.17 155 / 0.15)', text: 'var(--good)' },
  warning: { color: 'var(--moderate)', bg: 'oklch(0.78 0.16 90 / 0.15)', text: 'var(--river)' },
  critical: { color: 'var(--critical)', bg: 'oklch(0.58 0.22 27 / 0.15)', text: 'var(--critical)' },
};

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColors = { up: 'var(--critical)', down: 'var(--good)', stable: 'text-muted-foreground' };

export default function MetricsCard({ icon: Icon, label, value, unit, target, status, trend = 'stable' }: MetricsCardProps) {
  const style = statusStyles[status];
  const TrendIcon = trendIcons[trend];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING_CONFIG}
      className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] ring-1 ring-black/5 text-[var(--river)]"
    >
      <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className="text-muted-foreground" />
          <span className="font-semibold">{label}</span>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: style.bg, color: style.color }}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2 mt-3">
        <span className="text-3xl font-bold text-[var(--river)]">{value}</span>
        <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[10px]">
        <div className="flex items-center gap-1" style={{ color: trendColors[trend] === 'text-muted-foreground' ? '#64748b' : trendColors[trend] }}>
          <TrendIcon size={12} />
          <span className="capitalize">{trend}</span>
        </div>
        <span className="text-muted-foreground">Target: {target}</span>
      </div>
    </motion.div>
  );
}
