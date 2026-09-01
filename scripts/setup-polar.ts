/**
 * One-time setup: create (or reuse) the pay-what-you-want product that powers
 * dynamic checkouts. Run with:
 *
 *   npm run setup:polar
 *
 * It reads POLAR_ACCESS_TOKEN / POLAR_SERVER / POLAR_ORGANIZATION_ID from
 * .env.local, then prints the POLAR_PRODUCT_ID line to paste back into
 * .env.local.
 */
import { Polar } from "@polar-sh/sdk";

const PRODUCT_NAME = "MillionDollar Ranking Spot";
const PRODUCT_DESCRIPTION =
  "Pay what you want (minimum $10) to claim your spot on the MillionDollar board. Pay more than the current #1 to seize the crown.";

async function main() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Missing POLAR_ACCESS_TOKEN in .env.local");
    process.exit(1);
  }
  const server =
    process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
  const organizationId = process.env.POLAR_ORGANIZATION_ID || undefined;

  const polar = new Polar({ accessToken, server });

  console.log(`Using Polar ${server}${organizationId ? ` (org ${organizationId})` : ""}`);

  // Reuse an existing product with the same name if one exists.
  try {
    const pages = await polar.products.list({
      query: PRODUCT_NAME,
      organizationId,
      limit: 100,
    });
    for await (const page of pages) {
      for (const p of page.result.items) {
        if (p.name === PRODUCT_NAME && !p.isArchived) {
          console.log(`Reusing existing product ${p.id}`);
          printResult(p.id);
          return;
        }
      }
    }
  } catch (err) {
    console.warn("Could not list existing products, will create a new one:", err);
  }

  const product = await polar.products.create({
    name: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    recurringInterval: null,
    prices: [
      {
        amountType: "custom",
        priceCurrency: "usd",
        minimumAmount: 1000, // $10 floor enforced by Polar
        presetAmount: 1000,
      },
    ],
    organizationId,
  });

  console.log(`Created product ${product.id}`);
  printResult(product.id);
}

function printResult(productId: string) {
  console.log("\nAdd this to .env.local:\n");
  console.log(`POLAR_PRODUCT_ID=${productId}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
