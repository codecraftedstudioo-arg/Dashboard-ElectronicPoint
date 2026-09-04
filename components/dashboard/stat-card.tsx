import { type ReactNode } from "react";
import { Card, cn } from "@/components/ui";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClassName,
}: {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  iconClassName?: string;
}) {
  return (
    <Card className="flex min-h-[140px] flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="pt-0.5 text-right text-xs font-medium text-muted sm:text-sm">
          {title}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.65rem]">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted">{subtitle}</div>
      </div>
    </Card>
  );
}
