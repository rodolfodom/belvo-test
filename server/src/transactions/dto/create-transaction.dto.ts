import {
  IsString,
  IsNumber,
  IsIn,
  Validate,
  Matches,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
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
      return `Amount must be negative for outflow.`;
    }
    if (obj.type === 'inflow') {
      return 'Amount must be positive for inflow. ()';
    }
    return 'Invalid transaction type.';
  }
}

// Validador personalizado para fecha igual o anterior a hoy
export function IsPastOrToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPastOrToday',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Espera formato YYYY-MM-DD
          const date = new Date(value + 'T00:00:00');
          const now = new Date();
          // Ignorar hora, comparar solo fecha
          date.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          return date <= now;
        },
        defaultMessage() {
          return 'date must be today or in the past';
        },
      },
    });
  };
}

export class CreateTransactionDto {
  @IsString()
  reference!: string;

  @IsString()
  account!: string;

  @IsNumber()
  @Validate(AmountTypeMatch)
  amount!: number;

  @IsIn(['outflow', 'inflow'])
  type!: TransactionType;

  @IsString()
  category!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in format YYYY-MM-DD',
  })
  @IsPastOrToday({ message: 'date must be today or in the past' })
  date!: string;
}
