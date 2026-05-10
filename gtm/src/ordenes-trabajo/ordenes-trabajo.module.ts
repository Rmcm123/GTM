import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenTrabajo } from './orden-trabajo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenTrabajo])],
  exports: [TypeOrmModule],
})
export class OrdenesTrabajoModule {}
