import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function propertyTypeSeed() {
  await prisma.propertyType.createMany({
    data: [
      {
        propertyType: 'house',
      },
      {
        propertyType: 'apartment',
      },
      {
        propertyType: 'warehouse',
      },
      {
        propertyType: 'boat',
      },
      {
        propertyType: 'shack',
      },
      {
        propertyType: 'castle',
      },
      {
        propertyType: 'hotel',
      },
      {
        propertyType: 'earth house',
      },
      {
        propertyType: 'farm',
      },
      {
        propertyType: 'tent',
      },
      {
        propertyType: 'tree house',
      },
    ],
  });
}
