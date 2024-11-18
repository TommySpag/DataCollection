import { User } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';
import {config} from '../config/config'

export class UserService {

  public static users: User[] = config.nodeEnv === 'test' ? [
    { username: "Jania", password: "Chrissy", role: "gestionnaire" },
    { username: "Jemmy", password: "Kimmi", role: "gestionnaire" },
    { username: "Cornell", password: "Delbert", role: "gestionnaire" },
    { username: "Cindelyn", password: "Chloris", role: "gestionnaire" },
    { username: "Martita", password: "Granthem", role: "gestionnaire" },
    { username: "Micah", password: "Victor", role: "gestionnaire" },
    { username: "Ambros", password: "Clarette", role: "gestionnaire" },
    { username: "Ashien", password: "Victoir", role: "gestionnaire" },
    { username: "Stephine", password: "Heddie", role: "gestionnaire" },
    { username: "Morton", password: "Lindsay", role: "gestionnaire" },
    { username: "Jozef", password: "Bernarr", role: "gestionnaire" },
    { username: "Marquita", password: "Nikolaus", role: "gestionnaire" },
    { username: "Kasper", password: "Maurie", role: "gestionnaire" },
    { username: "Aldwin", password: "Bamby", role: "gestionnaire" },
    { username: "Mayor", password: "Candis", role: "gestionnaire" },
    { username: "Derby", password: "Monti", role: "gestionnaire" },
    { username: "Patsy", password: "Kizzie", role: "gestionnaire" },
    { username: "Orelia", password: "Thaddus", role: "gestionnaire" },
    { username: "Alma", password: "Marne", role: "gestionnaire" },
    { username: "Terry", password: "Sheri", role: "gestionnaire" },
    { username: "Myrtice", password: "Vernice", role: "gestionnaire" },
    { username: "Rolland", password: "Merlina", role: "gestionnaire" },
    { username: "Dorice", password: "Jeanie", role: "gestionnaire" },
    { username: "Constantina", password: "Raphael", role: "gestionnaire" },
    { username: "Roman", password: "Dougy", role: "gestionnaire" },
    { username: "Kerwin", password: "Josee", role: "gestionnaire" },
    { username: "Benedetta", password: "Hertha", role: "gestionnaire" },
    { username: "Nickola", password: "Cris", role: "gestionnaire" },
    { username: "Rutger", password: "Gunter", role: "gestionnaire" },
    { username: "Birgit", password: "Vina", role: "gestionnaire" },
    { username: "Olympia", password: "Wayland", role: "gestionnaire" },
    { username: "Brendin", password: "Darbee", role: "gestionnaire" },
    { username: "Tami", password: "Corrinne", role: "gestionnaire" },
    { username: "Stacee", password: "Johannes", role: "gestionnaire" },
    { username: "Stanley", password: "Neda", role: "gestionnaire" },
    { username: "Vance", password: "Delmar", role: "gestionnaire" },
    { username: "Catarina", password: "Kendricks", role: "gestionnaire" },
    { username: "Mendy", password: "Cathi", role: "gestionnaire" },
    { username: "Faythe", password: "Dolores", role: "gestionnaire" },
    { username: "Vanny", password: "Vonni", role: "gestionnaire" },
    { username: "Zach", password: "Joye", role: "gestionnaire" },
    { username: "Guntar", password: "Adan", role: "gestionnaire" },
    { username: "Jonis", password: "Boonie", role: "gestionnaire" },
    { username: "Sophie", password: "Cassie", role: "gestionnaire" },
    { username: "Waylon", password: "Lelah", role: "gestionnaire" },
    { username: "Cleavland", password: "Bax", role: "gestionnaire" },
    { username: "Claiborn", password: "Juditha", role: "gestionnaire" },
    { username: "Waring", password: "Angel", role: "gestionnaire" },
    { username: "Else", password: "Giuditta", role: "gestionnaire" },
    { username: "Essy", password: "Chet", role: "gestionnaire" }] : [];

  public static getUserByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  public static async createUser(user: User) {
    this.users.push(
      {
        username: user.username,
        password: user.password,
        role: user.role
      }
    )
    if(UserService.getUserByUsername(user.username)){
      return 200;
    }
    else{
      return 400;
    }
  }

  public static async getAllUsers(): Promise<{username: string, role: string}[]> {
    return this.users.map(user => ({username: user.username, role: user.role}));
  }
}