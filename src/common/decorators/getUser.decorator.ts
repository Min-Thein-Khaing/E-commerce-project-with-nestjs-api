import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '../interfaces/userData.interface';

export const GetUser = createParamDecorator(
  (data: keyof UserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserData }>();
    return data ? request.user?.[data] : request.user;
  },
);
