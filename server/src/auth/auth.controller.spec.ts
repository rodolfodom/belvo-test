import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

const mockAuthResult = {
  accessToken: 'jwt-token-123',
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'singIn'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { singIn: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logIn', () => {
    it('calls authService.singIn with the email and password from the body', async () => {
      authService.singIn.mockResolvedValue(mockAuthResult);
      const loginDto: LoginDto = { email: 'rodolfo@test.com', password: 'pass123' };

      await controller.logIn(loginDto);

      expect(authService.singIn).toHaveBeenCalledWith('rodolfo@test.com', 'pass123');
    });

    it('returns the result of authService.singIn', async () => {
      authService.singIn.mockResolvedValue(mockAuthResult);
      const loginDto: LoginDto = { email: 'rodolfo@test.com', password: 'pass123' };

      const result = await controller.logIn(loginDto);

      expect(result).toEqual(mockAuthResult);
    });
  });
});
