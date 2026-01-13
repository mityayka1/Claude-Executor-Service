import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import { ExecuteTaskDto } from '../common/dto/execute-task.dto';
import { ExecuteSuccessResponseDto } from '../common/dto/execute-response.dto';

@Controller('api/v1')
export class ExecutorController {
  constructor(private readonly executorService: ExecutorService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async execute(
    @Body() dto: ExecuteTaskDto,
  ): Promise<ExecuteSuccessResponseDto> {
    return this.executorService.execute(dto);
  }
}
