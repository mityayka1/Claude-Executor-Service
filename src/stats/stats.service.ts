import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ClaudeCliRun } from '../database/entities/claude-cli-run.entity';
import {
  StatsPeriod,
  StatsResponseDto,
  TaskTypeStatsDto,
  ModelStatsDto,
} from '../common/dto/stats.dto';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(ClaudeCliRun)
    private readonly runRepository: Repository<ClaudeCliRun>,
  ) {}

  async getStats(period: StatsPeriod): Promise<StatsResponseDto> {
    const startDate = this.getStartDate(period);

    const runs = await this.runRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    const totalRuns = runs.length;
    const successfulRuns = runs.filter((r) => r.success).length;
    const successRate = totalRuns > 0 ? successfulRuns / totalRuns : 0;

    const totalCostUsd = runs.reduce(
      (sum, r) => sum + (Number(r.costUsd) || 0),
      0,
    );

    const avgDurationMs =
      totalRuns > 0
        ? runs.reduce((sum, r) => sum + r.durationMs, 0) / totalRuns
        : 0;

    const byTaskType = this.groupByTaskType(runs);
    const byModel = this.groupByModel(runs);

    return {
      period,
      totalRuns,
      successRate: Math.round(successRate * 1000) / 1000,
      totalCostUsd: Math.round(totalCostUsd * 100) / 100,
      avgDurationMs: Math.round(avgDurationMs),
      byTaskType,
      byModel,
    };
  }

  private getStartDate(period: StatsPeriod): Date {
    const now = new Date();
    switch (period) {
      case StatsPeriod.DAY:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case StatsPeriod.WEEK:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case StatsPeriod.MONTH:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private groupByTaskType(
    runs: ClaudeCliRun[],
  ): Record<string, TaskTypeStatsDto> {
    const groups: Record<string, ClaudeCliRun[]> = {};

    for (const run of runs) {
      if (!groups[run.taskType]) {
        groups[run.taskType] = [];
      }
      groups[run.taskType].push(run);
    }

    const result: Record<string, TaskTypeStatsDto> = {};
    for (const [taskType, taskRuns] of Object.entries(groups)) {
      const avgDuration =
        taskRuns.reduce((sum, r) => sum + r.durationMs, 0) / taskRuns.length;
      result[taskType] = {
        runs: taskRuns.length,
        avgDuration: Math.round(avgDuration),
      };
    }

    return result;
  }

  private groupByModel(runs: ClaudeCliRun[]): Record<string, ModelStatsDto> {
    const groups: Record<string, ClaudeCliRun[]> = {};

    for (const run of runs) {
      if (!groups[run.model]) {
        groups[run.model] = [];
      }
      groups[run.model].push(run);
    }

    const result: Record<string, ModelStatsDto> = {};
    for (const [model, modelRuns] of Object.entries(groups)) {
      const costUsd = modelRuns.reduce(
        (sum, r) => sum + (Number(r.costUsd) || 0),
        0,
      );
      result[model] = {
        runs: modelRuns.length,
        costUsd: Math.round(costUsd * 100) / 100,
      };
    }

    return result;
  }
}
