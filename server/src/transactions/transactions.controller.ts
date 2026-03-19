import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { Transaction } from './transaction.entity';

@Controller('users')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  async create(
    @Body() transactionData: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.service.create(transactionData);
  }
}
