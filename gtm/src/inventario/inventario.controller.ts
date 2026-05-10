import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ActualizarStockDto } from './dto/actualizar-stock.dto';
import type { RegistrarEntradaDto } from './dto/registrar-entrada.dto';
import { InventarioService } from './inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  obtenerInventario() {
    return this.inventarioService.obtenerInventario();
  }

  @Get('movimientos')
  obtenerMovimientos() {
    return this.inventarioService.obtenerMovimientos();
  }

  @Post('actualizar-stock')
  actualizarStock(@Body() datos: ActualizarStockDto) {
    return this.inventarioService.actualizarStock(datos);
  }

  @Post('entrada')
  registrarEntrada(@Body() datos: RegistrarEntradaDto) {
    return this.inventarioService.registrarEntrada(datos);
  }
}
