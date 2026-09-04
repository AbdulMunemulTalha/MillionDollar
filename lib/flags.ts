// Product feature flags — pure constants, safe to import on client and server.

/**
 * Master switch for monetization.
 *
 * FALSE = free mode: anyone can add a product to the board for free and rank
 * purely by clicks. This is the launch / traction phase.
 *
 * TRUE = paid mode: the original Polar pay-to-list / pay-to-take-#1 flow.
 *
 * Everything payment-related is GATED on this flag, never deleted — the Polar
 * client, checkout route, webhook, pricing math, and amount-based ranking all
 * stay in the codebase and go live again the moment this flips back to true.
 */
export const PAYMENTS_ENABLED = false;
