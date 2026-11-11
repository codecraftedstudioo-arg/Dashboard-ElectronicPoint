import { type ReactNode } from "react";
import { Card, cn } from "@/components/ui";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClassName,
  variant = "default",
}: {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  iconClassName?: string;
  variant?: "default" | "glass";
}) {
  if (variant === "glass") {
    return (
      <div className="flex min-h-[138px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            {icon}
          </div>
          <div className="pt-1 text-right text-sm text-white/70">{title}</div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-sm text-white/50">{subtitle}</div>
        </div>
      </div>
    );
  }

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
