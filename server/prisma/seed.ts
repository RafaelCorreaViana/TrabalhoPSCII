import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);

  // Criar organizador
  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@sporthub.com' },
    update: {},
    create: {
      name: 'Organizador Teste',
      email: 'organizador@sporthub.com',
      password_hash: passwordHash,
      role: 'ORGANIZER',
    },
  });

  // Criar Admin de Local
  const venueAdmin = await prisma.user.upsert({
    where: { email: 'admin@sporthub.com' },
    update: {},
    create: {
      name: 'Admin Local Teste',
      email: 'admin@sporthub.com',
      password_hash: passwordHash,
      role: 'VENUE_ADMIN',
    },
  });

  // Criar Jogadores
  const player1 = await prisma.user.upsert({
    where: { email: 'jogador1@sporthub.com' },
    update: {},
    create: {
      name: 'Jogador Um',
      email: 'jogador1@sporthub.com',
      password_hash: passwordHash,
      role: 'PLAYER',
    },
  });

  const player2 = await prisma.user.upsert({
    where: { email: 'jogador2@sporthub.com' },
    update: {},
    create: {
      name: 'Jogador Dois',
      email: 'jogador2@sporthub.com',
      password_hash: passwordHash,
      role: 'PLAYER',
    },
  });

  // Criar Quadra
  const venue = await prisma.venue.create({
    data: {
      name: 'Quadra Central Futsal',
      address: 'Rua Principal, 123',
      sportType: 'futsal',
      capacity: 10,
      adminId: venueAdmin.id,
    },
  });

  console.log({ organizer, venueAdmin, player1, player2, venue });
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
