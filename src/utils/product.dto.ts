import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      const val = value.trim().toLowerCase();

      if (val === 'true' || val === '1') return true;
      if (val === 'false' || val === '0') return false;
    }

    return false;
  })
  @IsBoolean()
  isAvailable: boolean;
}
