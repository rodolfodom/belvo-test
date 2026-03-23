import { IsDateString, IsOptional } from 'class-validator';

export class GetSummaryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
