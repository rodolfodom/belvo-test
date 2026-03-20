import {
  IsString,
  IsNumber,
  IsISO8601,
  IsIn,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export type TransactionType = 'outflow' | 'inflow';

@ValidatorConstraint({ name: 'AmountTypeMatch', async: false })
export class AmountTypeMatch implements ValidatorConstraintInterface {
  validate(amount: number, args: ValidationArguments): boolean {
    const obj = args.object as CreateTransactionDto;
    if (obj.type === 'outflow') {
      return amount < 0;
    }
    if (obj.type === 'inflow') {
      return amount > 0;
    }
    return false;
  }
  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as CreateTransactionDto;
    if (obj.type === 'outflow') {
      console.log('Holaaaaa');
      return `Amount must be negative for outflow. ${obj.amount}`;
    }
    if (obj.type === 'inflow') {
      return 'Amount must be positive for inflow. ()';
    }
    return 'Invalid transaction type.';
  }
}

export class CreateTransactionDto {
  @IsString()
  account: string;

  @IsNumber()
  @Validate(AmountTypeMatch)
  amount: number;

  @IsIn(['outflow', 'inflow'])
  type: TransactionType;

  @IsString()
  category: string;

  @IsISO8601()
  date: string;
}
