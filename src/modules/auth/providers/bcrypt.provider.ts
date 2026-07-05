import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { HashProvider } from './hash.provider';

@Injectable()
export class BcryptProvider implements HashProvider {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(password, encrypted);
  }
}
