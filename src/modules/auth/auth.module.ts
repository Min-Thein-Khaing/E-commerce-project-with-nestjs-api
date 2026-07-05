import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { HashProvider } from './providers/hash.provider';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategys/jwt.strategy';
import { RefreshTokenStrategy } from './strategys/refreshToken.strategy';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthService } from './providers/auth.service';

@Module({
  providers: [
    AuthService,
    { provide: HashProvider, useClass: BcryptProvider },
    JwtStrategy, //important
    RefreshTokenStrategy, //important
  ],
  controllers: [AuthController],
  exports: [AuthService, HashProvider],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET')!,
        signOptions: {
          expiresIn: Number(
            configService.get<number>('JWT_EXPIRATION_TIME', 604800),
          ),
        },
      }),
    }),
  ],
})
export class AuthModule {}
