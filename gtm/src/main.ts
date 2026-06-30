import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const protocoloDesarrollo = 'http';
  const origenesPermitidos = (
    process.env.CORS_ORIGINS ??
    `${protocoloDesarrollo}://localhost:5173,${protocoloDesarrollo}://127.0.0.1:5173,${protocoloDesarrollo}://[::1]:5173`
  )
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origenesPermitidos,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
