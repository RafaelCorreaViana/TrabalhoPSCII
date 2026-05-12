import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      status: true,
    }
  });
  console.log('--- Eventos no Banco ---');
  console.table(events);
}

main().catch(console.error).finally(() => prisma.$disconnect());
