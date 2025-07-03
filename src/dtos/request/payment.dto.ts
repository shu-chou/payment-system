import { IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class PaymentRequestDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;
} 