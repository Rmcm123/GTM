import { Controller, Get, Post, Body, Param, Patch } from "@nestjs/common";
import { MecanicoService } from "./mecanico.service";
import { Mecanico } from "./mecanico.entity";

@Controller('mecanicos')
export class MecanicoController {
    constructor(private readonly mecanicoService: MecanicoService) {}

    @Get(':id')
    obtenerPorId(@Param('id') id: string) {
        return this.mecanicoService.obtenerMecanicoPorId(id);
    }

    @Post()
    crear(@Body() datosMecanico: Mecanico) {
        return this.mecanicoService.crearMecanico(datosMecanico);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() datosActualizados: Partial<Mecanico>) {
        return this.mecanicoService.actualizarMecanico(id, datosActualizados);
    }
}