import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.userService.findAllUsers(email);

    if (users.length) {
      throw new BadRequestException('Email already in use');
    }
    // Hash the users password
    // generae a salt
    const salt = randomBytes(8).toString('hex');
    //hash the salt and paaword together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    //Crete new user and save it
    const user = await this.userService.createUser(email, result);
    // return new user

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.findAllUsers(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
