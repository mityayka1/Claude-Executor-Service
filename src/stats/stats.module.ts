import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ClaudeCliRun } from '../database/entities/claude-cli-run.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaudeCliRun])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
