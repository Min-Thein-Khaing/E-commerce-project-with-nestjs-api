import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/generated/prisma/enums';

export const ROLE_KEY = 'roleGuard';
export const Roles = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);
