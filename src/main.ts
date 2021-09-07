import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieparser  from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [/^(.*)/,],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  })
  app.use(cookieparser())
  await app.listen(4000);
}
bootstrap();
