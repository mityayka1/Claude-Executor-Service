export class SchemaInfoDto {
  name: string;
  path: string;
  description?: string;
}

export class ListSchemasResponseDto {
  schemas: SchemaInfoDto[];
}
