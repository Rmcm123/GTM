import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';
import { VehiculoRespuestaDto } from './dto/vehiculo-respuesta.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly repositorioVehiculos: Repository<Vehiculo>,
  ) {}

  async buscarPorCliente(cliente_id: string): Promise<VehiculoRespuestaDto[]> {
    const vehiculos = await this.repositorioVehiculos.find({
      where: { cliente_id },
      order: { creadoEn: 'DESC' },
      relations: [],
    });

    return vehiculos.map((vehiculo) => this.convertirARespuesta(vehiculo));
  }

  async buscarPorPatente(patente: string): Promise<VehiculoRespuestaDto | null> {
    const vehiculo = await this.repositorioVehiculos.findOne({
      where: { patente },
      relations: [],
    });

    return vehiculo ? this.convertirARespuesta(vehiculo) : null;
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
      cliente_id: vehiculo.cliente_id,
    };
  }
}
