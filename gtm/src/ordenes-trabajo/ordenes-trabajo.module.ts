import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Cliente } from '../clientes/cliente.entity';
import { DescuentosModule } from '../descuentos/descuentos.module';
import { InventarioModule } from '../inventario/inventario.module';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { RegistroTiempo } from './registro-tiempo.entity';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenTrabajo,
      Cliente,
      Vehiculo,
      RegistroTiempo,
      Usuario,
    ]),
    AutenticacionModule,
    DescuentosModule,
    InventarioModule,
  ],
  controllers: [OrdenesTrabajoController],
  providers: [OrdenesTrabajoService, OrdenTrabajoFactory, OrdenesTrabajoFacade],
  exports: [OrdenesTrabajoService, OrdenTrabajoFactory, OrdenesTrabajoFacade],
})
export class OrdenesTrabajoModule {}
