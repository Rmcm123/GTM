import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [JwtModule.register({}), UsuariosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtAuthGuard, RolesGuard],
  exports: [JwtModule, AutenticacionService, JwtAuthGuard, RolesGuard],
})
export class AutenticacionModule {}
