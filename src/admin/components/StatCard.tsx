import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  color = "text-primary",
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-3xl font-heading font-bold tracking-tight">{value}</h3>
            {change && (
              <p className={`text-sm font-medium ${changeColor}`}>{change}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
