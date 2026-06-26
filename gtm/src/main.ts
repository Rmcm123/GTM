import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origenesPermitidos = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://[::1]:5173',
  ];

  app.enableCors({
    origin: origenesPermitidos,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
