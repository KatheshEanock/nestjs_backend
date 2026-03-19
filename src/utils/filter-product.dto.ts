import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @IsOptional()
  @Type(() => Number)
  minStock?: number;

  @IsOptional()
  @Type(() => Number)
  maxStock?: number;
}
