import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './create-transaction.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    transactionData: CreateTransactionDto,
    user: User,
  ): Promise<Transaction> {
    // Convertir date string a Date
    const transaction = this.transactionRepository.create({
      ...transactionData,
      date: new Date(transactionData.date),
    });
    transaction.user = user;
    return this.transactionRepository.save(transaction);
  }

  async findAllByUser(user: User): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { user } });
  }

  async getSummaryByCategory(user: User): Promise<Record<string, Record<string, string>>> {
    const rows = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('tx.type', 'type')
      .addSelect('tx.category', 'category')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId', { userId: user.id })
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
      .select('tx.account', 'account')
      .addSelect('SUM(tx.amount)', 'balance')
      .addSelect(
        `SUM(CASE WHEN tx.type = 'inflow' THEN tx.amount ELSE 0 END)`,
        'total_inflow',
      )
      .addSelect(
        `SUM(CASE WHEN tx.type = 'outflow' THEN tx.amount ELSE 0 END)`,
        'total_outflow',
      )
      .where('tx.userId = :userId', { userId: user.id })
      .groupBy('tx.account');

    if (startDate) {
      qb.andWhere('tx.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('tx.date <= :endDate', { endDate });
    }

    const rows = await qb.getRawMany<{
      account: string;
      balance: string;
      total_inflow: string;
      total_outflow: string;
    }>();

    return rows.map((row) => ({
      account: row.account,
      balance: parseFloat(row.balance).toFixed(2),
      total_inflow: parseFloat(row.total_inflow).toFixed(2),
      total_outflow: parseFloat(row.total_outflow).toFixed(2),
    }));
  }
}
