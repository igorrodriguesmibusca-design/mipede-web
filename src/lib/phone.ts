export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatBrazilPhone(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isCompleteBrazilMobile(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length === 11;
}

export function maskWhatsapp(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length < 10) return value;
  const ddd = digits.slice(0, 2);
  const last = digits.slice(-4);
  return `(${ddd}) ${digits[2] ?? "9"} ****-${last}`;
}
