import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // La conexion se configura desde .env para que cada integrante use
        // sus credenciales locales de PostgreSQL sin cambiar el codigo.
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'admin1234'),
        database: configService.get<string>('DB_DATABASE', 'gtm'),
        autoLoadEntities: true,
        // Solo se recomienda true en desarrollo; mas adelante conviene usar migraciones.
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
