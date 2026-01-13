import {
  IsString,
  IsObject,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export enum ModelType {
  HAIKU = 'haiku',
  SONNET = 'sonnet',
  OPUS = 'opus',
}

export class ExecuteTaskDto {
  @IsString()
  taskType: string;

  @IsString()
  @MaxLength(50000)
  prompt: string;

  @IsObject()
  schema: object;

  @IsOptional()
  @IsString()
  agent?: string;

  @IsOptional()
  @IsEnum(ModelType)
  model?: ModelType;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(600000)
  timeout?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedTools?: string[];

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
