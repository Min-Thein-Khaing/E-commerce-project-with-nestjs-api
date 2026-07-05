import { Request } from 'express';
import { UserData } from './userData.interface';

export interface RequestWithUser extends Request {
  user: UserData;
}
