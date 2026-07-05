import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  //  UseGuards
} from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { GetUser } from '../../common/decorators/getUser.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponse } from './interfaces/authResponse.interface.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new User',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests or rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  //refresh access token
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth('JWT-refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh the access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests or rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async refreshToken(@GetUser('id') userId: string): Promise<AuthResponse> {
    return await this.authService.refreshToken(userId);
  }

  //logout user and invalidate the refresh token
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout the user and invalidate the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests or rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Successfully logged out' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate the user and return access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests or rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }
}
