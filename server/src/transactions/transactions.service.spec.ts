import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { User } from '../users/user.entity';
import { CreateTransactionDto } from './create-transaction.dto';

const mockUser: User = {
  id: 1,
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
  password: 'hashed-password',
  transactions: [],
};

const mockTransaction: Transaction = {
  reference: 1,
  account: 'BBVA',
  date: new Date('2026-03-01'),
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  user: mockUser,
};

const createTransactionDto: CreateTransactionDto = {
  account: 'BBVA',
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  date: '2026-03-01',
};

// Mock reutilizable del QueryBuilder — cada método retorna this (fluent interface)
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<
    Pick<import('typeorm').Repository<Transaction>, 'create' | 'save' | 'find' | 'createQueryBuilder'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('convierte el date string a un objeto Date', async () => {
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        date: new Date('2026-03-01'),
      });
    });

    it('asigna el usuario a la transacción antes de guardar', async () => {
      const partialTransaction = { ...mockTransaction, user: undefined } as any;
      transactionRepository.create.mockReturnValue(partialTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockUser }),
      );
    });

    it('retorna la transacción guardada', async () => {
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransactionDto, mockUser);

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('createMany', () => {
    const createDtos: CreateTransactionDto[] = [
      { account: 'BBVA', amount: -255, type: 'outflow', category: 'groceries', date: '2026-03-01' },
      { account: 'BBVA', amount: 1000, type: 'inflow', category: 'salary', date: '2026-03-02' },
    ];

    const mockTransactions: Transaction[] = [
      { ...mockTransaction },
      { reference: 2, account: 'BBVA', date: new Date('2026-03-02'), amount: 1000, type: 'inflow', category: 'salary', user: mockUser },
    ];

    it('convierte el date string a Date en cada transacción', async () => {
      transactionRepository.create
        .mockReturnValueOnce(mockTransactions[0])
        .mockReturnValueOnce(mockTransactions[1]);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      await service.createMany(createDtos, mockUser);

      expect(transactionRepository.create).toHaveBeenNthCalledWith(1, {
        ...createDtos[0],
        date: new Date('2026-03-01'),
      });
      expect(transactionRepository.create).toHaveBeenNthCalledWith(2, {
        ...createDtos[1],
        date: new Date('2026-03-02'),
      });
    });

    it('asigna el usuario a cada transacción antes de guardar', async () => {
      const partial1 = { ...mockTransactions[0], user: undefined } as any;
      const partial2 = { ...mockTransactions[1], user: undefined } as any;
      transactionRepository.create
        .mockReturnValueOnce(partial1)
        .mockReturnValueOnce(partial2);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      await service.createMany(createDtos, mockUser);

      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ user: mockUser }),
          expect.objectContaining({ user: mockUser }),
        ]),
      );
    });

    it('retorna el array de transacciones guardadas', async () => {
      transactionRepository.create
        .mockReturnValueOnce(mockTransactions[0])
        .mockReturnValueOnce(mockTransactions[1]);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      const result = await service.createMany(createDtos, mockUser);

      expect(result).toEqual(mockTransactions);
    });

    it('llama a save una sola vez con el array completo', async () => {
      transactionRepository.create
        .mockReturnValueOnce(mockTransactions[0])
        .mockReturnValueOnce(mockTransactions[1]);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      await service.createMany(createDtos, mockUser);

      expect(transactionRepository.save).toHaveBeenCalledTimes(1);
      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([mockTransactions[0], mockTransactions[1]]),
      );
    });
  });

  describe('findAllByUser', () => {
    it('retorna todas las transacciones del usuario', async () => {
      transactionRepository.find.mockResolvedValue([mockTransaction]);

      const result = await service.findAllByUser(mockUser);

      expect(result).toEqual([mockTransaction]);
    });

    it('llama a find con el where correcto', async () => {
      transactionRepository.find.mockResolvedValue([]);

      await service.findAllByUser(mockUser);

      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { user: mockUser },
      });
    });

    it('retorna array vacío cuando el usuario no tiene transacciones', async () => {
      transactionRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUser(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getSummaryByCategory', () => {
    it('agrupa las transacciones por tipo y categoría', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { type: 'outflow', category: 'groceries', total: '500' },
        { type: 'outflow', category: 'transport', total: '200' },
        { type: 'inflow', category: 'salary', total: '3000' },
      ]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByCategory(mockUser);

      expect(result).toEqual({
        outflow: { groceries: '500.00', transport: '200.00' },
        inflow: { salary: '3000.00' },
      });
    });

    it('formatea los totales con 2 decimales', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { type: 'inflow', category: 'salary', total: '1234.5' },
      ]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByCategory(mockUser);

      expect(result.inflow.salary).toBe('1234.50');
    });

    it('retorna objeto vacío cuando no hay transacciones', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByCategory(mockUser);

      expect(result).toEqual({});
    });

    it('filtra por el userId del usuario', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByCategory(mockUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('tx.userId = :userId', { userId: 1 });
    });
  });

  describe('getSummaryByAccount', () => {
    const mockRows = [
      {
        account: 'BBVA',
        balance: '2000.5',
        total_inflow: '3000',
        total_outflow: '999.5',
      },
    ];

    it('retorna el resumen con valores formateados a 2 decimales', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRows);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByAccount(mockUser);

      expect(result).toEqual([
        {
          account: 'BBVA',
          balance: '2000.50',
          total_inflow: '3000.00',
          total_outflow: '999.50',
        },
      ]);
    });

    it('no aplica filtro de fecha cuando no se pasan startDate ni endDate', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('aplica filtro de startDate cuando se proporciona', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser, '2026-01-01');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date >= :startDate', {
        startDate: '2026-01-01',
      });
    });

    it('aplica filtro de endDate cuando se proporciona', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser, undefined, '2026-03-31');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date <= :endDate', {
        endDate: '2026-03-31',
      });
    });

    it('aplica ambos filtros cuando se proporcionan startDate y endDate', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser, '2026-01-01', '2026-03-31');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date >= :startDate', {
        startDate: '2026-01-01',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date <= :endDate', {
        endDate: '2026-03-31',
      });
    });

    it('retorna array vacío cuando no hay transacciones', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByAccount(mockUser);

      expect(result).toEqual([]);
    });
  });
});
