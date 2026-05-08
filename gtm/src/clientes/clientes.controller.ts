import { Controller, Get } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  buscarTodos(): Promise<ClienteRespuestaDto[]> {
    return this.clientesService.buscarTodos();
  }
}
