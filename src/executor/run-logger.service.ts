import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaudeCliRun } from '../database/entities/claude-cli-run.entity';

export interface LogRunSuccessParams {
  taskType: string;
  model: string;
  agentName?: string;
  sessionId: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  durationMs: number;
  referenceType?: string;
  referenceId?: string;
  inputPreview?: string;
  outputPreview?: string;
}

export interface LogRunErrorParams {
  taskType: string;
  model: string;
  agentName?: string;
  durationMs: number;
  errorCode: string;
  errorMessage: string;
  referenceType?: string;
  referenceId?: string;
  inputPreview?: string;
}

@Injectable()
export class RunLoggerService {
  private readonly logger = new Logger(RunLoggerService.name);

  constructor(
    @InjectRepository(ClaudeCliRun)
    private readonly runRepository: Repository<ClaudeCliRun>,
  ) {}

  async logSuccess(params: LogRunSuccessParams): Promise<ClaudeCliRun> {
    const run = this.runRepository.create({
      taskType: params.taskType,
      model: params.model,
      agentName: params.agentName || null,
      sessionId: params.sessionId,
      tokensIn: params.tokensIn,
      tokensOut: params.tokensOut,
      costUsd: params.costUsd,
      durationMs: params.durationMs,
      success: true,
      errorCode: null,
      errorMessage: null,
      referenceType: params.referenceType || null,
      referenceId: params.referenceId || null,
      inputPreview: params.inputPreview?.substring(0, 500) || null,
      outputPreview: params.outputPreview?.substring(0, 500) || null,
      createdDate: new Date(),
    });

    const saved = await this.runRepository.save(run);
    this.logger.debug(`Logged successful run: ${saved.id}`);
    return saved;
  }

  async logError(params: LogRunErrorParams): Promise<ClaudeCliRun> {
    const run = this.runRepository.create({
      taskType: params.taskType,
      model: params.model,
      agentName: params.agentName || null,
      sessionId: null,
      tokensIn: null,
      tokensOut: null,
      costUsd: null,
      durationMs: params.durationMs,
      success: false,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
      referenceType: params.referenceType || null,
      referenceId: params.referenceId || null,
      inputPreview: params.inputPreview?.substring(0, 500) || null,
      outputPreview: null,
      createdDate: new Date(),
    });

    const saved = await this.runRepository.save(run);
    this.logger.debug(`Logged error run: ${saved.id}`);
    return saved;
  }
}
