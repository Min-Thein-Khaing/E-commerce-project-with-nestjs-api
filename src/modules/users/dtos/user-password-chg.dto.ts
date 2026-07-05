import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Old password of the user',
    example: 'oldPassword123',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'newPassword123',
  })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    },
  )
  newPassword!: string;
}
