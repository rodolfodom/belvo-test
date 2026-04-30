import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import type { TransactionType } from '../dto/create-transaction.dto';
import { Account } from '../../accounts/entities/account.entity';

@Entity()
export class Transaction {
  @PrimaryColumn()
  reference!: string;

  @Column()
  date!: Date;

  @Column()
  amount!: number;

  @Column({ type: 'text', enum: ['outflow', 'inflow'] })
  type!: TransactionType;

  @Column()
  category!: string;

  @ManyToOne(() => Account, (account: Account) => account.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  account!: Account;
}
