import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function languageSeed() {
  await prisma.language.createMany({
    data: [
      {
        id: 1,
        language: 'english',
      },
      {
        id: 2,
        language: 'turkish',
      },
      {
        id: 3,
        language: 'german',
      },
      {
        id: 4,
        language: 'azerbaijani',
      },
      {
        id: 5,
        language: 'kyrgyz',
      },
    ],
  });
}

export default languageSeed;
