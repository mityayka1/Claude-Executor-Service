import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsQueryDto, StatsResponseDto } from '../common/dto/stats.dto';

@Controller('api/v1/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@Query() query: StatsQueryDto): Promise<StatsResponseDto> {
    return this.statsService.getStats(query.period);
  }
}
