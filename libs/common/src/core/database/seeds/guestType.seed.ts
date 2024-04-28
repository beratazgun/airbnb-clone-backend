import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function guestTypeSeed() {
  await prisma.guestType.createMany({
    data: [
      {
        id: 1,
        guestType: 'child',
        ageRangeStart: 2,
        ageRangeEnd: 12,
      },
      {
        id: 2,
        guestType: 'adult',
        ageRangeStart: 13,
      },
      {
        id: 3,
        guestType: 'baby',
        ageRangeStart: 0,
        ageRangeEnd: 2,
      },
      {
        id: 4,
        guestType: 'pets',
      },
    ],
  });
}
