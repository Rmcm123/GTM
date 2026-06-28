import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  buscarTodos(@Query('limite') limite?: string) {
    const limiteNumerico = limite ? Math.min(Number(limite), 100) : 50;
    return this.auditoriaService.buscarTodos(limiteNumerico);
  }
}
