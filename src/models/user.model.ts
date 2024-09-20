import { User } from '../interfaces/user.interface';

export class UserModel implements User {
  constructor(public username: string, public password: string) {}
}