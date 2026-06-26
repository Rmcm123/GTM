import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Cliente } from '../clientes/cliente.entity';
import { DescuentosModule } from '../descuentos/descuentos.module';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenTrabajo, Cliente, Vehiculo]),
    AutenticacionModule,
    DescuentosModule,
  ],
  controllers: [OrdenesTrabajoController],
  providers: [OrdenesTrabajoService, OrdenTrabajoFactory, OrdenesTrabajoFacade],
  exports: [OrdenesTrabajoService, OrdenTrabajoFactory, OrdenesTrabajoFacade],
})
export class OrdenesTrabajoModule {}
