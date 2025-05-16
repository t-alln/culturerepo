const { PrismaClient, MediaType } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  // Create anonymous user
  const user = await prisma.user.upsert({
    where: { email: "anonymous@example.com" },
    update: {},
    create: {
      id: "anonymous",
      name: "Anonymous User",
      email: "anonymous@example.com",
    },
  });

  console.log(`Created user: ${user.name}`);

  // Create sample entries
  const entries = [
    {
      term: "Fleek",
      description: "Looking perfect",
      mediaType: MediaType.IMAGE,
      mediaUrl: "https://placekitten.com/800/600",
      userId: user.id,
    },
    {
      term: "Vibe Check",
      description: "Assessing someone's mood or energy",
      mediaType: MediaType.IMAGE,
      mediaUrl: "https://placekitten.com/801/600",
      userId: user.id,
    },
    {
      term: "GOAT",
      description: "Greatest Of All Time",
      mediaType: MediaType.IMAGE,
      mediaUrl: "https://placekitten.com/802/600",
      userId: user.id,
    },
  ];

  for (const entry of entries) {
    const createdEntry = await prisma.entry.create({
      data: entry,
    });
    console.log(`Created entry: ${createdEntry.term}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
