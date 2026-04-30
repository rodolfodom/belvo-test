import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/entities/user.entity';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private accountsService: AccountsService,
  ) {}

  async create(
    transactionData: CreateTransactionDto,
    user: User,
  ): Promise<Transaction> {
    const existing = await this.transactionRepository.findOneBy({
      reference: transactionData.reference,
    });
    if (existing) {
      throw new ConflictException(
        `Transaction with reference '${transactionData.reference}' already exists`,
      );
    }
    const account = await this.accountsService.findOne(
      transactionData.accountID,
      user,
    );
    const transaction = this.transactionRepository.create({
      reference: transactionData.reference,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category,
      date: new Date(transactionData.date),
      account,
    });
    return this.transactionRepository.save(transaction);
  }

  async createMany(
    transactionsData: CreateTransactionDto[],
    user: User,
  ): Promise<Transaction[]> {
    const references = transactionsData.map((d) => d.reference);
    if (new Set(references).size !== references.length) {
      throw new ConflictException(
        'The request contains duplicate transaction references',
      );
    }
    const existing = await this.transactionRepository.findBy({
      reference: In(references),
    });
    if (existing.length > 0) {
      const duplicates = existing.map((t) => t.reference).join(', ');
      throw new ConflictException(
        `Transactions already exist with references: ${duplicates}`,
      );
    }

    const uniqueAccountIDs = [
      ...new Set(transactionsData.map((d) => d.accountID)),
    ];
    const accounts = await Promise.all(
      uniqueAccountIDs.map((id) => this.accountsService.findOne(id, user)),
    );
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    const transactions = transactionsData.map((data) =>
      this.transactionRepository.create({
        reference: data.reference,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        account: accountMap.get(data.accountID)!,
      }),
    );
    return this.transactionRepository.save(transactions);
  }

  async findAllByUser(user: User): Promise<Transaction[]> {
    return this.transactionRepository
      .createQueryBuilder('tx')
      .innerJoin('tx.account', 'account')
      .innerJoin('account.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getMany();
  }

  async getSummaryByCategory(
    user: User,
  ): Promise<Record<string, Record<string, string>>> {
    const rows = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('tx.type', 'type')
      .addSelect('tx.category', 'category')
      .addSelect('SUM(tx.amount)', 'total')
      .innerJoin('tx.account', 'account')
      .innerJoin('account.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .groupBy('tx.type')
      .addGroupBy('tx.category')
      .getRawMany<{ type: string; category: string; total: string }>();

    const result: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!result[row.type]) result[row.type] = {};
      result[row.type][row.category] = parseFloat(row.total).toFixed(2);
    }
    return result;
  }

  async getSummaryByAccount(
    user: User,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    const qb = this.transactionRepository
      .createQueryBuilder('tx')
      .select('account.id', 'accountId')
      .addSelect('account.name', 'accountName')
      .addSelect('SUM(tx.amount)', 'balance')
      .addSelect(
        `SUM(CASE WHEN tx.type = 'inflow' THEN tx.amount ELSE 0 END)`,
        'total_inflow',
      )
      .addSelect(
        `SUM(CASE WHEN tx.type = 'outflow' THEN tx.amount ELSE 0 END)`,
        'total_outflow',
      )
      .innerJoin('tx.account', 'account')
      .innerJoin('account.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .groupBy('account.id')
      .addGroupBy('account.name');

    if (startDate) qb.andWhere('tx.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('tx.date <= :endDate', { endDate });

    const rows = await qb.getRawMany<{
      accountId: string;
      accountName: string;
      balance: string;
      total_inflow: string;
      total_outflow: string;
    }>();

    return rows.map((row) => ({
      accountId: row.accountId,
      accountName: row.accountName,
      balance: parseFloat(row.balance).toFixed(2),
      total_inflow: parseFloat(row.total_inflow).toFixed(2),
      total_outflow: parseFloat(row.total_outflow).toFixed(2),
    }));
  }
}
