import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repositorioClientes: Repository<Cliente>,
  ) {}

  async buscarTodos(): Promise<ClienteRespuestaDto[]> {
    const clientes = await this.repositorioClientes.find({
      order: { creadoEn: 'DESC' },
    });

    // La respuesta se separa de la entidad para controlar que datos salen por la API.
    return clientes.map((cliente) => this.convertirARespuesta(cliente));
  }

  private convertirARespuesta(cliente: Cliente): ClienteRespuestaDto {
    return {
      id: cliente.id,
      rut: cliente.rut,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      patenteVehiculo: cliente.patenteVehiculo,
      vehiculo: cliente.vehiculo,
    };
  }
}
