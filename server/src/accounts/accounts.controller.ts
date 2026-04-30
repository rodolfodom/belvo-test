import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/entities/user.entity';

@UseGuards(AuthGuard)
@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Body() dto: CreateAccountDto,
    @Request() req: { user: User },
  ) {
    return this.accountsService.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req: { user: User }) {
    return this.accountsService.findAllByUser(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.accountsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() req: { user: User },
  ) {
    return this.accountsService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.accountsService.remove(id, req.user);
  }
}
