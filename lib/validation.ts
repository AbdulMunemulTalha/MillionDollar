import { z } from "zod";

/**
 * Request body for the checkout API. `url` is validated loosely here (a bare
 * domain like "trycomp.ai" is allowed) and normalized in the route. The display
 * name is derived from the URL, so there is no separate name field.
 *
 * `amountCents` is the amount the user *chose*; the server independently
 * recomputes the required floor and never trusts this value as sufficient.
 */
export const submitSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter your product URL")
    .max(2048, "URL is too long"),
  amountCents: z
    .number("Enter an amount")
    .int()
    .nonnegative()
    .max(100_000_000, "That is a suspiciously large amount"),
  /** true = trying to seize #1; false/undefined = just get listed. */
  claimTop: z.boolean().optional(),
});

export type SubmitInput = z.infer<typeof submitSchema>;

/**
 * Request body for the free submission API (payments disabled). There is no
 * amount because listing is free and ranking is by clicks. Name and email are
 * collected in the submission popup. The URL is validated loosely here and
 * normalized in the route, exactly like above.
 */
export const freeSubmitSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter your product URL")
    .max(2048, "URL is too long"),
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Name is too long"),
  email: z
    .email("Enter a valid email")
    .trim()
    .max(254, "Email is too long"),
});

export type FreeSubmitInput = z.infer<typeof freeSubmitSchema>;
