
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
  description?: string;
}

export function SummaryCard({ title, value, icon: Icon, isLoading, description }: SummaryCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            {description && <Skeleton className="h-4 w-1/2" />}
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-foreground text-right rtl:text-right">{value}</div>
            {description && <p className="text-xs text-muted-foreground pt-1 text-right rtl:text-right">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
