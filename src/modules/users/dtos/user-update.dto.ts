import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @ApiPropertyOptional({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  email?: string;
  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;
  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
