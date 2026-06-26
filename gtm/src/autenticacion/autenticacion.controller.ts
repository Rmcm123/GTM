import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RequestConUsuario } from './guards/jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login')
  login(@Body() datosLogin: LoginDto) {
    return this.autenticacionService.login(datosLogin);
  }

  @Post('refresh')
  refresh(@Body() datosRefresh: RefreshTokenDto) {
    return this.autenticacionService.refresh(datosRefresh);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  obtenerPerfil(@Req() request: RequestConUsuario) {
    return this.autenticacionService.obtenerPerfil(request.usuario!.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() request: RequestConUsuario) {
    return this.autenticacionService.logout(request.usuario!.id);
  }
}
