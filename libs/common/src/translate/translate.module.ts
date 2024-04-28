import { Global, Module, DynamicModule } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

@Global()
@Module({})
export class TranslateModule {
  static forRoot(path: string): DynamicModule {
    return {
      module: TranslateModule,
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'tr', // default language
          fallbacks: {
            'tr-TR': 'tr',
            'en-US': 'en',
            'en-EN': 'en',
            'de-DE': 'de',
            'az-AZ': 'az',
            'ky-KG': 'ky',
          },
          loaderOptions: {
            path,
            watch: true,
          },
          resolvers: [
            { use: QueryResolver, options: ['locale'] },
            AcceptLanguageResolver,
          ],
        }),
      ],
      providers: [TranslateService],
      exports: [TranslateService],
    };
  }
}
