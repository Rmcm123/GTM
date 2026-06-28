import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import { ClientesService } from './clientes.service';
import type { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';
import type { CrearClienteDto } from './dto/crear-cliente.dto';
import type { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.Recepcionista)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  buscarTodos(): Promise<ClienteRespuestaDto[]> {
    return this.clientesService.buscarTodos();
  }

  @Post()
  crear(@Body() datosCliente: CrearClienteDto): Promise<ClienteRespuestaDto> {
    return this.clientesService.crear(datosCliente);
  }

  @Patch(':rut')
  actualizar(
    @Param('rut') rut: string,
    @Body() datosCliente: ActualizarClienteDto,
  ): Promise<ClienteRespuestaDto> {
    return this.clientesService.actualizar(rut, datosCliente);
  }
}
