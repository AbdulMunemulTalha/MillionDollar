// Centralized environment access.
//
// Secrets are exposed through lazy getters so that merely importing a module
// which references `serverEnv` never throws at build time when a variable is
// unset — the throw only happens the moment a secret is actually read at
// request time. This keeps `next build` working before .env.local is filled in.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseServiceRoleKey(): string {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get polarAccessToken(): string {
    return required("POLAR_ACCESS_TOKEN");
  },
  get polarProductId(): string {
    return required("POLAR_PRODUCT_ID");
  },
  /** "sandbox" (default) or "production". Flip via POLAR_SERVER when going live. */
  get polarServer(): "sandbox" | "production" {
    return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
  },
} as const;

export const publicEnv = {
  /** Absolute base URL used as a fallback when the request origin is unavailable. */
  get appUrl(): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return raw.replace(/\/+$/, "");
  },
} as const;
