import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function localeCodesSeed() {
  const regions = await prisma.region.findMany();

  await prisma.country.createMany({
    data: [
      {
        id: 1,
        country: 'turkey',
        regionID: regions.find((region) => region.region === 'europe').id,
        phoneCode: '+90',
      },
      {
        id: 2,
        country: 'england',
        regionID: regions.find((region) => region.region === 'europe').id,
        phoneCode: '+44',
      },
      {
        id: 3,
        country: 'united states of america',
        regionID: regions.find((region) => region.region === 'americas').id,
        phoneCode: '+1',
      },
      {
        id: 4,
        country: 'united kingdom',
        regionID: regions.find((region) => region.region === 'americas').id,
        phoneCode: '+1',
      },
      {
        id: 5,
        country: 'germany',
        regionID: regions.find((region) => region.region === 'europe').id,
        phoneCode: '+49',
      },
      {
        id: 6,
        country: 'azerbaijan',
        regionID: regions.find((region) => region.region === 'asia').id,
        phoneCode: '+994',
      },
      {
        id: 7,
        country: 'kyrgyzstan',
        regionID: regions.find((region) => region.region === 'asia').id,
        phoneCode: '+996',
      },
    ],
  });
}

export default localeCodesSeed;
