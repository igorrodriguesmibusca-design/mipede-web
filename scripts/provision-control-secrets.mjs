import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const ACCOUNT_ID = "600db690d514ab366e873c99e89cc9fb";
const CONFIG = "workers/control-api/wrangler.toml";
const PLATFORM_ADMIN = "aliceecosta1425@gmail.com";
const TRUSTED = "https://mipede-web.vercel.app";

function wranglerToken() {
  const file = join(homedir(), "AppData/Roaming/xdg.config/.wrangler/config/default.toml");
  const text = readFileSync(file, "utf8");
  const match = text.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("oauth token missing");
  return match[1];
}

function putSecret(env, name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      ["exec", "wrangler", "secret", "put", name, "--env", env, "--config", CONFIG],
      { stdio: ["pipe", "inherit", "inherit"], shell: true },
    );
    child.stdin.write(value);
    child.stdin.end();
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${name} ${env} failed`))));
  });
}

async function createWidget(token, name) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/challenges/widgets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      domains: ["mipede-web.vercel.app"],
      mode: "managed",
    }),
  });
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(`turnstile ${name} failed`);
  }
  return { sitekey: payload.result.sitekey, secret: payload.result.secret };
}

const envName = process.argv[2];
if (envName !== "staging" && envName !== "production") {
  throw new Error("usage: node provision-control-secrets.mjs staging|production");
}

const token = wranglerToken();
const authSecret = randomBytes(48).toString("base64url");
const bffSecret = randomBytes(48).toString("base64url");
const widget = await createWidget(token, `mipede-${envName}`);

await putSecret(envName, "BETTER_AUTH_SECRET", authSecret);
await putSecret(envName, "MIPEDE_BFF_SHARED_SECRET", bffSecret);
await putSecret(envName, "TURNSTILE_SECRET_KEY", widget.secret);
await putSecret(envName, "PLATFORM_ADMIN_EMAILS", PLATFORM_ADMIN);
await putSecret(envName, "TRUSTED_ORIGINS", TRUSTED);

writeFileSync(`.secrets-${envName}.bff`, bffSecret, { mode: 0o600 });
writeFileSync(`.secrets-${envName}.turnstile-sitekey`, widget.sitekey, { mode: 0o600 });
process.stdout.write(`OK ${envName} turnstile_sitekey=${widget.sitekey}\n`);
