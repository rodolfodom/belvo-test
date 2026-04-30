import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetSummaryDto } from './dto/get-summary.dto';
import { Transaction } from './entities/transaction.entity';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/entities/user.entity';

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
  @Post('bulk')
  async createMany(
    @Body(new ParseArrayPipe({ items: CreateTransactionDto }))
    transactionsData: CreateTransactionDto[],
    @Request() req: { user: User },
  ): Promise<Transaction[]> {
    return await this.service.createMany(transactionsData, req.user);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAllByUser(@Request() req: { user: User }): Promise<Transaction[]> {
    const user: User = req.user;
    return await this.service.findAllByUser(user);
  }

  @UseGuards(AuthGuard)
  @Get('summary/by-category')
  async getSummaryByCategory(
    @Request() req: { user: User },
  ): Promise<Record<string, Record<string, string>>> {
    return await this.service.getSummaryByCategory(req.user);
  }

  @UseGuards(AuthGuard)
  @Get('summary/by-account')
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
