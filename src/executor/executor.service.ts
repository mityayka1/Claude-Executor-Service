import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClaudeCliService } from './claude-cli.service';
import { RunLoggerService } from './run-logger.service';
import { ExecuteTaskDto, ModelType } from '../common/dto/execute-task.dto';
import { ExecuteSuccessResponseDto } from '../common/dto/execute-response.dto';
import { ExecutorException } from '../common/exceptions/executor.exception';
import { ExecutorConfig } from '../config/configuration';

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);
  private readonly config: ExecutorConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly claudeCliService: ClaudeCliService,
    private readonly runLoggerService: RunLoggerService,
  ) {
    this.config = this.configService.get<ExecutorConfig>('executor');
  }

  async execute<T = unknown>(
    dto: ExecuteTaskDto,
  ): Promise<ExecuteSuccessResponseDto<T>> {
    const model = dto.model || (this.config.defaults.model as ModelType);
    const timeout = dto.timeout || this.config.defaults.timeout;

    this.logger.log(
      `Executing task: type=${dto.taskType}, model=${model}, agent=${dto.agent || 'none'}`,
    );

    try {
      const result = await this.claudeCliService.execute<T>({
        prompt: dto.prompt,
        schema: dto.schema,
        model,
        timeout,
        allowedTools: dto.allowedTools,
      });

      const run = await this.runLoggerService.logSuccess({
        taskType: dto.taskType,
        model,
        agentName: dto.agent,
        sessionId: result.sessionId,
        tokensIn: result.usage.inputTokens,
        tokensOut: result.usage.outputTokens,
        costUsd: result.costUsd,
        durationMs: result.durationMs,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        inputPreview: dto.prompt,
        outputPreview: JSON.stringify(result.data),
      });

      return {
        success: true,
        data: result.data,
        runId: run.id,
        sessionId: result.sessionId,
        durationMs: result.durationMs,
        usage: result.usage,
        costUsd: result.costUsd,
      };
    } catch (error) {
      if (error instanceof ExecutorException) {
        const run = await this.runLoggerService.logError({
          taskType: dto.taskType,
          model,
          agentName: dto.agent,
          durationMs: error.durationMs || 0,
          errorCode: error.code,
          errorMessage: error.message,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          inputPreview: dto.prompt,
        });

        throw new ExecutorException(
          error.code,
          error.message,
          run.id,
          error.durationMs,
        );
      }

      const run = await this.runLoggerService.logError({
        taskType: dto.taskType,
        model,
        agentName: dto.agent,
        durationMs: 0,
        errorCode: 'UNKNOWN_ERROR',
        errorMessage: error.message,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        inputPreview: dto.prompt,
      });

      throw error;
    }
  }
}
