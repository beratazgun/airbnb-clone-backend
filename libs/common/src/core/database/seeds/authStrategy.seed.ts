import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function authStrategySeed() {
  await prisma.authStrategy.createMany({
    data: [
      {
        id: 1,
        strategyName: 'google',
        strategyNameUpperCase: 'GOOGLE',
      },
      {
        id: 2,
        strategyName: 'facebook',
        strategyNameUpperCase: 'FACEBOOK',
      },
      {
        id: 3,
        strategyName: 'apple',
        strategyNameUpperCase: 'APPLE',
      },
      {
        id: 4,
        strategyName: 'local',
        strategyNameUpperCase: 'LOCAL',
      },
    ],
  });
}

export default authStrategySeed;
