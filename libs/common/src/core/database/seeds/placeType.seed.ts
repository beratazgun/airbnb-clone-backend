import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function placeTypeSeed() {
  await prisma.placeType.createMany({
    data: [
      {
        placeType: 'the whole house',
      },
      {
        placeType: 'room',
      },
    ],
  });
}
