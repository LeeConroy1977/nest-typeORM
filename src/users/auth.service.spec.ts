import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      findAllUsers: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      createUser: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('terry@gmail.com', 'Sunderland1#');
    expect(user.password).not.toEqual('Sunderland1#');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is in use', async () => {
    fakeUsersService.findAllUsers = () =>
      Promise.resolve([
        { id: 1, email: 'bov@gmail.com', password: 'fukuAssblood88#' } as User,
      ]);
    await expect(service.signup('asdas@gmail', 'Sunderlan1#')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if user signs in with an unused email', async () => {
    await expect(service.signin('ass@gmail', 'Sunderlan1#')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws an error if an invalid password', async () => {
    fakeUsersService.findAllUsers = () =>
      Promise.resolve([
        { id: 1, email: 'bov@gmail.com', password: 'fukuAssblood88#' } as User,
      ]);
    await expect(service.signup('asdas@gmail', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('terry@gmail', 'password');

    const user = await service.signin('terry@gmail', 'password');
    expect(user).toBeDefined();
  });
});
