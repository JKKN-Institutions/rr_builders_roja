/**
 * Seed script: Creates the first client and owner user for BuildWise.
 *
 * Run with: npx tsx scripts/seed-client.ts
 *
 * This creates:
 * 1. A client record with API key (for the bridge agent)
 * 2. An owner user (for dashboard login)
 * 3. A dashboard_users record linking them
 */

import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Run from project root with .env.local loaded:");
  console.error("  npx tsx --env-file=.env.local scripts/seed-client.ts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seed() {
  const CLIENT_ID = "rr-thulasi-001";
  const COMPANY_NAME = "RR Thulasi Builders";
  const TALLY_COMPANY = "RR Thulasi Builders Pvt. Ltd.";

  // --- 1. Generate API Key ---
  const randomPart = randomBytes(24).toString("base64url");
  const prefix = randomPart.slice(0, 8);
  const apiKey = `bw_live_${randomPart}`;
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

  const masked = apiKey.slice(0, -4).replace(/./g, "*") + apiKey.slice(-4);
  console.log("\n=== API Key (SAVE THIS - shown only once) ===");
  console.log(`API Key: ${masked}`);
  console.log(`Prefix:  ${prefix}`);
  console.log("=============================================\n");
  console.log("Full API key is in the bridge agent config below.");

  // --- 2. Create client ---
  const { error: clientError } = await supabase.from("clients").upsert(
    {
      id: CLIENT_ID,
      company_name: COMPANY_NAME,
      api_key_prefix: prefix,
      api_key_hash: apiKeyHash,
      tally_company: TALLY_COMPANY,
    },
    { onConflict: "id" }
  );

  if (clientError) {
    console.error("Failed to create client:", clientError.message);
    process.exit(1);
  }
  console.log(`Client created: ${CLIENT_ID} (${COMPANY_NAME})`);

  // --- 3. Create owner user ---
  const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || "md@rrthulasi.com";
  const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || randomBytes(16).toString("base64url");

  const { data: userResult, error: userError } =
    await supabase.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      email_confirm: true,
      app_metadata: {
        client_id: CLIENT_ID,
        role: "owner",
      },
      user_metadata: {
        display_name: "RR Thulasi",
      },
    });

  if (userError) {
    if (userError.message.includes("already been registered")) {
      console.log(`User already exists: ${OWNER_EMAIL}`);
      // Update app_metadata for existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users.find((u) => u.email === OWNER_EMAIL);
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          app_metadata: { client_id: CLIENT_ID, role: "owner" },
          user_metadata: { display_name: "RR Thulasi" },
        });
        console.log("Updated existing user metadata");

        // Upsert dashboard_users
        await supabase.from("dashboard_users").upsert(
          {
            id: existing.id,
            client_id: CLIENT_ID,
            role: "owner",
            display_name: "RR Thulasi",
            email: OWNER_EMAIL,
          },
          { onConflict: "id" }
        );
      }
    } else {
      console.error("Failed to create user:", userError.message);
      process.exit(1);
    }
  } else if (userResult.user) {
    console.log(`Owner user created: ${OWNER_EMAIL}`);

    // --- 4. Create dashboard_users record ---
    const { error: dashError } = await supabase.from("dashboard_users").upsert(
      {
        id: userResult.user.id,
        client_id: CLIENT_ID,
        role: "owner",
        display_name: "RR Thulasi",
        email: OWNER_EMAIL,
      },
      { onConflict: "id" }
    );

    if (dashError) {
      console.error("Failed to create dashboard user:", dashError.message);
    } else {
      console.log("Dashboard user record created");
    }
  }

  // --- Summary ---
  console.log("\n=== Setup Complete ===");
  console.log(`Dashboard: https://buildwise-mvp.vercel.app`);
  console.log(`Login: ${OWNER_EMAIL} / [password set via SEED_OWNER_PASSWORD env var or generated randomly — check output above if generated]`);
  // Mask the API key in bridge config output (show first 12 + last 4 chars)
  const maskedKey = apiKey.slice(0, 12) + "****" + apiKey.slice(-4);
  console.log(`\nBridge Agent config.json (API key masked — use the actual key from above):`);
  console.log(
    JSON.stringify(
      {
        cloud: {
          apiUrl: "http://localhost:3000/api/tally",
          apiKeyEncrypted: maskedKey,
          clientId: CLIENT_ID,
        },
      },
      null,
      2
    )
  );
  console.log("\n=== Done ===\n");
}

seed().catch(console.error);
