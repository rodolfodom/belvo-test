import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import type { TransactionType } from './create-transaction.dto';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  reference: number;

  @Column()
  account: string;

  @Column()
  date: Date;

  @Column()
  amount: number;

  @Column()
  type: TransactionType;

  @Column()
  category: string;

  @ManyToOne(() => User, (user) => user.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
