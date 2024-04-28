import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function oppurtunitySeed() {
  const categories = await prisma.opportunityCategory.findMany();

  await prisma.opportunity.createMany({
    data: [
      {
        opportunity: 'wifi',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'internet and office',
        )?.id,
      },
      {
        opportunity: 'private workspace',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'internet and office',
        )?.id,
      },
      {
        opportunity: 'kitchen',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'kitchen and dining',
        )?.id,
      },
      {
        opportunity: 'microwave oven',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'kitchen and dining',
        )?.id,
      },
      {
        opportunity: 'basic ingredients for cooking',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'kitchen and dining',
        )?.id,
      },
      {
        opportunity: 'dinnerware and cutlery',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'kitchen and dining',
        )?.id,
      },
      {
        opportunity: 'beach access - Seafront',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'location features',
        )?.id,
        opportunityDescription: 'guests can enjoy a nearby beach',
      },
      {
        opportunity: 'separate entrance',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'location features',
        )?.id,
        opportunityDescription: 'a separate street or building entrance',
      },
      {
        opportunity: 'garden furniture',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'open area',
        )?.id,
      },
      {
        opportunity: 'outdoor dining area',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'open area',
        )?.id,
      },
      {
        opportunity: 'free parking in the building',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'parking and facilities',
        )?.id,
      },
      {
        opportunity: 'free parking on the street',
        opportunityCategoryID: categories.find(
          (c) => c.category === 'parking and facilities',
        )?.id,
      },
      {
        opportunity: 'breakfast',
        opportunityCategoryID: categories.find((c) => c.category === 'services')
          ?.id,
        opportunityDescription: 'Breakfast is offered',
      },
      {
        opportunity: 'self login',
        opportunityCategoryID: categories.find((c) => c.category === 'services')
          ?.id,
      },
    ],
  });
}

//  id
//   opportunity
//   opportunityCategoryID
//   opportunityDescription
