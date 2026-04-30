import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto, user: User): Promise<Account> {
    const account = this.accountRepository.create({
      id: randomUUID(),
      name: dto.name,
      balance: 0,
      user,
    });
    return this.accountRepository.save(account);
  }

  async findAllByUser(user: User): Promise<Account[]> {
    return this.accountRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!account) throw new NotFoundException(`Account '${id}' not found`);
    return account;
  }

  async update(
    id: string,
    dto: UpdateAccountDto,
    user: User,
  ): Promise<Account> {
    const account = await this.findOne(id, user);
    Object.assign(account, dto);
    return this.accountRepository.save(account);
  }

  async remove(id: string, user: User): Promise<void> {
    const account = await this.findOne(id, user);
    await this.accountRepository.remove(account);
  }
}
