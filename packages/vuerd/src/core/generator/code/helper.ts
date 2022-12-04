import { camelCase, pascalCase, snakeCase } from '@/core/helper';
import {
  databaseHints,
  DataTypeHint,
  PrimitiveType,
} from '@/core/sql/dataType';
import { Database, NameCase } from '@@types/engine/store/canvas.state';

export function getPrimitiveType(
  dataType: string,
  database: Database
): PrimitiveType {
  const dataTypeHints = getDataTypeHints(database);
  for (const dataTypeHint of dataTypeHints) {
    if (
      dataType
        .toLocaleLowerCase()
        .indexOf(dataTypeHint.name.toLocaleLowerCase()) === 0
    ) {
      return dataTypeHint.primitiveType;
    }
  }
  return 'string';
}

export function getDataTypeHints(database: Database): DataTypeHint[] {
  for (const data of databaseHints) {
    if (data.database === database) {
      return data.dataTypeHints;
    }
  }
  return [];
}

export function getNameCase(name: string, nameCase: NameCase): string {
  let changeName = name;
  switch (nameCase) {
    case 'camelCase':
      changeName = camelCase(name);
      break;
    case 'pascalCase':
      changeName = pascalCase(name);
      break;
    case 'snakeCase':
      changeName = snakeCase(name);
      break;
  }
  return changeName;
}
