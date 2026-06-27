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
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

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
      esRegular: Boolean(datosCliente.esRegular),
      porcentajeDescuentoRegular: this.normalizarDescuentoRegular(
        datosCliente.porcentajeDescuentoRegular,
      ),
      membresia: datosCliente.membresia,
    });

    const clienteGuardado = await this.repositorioClientes.save(cliente);

    return this.convertirARespuesta(clienteGuardado);
  }

  async actualizar(
    rut: string,
    datosActualizar: ActualizarClienteDto,
  ): Promise<ClienteRespuestaDto> {
    const clienteExistente = await this.repositorioClientes.findOne({
      where: { rut },
    });

    if (!clienteExistente) {
      throw new BadRequestException('El cliente no existe');
    }

    if (datosActualizar.nombre)
      clienteExistente.nombre = datosActualizar.nombre.trim();
    if (datosActualizar.telefono)
      clienteExistente.telefono = datosActualizar.telefono.trim();
    if (datosActualizar.correo)
      clienteExistente.correo = datosActualizar.correo.trim();
    if (typeof datosActualizar.esRegular === 'boolean')
      clienteExistente.esRegular = datosActualizar.esRegular;
    if (typeof datosActualizar.porcentajeDescuentoRegular === 'number')
      clienteExistente.porcentajeDescuentoRegular =
        this.normalizarDescuentoRegular(
          datosActualizar.porcentajeDescuentoRegular,
        );
    if (datosActualizar.membresia)
      clienteExistente.membresia = datosActualizar.membresia;

    const clienteActualizado =
      await this.repositorioClientes.save(clienteExistente);
    return this.convertirARespuesta(clienteActualizado);
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
      esRegular: cliente.esRegular,
      porcentajeDescuentoRegular: cliente.porcentajeDescuentoRegular,
      membresia: cliente.membresia,
    };
  }

  private normalizarDescuentoRegular(porcentaje?: number): number {
    if (typeof porcentaje !== 'number' || !Number.isFinite(porcentaje)) {
      return 0;
    }

    if (porcentaje < 0) {
      return 0;
    }

    if (porcentaje > 10) {
      return 10;
    }

    return porcentaje;
  }
}
