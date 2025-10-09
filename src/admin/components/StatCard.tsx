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
      ? "text-fresh-lime"
      : changeType === "negative"
      ? "text-tropical-pink"
      : "text-muted-foreground";

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-3xl font-heading font-bold mt-2">{value}</h3>
            {change && (
              <p className={`text-sm mt-2 ${changeColor}`}>{change}</p>
            )}
          </div>
          <div className={`p-3 bg-muted rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
