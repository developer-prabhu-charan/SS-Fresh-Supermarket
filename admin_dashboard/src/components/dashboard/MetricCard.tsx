import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  gradient?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon,
  gradient = "bg-gradient-primary"
}: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="metric-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-card-foreground mb-2">
            {value}
          </h3>
          {change && (
            <p className={`text-sm flex items-center gap-1 ${
              changeType === "positive" ? "text-success" : "text-destructive"
            }`}>
              <span className={`text-xs ${
                changeType === "positive" ? "text-success" : "text-destructive"
              }`}>
                {changeType === "positive" ? "↗" : "↘"}
              </span>
              {change}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};