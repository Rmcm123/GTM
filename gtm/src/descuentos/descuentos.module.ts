import { Module } from '@nestjs/common';
import { DescuentosService } from './descuentos.service';
import { DescuentoClienteRegularStrategy } from './estrategias/descuento-cliente-regular.strategy';
import { DescuentoMarcaStrategy } from './estrategias/descuento-marca.strategy';
import { DescuentoMembresiaStrategy } from './estrategias/descuento-membresia.strategy';

@Module({
  providers: [
    DescuentosService,
    DescuentoMarcaStrategy,
    DescuentoClienteRegularStrategy,
    DescuentoMembresiaStrategy,
  ],
  exports: [DescuentosService],
})
export class DescuentosModule {}
