import { SetMetadata } from '@nestjs/common';
import type { RolUsuario } from '../../usuarios/usuario.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
