import * as React from "react";

// Simple chart context for color management
const ChartContext = React.createContext<{
  config: Record<string, { label?: string; color?: string; icon?: React.ComponentType }>
}>({
  config: {}
});

export const useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
};

interface ChartContainerProps {
  config: Record<string, { label?: string; color?: string; icon?: React.ComponentType }>;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer = ({ config, children, className }: ChartContainerProps) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className}>
        {children}
      </div>
    </ChartContext.Provider>
  );
};

// Simple tooltip component
export const ChartTooltip = ({ children, ...props }: any) => {
  return React.cloneElement(children, props);
};

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: any[];
    label?: string;
    labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
    labelClassName?: string;
    formatter?: (value: any, name: any, item: any, index: number) => React.ReactNode;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }
>(({ active, payload, label, className, ...props }, ref) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      ref={ref}
      className={`bg-card border border-border rounded-lg p-3 shadow-lg ${className || ""}`}
      {...props}
    >
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} className="text-sm font-medium text-card-foreground">
          {item.name}: {item.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
});

ChartTooltipContent.displayName = "ChartTooltipContent";

// Simple legend component  
export const ChartLegend = ({ children, ...props }: any) => {
  return React.cloneElement(children, props);
};

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    payload?: any[];
    verticalAlign?: "top" | "bottom";
    nameKey?: string;
  }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-4 ${
        verticalAlign === "top" ? "pb-3" : "pt-3"
      } ${className || ""}`}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = config[key] || {};

        return (
          <div key={index} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color || itemConfig.color,
                }}
              />
            )}
            <span className="text-xs text-muted-foreground">
              {itemConfig.label || item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
});

ChartLegendContent.displayName = "ChartLegendContent";