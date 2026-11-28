import type { Env } from "./env";
import { HttpError } from "./http";

/**
 * Verifies the Cloudflare Access token on admin requests.
 *
 * Access already blocks anyone not on its policy before a request reaches us. Checking the
 * signed token here as well means the admin API stays closed even if the Access application
 * is misconfigured, deleted, or the site is reached through another hostname (like *.pages.dev).
 */

type Jwk = JsonWebKey & { kid: string };
let keyCache: { domain: string; keys: Map<string, CryptoKey>; fetchedAt: number } | null = null;

async function getKeys(domain: string, forceRefresh = false) {
  if (!forceRefresh && keyCache && keyCache.domain === domain && Date.now() - keyCache.fetchedAt < 10 * 60_000) {
    return keyCache.keys;
  }
  const response = await fetch(`https://${domain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new HttpError(503, "Could not reach Cloudflare Access to check your sign-in.");
  const { keys } = (await response.json()) as { keys: Jwk[] };
  const imported = new Map<string, CryptoKey>();
  for (const jwk of keys) {
    imported.set(
      jwk.kid,
      await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]),
    );
  }
  keyCache = { domain, keys: imported, fetchedAt: Date.now() };
  return imported;
}

function base64UrlDecode(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function getToken(request: Request) {
  const header = request.headers.get("cf-access-jwt-assertion");
  if (header) return header;
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1] ?? null;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Returns the signed-in admin's email, or throws 401/403. */
export async function requireAdmin(request: Request, env: Env): Promise<string> {
  // Local development: `wrangler pages dev` has no Access in front of it.
  if (env.DEV_ADMIN_EMAIL && LOCAL_HOSTS.has(new URL(request.url).hostname)) {
    return env.DEV_ADMIN_EMAIL.toLowerCase();
  }

  const domain = env.CF_ACCESS_TEAM_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const audience = env.CF_ACCESS_AUD;
  if (!domain || !audience) {
    // Fail closed: never serve admin data when sign-in is not set up.
    throw new HttpError(503, "The admin panel's sign-in is not configured yet (CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD).");
  }

  const token = getToken(request);
  if (!token) throw new HttpError(401, "Please sign in.");

  const parts = token.split(".");
  if (parts.length !== 3) throw new HttpError(401, "Please sign in again.");
  let header: { kid?: string; alg?: string };
  let payload: { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
  } catch {
    throw new HttpError(401, "Please sign in again.");
  }
  if (header.alg !== "RS256" || !header.kid) throw new HttpError(401, "Please sign in again.");

  let keys = await getKeys(domain);
  if (!keys.has(header.kid)) keys = await getKeys(domain, true); // Access rotates its keys
  const key = keys.get(header.kid);
  if (!key) throw new HttpError(401, "Please sign in again.");

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlDecode(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) throw new HttpError(401, "Please sign in again.");

  const nowSeconds = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) throw new HttpError(401, "Please sign in again.");
  if (payload.iss !== `https://${domain}`) throw new HttpError(401, "Please sign in again.");
  if (!payload.exp || payload.exp < nowSeconds - 30) throw new HttpError(401, "Your sign-in has expired. Please sign in again.");
  if (payload.nbf && payload.nbf > nowSeconds + 30) throw new HttpError(401, "Please sign in again.");

  const email = payload.email?.toLowerCase();
  if (!email) throw new HttpError(403, "This sign-in has no email address.");

  const allowList = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowList.length && !allowList.includes(email)) throw new HttpError(403, `${email} is not an admin.`);

  return email;
}
