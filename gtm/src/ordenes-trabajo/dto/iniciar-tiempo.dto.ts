import { IsOptional, IsString } from 'class-validator';

export class IniciarTiempoDto {
  @IsOptional()
  @IsString()
  descripcion?: string;
}
