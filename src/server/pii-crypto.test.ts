import { describe, expect, it } from "vitest";

import { decryptPii, encryptPii, hashEmailLookup } from "./pii-crypto";

describe("PII", () => {
  it("criptografa e descriptografa sem guardar texto puro", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const packed = await encryptPii(key, "Igor Rodrigues");
    expect(packed.startsWith("v1.")).toBe(true);
    expect(packed.includes("Igor")).toBe(false);
    expect(await decryptPii(key, packed)).toBe("Igor Rodrigues");
  });

  it("HMAC do e-mail é determinístico e irreversível", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const first = await hashEmailLookup(key, "I.RodriguesC507@gmail.com");
    const second = await hashEmailLookup(key, "i.rodriguesc507@gmail.com");
    expect(first).toBe(second);
    expect(first).not.toContain("@");
  });
});
