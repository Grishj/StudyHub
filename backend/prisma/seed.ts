import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "NRB" },
      update: {},
      create: {
        name: "NRB",
        description: "Nepal Rastra Bank",
        icon: "🏦",
      },
    }),
    prisma.category.upsert({
      where: { name: "NTC" },
      update: {},
      create: {
        name: "NTC",
        description: "Nepal Telecom",
        icon: "📱",
      },
    }),
    prisma.category.upsert({
      where: { name: "NEA" },
      update: {},
      create: {
        name: "NEA",
        description: "Nepal Electricity Authority",
        icon: "⚡",
      },
    }),
    prisma.category.upsert({
      where: { name: "Federal" },
      update: {},
      create: {
        name: "Federal",
        description: "Federal Government",
        icon: "🏛️",
      },
    }),
  ]);

  console.log("Categories seeded:", categories);

  // Seed Achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { name: "First Steps" },
      update: {},
      create: {
        name: "First Steps",
        description: "Complete your first quiz",
        icon: "🎯",
        points: 10,
        criteria: { type: "quiz_completed", count: 1 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: "Study Streak" },
      update: {},
      create: {
        name: "Study Streak",
        description: "Maintain a 7-day study streak",
        icon: "🔥",
        points: 50,
        criteria: { type: "streak", days: 7 },
      },
    }),
    prisma.achievement.upsert({
      where: { name: "Quiz Master" },
      update: {},
      create: {
        name: "Quiz Master",
        description: "Score 100% in any quiz",
        icon: "🏆",
        points: 100,
        criteria: { type: "perfect_score", count: 1 },
      },
    }),
  ]);

  console.log("Achievements seeded:", achievements);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
