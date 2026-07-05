import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';

import { HashProvider } from './hash.provider';
import { randomBytes } from 'crypto';
import { AuthResponse } from '../interfaces/authResponse.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = registerDto;

    const existsEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existsEmail) {
      throw new ConflictException('Email already exists');
    }
    const hashPassword = await this.hashProvider.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    const token = await this.generateToken(user.id, user.email);
    await this.updateRefreshToken(user.id, token.refreshToken);
    return {
      ...token,
      user,
    };
  }

  async generateToken(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const refreshIdToken = randomBytes(16).toString('hex');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        {
          ...payload,
          refreshIdToken,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.hashProvider.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  //refresh access token
  async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = await this.generateToken(user.id, user.email);
    await this.updateRefreshToken(user.id, token.refreshToken);

    return {
      ...token,
      user,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
      },
    });

    if (!user || !(await this.hashProvider.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(user.id, user.email);
    await this.updateRefreshToken(user.id, token.refreshToken);

    return {
      ...token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
