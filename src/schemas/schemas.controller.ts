import { Controller, Get, Param, Post } from '@nestjs/common';
import { SchemasService } from './schemas.service';
import { ListSchemasResponseDto } from '../common/dto/schema.dto';

@Controller('api/v1/schemas')
export class SchemasController {
  constructor(private readonly schemasService: SchemasService) {}

  @Get()
  async listSchemas(): Promise<ListSchemasResponseDto> {
    const schemas = await this.schemasService.listSchemas();
    return { schemas };
  }

  @Get(':name')
  async getSchema(@Param('name') name: string): Promise<object> {
    return this.schemasService.getSchema(name);
  }

  @Post('reload')
  async reloadSchemas(): Promise<{ success: boolean; message: string }> {
    await this.schemasService.reloadSchemas();
    return { success: true, message: 'Schemas reloaded successfully' };
  }
}
