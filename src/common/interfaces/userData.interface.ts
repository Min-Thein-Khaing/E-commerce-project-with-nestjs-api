import { Role } from 'src/generated/prisma/enums';

export interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
}
