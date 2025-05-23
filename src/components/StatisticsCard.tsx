
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendIncreasing?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendIncreasing = true,
  className,
  iconClassName,
  onClick,
}: StatisticsCardProps) {
  return (
    <Card 
      className={cn("transition-all duration-200", 
        onClick ? "cursor-pointer hover:shadow-md" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <div 
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trendIncreasing ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trendIncreasing ? 
                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                    <TrendingDown className="h-3 w-3 mr-1" />
                  }
                  <span>{trend}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={cn("p-2 rounded-full", 
            iconClassName || "bg-primary/10"
          )}>
            <Icon className={cn("h-5 w-5", 
              iconClassName ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
