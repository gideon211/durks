"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color = "text-blue-500",
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
      ? "text-red-500"
      : "text-muted-foreground";

  const iconBg =
    color === "text-blue-500"
      ? "bg-blue-50"
      : color === "text-amber-500"
      ? "bg-amber-50"
      : color === "text-emerald-500"
      ? "bg-emerald-50"
      : "bg-muted";

  return (
    <div className="group relative rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 sm:p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-border/80 min-w-0">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2 min-w-0 overflow-hidden">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold tracking-tight text-foreground truncate">{value}</h3>
          {change && (
            <p className="text-xs sm:text-sm font-medium truncate">{change}</p>
          )}
        </div>
        <div className={`flex-shrink-0 p-2 sm:p-2.5 lg:p-3 rounded-xl ${iconBg} transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}
