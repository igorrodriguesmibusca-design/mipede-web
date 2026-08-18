import { cn } from "@/lib/utils";

type MipedeMarkProps = {
  className?: string;
  inverted?: boolean;
};

export function MipedeMark({ className, inverted = false }: MipedeMarkProps) {
  const fill = inverted ? "#FF5C00" : "#ffffff";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("size-full", className)}
    >
      <path
        d="M12 24c0-10 9-18 20-18s20 8 20 18v3H12v-3Z"
        fill={fill}
      />
      <path
        d="M8 24c2-6 6-8 10-8"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="26" cy="34" r="2.2" fill={fill} />
      <circle cx="38" cy="34" r="2.2" fill={fill} />
      <path
        d="M24 42c3 3 13 3 16 0"
        stroke={fill}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M22 46h20c1.4 4 1.4 8 0 12H22c-1.4-4-1.4-8 0-12Z"
        fill={fill}
      />
      <circle cx="32" cy="54" r="1.6" fill={inverted ? "#ffffff" : "#FF5C00"} />
    </svg>
  );
}

export function MipedeLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand">
        <MipedeMark className="size-7" />
      </span>
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight text-ink">MiPede</span>
      ) : null}
    </div>
  );
}
