const KEY_VERSION = "v1";

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (const item of bytes) binary += String.fromCharCode(item);
  return btoa(binary);
}

function b64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function decodeKey(raw: string | undefined): Uint8Array | null {
  if (!raw) return null;
  try {
    const bytes = b64ToBytes(raw.trim());
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

export async function encryptPii(key: Uint8Array, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey("raw", key as BufferSource, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, new TextEncoder().encode(plaintext)));
  return `${KEY_VERSION}.${bytesToB64(iv)}.${bytesToB64(cipher)}`;
}

export async function decryptPii(key: Uint8Array, payload: string): Promise<string> {
  const [version, ivPart, dataPart] = payload.split(".");
  if (version !== KEY_VERSION || !ivPart || !dataPart) throw new Error("invalid_payload");
  const cryptoKey = await crypto.subtle.importKey("raw", key as BufferSource, "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(ivPart) as BufferSource }, cryptoKey, b64ToBytes(dataPart) as BufferSource);
  return new TextDecoder().decode(plain);
}

export async function hashEmailLookup(key: Uint8Array, email: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(email.trim().toLowerCase())),
  );
  return [...signature].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export async function hashInviteToken(token: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  return [...digest].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToB64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}
