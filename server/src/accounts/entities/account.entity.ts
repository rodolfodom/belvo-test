import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exclude } from 'class-transformer';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class Account {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Exclude()
  @ManyToOne(() => User, (user: User) => user.accounts, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Exclude()
  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions!: Transaction[];

  @Column('decimal', { precision: 15, scale: 2 })
  balance!: number;
}
