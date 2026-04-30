import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Account } from '../../accounts/entities/account.entity';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];
}
