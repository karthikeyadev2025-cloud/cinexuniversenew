import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed default feature toggles
  await db
    .insert(schema.featureToggles)
    .values([
      { featureId: "ai_image_gen", name: "AI Image Generation", enabled: true, category: "ai" },
      { featureId: "ai_video_gen", name: "AI Video Generation", enabled: true, category: "ai" },
      { featureId: "ai_voice_gen", name: "AI Voice Generation", enabled: true, category: "ai" },
      { featureId: "casting_directory", name: "Casting Directory", enabled: true, category: "casting" },
      { featureId: "script_breakdown", name: "Script Breakdown", enabled: true, category: "production" },
      { featureId: "shot_listing", name: "Shot Listing", enabled: true, category: "production" },
      { featureId: "storyboarding", name: "Storyboarding", enabled: true, category: "production" },
      { featureId: "scheduling", name: "Scheduling", enabled: true, category: "production" },
      { featureId: "call_sheets", name: "Call Sheets", enabled: true, category: "production" },
      { featureId: "budgeting", name: "Budgeting", enabled: true, category: "production" },
    ])
    .onConflictDoNothing({ target: schema.featureToggles.featureId });

  // Seed default plans
  await db
    .insert(schema.plans)
    .values([
      {
        name: "Free",
        slug: "free",
        description: "For individuals exploring film production tools",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ["1 Project", "Basic Script Tools", "Community Access"],
      },
      {
        name: "Pro",
        slug: "pro",
        description: "For serious filmmakers and small teams",
        monthlyPrice: 1999,
        yearlyPrice: 19999,
        features: ["Unlimited Projects", "AI Generation", "Casting Tools", "Priority Support"],
        isPopular: true,
      },
      {
        name: "Enterprise",
        slug: "enterprise",
        description: "For studios and production houses",
        monthlyPrice: 4999,
        yearlyPrice: 49999,
        features: ["Everything in Pro", "Team Collaboration", "Custom Integrations", "Dedicated Manager"],
      },
    ])
    .onConflictDoNothing({ target: schema.plans.slug });

  console.log("Done.");
  process.exit(0);
}

seed();
