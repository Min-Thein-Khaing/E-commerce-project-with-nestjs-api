import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])\S{6,}$/, {
    message:
      'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
