import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from './inventario.controller';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { Repuesto } from './repuesto.entity';
import { InventarioService } from './inventario.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto, MovimientoInventario])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
