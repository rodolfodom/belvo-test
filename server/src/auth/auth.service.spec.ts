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
  accounts: [],
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
    it('returns accessToken, name and email when credentials are valid', async () => {
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

    it('calls findByEmail with the correct email', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(userService.findByEmail).toHaveBeenCalledWith('rodolfo@test.com');
    });

    it('calls hashService.compare with the plain text password and the user hash', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(hashService.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
    });

    it('calls jwtService.signAsync with the correct payload', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      await service.singIn('rodolfo@test.com', 'plain-password');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'rodolfo@test.com',
        sub: 1,
      });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.singIn('noexiste@test.com', 'any-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(service.singIn('rodolfo@test.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException with the correct message', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.singIn('noexiste@test.com', 'any-password')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('does not call jwtService.signAsync when credentials are invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(service.singIn('rodolfo@test.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
