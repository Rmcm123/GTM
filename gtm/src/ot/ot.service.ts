import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ot } from './ot.entity';
import { CreateOtDto } from './fto/create-ot.dto';
import { UpdateOtDto } from './fto/update-ot.dto';

@Injectable()
export class OtService {
  constructor(
    @InjectRepository(Ot)
    private readonly repo: Repository<Ot>,
  ) {}

  async crear(createDto: CreateOtDto): Promise<Ot> {
    const ot = this.repo.create({
      numeroOrden: createDto.numeroOrden,
      clienteId: createDto.clienteId,
      vehiculoId: createDto.vehiculoId,
      mecanicoId: createDto.mecanicoId ?? null,
      fechaPromesaSalida: createDto.fechaPromesaSalida ?? null,
      precioTotal: createDto.precioTotal ?? 0,
      diagnostico: createDto.diagnostico ?? null,
      pagos: createDto.adelanto ?? 0,
      estado: 'pendiente',
      fechaIngreso: new Date(),
    } as any) as unknown as Ot;

    return this.repo.save(ot);
  }

  async obtenerTodos(): Promise<Ot[]> {
    return this.repo.find({ order: { creadoEn: 'DESC' } });
  }

  async obtenerPorId(id: string): Promise<Ot> {
    const ot = await this.repo.findOne({ where: { id } });
    if (!ot) throw new NotFoundException('Orden de trabajo no encontrada');
    return ot;
  }

  async actualizar(id: string, datos: UpdateOtDto): Promise<Ot> {
    const ot = await this.obtenerPorId(id);
    Object.assign(ot, datos as any);
    return this.repo.save(ot);
  }

  // Registra un pago (suma a pagos)
  async registrarPago(id: string, monto: number): Promise<Ot> {
    if (monto <= 0) throw new BadRequestException('El monto debe ser mayor a 0');
    const ot = await this.obtenerPorId(id);
    ot.pagos = Number(ot.pagos) + Number(monto);

    // Si ya se cubre el total, podemos marcar como entregado automáticamente
    if (Number(ot.pagos) >= Number(ot.precioTotal) && ot.precioTotal > 0) {
      ot.estado = 'entregado';
      ot.fechaSalida = new Date();
    }

    return this.repo.save(ot);
  }

  // Intentar iniciar trabajo: requiere adelanto >= 40% del precioTotal
  async iniciarTrabajo(id: string): Promise<Ot> {
    const ot = await this.obtenerPorId(id);
    const required = Number(ot.precioTotal) * 0.4;
    if (Number(ot.pagos) < required) {
      throw new BadRequestException(`Se requiere adelanto mínimo de ${required}`);
    }
    ot.estado = 'progreso';
    ot.fechaIngreso = ot.fechaIngreso ?? new Date();
    return this.repo.save(ot);
  }

  async finalizarTrabajo(id: string): Promise<Ot> {
    const ot = await this.obtenerPorId(id);
    if (ot.estado !== 'progreso') throw new BadRequestException('La orden no está en progreso');
    ot.estado = 'finalizado';
    ot.fechaSalida = new Date();
    return this.repo.save(ot);
  }

  async cambiarEstado(id: string, nuevoEstado: Ot['estado']): Promise<Ot> {
    const ot = await this.obtenerPorId(id);
    const allowed: Record<string, string[]> = {
      pendiente: ['progreso', 'finalizado'],
      progreso: ['finalizado', 'entregado'],
      finalizado: ['entregado'],
      entregado: [],
    };
    if (!allowed[ot.estado].includes(nuevoEstado)) {
      throw new BadRequestException(`Transición no permitida de ${ot.estado} a ${nuevoEstado}`);
    }
    // Si se intenta pasar a progreso, validar adelanto
    if (nuevoEstado === 'progreso') {
      const required = Number(ot.precioTotal) * 0.4;
      if (Number(ot.pagos) < required) throw new BadRequestException(`Se requiere adelanto mínimo de ${required}`);
    }
    ot.estado = nuevoEstado;
    if (nuevoEstado === 'entregado') ot.fechaSalida = ot.fechaSalida ?? new Date();
    return this.repo.save(ot);
  }
}
