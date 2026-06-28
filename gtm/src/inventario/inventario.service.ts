import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { Repuesto } from './repuesto.entity';
import type { ActualizarStockDto } from './dto/actualizar-stock.dto';
import type { RegistrarEntradaDto } from './dto/registrar-entrada.dto';
import type { RegistrarSalidaDto } from './dto/registrar-salida.dto';
import type { MovimientoRespuestaDto } from './dto/movimiento-respuesta.dto';
import type { RepuestoRespuestaDto } from './dto/repuesto-respuesta.dto';
import {
  OBSERVADORES_INVENTARIO,
  type ObservadorInventario,
} from './observadores/observador-inventario.interface';
import { StockBajoObservador } from './observadores/stock-bajo.observador';
import type { AlertaStockBajo } from './observadores/evento-stock-inventario';

const INVENTARIO_INICIAL = [
  {
    nombre: 'Aceite 10W-40',
    categoria: 'Lubricantes',
    stock: 6,
    minimo: 8,
    precioUnitario: 18000,
  },
  {
    nombre: 'Filtro de aire',
    categoria: 'Filtros',
    stock: 3,
    minimo: 6,
    precioUnitario: 12000,
  },
  {
    nombre: 'Bujias',
    categoria: 'Encendido',
    stock: 14,
    minimo: 10,
    precioUnitario: 4500,
  },
];

@Injectable()
export class InventarioService implements OnModuleInit {
  constructor(
    @InjectRepository(Repuesto)
    private readonly repositorioRepuestos: Repository<Repuesto>,
    @InjectRepository(MovimientoInventario)
    private readonly repositorioMovimientos: Repository<MovimientoInventario>,
    @Inject(OBSERVADORES_INVENTARIO)
    private readonly observadoresInventario: ObservadorInventario[],
    private readonly stockBajoObservador: StockBajoObservador,
  ) {}

  async onModuleInit() {
    await this.sembrarInventarioInicial();
  }

  async obtenerInventario(): Promise<RepuestoRespuestaDto[]> {
    const repuestos = await this.repositorioRepuestos.find({
      order: { nombre: 'ASC' },
    });

    return repuestos.map((repuesto) => this.convertirARespuesta(repuesto));
  }

  async obtenerMovimientos(): Promise<MovimientoRespuestaDto[]> {
    const movimientos = await this.repositorioMovimientos.find({
      order: { creadoEn: 'DESC' },
      take: 20,
    });

    const repuestos = await this.repositorioRepuestos.find();
    const nombresPorId = new Map(
      repuestos.map((repuesto) => [repuesto.id, repuesto.nombre]),
    );

    return movimientos.map((movimiento) => ({
      id: movimiento.id,
      repuestoId: movimiento.repuestoId,
      nombre: nombresPorId.get(movimiento.repuestoId) ?? 'Repuesto eliminado',
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      stockAnterior: movimiento.stockAnterior,
      stockNuevo: movimiento.stockNuevo,
      nota: movimiento.nota,
      creadoEn: movimiento.creadoEn.toISOString(),
    }));
  }

  async actualizarStock(
    datos: ActualizarStockDto,
  ): Promise<RepuestoRespuestaDto> {
    this.validarNombre(datos.nombre);
    this.validarStockNoNegativo(
      datos.stock,
      'El stock nuevo debe ser mayor o igual a 0',
    );

    const repuesto = await this.obtenerOCrearRepuesto(datos);
    const stockAnterior = repuesto.stock;

    repuesto.stock = Number(datos.stock);
    if (
      typeof datos.categoria === 'string' &&
      datos.categoria.trim().length > 0
    ) {
      repuesto.categoria = datos.categoria.trim();
    }
    if (typeof datos.minimo === 'number' && Number.isFinite(datos.minimo)) {
      repuesto.minimo = Number(datos.minimo);
    }
    if (
      typeof datos.precioUnitario === 'number' &&
      Number.isFinite(datos.precioUnitario)
    ) {
      this.validarStockNoNegativo(
        datos.precioUnitario,
        'El precio unitario debe ser mayor o igual a 0',
      );
      repuesto.precioUnitario = Number(datos.precioUnitario);
    }

    const repuestoGuardado = await this.repositorioRepuestos.save(repuesto);
    await this.repositorioMovimientos.save(
      this.repositorioMovimientos.create({
        repuestoId: repuestoGuardado.id,
        tipo: 'Actualizacion',
        cantidad: repuestoGuardado.stock - stockAnterior,
        stockAnterior,
        stockNuevo: repuestoGuardado.stock,
        nota: datos.nota?.trim() || 'Actualizacion de stock',
      }),
    );
    this.notificarCambioStock(repuestoGuardado, stockAnterior, 'Actualizacion');

    return this.convertirARespuesta(repuestoGuardado);
  }

  async obtenerAlertasStockBajo(): Promise<AlertaStockBajo[]> {
    const repuestos = await this.repositorioRepuestos.find({
      order: { nombre: 'ASC' },
    });

    this.stockBajoObservador.sincronizarConInventario(repuestos);
    return this.stockBajoObservador.obtenerAlertas();
  }

  async registrarEntrada(
    datos: RegistrarEntradaDto,
  ): Promise<RepuestoRespuestaDto> {
    this.validarNombre(datos.nombre);
    this.validarCantidadPositiva(datos.cantidad);

    const repuesto = await this.obtenerOCrearRepuesto(datos);
    const stockAnterior = repuesto.stock;

    repuesto.stock = Number(repuesto.stock) + Number(datos.cantidad);
    if (
      typeof datos.categoria === 'string' &&
      datos.categoria.trim().length > 0
    ) {
      repuesto.categoria = datos.categoria.trim();
    }
    if (typeof datos.minimo === 'number' && Number.isFinite(datos.minimo)) {
      repuesto.minimo = Number(datos.minimo);
    }
    if (
      typeof datos.precioUnitario === 'number' &&
      Number.isFinite(datos.precioUnitario)
    ) {
      this.validarStockNoNegativo(
        datos.precioUnitario,
        'El precio unitario debe ser mayor o igual a 0',
      );
      repuesto.precioUnitario = Number(datos.precioUnitario);
    }

    const repuestoGuardado = await this.repositorioRepuestos.save(repuesto);
    await this.repositorioMovimientos.save(
      this.repositorioMovimientos.create({
        repuestoId: repuestoGuardado.id,
        tipo: 'Entrada',
        cantidad: Number(datos.cantidad),
        stockAnterior,
        stockNuevo: repuestoGuardado.stock,
        nota: datos.nota?.trim() || 'Entrada de inventario',
      }),
    );
    this.notificarCambioStock(repuestoGuardado, stockAnterior, 'Entrada');

    return this.convertirARespuesta(repuestoGuardado);
  }

  async registrarSalida(
    datos: RegistrarSalidaDto,
  ): Promise<RepuestoRespuestaDto> {
    this.validarNombre(datos.nombre);
    this.validarCantidadPositiva(datos.cantidad);

    const nombreNormalizado = datos.nombre.trim();
    const repuesto = await this.repositorioRepuestos.findOne({
      where: { nombre: nombreNormalizado },
    });

    if (!repuesto) {
      throw new BadRequestException('El repuesto no existe en inventario');
    }

    const stockAnterior = repuesto.stock;
    const cantidadSalida = Number(datos.cantidad);

    if (cantidadSalida > stockAnterior) {
      throw new BadRequestException(
        'No hay stock suficiente para registrar la salida',
      );
    }

    repuesto.stock = stockAnterior - cantidadSalida;

    const repuestoGuardado = await this.repositorioRepuestos.save(repuesto);
    await this.repositorioMovimientos.save(
      this.repositorioMovimientos.create({
        repuestoId: repuestoGuardado.id,
        tipo: 'Salida',
        cantidad: cantidadSalida,
        stockAnterior,
        stockNuevo: repuestoGuardado.stock,
        nota: datos.nota?.trim() || 'Salida de inventario',
      }),
    );
    this.notificarCambioStock(repuestoGuardado, stockAnterior, 'Salida');

    return this.convertirARespuesta(repuestoGuardado);
  }

  async calcularCostoRepuestos(
    repuestosSolicitados: { nombre: string; cantidad: number }[] = [],
  ): Promise<number> {
    return this.calcularCostoRepuestosConManager(
      this.repositorioRepuestos.manager,
      repuestosSolicitados,
    );
  }

  async calcularCostoRepuestosConManager(
    manager: EntityManager,
    repuestosSolicitados: { nombre: string; cantidad: number }[] = [],
  ): Promise<number> {
    let total = 0;
    const repositorioRepuestos = manager.getRepository(Repuesto);

    for (const repuestoSolicitado of repuestosSolicitados) {
      this.validarNombre(repuestoSolicitado.nombre);
      this.validarCantidadPositiva(repuestoSolicitado.cantidad);

      const repuesto = await repositorioRepuestos.findOne({
        where: { nombre: repuestoSolicitado.nombre.trim() },
      });

      if (!repuesto) {
        throw new BadRequestException(
          `El repuesto ${repuestoSolicitado.nombre} no existe en inventario`,
        );
      }

      if (Number(repuestoSolicitado.cantidad) > repuesto.stock) {
        throw new BadRequestException(
          `No hay stock suficiente para ${repuesto.nombre}`,
        );
      }

      total += repuesto.precioUnitario * Number(repuestoSolicitado.cantidad);
    }

    return total;
  }

  async registrarSalidasPorOrden(
    ordenTrabajoId: number,
    repuestosSolicitados: { nombre: string; cantidad: number }[] = [],
  ) {
    await this.registrarSalidasPorOrdenConManager(
      this.repositorioRepuestos.manager,
      ordenTrabajoId,
      repuestosSolicitados,
    );
  }

  async registrarSalidasPorOrdenConManager(
    manager: EntityManager,
    ordenTrabajoId: number,
    repuestosSolicitados: { nombre: string; cantidad: number }[] = [],
  ) {
    for (const repuestoSolicitado of repuestosSolicitados) {
      await this.registrarSalidaConManager(manager, {
        nombre: repuestoSolicitado.nombre,
        cantidad: repuestoSolicitado.cantidad,
        nota: `Salida asociada a OT-${String(ordenTrabajoId).padStart(3, '0')}`,
      });
    }
  }

  private async registrarSalidaConManager(
    manager: EntityManager,
    datos: RegistrarSalidaDto,
  ): Promise<RepuestoRespuestaDto> {
    this.validarNombre(datos.nombre);
    this.validarCantidadPositiva(datos.cantidad);

    const repositorioRepuestos = manager.getRepository(Repuesto);
    const repositorioMovimientos = manager.getRepository(MovimientoInventario);
    const nombreNormalizado = datos.nombre.trim();
    const repuesto = await repositorioRepuestos.findOne({
      where: { nombre: nombreNormalizado },
    });

    if (!repuesto) {
      throw new BadRequestException('El repuesto no existe en inventario');
    }

    const stockAnterior = repuesto.stock;
    const cantidadSalida = Number(datos.cantidad);

    if (cantidadSalida > stockAnterior) {
      throw new BadRequestException(
        'No hay stock suficiente para registrar la salida',
      );
    }

    repuesto.stock = stockAnterior - cantidadSalida;

    const repuestoGuardado = await repositorioRepuestos.save(repuesto);
    await repositorioMovimientos.save(
      repositorioMovimientos.create({
        repuestoId: repuestoGuardado.id,
        tipo: 'Salida',
        cantidad: cantidadSalida,
        stockAnterior,
        stockNuevo: repuestoGuardado.stock,
        nota: datos.nota?.trim() || 'Salida de inventario',
      }),
    );
    this.notificarCambioStock(repuestoGuardado, stockAnterior, 'Salida');

    return this.convertirARespuesta(repuestoGuardado);
  }

  private async sembrarInventarioInicial() {
    const cantidadRepuestos = await this.repositorioRepuestos.count();

    if (cantidadRepuestos > 0) {
      return;
    }

    for (const repuestoInicial of INVENTARIO_INICIAL) {
      const repuesto = this.repositorioRepuestos.create({
        nombre: repuestoInicial.nombre,
        categoria: repuestoInicial.categoria,
        stock: repuestoInicial.stock,
        minimo: repuestoInicial.minimo,
        precioUnitario: repuestoInicial.precioUnitario,
      });

      const repuestoGuardado = await this.repositorioRepuestos.save(repuesto);
      await this.repositorioMovimientos.save(
        this.repositorioMovimientos.create({
          repuestoId: repuestoGuardado.id,
          tipo: 'Entrada',
          cantidad: repuestoInicial.stock,
          stockAnterior: 0,
          stockNuevo: repuestoInicial.stock,
          nota: 'Carga inicial de inventario',
        }),
      );
    }
  }

  private async obtenerOCrearRepuesto(
    datos: Pick<
      ActualizarStockDto,
      'nombre' | 'categoria' | 'minimo' | 'precioUnitario'
    >,
  ) {
    const nombreNormalizado = datos.nombre.trim();
    let repuesto = await this.repositorioRepuestos.findOne({
      where: { nombre: nombreNormalizado },
    });

    if (!repuesto) {
      repuesto = this.repositorioRepuestos.create({
        nombre: nombreNormalizado,
        categoria: datos.categoria?.trim() || 'General',
        stock: 0,
        minimo: typeof datos.minimo === 'number' ? Number(datos.minimo) : 0,
        precioUnitario:
          'precioUnitario' in datos && typeof datos.precioUnitario === 'number'
            ? Number(datos.precioUnitario)
            : 0,
      });
      repuesto = await this.repositorioRepuestos.save(repuesto);
    }

    return repuesto;
  }

  private validarNombre(nombre: string) {
    if (!nombre || nombre.trim().length === 0) {
      throw new BadRequestException('El nombre del repuesto es obligatorio');
    }
  }

  private validarCantidadPositiva(cantidad: number) {
    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
  }

  private validarStockNoNegativo(stock: number, mensaje: string) {
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      throw new BadRequestException(mensaje);
    }
  }

  private convertirARespuesta(repuesto: Repuesto): RepuestoRespuestaDto {
    return {
      id: repuesto.id,
      nombre: repuesto.nombre,
      categoria: repuesto.categoria,
      stock: repuesto.stock,
      minimo: repuesto.minimo,
      precioUnitario: repuesto.precioUnitario,
    };
  }

  private notificarCambioStock(
    repuesto: Repuesto,
    stockAnterior: number,
    tipoMovimiento: string,
  ) {
    for (const observador of this.observadoresInventario) {
      observador.actualizar({ repuesto, stockAnterior, tipoMovimiento });
    }
  }
}
