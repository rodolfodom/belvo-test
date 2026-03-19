import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

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
  type: string;

  @Column()
  category: string;

  @ManyToOne(() => User, (user) => user.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
