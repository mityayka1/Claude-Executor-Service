import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutorController } from './executor.controller';
import { ExecutorService } from './executor.service';
import { ClaudeCliService } from './claude-cli.service';
import { RunLoggerService } from './run-logger.service';
import { ClaudeCliRun } from '../database/entities/claude-cli-run.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaudeCliRun])],
  controllers: [ExecutorController],
  providers: [ExecutorService, ClaudeCliService, RunLoggerService],
  exports: [ExecutorService],
})
export class ExecutorModule {}
