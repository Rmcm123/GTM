import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from './inventario.controller';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { Repuesto } from './repuesto.entity';
import { InventarioService } from './inventario.service';
import {
  OBSERVADORES_INVENTARIO,
  type ObservadorInventario,
} from './observadores/observador-inventario.interface';
import { StockBajoObservador } from './observadores/stock-bajo.observador';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto, MovimientoInventario])],
  controllers: [InventarioController],
  providers: [
    InventarioService,
    StockBajoObservador,
    {
      provide: OBSERVADORES_INVENTARIO,
      useFactory: (
        stockBajoObservador: StockBajoObservador,
      ): ObservadorInventario[] => [stockBajoObservador],
      inject: [StockBajoObservador],
    },
  ],
  exports: [InventarioService],
})
export class InventarioModule {}
