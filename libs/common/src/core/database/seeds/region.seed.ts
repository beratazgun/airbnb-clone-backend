import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { flatMap, uniqBy } from 'lodash';
import GeneratorManager from '@common/core/helpers/GeneratorManager';

const prisma = new PrismaClient();

async function regionSeed() {
  await prisma.region.createMany({
    data: [
      {
        id: 1,
        region: 'europe',
      },
      {
        id: 2,
        region: 'asia',
      },
      {
        id: 3,
        region: 'africa',
      },
      {
        id: 4,
        region: 'oceania',
      },
      {
        id: 5,
        region: 'americas',
      },
      {
        id: 6,
        region: 'polar',
      },
    ],
  });
}

export default regionSeed;
