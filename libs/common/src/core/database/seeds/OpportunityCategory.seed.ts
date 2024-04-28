import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function OpportunityCategorySeed() {
  await prisma.opportunityCategory.createMany({
    data: [
      {
        category: 'accessibility',
      },
      {
        category: 'bath',
      },
      {
        category: 'bedroom and laundry facilities',
      },
      {
        category: 'entertainment',
      },
      {
        category: 'family',
      },
      {
        category: 'heating and cooling',
      },
      {
        category: 'home security',
      },
      {
        category: 'internet and office',
      },
      {
        category: 'kitchen and dining',
      },
      {
        category: 'washing',
      },
      {
        category: 'location features',
      },
      {
        category: 'open area',
      },
      {
        category: 'parking and facilities',
      },
      {
        category: 'services',
      },
    ],
  });
}
