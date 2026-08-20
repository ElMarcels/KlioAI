import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "mnartves@gmail.com" },
    update: {
      role: "ADMIN",
      plan: "PRO",
    },
    create: {
      email: "mnartves@gmail.com",
      name: "Owner",
      role: "ADMIN",
      plan: "PRO",
    },
  });

  console.log("User updated:", user);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
