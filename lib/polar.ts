import "server-only";
import { Polar } from "@polar-sh/sdk";
import { serverEnv } from "./env";

let client: Polar | null = null;

/** Server-only Polar client, pointed at sandbox or production per POLAR_SERVER. */
export function createPolarClient(): Polar {
  if (client) return client;
  client = new Polar({
    accessToken: serverEnv.polarAccessToken,
    server: serverEnv.polarServer,
  });
  return client;
}
