import { Controller, Get } from '@nestjs/common';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  obtenerTodas() {
    return this.alertasService.obtenerTodas();
  }
}
