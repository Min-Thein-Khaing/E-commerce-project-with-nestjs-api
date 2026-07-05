import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/generated/prisma/enums';
import { ROLE_KEY } from '../decorators/role.decorator';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    return requireRoles.some((role) => user?.role === role);
  }
}
