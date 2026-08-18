import { cn } from "@/lib/utils";

export function StoreMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={cn("size-full", className)}
      aria-hidden="true"
    >
      <rect width="160" height="160" rx="16" fill="#111111" />
      <path
        d="M80 22l8 18h20l-16 12 6 18-18-12-18 12 6-18-16-12h20L80 22z"
        fill="#D4AF37"
      />
      <text
        x="80"
        y="86"
        textAnchor="middle"
        fill="#D4AF37"
        fontFamily="Georgia, serif"
        fontSize="18"
        letterSpacing="3"
      >
        PIZZARIA
      </text>
      <text
        x="80"
        y="116"
        textAnchor="middle"
        fill="#F5F0E6"
        fontFamily="Georgia, serif"
        fontSize="26"
        fontWeight="700"
      >
        IMPERIAL
      </text>
      <text
        x="80"
        y="136"
        textAnchor="middle"
        fill="#D4AF37"
        fontFamily="Georgia, serif"
        fontSize="10"
        letterSpacing="2"
      >
        DESDE 2010
      </text>
    </svg>
  );
}
