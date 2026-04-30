import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction]),
        AuthModule,
        AccountsModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService],
})
export class TransactionsModule {}
