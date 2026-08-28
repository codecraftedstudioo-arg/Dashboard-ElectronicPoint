import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/components/ui";

const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8 text-sm",
  xl: "h-12 px-8 text-sm",
  xxl: "h-16 px-10 text-lg",
} as const;

type Size = keyof typeof sizes;

const glassShadow =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]";

const shellClass =
  "relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full text-center font-semibold text-foreground transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-50";

function GlassFilter() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves={1}
            seed={1}
            result="turbulence"
          />
          <feGaussianBlur
            in="turbulence"
            stdDeviation={2}
            result="blurredNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale={70}
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur
            in="displaced"
            stdDeviation={0.5}
            result="finalBlur"
          />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function GlassLayers({ children }: { children: ReactNode }) {
  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 z-0 rounded-full",
          glassShadow,
        )}
      />
      <span
        className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden rounded-full bg-white/15"
        style={{
          backdropFilter: 'blur(2px) saturate(160%) url("#container-glass")',
          WebkitBackdropFilter: "blur(12px) saturate(160%)",
        }}
      />
      <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
        {children}
      </span>
      <GlassFilter />
    </>
  );
}

type LiquidButtonProps = {
  size?: Size;
  children?: ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentPropsWithoutRef<"a">, "children" | "className">)
  | ({ href?: undefined } & Omit<
      ComponentPropsWithoutRef<"button">,
      "children" | "className"
    >)
);

export function LiquidButton({
  className,
  children,
  size = "xl",
  href,
  ...props
}: LiquidButtonProps) {
  const classes = cn(shellClass, sizes[size], className);

  if (href) {
    const anchorProps = props as Omit<
      ComponentPropsWithoutRef<"a">,
      "children" | "className" | "href"
    >;
    return (
      <a href={href} className={classes} {...anchorProps}>
        <GlassLayers>{children}</GlassLayers>
      </a>
    );
  }

  const buttonProps = props as Omit<
    ComponentPropsWithoutRef<"button">,
    "children" | "className"
  >;
  return (
    <button type="button" className={classes} {...buttonProps}>
      <GlassLayers>{children}</GlassLayers>
    </button>
  );
}
