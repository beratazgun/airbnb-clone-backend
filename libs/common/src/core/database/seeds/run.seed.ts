import languageSeed from './language.seed';
import currencySeed from './currency.seed';
import timezoneSeed from './timezone.seed';
import mailTemplateSeed from './mailTemplate.seed';
import authProvidersSeed from './authStrategy.seed';
import countrySeed from './country.seed';
import regionSeed from './region.seed';
import localeCodesSeed from './localeCodes.seed';
import { guestTypeSeed } from './guestType.seed';
import { OpportunityCategorySeed } from './OpportunityCategory.seed';
import { oppurtunitySeed } from './opportunity.seed';
import { placeTypeSeed } from './placeType.seed';
import { propertyTypeSeed } from './propertyType.seed';

async function runSeed() {
  // await userSeed();
  await mailTemplateSeed();
  await timezoneSeed();
  await authProvidersSeed();
  await languageSeed();
  await regionSeed();
  await countrySeed();
  await currencySeed();
  await localeCodesSeed();
  await guestTypeSeed();
  await OpportunityCategorySeed();
  await oppurtunitySeed();
  await placeTypeSeed();
  await propertyTypeSeed();
}

runSeed();

export default runSeed;
