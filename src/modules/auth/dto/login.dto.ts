import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
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
  password!: string;
}
