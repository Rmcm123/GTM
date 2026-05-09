import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ClientesModule,
    VehiculosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
