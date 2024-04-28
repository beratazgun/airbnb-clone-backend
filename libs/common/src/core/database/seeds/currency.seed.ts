import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import GeneratorManager from '@common/core/helpers/GeneratorManager';

const prisma = new PrismaClient();

async function currencySeed() {
  await prisma.currency.createMany({
    data: [
      {
        currencySymbol: '$',
        unicodeSymbol: '$',
        currencyCode: 'usd',
        currencyCodeUpperCase: 'USD',
        currencyName: 'united states dollar',
      },
      {
        currencyName: 'turkish lira',
        currencyCode: 'try',
        currencyCodeUpperCase: 'TRY',
        currencySymbol: '₺',
        unicodeSymbol: '₺',
      },
      {
        currencyName: 'euro',
        currencyCode: 'eur',
        currencyCodeUpperCase: 'EUR',
        currencySymbol: '€',
        unicodeSymbol: '€',
      },
      {
        currencyName: 'pound sterling',
        currencyCode: 'gbp',
        currencyCodeUpperCase: 'GBP',
        currencySymbol: '£',
        unicodeSymbol: '£',
      },
      {
        currencyName: 'Azerbaijani manat',
        currencyCode: 'azn',
        currencyCodeUpperCase: 'AZN',
        currencySymbol: '₼',
        unicodeSymbol: '₼',
      },
      {
        currencyName: 'Kyrgyzstani som',
        currencyCode: 'kgs',
        currencyCodeUpperCase: 'KGS',
        currencySymbol: 'с',
        unicodeSymbol: 'с',
      },
    ],
  });
}

export default currencySeed;
