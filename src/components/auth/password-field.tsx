"use client";

import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { passwordStrength } from "@/server/passwords";
import { cn } from "@/lib/utils";

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = "new-password",
  showStrength = false,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  showStrength?: boolean;
}) {
  const strength = useMemo(() => passwordStrength(value), [value]);

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <Input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        value={value}
        minLength={10}
        maxLength={128}
        onChange={(event) => onChange(event.target.value)}
      />
      {showStrength && value ? (
        <div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  strength.score > item ? "bg-brand" : "bg-zinc-200",
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-subtle">{strength.label}</p>
        </div>
      ) : null}
    </label>
  );
}
