import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { HashService } from '../utils/hash.service';

const mockUser = {
  id: 1,
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
  password: 'hashed-password',
  transactions: [],
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<Pick<UserService, 'findByEmail'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let hashService: jest.Mocked<Pick<HashService, 'compare'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: HashService,
          useValue: { compare: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    hashService = module.get(HashService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('singIn', () => {
    it('retorna accessToken, name y email cuando las credenciales son válidas', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      const result = await service.singIn('rodolfo@test.com', 'plain-password');

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
        name: 'Rodolfo',
        email: 'rodolfo@test.com',
      });
    });

    it('llama a findByEmail con el email correcto', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(userService.findByEmail).toHaveBeenCalledWith('rodolfo@test.com');
    });

    it('llama a hashService.compare con la password en texto plano y el hash del usuario', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(hashService.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
    });

    it('llama a jwtService.signAsync con el payload correcto', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'rodolfo@test.com',
        sub: 1,
      });
    });

    it('lanza UnauthorizedException cuando el usuario no existe', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.singIn('noexiste@test.com', 'any-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException cuando la password es incorrecta', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(service.singIn('rodolfo@test.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException con el mensaje correcto', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.singIn('noexiste@test.com', 'any-password')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('no llama a jwtService.signAsync cuando las credenciales son inválidas', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(service.singIn('rodolfo@test.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
