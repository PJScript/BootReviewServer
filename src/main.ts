import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieparser  from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000','https://bootview.info'],
    methods: 'GET,PATCH,POST,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: ['Authorization','Set-Cookie']
  })
  app.use(cookieparser())

  await app.listen(4000);
}
bootstrap();
