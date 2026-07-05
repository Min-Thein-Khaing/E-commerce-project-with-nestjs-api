import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums.js';

export class AuthUserResponse {
  @ApiProperty({ example: 'cm1234567890' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John', nullable: true, type: String })
  firstName!: string | null;

  @ApiProperty({ example: 'Doe', nullable: true, type: String })
  lastName!: string | null;

  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.USER })
  role!: Role;
}

export class AuthResponse {
  @ApiProperty({
    description: 'The access token for the user',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'The refresh token for the user',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'The user information',
    type: () => AuthUserResponse,
  })
  user!: AuthUserResponse;
}
