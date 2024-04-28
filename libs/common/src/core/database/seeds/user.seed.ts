import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import HashManager from '@common/core/helpers/HashManager';
import GeneratorManager from '@common/core/helpers/GeneratorManager';

const prisma = new PrismaClient();

async function userSeed() {
  try {
    const usersData: any[] = [];

    for (let index = 0; index < 20; index++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      usersData.push({
        fullName: faker.internet.userName({
          firstName,
          lastName,
        }),
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        password: await HashManager.hashPassword('Usrw123!_'),
        phone: faker.string.numeric({ length: 10 }),
        userSubID: Number(
          GeneratorManager.generateRandomId({
            length: 8,
            type: 'number',
          }),
        ),
        isEmailConfirmed: true,
        isPhoneConfirmed: true,
      });
    }

    await prisma.users.createMany({
      data: [
        ...usersData,
        {
          fullName: 'johndoe',
          firstName: 'john',
          lastName: 'doe',
          email: 'johndoe@gmail.com',
          password: await HashManager.hashPassword('Usrw123!_'),
          userSubID: Number(
            GeneratorManager.generateRandomId({
              length: 8,
              type: 'number',
            }),
          ),
          phone: faker.string.numeric({ length: 10 }),
          isEmailConfirmed: true,
          isPhoneConfirmed: true,
        },
      ],
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

export default userSeed;
