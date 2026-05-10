import { Controller, Post, Get, Param, Patch, Body } from '@nestjs/common';
import { OtService } from './ot.service';
import type { CreateOtDto } from './fto/create-ot.dto';

@Controller('ot')
export class OtController {
  constructor(private readonly otService: OtService) {}

  @Post()
  crear(@Body() dto: CreateOtDto) {
    return this.otService.crear(dto);
  }

  @Get()
  obtenerTodos() {
    return this.otService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.otService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: any) {
    return this.otService.actualizar(id, datos);
  }

  @Post(':id/registrar-pago')
  registrarPago(@Param('id') id: string, @Body() body: { monto: number }) {
    return this.otService.registrarPago(id, body.monto);
  }

  @Post(':id/iniciar')
  iniciarTrabajo(@Param('id') id: string) {
    return this.otService.iniciarTrabajo(id);
  }

  @Post(':id/finalizar')
  finalizarTrabajo(@Param('id') id: string) {
    return this.otService.finalizarTrabajo(id);
  }

  @Post(':id/cambiar-estado')
  cambiarEstado(@Param('id') id: string, @Body() body: { estado: any }) {
    return this.otService.cambiarEstado(id, body.estado);
  }
}
