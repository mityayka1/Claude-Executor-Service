import { IsOptional, IsEnum } from 'class-validator';

export enum StatsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class StatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod = StatsPeriod.MONTH;
}

export class TaskTypeStatsDto {
  runs: number;
  avgDuration: number;
}

export class ModelStatsDto {
  runs: number;
  costUsd: number;
}

export class StatsResponseDto {
  period: StatsPeriod;
  totalRuns: number;
  successRate: number;
  totalCostUsd: number;
  avgDurationMs: number;
  byTaskType: Record<string, TaskTypeStatsDto>;
  byModel: Record<string, ModelStatsDto>;
}
