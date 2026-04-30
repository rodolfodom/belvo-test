import { IsOptional, Matches } from 'class-validator';

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT_MESSAGE = 'must be a date in YYYY-MM-DD format';

export class GetSummaryDto {
  @IsOptional()
  @Matches(DATE_FORMAT_REGEX, { message: `startDate ${DATE_FORMAT_MESSAGE}` })
  startDate?: string;

  @IsOptional()
  @Matches(DATE_FORMAT_REGEX, { message: `endDate ${DATE_FORMAT_MESSAGE}` })
  endDate?: string;
}
