import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { HashService } from '../utils/hash.service';
import { CreateUserDto } from './create-user.dto';

const mockUser: User = {
  id: 1,
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
  password: 'hashed-password',
  transactions: [],
};

const createUserDto: CreateUserDto = {
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
  password: 'PlainPassword1!',
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Pick<import('typeorm').Repository<User>, 'create' | 'save' | 'findOne'>>;
  let hashService: jest.Mocked<Pick<HashService, 'hash'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: { hash: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    hashService = module.get(HashService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('hashea la password antes de guardar el usuario', async () => {
      hashService.hash.mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(hashService.hash).toHaveBeenCalledWith('PlainPassword1!');
    });

    it('crea el usuario con la password hasheada, no la original', async () => {
      hashService.hash.mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
    });

    it('guarda el usuario y retorna el resultado', async () => {
      hashService.hash.mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('retorna el usuario cuando existe el email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('rodolfo@test.com');

      expect(result).toEqual(mockUser);
    });

    it('llama a findOne con el where correcto', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await service.findByEmail('rodolfo@test.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'rodolfo@test.com' },
      });
    });

    it('retorna null cuando el email no existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('retorna el usuario cuando existe el id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
    });

    it('llama a findOne con el where correcto', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await service.findOne(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('retorna null cuando el id no existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
