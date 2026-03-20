import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { Transaction } from './transaction.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/user.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() transactionData: CreateTransactionDto,
    @Request() req: { user: User },
  ): Promise<Transaction> {
    const user: User = req.user; // El usuario autenticado se encuentra en req.user gracias al AuthGuard
    return await this.service.create(transactionData, user);
  }
}
