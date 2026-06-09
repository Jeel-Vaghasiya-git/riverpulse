import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TimeSeriesPoint } from '../../data/constants';

interface RealTimeChartProps {
  data: TimeSeriesPoint[];
  dataKey: keyof TimeSeriesPoint;
  label: string;
  color: string;
  unit: string;
}

function CustomTooltip({ active, payload, label: lbl, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs bg-white shadow-lg border border-border text-[var(--river)]">
      <p className="mb-0.5 text-muted-foreground">{lbl}</p>
      <p className="font-semibold text-[var(--river)]">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

export default function RealTimeChart({ data, dataKey, label, color, unit }: RealTimeChartProps) {
  const chartData = useMemo(() => data.map((d) => ({ ...d })), [data]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] ring-1 ring-black/5">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{label} Stream</h4>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
