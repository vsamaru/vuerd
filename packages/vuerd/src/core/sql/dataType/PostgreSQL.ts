import { DataTypeHint } from '@/core/sql/dataType';

/**
 * https://www.postgresql.org/docs/current/datatype.html
 */
export const PostgreSQLTypes: DataTypeHint[] = [
  { name: 'bigint', primitiveType: 'long' },
  { name: 'bigserial', primitiveType: 'long' },
  { name: 'bit varying', primitiveType: 'int' },
  { name: 'bit', primitiveType: 'int' },
  { name: 'bool', primitiveType: 'boolean' },
  { name: 'boolean', primitiveType: 'boolean' },
  { name: 'box', primitiveType: 'string' },
  { name: 'bytea', primitiveType: 'string' },
  { name: 'char', primitiveType: 'string' },
  { name: 'character varying', primitiveType: 'string' },
  { name: 'character', primitiveType: 'string' },
  { name: 'cidr', primitiveType: 'string' },
  { name: 'circle', primitiveType: 'string' },
  { name: 'date', primitiveType: 'date' },
  { name: 'decimal', primitiveType: 'decimal' },
  { name: 'double precision', primitiveType: 'double' },
  { name: 'float4', primitiveType: 'float' },
  { name: 'float8', primitiveType: 'double' },
  { name: 'inet', primitiveType: 'string' },
  { name: 'int', primitiveType: 'int' },
  { name: 'int2', primitiveType: 'int' },
  { name: 'int4', primitiveType: 'int' },
  { name: 'int8', primitiveType: 'long' },
  { name: 'integer', primitiveType: 'int' },
  { name: 'interval', primitiveType: 'time' },
  { name: 'json', primitiveType: 'lob' },
  { name: 'jsonb', primitiveType: 'lob' },
  { name: 'line', primitiveType: 'string' },
  { name: 'lseg', primitiveType: 'string' },
  { name: 'macaddr', primitiveType: 'string' },
  { name: 'macaddr8', primitiveType: 'string' },
  { name: 'money', primitiveType: 'double' },
  { name: 'numeric', primitiveType: 'decimal' },
  { name: 'path', primitiveType: 'string' },
  { name: 'pg_lsn', primitiveType: 'int' },
  { name: 'point', primitiveType: 'string' },
  { name: 'polygon', primitiveType: 'string' },
  { name: 'real', primitiveType: 'float' },
  { name: 'serial', primitiveType: 'int' },
  { name: 'serial2', primitiveType: 'int' },
  { name: 'serial4', primitiveType: 'int' },
  { name: 'serial8', primitiveType: 'long' },
  { name: 'smallint', primitiveType: 'int' },
  { name: 'smallserial', primitiveType: 'int' },
  { name: 'text', primitiveType: 'string' },
  { name: 'time with time zone', primitiveType: 'time' },
  { name: 'time', primitiveType: 'time' },
  { name: 'timestamp with time zone', primitiveType: 'dateTime' },
  { name: 'timestamp', primitiveType: 'dateTime' },
  { name: 'timestamptz', primitiveType: 'dateTime' },
  { name: 'timetz', primitiveType: 'time' },
  { name: 'tsquery', primitiveType: 'string' },
  { name: 'tsvector', primitiveType: 'string' },
  { name: 'txid_snapshot', primitiveType: 'string' },
  { name: 'uuid', primitiveType: 'string' },
  { name: 'varbit', primitiveType: 'int' },
  { name: 'varchar', primitiveType: 'string' },
  { name: 'xml', primitiveType: 'lob' },
];
