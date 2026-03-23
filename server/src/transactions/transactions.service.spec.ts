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
  reference: 'REF001',
  account: 'BBVA',
  date: new Date('2026-03-01'),
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  user: mockUser,
};

const createTransactionDto: CreateTransactionDto = {
  reference: 'REF001',
  account: 'BBVA',
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  date: '2026-03-01',
};

// Reusable QueryBuilder mock — each method returns this (fluent interface)
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
    Pick<import('typeorm').Repository<Transaction>, 'create' | 'save' | 'find' | 'findOneBy' | 'findBy' | 'createQueryBuilder'>
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
            findOneBy: jest.fn(),
            findBy: jest.fn(),
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
    it('converts the date string to a Date object', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        date: new Date('2026-03-01'),
      });
    });

    it('assigns the user to the transaction before saving', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      const partialTransaction = { ...mockTransaction, user: undefined } as any;
      transactionRepository.create.mockReturnValue(partialTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockUser }),
      );
    });

    it('returns the saved transaction', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransactionDto, mockUser);

      expect(result).toEqual(mockTransaction);
    });

    it('throws ConflictException if the reference already exists', async () => {
      transactionRepository.findOneBy.mockResolvedValue(mockTransaction);

      await expect(service.create(createTransactionDto, mockUser)).rejects.toThrow(
        `Transaction with reference 'REF001' already exists`,
      );
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const createDtos: CreateTransactionDto[] = [
      { reference: 'REF001', account: 'BBVA', amount: -255, type: 'outflow', category: 'groceries', date: '2026-03-01' },
      { reference: 'REF002', account: 'BBVA', amount: 1000, type: 'inflow', category: 'salary', date: '2026-03-02' },
    ];

    const mockTransactions: Transaction[] = [
      { ...mockTransaction },
      { reference: 'REF002', account: 'BBVA', date: new Date('2026-03-02'), amount: 1000, type: 'inflow', category: 'salary', user: mockUser },
    ];

    it('converts the date string to Date in each transaction', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
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

    it('assigns the user to each transaction before saving', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
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

    it('returns the array of saved transactions', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
      transactionRepository.create
        .mockReturnValueOnce(mockTransactions[0])
        .mockReturnValueOnce(mockTransactions[1]);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      const result = await service.createMany(createDtos, mockUser);

      expect(result).toEqual(mockTransactions);
    });

    it('calls save once with the full array', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
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

    it('throws ConflictException if there are duplicate references in the batch', async () => {
      const dtosWithDup: CreateTransactionDto[] = [
        { reference: 'REF001', account: 'BBVA', amount: -255, type: 'outflow', category: 'groceries', date: '2026-03-01' },
        { reference: 'REF001', account: 'BBVA', amount: 1000, type: 'inflow', category: 'salary', date: '2026-03-02' },
      ];

      await expect(service.createMany(dtosWithDup, mockUser)).rejects.toThrow(
        'The request contains duplicate transaction references',
      );
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException if any reference already exists in the database', async () => {
      transactionRepository.findBy.mockResolvedValue([mockTransaction]);

      await expect(service.createMany(createDtos, mockUser)).rejects.toThrow(
        'Transactions already exist with references: REF001',
      );
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('returns all transactions for the user', async () => {
      transactionRepository.find.mockResolvedValue([mockTransaction]);

      const result = await service.findAllByUser(mockUser);

      expect(result).toEqual([mockTransaction]);
    });

    it('calls find with the correct where clause', async () => {
      transactionRepository.find.mockResolvedValue([]);

      await service.findAllByUser(mockUser);

      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { user: mockUser },
      });
    });

    it('returns an empty array when the user has no transactions', async () => {
      transactionRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUser(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getSummaryByCategory', () => {
    it('groups transactions by type and category', async () => {
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

    it('formats totals with 2 decimal places', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { type: 'inflow', category: 'salary', total: '1234.5' },
      ]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByCategory(mockUser);

      expect(result.inflow.salary).toBe('1234.50');
    });

    it('returns an empty object when there are no transactions', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByCategory(mockUser);

      expect(result).toEqual({});
    });

    it('filters by the user userId', async () => {
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

    it('returns the summary with values formatted to 2 decimal places', async () => {
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

    it('does not apply date filter when startDate and endDate are not provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('applies startDate filter when provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser, '2026-01-01');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date >= :startDate', {
        startDate: '2026-01-01',
      });
    });

    it('applies endDate filter when provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByAccount(mockUser, undefined, '2026-03-31');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tx.date <= :endDate', {
        endDate: '2026-03-31',
      });
    });

    it('applies both filters when startDate and endDate are provided', async () => {
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

    it('returns an empty array when there are no transactions', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getSummaryByAccount(mockUser);

      expect(result).toEqual([]);
    });
  });
});
