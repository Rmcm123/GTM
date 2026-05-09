import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import type { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';
import type { CrearClienteDto } from './dto/crear-cliente.dto';

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
}
