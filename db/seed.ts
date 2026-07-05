import { getDb } from "../api/queries/connection";
import { achievements } from "./schema";

async function seed() {
  console.log("Seeding achievements...");

  const existing = await getDb().query.achievements.findMany();
  if (existing.length > 0) {
    console.log(`Already seeded with ${existing.length} achievements. Skipping.`);
    return;
  }

  const defaultAchievements = [
    { name: "First Steps", description: "Complete your first learning module", icon: "Footprints", category: "module" as const, requirementType: "modules_completed", requirementValue: 1, coinsReward: 50 },
    { name: "Streak Starter", description: "Maintain a 3-day learning streak", icon: "Flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 3, coinsReward: 100 },
    { name: "Week Warrior", description: "Maintain a 7-day learning streak", icon: "Flame", category: "streak" as const, requirementType: "streak_days", requirementValue: 7, coinsReward: 200 },
    { name: "History Buff", description: "Complete 3 History modules", icon: "Scroll", category: "domain" as const, requirementType: "history_modules", requirementValue: 3, coinsReward: 150 },
    { name: "Language Learner", description: "Complete 3 Language modules", icon: "Languages", category: "domain" as const, requirementType: "language_modules", requirementValue: 3, coinsReward: 150 },
    { name: "Food Explorer", description: "Complete 3 Food modules", icon: "Utensils", category: "domain" as const, requirementType: "food_modules", requirementValue: 3, coinsReward: 150 },
    { name: "Culture Keeper", description: "Complete 3 Dress modules", icon: "Shirt", category: "domain" as const, requirementType: "dress_modules", requirementValue: 3, coinsReward: 150 },
    { name: "Video Star", description: "Submit your first video assessment", icon: "Video", category: "assessment" as const, requirementType: "videos_submitted", requirementValue: 1, coinsReward: 100 },
    { name: "Halfway There", description: "Complete 50% of all assigned modules", icon: "Target", category: "milestone" as const, requirementType: "modules_percentage", requirementValue: 50, coinsReward: 300 },
    { name: "Master Scholar", description: "Complete all assigned modules", icon: "Crown", category: "milestone" as const, requirementType: "modules_percentage", requirementValue: 100, coinsReward: 500 },
  ];

  await getDb().insert(achievements).values(defaultAchievements);
  console.log(`Seeded ${defaultAchievements.length} achievements.`);
}

seed().catch(console.error);
