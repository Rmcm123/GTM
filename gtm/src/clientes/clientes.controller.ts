import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import type { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';
import type { CrearClienteDto } from './dto/crear-cliente.dto';
import type { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

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
