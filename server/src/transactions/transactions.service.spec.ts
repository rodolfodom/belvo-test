import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Account } from '../accounts/entities/account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';

const mockUser: User = {
  id: 1,
  name: 'Rodolfo',
  email: 'rodolfo@test.com',
  password: 'hashed-password',
  accounts: [],
};

const mockAccount: Account = {
  id: 'acc-uuid-1',
  name: 'BBVA',
  balance: 0,
  user: mockUser,
  transactions: [],
};

const mockTransaction: Transaction = {
  reference: 'REF001',
  date: new Date('2026-03-01'),
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  account: mockAccount,
};

const createTransactionDto: CreateTransactionDto = {
  reference: 'REF001',
  accountID: 'acc-uuid-1',
  amount: -255,
  type: 'outflow',
  category: 'groceries',
  date: '2026-03-01',
};

// Reusable QueryBuilder mock — each method returns this (fluent interface)
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getRawMany: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<
    Pick<
      import('typeorm').Repository<Transaction>,
      'create' | 'save' | 'findOneBy' | 'findBy' | 'createQueryBuilder'
    >
  >;
  let accountsService: jest.Mocked<Pick<AccountsService, 'findOne'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: AccountsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    accountsService = module.get(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('resolves the account and passes the entity to the repository', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      accountsService.findOne.mockResolvedValue(mockAccount);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(accountsService.findOne).toHaveBeenCalledWith('acc-uuid-1', mockUser);
      expect(transactionRepository.create).toHaveBeenCalledWith({
        reference: 'REF001',
        amount: -255,
        type: 'outflow',
        category: 'groceries',
        date: new Date('2026-03-01'),
        account: mockAccount,
      });
    });

    it('converts the date string to a Date object', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      accountsService.findOne.mockResolvedValue(mockAccount);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);

      await service.create(createTransactionDto, mockUser);

      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ date: new Date('2026-03-01') }),
      );
    });

    it('returns the saved transaction', async () => {
      transactionRepository.findOneBy.mockResolvedValue(null);
      accountsService.findOne.mockResolvedValue(mockAccount);
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
      {
        reference: 'REF001',
        accountID: 'acc-uuid-1',
        amount: -255,
        type: 'outflow',
        category: 'groceries',
        date: '2026-03-01',
      },
      {
        reference: 'REF002',
        accountID: 'acc-uuid-1',
        amount: 1000,
        type: 'inflow',
        category: 'salary',
        date: '2026-03-02',
      },
    ];

    const mockTransaction2: Transaction = {
      reference: 'REF002',
      date: new Date('2026-03-02'),
      amount: 1000,
      type: 'inflow',
      category: 'salary',
      account: mockAccount,
    };

    const mockTransactions = [mockTransaction, mockTransaction2];

    it('creates transactions with the resolved account entity', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
      accountsService.findOne.mockResolvedValue(mockAccount);
      transactionRepository.create
        .mockReturnValueOnce(mockTransaction)
        .mockReturnValueOnce(mockTransaction2);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      await service.createMany(createDtos, mockUser);

      expect(transactionRepository.create).toHaveBeenNthCalledWith(1, {
        reference: 'REF001',
        amount: -255,
        type: 'outflow',
        category: 'groceries',
        date: new Date('2026-03-01'),
        account: mockAccount,
      });
      expect(transactionRepository.create).toHaveBeenNthCalledWith(2, {
        reference: 'REF002',
        amount: 1000,
        type: 'inflow',
        category: 'salary',
        date: new Date('2026-03-02'),
        account: mockAccount,
      });
    });

    it('returns the array of saved transactions', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
      accountsService.findOne.mockResolvedValue(mockAccount);
      transactionRepository.create
        .mockReturnValueOnce(mockTransactions[0])
        .mockReturnValueOnce(mockTransactions[1]);
      transactionRepository.save.mockResolvedValue(mockTransactions as any);

      const result = await service.createMany(createDtos, mockUser);

      expect(result).toEqual(mockTransactions);
    });

    it('calls save once with the full array', async () => {
      transactionRepository.findBy.mockResolvedValue([]);
      accountsService.findOne.mockResolvedValue(mockAccount);
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
        {
          reference: 'REF001',
          accountID: 'acc-uuid-1',
          amount: -255,
          type: 'outflow',
          category: 'groceries',
          date: '2026-03-01',
        },
        {
          reference: 'REF001',
          accountID: 'acc-uuid-1',
          amount: 1000,
          type: 'inflow',
          category: 'salary',
          date: '2026-03-02',
        },
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
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllByUser(mockUser);

      expect(result).toEqual([mockTransaction]);
    });

    it('filters by user via account join', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAllByUser(mockUser);

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('tx.account', 'account');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('account.user', 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', { userId: 1 });
    });

    it('returns an empty array when the user has no transactions', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

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

    it('filters by the user via account join', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getSummaryByCategory(mockUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', { userId: 1 });
    });
  });

  describe('getSummaryByAccount', () => {
    const mockRows = [
      {
        accountId: 'acc-uuid-1',
        accountName: 'BBVA',
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
          accountId: 'acc-uuid-1',
          accountName: 'BBVA',
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
