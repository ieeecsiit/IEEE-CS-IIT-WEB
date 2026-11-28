export type Env = {
  DB: D1Database;
  FILES: R2Bucket;
  /** Cloudflare Access team domain, e.g. "ieeecsiit.cloudflareaccess.com". */
  CF_ACCESS_TEAM_DOMAIN?: string;
  /** "Application Audience (AUD) Tag" of the Access application that covers /admin and /api/admin. */
  CF_ACCESS_AUD?: string;
  /** Optional extra allow-list (comma separated). Access policies are the main gate. */
  ADMIN_EMAILS?: string;
  /** Turnstile secret key. When set, submissions must carry a valid Turnstile token. */
  TURNSTILE_SECRET_KEY?: string;
  /** Local development only (.dev.vars): sign in to the admin API as this email on localhost. */
  DEV_ADMIN_EMAIL?: string;
};

export type AdminData = { email: string };

export type PublicContext = EventContext<Env, string, Record<string, unknown>>;
export type AdminContext = EventContext<Env, string, AdminData>;
