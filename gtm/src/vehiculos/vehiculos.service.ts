import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { VehiculoRespuestaDto } from './dto/vehiculo-respuesta.dto';
import { Vehiculo } from './vehiculo.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly repositorioVehiculos: Repository<Vehiculo>,
    @InjectRepository(Cliente)
    private readonly repositorioClientes: Repository<Cliente>,
  ) {}

  async buscarTodos(): Promise<VehiculoRespuestaDto[]> {
    const vehiculos = await this.repositorioVehiculos.find({
      order: { creadoEn: 'DESC' },
      relations: ['cliente'],
    });

    return vehiculos.map((vehiculo) => this.convertirARespuesta(vehiculo));
  }

  async buscarPorCliente(clienteId: string): Promise<VehiculoRespuestaDto[]> {
    const vehiculos = await this.repositorioVehiculos.find({
      where: { clienteId },
      order: { creadoEn: 'DESC' },
      relations: ['cliente'],
    });

    return vehiculos.map((vehiculo) => this.convertirARespuesta(vehiculo));
  }

  async buscarPorRutCliente(
    rutCliente: string,
  ): Promise<VehiculoRespuestaDto[]> {
    const cliente = await this.repositorioClientes.findOne({
      where: { rut: rutCliente },
    });

    if (!cliente) {
      throw new NotFoundException(
        'No existe un cliente registrado con ese RUT',
      );
    }

    return this.buscarPorCliente(cliente.id);
  }

  async buscarPorPatente(
    patente: string,
  ): Promise<VehiculoRespuestaDto | null> {
    const vehiculo = await this.repositorioVehiculos.findOne({
      where: { patente: patente.trim().toUpperCase() },
      relations: ['cliente'],
    });

    return vehiculo ? this.convertirARespuesta(vehiculo) : null;
  }

  async crear(datosVehiculo: CrearVehiculoDto): Promise<VehiculoRespuestaDto> {
    this.validarDatosObligatorios(datosVehiculo);

    const cliente = await this.repositorioClientes.findOne({
      where: { rut: datosVehiculo.rutCliente.trim() },
    });

    if (!cliente) {
      throw new NotFoundException(
        'No existe un cliente registrado con ese RUT',
      );
    }

    const patenteNormalizada = datosVehiculo.patente.trim().toUpperCase();
    const vehiculoExistente = await this.repositorioVehiculos.findOne({
      where: { patente: patenteNormalizada },
    });

    if (vehiculoExistente) {
      throw new ConflictException(
        'Ya existe un vehiculo registrado con esa patente',
      );
    }

    const vehiculo = this.repositorioVehiculos.create({
      patente: patenteNormalizada,
      marca: datosVehiculo.marca.trim(),
      modelo: datosVehiculo.modelo.trim(),
      año: Number(datosVehiculo.año),
      color: datosVehiculo.color?.trim() || undefined,
      kilometraje: datosVehiculo.kilometraje,
      clienteId: cliente.id,
      cliente,
    });

    const vehiculoGuardado = await this.repositorioVehiculos.save(vehiculo);

    return this.convertirARespuesta(vehiculoGuardado);
  }

  private validarDatosObligatorios(datosVehiculo: CrearVehiculoDto) {
    const camposObligatorios = [
      datosVehiculo.rutCliente,
      datosVehiculo.patente,
      datosVehiculo.marca,
      datosVehiculo.modelo,
    ];

    if (
      camposObligatorios.some((campo) => !campo || campo.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Los datos principales del vehiculo son obligatorios',
      );
    }

    if (
      !Number.isInteger(Number(datosVehiculo.año)) ||
      Number(datosVehiculo.año) < 1900
    ) {
      throw new BadRequestException('El año del vehiculo debe ser valido');
    }
  }

  private convertirARespuesta(vehiculo: Vehiculo): VehiculoRespuestaDto {
    return {
      id: vehiculo.id,
      patente: vehiculo.patente,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      año: vehiculo.año,
      color: vehiculo.color,
      kilometraje: vehiculo.kilometraje,
      clienteId: vehiculo.clienteId,
      rutCliente: vehiculo.cliente?.rut,
      nombreCliente: vehiculo.cliente?.nombre,
    };
  }
}
