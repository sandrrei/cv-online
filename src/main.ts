import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  // Alterado para NestExpressApplication para permitir configurar views
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar a pasta de views e o motor Handlebars (hbs)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
