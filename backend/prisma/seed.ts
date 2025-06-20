import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Apaga dados antigos para evitar conflito
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  // Cria usuários
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Collaborator',
      email: 'alice@example.com',
      password: 'hashed_password_1',
      roles: {
        create: [{ role: Role.COLLABORATOR }],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Manager',
      email: 'bob@example.com',
      password: 'hashed_password_2',
      roles: {
        create: [{ role: Role.MANAGER }],
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Carol HR',
      email: 'carol@example.com',
      password: 'hashed_password_3',
      roles: {
        create: [{ role: Role.HR }],
      },
    },
  });

  console.log({ user1, user2, user3 });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
