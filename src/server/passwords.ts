const COMMON_PASSWORDS = new Set(
  [
    "1234567890",
    "password12",
    "password123",
    "qwerty1234",
    "qwertyuiop",
    "1111111111",
    "0000000000",
    "abc1234567",
    "senha12345",
    "mipede1234",
    "admin12345",
    "administrador",
    "12345678910",
    "iloveyou12",
    "letmein123",
    "welcome123",
    "changeme12",
    "passw0rd12",
    "pizzaria123",
    "restaurant1",
  ].map((item) => item.toLowerCase()),
);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  if (isCommonPassword(password)) score = Math.min(score, 1);

  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte", "Excelente"] as const;
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] };
}
