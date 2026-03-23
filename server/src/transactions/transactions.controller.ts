import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { GetSummaryDto } from './get-summary.dto';
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
    const user: User = req.user;
    return await this.service.create(transactionData, user);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAllByUser(@Request() req: { user: User }): Promise<Transaction[]> {
    const user: User = req.user;
    return await this.service.findAllByUser(user);
  }

  @UseGuards(AuthGuard)
  @Get('summary')
  async getSummary(
    @Request() req: { user: User },
    @Query() query: GetSummaryDto,
  ): Promise<any[]> {
    const user: User = req.user;
    return await this.service.getSummaryByAccount(
      user,
      query.startDate,
      query.endDate,
    );
  }
}
