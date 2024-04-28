import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function mailTemplateSeed() {
  await prisma.mailTemplates.createMany({
    data: [
      {
        templateName: 'WELCOME',
        templateFileName: 'welcome.hbs',
        subject: 'Please confirm your email',
      },
      {
        templateName: 'FORGOT_PASSWORD',
        templateFileName: 'forgot-password.hbs',
        subject: 'Reset your password',
      },
      {
        templateName: 'UPDATE_EMAIL',
        templateFileName: 'update-email.hbs',
        subject: 'Please verify your new email',
      },
      {
        templateName: 'EMAIL_ADDRESS_HAS_BEEN_CHANGED',
        templateFileName: 'email-address-has-been-changed.hbs',
        subject: 'Account activity: Your email address has been changed',
      },
      {
        templateName: 'PASSWORD_HAS_BEEN_CHANGED',
        templateFileName: 'password-has-been-changed.hbs',
        subject: 'Account activity: Your password has been changed',
      },
    ],
  });
}

export default mailTemplateSeed;
