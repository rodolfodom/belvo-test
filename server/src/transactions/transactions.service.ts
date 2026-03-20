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
}
