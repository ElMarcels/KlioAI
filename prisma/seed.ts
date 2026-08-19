import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLANS = [
  {
    name: "Free",
    type: "FREE" as const,
    price: new Prisma.Decimal(0),
    interval: "month",
    features: ["50 messages per day", "Klio Core", "Klio Code", "Klio Study", "50K tokens per day", "Community support"],
    messageLimit: 50,
    tokenLimit: 100000,
    isActive: true,
    displayOrder: 0,
  },
  {
    name: "Pro",
    type: "PRO" as const,
    price: new Prisma.Decimal(19),
    interval: "month",
    features: ["Unlimited messages", "All AI models", "500K tokens per day", "Priority support", "Advanced analytics", "API access"],
    messageLimit: -1,
    tokenLimit: 500000,
    isActive: true,
    displayOrder: 1,
  },
  {
    name: "Enterprise",
    type: "ENTERPRISE" as const,
    price: new Prisma.Decimal(99),
    interval: "month",
    features: ["Everything in Pro", "Unlimited tokens", "Custom models", "Dedicated support", "SLA guarantee", "SSO & team management"],
    messageLimit: -1,
    tokenLimit: -1,
    isActive: true,
    displayOrder: 2,
  },
];

const MODELS = [
  { id: "klio-core", name: "Klio Core", displayName: "Klio Core", description: "General purpose AI assistant for everyday tasks", icon: "Bot", provider: "google", modelId: "gemini-2.0-flash", tier: "FREE" as const, supportsVision: false, supportsCode: false, displayOrder: 0 },
  { id: "klio-code", name: "Klio Code", displayName: "Klio Code", description: "Expert programming assistant", icon: "Code2", provider: "google", modelId: "gemini-2.0-flash", tier: "FREE" as const, supportsVision: false, supportsCode: true, displayOrder: 1 },
  { id: "klio-study", name: "Klio Study", displayName: "Klio Study", description: "Learning and education companion", icon: "GraduationCap", provider: "google", modelId: "gemini-2.0-flash", tier: "FREE" as const, supportsVision: false, supportsCode: false, displayOrder: 2 },
  { id: "klio-writer", name: "Klio Writer", displayName: "Klio Writer", description: "Creative writing and content creation", icon: "PenTool", provider: "google", modelId: "gemini-2.0-flash", tier: "PRO" as const, supportsVision: false, supportsCode: false, displayOrder: 3 },
  { id: "klio-research", name: "Klio Research", displayName: "Klio Research", description: "Deep research and analysis assistant", icon: "Search", provider: "google", modelId: "gemini-2.0-flash", tier: "PRO" as const, supportsVision: false, supportsCode: false, displayOrder: 4 },
  { id: "klio-vision", name: "Klio Vision", displayName: "Klio Vision", description: "Image understanding and visual analysis", icon: "Eye", provider: "google", modelId: "gemini-2.0-flash", tier: "PRO" as const, supportsVision: true, supportsCode: false, displayOrder: 5 },
];

async function main() {
  console.log("Seeding database...");

  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        type: plan.type,
        price: plan.price,
        interval: plan.interval,
        features: plan.features,
        messageLimit: plan.messageLimit,
        tokenLimit: plan.tokenLimit,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      },
      create: plan,
    });
  }
  console.log(`Seeded ${PLANS.length} plans`);

  for (const model of MODELS) {
    await prisma.model.upsert({
      where: { name: model.name },
      update: {
        displayName: model.displayName,
        description: model.description,
        icon: model.icon,
        provider: model.provider,
        modelId: model.modelId,
        tier: model.tier,
        supportsVision: model.supportsVision,
        supportsCode: model.supportsCode,
        displayOrder: model.displayOrder,
        isActive: true,
        config: {},
      },
      create: {
        id: model.id,
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        icon: model.icon,
        provider: model.provider,
        modelId: model.modelId,
        tier: model.tier,
        supportsVision: model.supportsVision,
        supportsCode: model.supportsCode,
        displayOrder: model.displayOrder,
        isActive: true,
        config: {},
      },
    });
  }
  console.log(`Seeded ${MODELS.length} models`);

  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@klioai.com" },
    update: {
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      plan: "FREE",
    },
    create: {
      name: "Admin",
      email: "admin@klioai.com",
      password: hashedPassword,
      role: "ADMIN",
      plan: "FREE",
    },
  });
  console.log("Seeded admin user (admin@klioai.com)");

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
