import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import {
  ClaudeCliCallParams,
  ClaudeCliResponse,
  ClaudeCliRawResult,
  ProcessResult,
  ParsedResponse,
} from '../common/interfaces/claude-cli.interface';
import {
  ExecutorException,
  ExecutorErrorCode,
} from '../common/exceptions/executor.exception';
import { ExecutorConfig } from '../config/configuration';

@Injectable()
export class ClaudeCliService {
  private readonly logger = new Logger(ClaudeCliService.name);
  private readonly config: ExecutorConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ExecutorConfig>('executor');
  }

  async execute<T>(params: ClaudeCliCallParams): Promise<ClaudeCliResponse<T>> {
    const startTime = Date.now();
    const model = params.model || this.config.defaults.model;
    const timeout = params.timeout || this.config.defaults.timeout;

    // Validate prompt length
    if (params.prompt.length > this.config.limits.maxPromptLength) {
      throw new ExecutorException(
        ExecutorErrorCode.PROMPT_TOO_LONG,
        `Prompt length ${params.prompt.length} exceeds maximum ${this.config.limits.maxPromptLength}`,
      );
    }

    const args = this.buildCliArgs(params, model);

    this.logger.log(
      `Calling Claude CLI: model=${model}, timeout=${timeout}ms, promptLength=${params.prompt.length}`,
    );

    let result: ProcessResult;
    let lastError: Error;

    // Retry logic
    for (let attempt = 1; attempt <= this.config.retry.attempts; attempt++) {
      try {
        result = await this.executeProcess(args, timeout);
        break;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${this.config.retry.attempts} failed: ${error.message}`,
        );

        if (attempt < this.config.retry.attempts) {
          const delay =
            this.config.retry.delayMs *
            Math.pow(this.config.retry.backoffMultiplier, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    if (!result) {
      const durationMs = Date.now() - startTime;
      if (lastError.message.includes('timeout')) {
        throw new ExecutorException(
          ExecutorErrorCode.CLI_TIMEOUT,
          lastError.message,
          undefined,
          durationMs,
        );
      }
      if (lastError.message.includes('ENOENT')) {
        throw new ExecutorException(
          ExecutorErrorCode.CLI_NOT_FOUND,
          `Claude CLI not found at path: ${this.config.paths.claudeCliPath}`,
          undefined,
          durationMs,
        );
      }
      throw new ExecutorException(
        ExecutorErrorCode.CLI_ERROR,
        lastError.message,
        undefined,
        durationMs,
      );
    }

    const durationMs = Date.now() - startTime;

    try {
      const parsed = this.parseResponse<T>(result.stdout);

      this.logger.log(
        `Claude CLI success: duration=${durationMs}ms, tokens=${parsed.usage.inputTokens}/${parsed.usage.outputTokens}`,
      );

      return {
        data: parsed.data,
        usage: parsed.usage,
        costUsd: parsed.costUsd,
        sessionId: parsed.sessionId,
        durationMs,
      };
    } catch (error) {
      throw new ExecutorException(
        ExecutorErrorCode.PARSE_ERROR,
        `Failed to parse Claude CLI response: ${error.message}`,
        undefined,
        durationMs,
      );
    }
  }

  private buildCliArgs(params: ClaudeCliCallParams, model: string): string[] {
    const args: string[] = [
      '--print',
      '--model',
      model,
      '--output-format',
      'json',
      '--json-schema',
      JSON.stringify(params.schema),
      '-p',
      params.prompt,
    ];

    if (params.allowedTools?.length) {
      args.push('--allowedTools', params.allowedTools.join(','));
    }

    return args;
  }

  private executeProcess(
    args: string[],
    timeout: number,
  ): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      const proc: ChildProcess = spawn(this.config.paths.claudeCliPath, args, {
        cwd: this.config.paths.workspacePath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGTERM');
        reject(new Error(`Claude CLI timeout after ${timeout}ms`));
      }, timeout);

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code: number | null) => {
        clearTimeout(timeoutId);

        if (timedOut) return;

        if (code !== 0) {
          reject(new Error(`Claude CLI failed with code ${code}: ${stderr}`));
          return;
        }

        resolve({ stdout, stderr, exitCode: code || 0 });
      });

      proc.on('error', (err: Error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to spawn Claude CLI: ${err.message}`));
      });
    });
  }

  private parseResponse<T>(stdout: string): ParsedResponse<T> {
    const data: ClaudeCliRawResult[] = JSON.parse(stdout);

    const resultMsg = data.find((m) => m.type === 'result');

    if (!resultMsg) {
      throw new Error('No result message in Claude CLI response');
    }

    let parsedData: T;

    if (resultMsg.structured_output) {
      parsedData = resultMsg.structured_output as T;
    } else if (resultMsg.result) {
      const jsonMatch = resultMsg.result.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        parsedData = JSON.parse(jsonMatch[1].trim()) as T;
      } else {
        parsedData = JSON.parse(resultMsg.result) as T;
      }
    } else {
      throw new Error('No structured_output or result in response');
    }

    return {
      data: parsedData,
      usage: {
        inputTokens: resultMsg.usage?.input_tokens || 0,
        outputTokens: resultMsg.usage?.output_tokens || 0,
      },
      costUsd: resultMsg.total_cost_usd || 0,
      sessionId: resultMsg.session_id || '',
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
