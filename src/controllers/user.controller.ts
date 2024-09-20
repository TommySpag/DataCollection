import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';
import { config } from '../config/config';

const SECRET_KEY = config.jwtSecret;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class UserController {
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await UserService.getAllUsers();
    res.json(users);
  }

  public async registerUser(user: User): Promise<void> {
    await UserService.createUser(user);
  }

  public async verifyUser(req: Request, res: Response): Promise<any> {
    const { username, password } = req.body;
    const user = await UserService.getUserByUsername(username);

    if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Génération d'un JWT
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  }
}