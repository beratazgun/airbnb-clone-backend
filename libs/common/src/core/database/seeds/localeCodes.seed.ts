import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function localeCodesSeed() {
  const countries = await prisma.country.findMany();
  const languages = await prisma.language.findMany();
  const currencies = await prisma.currency.findMany();

  await prisma.localeCodes.createMany({
    data: [
      {
        id: 1,
        localeCode: 'en-US',
        primaryLanguageSubtag: 'en',
        regionSubtag: 'US',
        countryID: countries.find((c) => c.id === 3).id,
        languageID: languages.find((l) => l.id === 1).id,
        currencyID: currencies.find((c) => c.currencyCode === 'usd').id,
      },
      {
        id: 2,
        localeCode: 'tr-TR',
        primaryLanguageSubtag: 'tr',
        regionSubtag: 'TR',
        countryID: countries.find((c) => c.id === 1).id,
        languageID: languages.find((l) => l.id === 2).id,
        currencyID: currencies.find((c) => c.currencyCode === 'try').id,
      },
      {
        id: 3,
        localeCode: 'en-EN',
        primaryLanguageSubtag: 'en',
        regionSubtag: 'EN',
        countryID: countries.find((c) => c.id === 4).id,
        languageID: languages.find((l) => l.id === 1).id,
        currencyID: currencies.find((c) => c.currencyCode === 'eur').id,
      },
      {
        id: 4,
        localeCode: 'de-DE',
        primaryLanguageSubtag: 'de',
        regionSubtag: 'DE',
        countryID: countries.find((c) => c.id === 5).id,
        languageID: languages.find((l) => l.id === 3).id,
        currencyID: currencies.find((c) => c.currencyCode === 'eur').id,
      },
      {
        id: 5,
        localeCode: 'az-AZ',
        primaryLanguageSubtag: 'az',
        regionSubtag: 'AZ',
        countryID: countries.find((c) => c.id === 6).id,
        languageID: languages.find((l) => l.id === 4).id,
        currencyID: currencies.find((c) => c.currencyCode === 'azn').id,
      },
      {
        id: 6,
        localeCode: 'ky-KG',
        primaryLanguageSubtag: 'ky',
        regionSubtag: 'KG',
        countryID: countries.find((c) => c.id === 7).id,
        languageID: languages.find((l) => l.id === 5).id,
        currencyID: currencies.find((c) => c.currencyCode === 'kgs').id,
      },
    ],
  });
}

export default localeCodesSeed;
