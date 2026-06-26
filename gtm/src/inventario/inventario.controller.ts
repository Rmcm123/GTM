import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import type { ActualizarStockDto } from './dto/actualizar-stock.dto';
import type { RegistrarEntradaDto } from './dto/registrar-entrada.dto';
import type { RegistrarSalidaDto } from './dto/registrar-salida.dto';
import { InventarioService } from './inventario.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.Inventario)
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

  @Get('alertas-stock-bajo')
  obtenerAlertasStockBajo() {
    return this.inventarioService.obtenerAlertasStockBajo();
  }

  @Post('actualizar-stock')
  actualizarStock(@Body() datos: ActualizarStockDto) {
    return this.inventarioService.actualizarStock(datos);
  }

  @Post('entrada')
  registrarEntrada(@Body() datos: RegistrarEntradaDto) {
    return this.inventarioService.registrarEntrada(datos);
  }

  @Post('salida')
  registrarSalida(@Body() datos: RegistrarSalidaDto) {
    return this.inventarioService.registrarSalida(datos);
  }
}
