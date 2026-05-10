import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { EstadoOrdenTrabajo, OrdenTrabajo } from './orden-trabajo.entity';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly repositorioOrdenesTrabajo: Repository<OrdenTrabajo>,
    @InjectRepository(Cliente)
    private readonly repositorioClientes: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly repositorioVehiculos: Repository<Vehiculo>,
  ) {}

  async buscarTodas(): Promise<OrdenTrabajoRespuestaDto[]> {
    const ordenes = await this.repositorioOrdenesTrabajo.find({
      order: { creadoEn: 'DESC' },
      relations: ['cliente', 'vehiculo'],
    });

    return ordenes.map((orden) => this.convertirARespuesta(orden));
  }

  async buscarPorId(id: number): Promise<OrdenTrabajoRespuestaDto> {
    const orden = await this.repositorioOrdenesTrabajo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo'],
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden de trabajo con ese id');
    }

    return this.convertirARespuesta(orden);
  }

  async crear(
    datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    this.validarDatosObligatorios(datosOrden);

    const cliente = await this.repositorioClientes.findOne({
      where: { rut: datosOrden.rutCliente.trim() },
    });

    if (!cliente) {
      throw new NotFoundException(
        'No existe un cliente registrado con ese RUT',
      );
    }

    const patenteNormalizada = datosOrden.patenteVehiculo.trim().toUpperCase();
    const vehiculo = await this.repositorioVehiculos.findOne({
      where: { patente: patenteNormalizada },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        'No existe un vehiculo registrado con esa patente',
      );
    }

    if (vehiculo.clienteId !== cliente.id) {
      throw new BadRequestException(
        'El vehiculo indicado no pertenece al cliente seleccionado',
      );
    }

    const orden = this.repositorioOrdenesTrabajo.create({
      clienteId: cliente.id,
      cliente,
      vehiculoId: vehiculo.id,
      vehiculo,
      tipoServicio: datosOrden.tipoServicio.trim(),
      diagnosticoInicial: datosOrden.diagnosticoInicial.trim(),
      mecanicoAsignado: datosOrden.mecanicoAsignado?.trim() || undefined,
      fechaIngreso: datosOrden.fechaIngreso,
      estado: EstadoOrdenTrabajo.Pendiente,
    });

    const ordenGuardada = await this.repositorioOrdenesTrabajo.save(orden);

    return this.convertirARespuesta(ordenGuardada);
  }

  private validarDatosObligatorios(datosOrden: CrearOrdenTrabajoDto) {
    const camposObligatorios = [
      datosOrden.rutCliente,
      datosOrden.patenteVehiculo,
      datosOrden.tipoServicio,
      datosOrden.diagnosticoInicial,
      datosOrden.fechaIngreso,
    ];

    if (
      camposObligatorios.some((campo) => !campo || campo.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Los datos principales de la orden de trabajo son obligatorios',
      );
    }
  }

  private convertirARespuesta(orden: OrdenTrabajo): OrdenTrabajoRespuestaDto {
    return {
      id: orden.id,
      clienteId: orden.clienteId,
      rutCliente: orden.cliente.rut,
      nombreCliente: orden.cliente.nombre,
      vehiculoId: orden.vehiculoId,
      patenteVehiculo: orden.vehiculo.patente,
      vehiculo: `${orden.vehiculo.marca} ${orden.vehiculo.modelo}`.trim(),
      tipoServicio: orden.tipoServicio,
      diagnosticoInicial: orden.diagnosticoInicial,
      mecanicoAsignado: orden.mecanicoAsignado,
      estado: orden.estado,
      fechaIngreso: orden.fechaIngreso,
    };
  }
}
