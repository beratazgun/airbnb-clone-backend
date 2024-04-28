import { PrismaClient } from '@prisma/client';
import * as moment from 'moment-timezone';
import GeneratorManager from '@common/core/helpers/GeneratorManager';

const prisma = new PrismaClient();

async function timezoneSeed() {
  const timezones = moment.tz.names().filter((timezone) => {
    return (
      timezone.includes('Africa') ||
      timezone.includes('America') ||
      timezone.includes('Asia') ||
      timezone.includes('Australia') ||
      timezone.includes('Europe') ||
      timezone.includes('Indian') ||
      timezone.includes('Pacific')
    );
  });

  try {
    await prisma.timezone.createMany({
      data: timezones.map((element) => {
        return {
          timezoneFullName: `(GMT,${moment.tz(element).format('Z')}) ${element}`,
          timezone: element.toLowerCase(),
        };
      }),
    });
  } catch (error) {
    console.log(error);
  }
}

export default timezoneSeed;
