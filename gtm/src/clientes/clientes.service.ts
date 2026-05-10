import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { ClienteRespuestaDto } from './dto/cliente-respuesta.dto';
import { CrearClienteDto } from './dto/crear-cliente.dto';

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

  async crear(datosCliente: CrearClienteDto): Promise<ClienteRespuestaDto> {
    this.validarDatosObligatorios(datosCliente);

    const clienteExistente = await this.repositorioClientes.findOne({
      where: { rut: datosCliente.rut },
    });

    if (clienteExistente) {
      throw new ConflictException(
        'Ya existe un cliente registrado con ese RUT',
      );
    }

    const cliente = this.repositorioClientes.create({
      rut: datosCliente.rut.trim(),
      nombre: datosCliente.nombre.trim(),
      telefono: datosCliente.telefono.trim(),
      correo: datosCliente.correo.trim(),
    });

    const clienteGuardado = await this.repositorioClientes.save(cliente);

    return this.convertirARespuesta(clienteGuardado);
  }

  private validarDatosObligatorios(datosCliente: CrearClienteDto) {
    // Validacion inicial simple.
    const camposObligatorios = [
      datosCliente.rut,
      datosCliente.nombre,
      datosCliente.telefono,
      datosCliente.correo,
    ];

    if (
      camposObligatorios.some((campo) => !campo || campo.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Todos los datos del cliente son obligatorios',
      );
    }
  }

  private convertirARespuesta(cliente: Cliente): ClienteRespuestaDto {
    return {
      id: cliente.id,
      rut: cliente.rut,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
    };
  }
}
