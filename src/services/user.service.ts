import { User } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';

export class UserService {

  public static users: User[] = [];

  public static getUserByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  public static async createUser(user: User) {
    this.users.push(
      {
        username: user.username,
        password: user.password
      }
    )
    if(UserService.getUserByUsername(user.password)){
      return 200;
    }
    else{
      return 400;
    }
  }

  public static async getAllUsers(): Promise<User[]> {
    // Logique pour récupérer tous les utilisateurs
    return this.users;
  }
}