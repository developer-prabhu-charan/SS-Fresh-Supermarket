import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: any[];
  type: "area" | "bar";
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-card-foreground">
          {payload[0].name}: {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const SimpleChart = ({ 
  data, 
  type, 
  dataKey, 
  xAxisKey, 
  color = "hsl(var(--primary))",
  height = 300 
}: ChartProps) => {
  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
  };

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        {type === "area" ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs text-muted-foreground" 
            />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        ) : (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs text-muted-foreground" 
            />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};