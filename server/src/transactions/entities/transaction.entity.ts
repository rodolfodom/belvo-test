import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import type { TransactionType } from '../dto/create-transaction.dto';

@Entity()
export class Transaction {
  @PrimaryColumn()
  reference!: string;

  @Column()
  account!: string;

  @Column()
  date!: Date;

  @Column()
  amount!: number;

  @Column({ type: 'text', enum: ['outflow', 'inflow'] })
  type!: TransactionType;

  @Column()
  category!: string;

  @Exclude()
  @ManyToOne(() => User, (user: User) => user.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;
}
