import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashProvider } from '../providers/hash.provider';

interface JwtPayload {
  sub: string;
  email: string;
}
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly hashProvider: HashProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authRefresh = req.headers.authorization;

    if (!authRefresh) {
      throw new UnauthorizedException();
    }

    const refreshToken = authRefresh.replace('Bearer ', '').trim();
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        refreshToken: true,
        role: true,
      },
    });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const isMatch = await this.hashProvider.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
