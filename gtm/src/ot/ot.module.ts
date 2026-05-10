import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ot } from './ot.entity';
import { OtService } from './ot.service';
import { OtController } from './ot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ot])],
  controllers: [OtController],
  providers: [OtService],
  exports: [OtService],
})
export class OtModule {}
