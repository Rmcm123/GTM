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
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Roles(
    RolUsuario.Administrador,
    RolUsuario.Inventario,
    RolUsuario.Recepcionista,
  )
  @Get()
  obtenerInventario() {
    return this.inventarioService.obtenerInventario();
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Inventario)
  @Get('movimientos')
  obtenerMovimientos() {
    return this.inventarioService.obtenerMovimientos();
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Inventario)
  @Get('alertas-stock-bajo')
  obtenerAlertasStockBajo() {
    return this.inventarioService.obtenerAlertasStockBajo();
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Inventario)
  @Post('actualizar-stock')
  actualizarStock(@Body() datos: ActualizarStockDto) {
    return this.inventarioService.actualizarStock(datos);
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Inventario)
  @Post('entrada')
  registrarEntrada(@Body() datos: RegistrarEntradaDto) {
    return this.inventarioService.registrarEntrada(datos);
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Inventario)
  @Post('salida')
  registrarSalida(@Body() datos: RegistrarSalidaDto) {
    return this.inventarioService.registrarSalida(datos);
  }
}
