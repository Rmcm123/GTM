import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { DescuentosModule } from './descuentos/descuentos.module';
import { InventarioModule } from './inventario/inventario.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { PagosModule } from './pagos/pagos.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ClientesModule,
    UsuariosModule,
    AutenticacionModule,
    DescuentosModule,
    InventarioModule,
    VehiculosModule,
    OrdenesTrabajoModule,
    PagosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
