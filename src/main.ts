import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as cookieParser from 'cookie-parser';
import {NestExpressApplication} from "@nestjs/platform-express";
import * as process from "process";
import { join } from 'path';

async function bootstrap() {
  const PORT = process.env.PORT || 4000
  const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
  );
  app.use(cookieParser());
  app.disable('x-powered-by')
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 99,
      }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  app.enableCors({
    allowedHeaders:"*",
    origin: "http://localhost/*",
    methods: 'GET,POST,HEAD,DELETE,PATCH',
    credentials: true,
  });

  await app.listen(PORT, ()=> console.log(`Server run on PORT = ${PORT}`));
}
bootstrap();
