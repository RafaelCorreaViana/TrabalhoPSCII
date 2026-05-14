import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  const events = await prisma.event.findMany({
    include: { teams: true, registrations: true }
  });
  console.log('Events:', events.map(e => ({
    id: e.id,
    name: e.name,
    teamsCount: e.teams.length,
    regsCount: e.registrations.length,
    teams: e.teams.map(t => t.name)
  })));

  const venues = await prisma.venue.findMany();
  console.log('Venues:', venues.map(v => ({ id: v.id, name: v.name })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
