import { getLatestSnapshot } from '@/core/contextmenu/export.menu';
import { createSnapshot } from '@/core/file';
import { Bus } from '@/core/helper/eventBus.helper';
import {
  Constraints,
  Dialect,
  Operation,
  ParserCallback,
  translate,
} from '@/core/parser/helper';
import { Column, IndexColumn, Statement } from '@/core/parser/index';
import { createJson } from '@/core/parser/ParserToJson';
import { zoomCanvas } from '@/engine/command/canvas.cmd.helper';
import { initLoadJson$ } from '@/engine/command/editor.cmd.helper.gen';
import { IERDEditorContext } from '@/internal-types/ERDEditorContext';
import { LiquibaseFile } from '@@types/core/liquibaseParser';

const dialectTo: Dialect = 'postgresql';
const defaultDialect: Dialect = 'postgresql';

/**
 * Parser for Liquibase XML file
 * @param input Entire XML file
 * @param dialect Dialect that the result will have datataypes in
 * @returns List of Statements to execute
 */
export const LiquibaseParser = (
  context: IERDEditorContext,
  files: LiquibaseFile[],
  dialect: Dialect = defaultDialect,
  rootFile?: LiquibaseFile
) => {
  const { store, eventBus, helper } = context;
  const zoom = JSON.parse(JSON.stringify(store.canvasState.zoomLevel));

  store.dispatchSync(zoomCanvas(0.7));
  store.canvasState.zoomLevel = 0.7;
  createSnapshot(context, {
    filename: rootFile?.path || '',
    type: rootFile?.path ? 'before-import' : 'user',
  });

  setTimeout(async () => {
    async function parseFile(file: LiquibaseFile) {
      eventBus.emit(Bus.Liquibase.progress, file.path);

      // workaround so code is non-blocking
      await new Promise(resolve => setTimeout(resolve, 0));

      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(file.value, 'text/xml');

      const databaseChangeLog = xmlDoc.querySelector('databaseChangeLog');
      if (!databaseChangeLog) return;
      console.log(file.path, databaseChangeLog.children);

      for (const element of databaseChangeLog.children) {
        if (element.tagName === 'changeSet') {
          handleChangeSetParsing(element, file);
        } else if (element.tagName === 'include') {
          await handleImportParsing(element, file);
        }
      }
    }

    async function handleImportParsing(include: Element, file: LiquibaseFile) {
      const fileName = include.getAttribute('file');

      var myDirectory = file.path.split('/').slice(0, -1).join('/');
      if (myDirectory) myDirectory += '/';
      const dstDirectory = `${myDirectory}${fileName}`;

      const dstFile = files.find(file => file.path === dstDirectory);
      if (dstFile) await parseFile(dstFile);
    }

    function handleChangeSetParsing(element: Element, file: LiquibaseFile) {
      const dbms: string = element.getAttribute('dbms') || '';
      if (dbms === '' || dbms == dialect) {
        var statements: Statement[] = [];
        if (parseChangeSet(element, statements, dialect)) {
          createSnapshot(context, {
            filename: file.path,
            type: 'before-import',
            statements: statements,
          });
          applyStatements(context, statements);
        }
      }
    }

    if (rootFile) {
      await parseFile(rootFile);
    } else {
      for (const file of files) {
        await parseFile(file);
      }
    }

    eventBus.emit(Bus.Liquibase.progressEnd);

    setTimeout(async () => {
      store.dispatchSync(zoomCanvas(zoom));
      createSnapshot(context, {
        filename: rootFile?.path || '',
        type: 'after-import',
      });
      console.log('SNAPSHOTS', context.snapshots);
    }, 0);
  }, 10);
};

export const applyStatements = (
  context: IERDEditorContext,
  statements: Statement[]
) => {
  var { store, helper } = context;

  const json = createJson(
    statements,
    helper,
    store.canvasState.database,
    getLatestSnapshot(context).data
  );

  store.dispatchSync(initLoadJson$(json));
};

export const parseChangeSet = (
  changeSet: Element,
  statements: Statement[],
  dialect: Dialect
): boolean => {
  if (!checkPreConditions(changeSet, dialect)) return false;

  function parse(operation: Operation) {
    parseElement(operation, changeSet, statements, parsers[operation], dialect);
  }

  parse('createTable');
  parse('createIndex');
  parse('addForeignKeyConstraint');
  parse('addPrimaryKey');
  parse('addColumn');
  parse('dropColumn');
  parse('dropTable');
  parse('dropForeignKeyConstraint');
  parse('addUniqueConstraint');

  return true;
};

export const checkPreConditions = (
  changeSet: Element,
  dialect: Dialect
): boolean => {
  const preConditions = changeSet.getElementsByTagName('preConditions')[0];
  if (!preConditions) return true;

  const preConditionsOr = preConditions.getElementsByTagName('or')[0];

  var preConditionsDbms: HTMLCollectionOf<Element>;
  if (preConditionsOr) {
    preConditionsDbms = preConditionsOr.getElementsByTagName('dbms');
  } else {
    preConditionsDbms = preConditions.getElementsByTagName('dbms');
  }

  for (const dbms of preConditionsDbms) {
    if (dbms.getAttribute('type') === dialect) {
      return true;
    }
  }

  return false;
};

export const parseElement = (
  type: Operation,
  element: Element,
  statements: Statement[],
  parser: ParserCallback,
  dialect?: Dialect
) => {
  const elements = element.getElementsByTagName(type);
  for (let i = 0; i < elements.length; i++) {
    parser(elements[i], statements, dialect);
  }
};

export const parseCreateTable = (
  createTable: Element,
  statements: Statement[],
  dialect: Dialect = defaultDialect
) => {
  var columns: Column[] = parseColumns(createTable, dialect);

  statements.push({
    type: 'create.table',
    name: createTable.getAttribute('tableName') || '',
    comment: createTable.getAttribute('remarks') || '',
    columns: columns,
    indexes: [],
    foreignKeys: [],
  });
};

const parseColumns = (element: Element, dialect: Dialect): Column[] => {
  var columns: Column[] = [];

  const cols = element.getElementsByTagName('column');
  for (let i = 0; i < cols.length; i++) {
    columns.push(parseSingleColumn(cols[i], dialect));
  }
  return columns;
};

export const parseSingleColumn = (
  column: Element,
  dialect: Dialect
): Column => {
  const constr = column.getElementsByTagName('constraints')[0];

  var constraints: Constraints;

  if (constr) {
    constraints = {
      primaryKey: constr.getAttribute('primaryKey') === 'true',
      nullable: !(constr.getAttribute('nullable') === 'true'),
      unique: constr.getAttribute('unique') === 'true',
    };
  } else {
    constraints = {
      primaryKey: false,
      nullable: true,
      unique: false,
    };
  }

  var dataType = translate(
    dialect,
    dialectTo,
    column.getAttribute('type') || ''
  );

  return {
    name: column.getAttribute('name') || '',
    dataType: dataType,
    default: column.getAttribute('defaultValue') || '',
    comment: column.getAttribute('remarks') || '',
    primaryKey: constraints.primaryKey,
    autoIncrement: column.getAttribute('autoIncrement') === 'true',
    unique: constraints.unique,
    nullable: constraints.nullable,
  };
};

export const parseSingleIndexColumn = (column: Element): IndexColumn => {
  return {
    name: column.getAttribute('name') || '',
    sort: column.getAttribute('descending') ? 'DESC' : 'ASC',
  };
};

export const parseCreateIndex = (
  createIndex: Element,
  statements: Statement[]
) => {
  var indexColumns: IndexColumn[] = [];

  const cols = createIndex.getElementsByTagName('column');
  for (let i = 0; i < cols.length; i++) {
    indexColumns.push(parseSingleIndexColumn(cols[i]));
  }

  statements.push({
    type: 'create.index',
    name: createIndex.getAttribute('indexName') || '',
    unique: createIndex.getAttribute('unique') === 'true',
    tableName: createIndex.getAttribute('tableName') || '',
    columns: indexColumns,
  });
};

export const parseAddForeignKeyConstraint = (
  addForeignKey: Element,
  statements: Statement[]
) => {
  var refColumnNames: string[] =
    addForeignKey
      .getAttribute('referencedColumnNames')
      ?.split(',')
      .map(item => item.trim()) || [];
  var columnNames: string[] =
    addForeignKey
      .getAttribute('baseColumnNames')
      ?.split(',')
      .map(item => item.trim()) || [];

  statements.push({
    type: 'alter.table.add.foreignKey',
    name: addForeignKey.getAttribute('baseTableName') || '',
    columnNames: columnNames,
    refTableName: addForeignKey.getAttribute('referencedTableName') || '',
    refColumnNames: refColumnNames,
    constraintName: addForeignKey.getAttribute('constraintName') || '',
  });
};

export const parseAddPrimaryKey = (
  addPrimaryKey: Element,
  statements: Statement[]
) => {
  var columnNames: string[] =
    addPrimaryKey
      .getAttribute('columnNames')
      ?.split(',')
      .map(item => item.trim()) || [];

  statements.push({
    type: 'alter.table.add.primaryKey',
    name: addPrimaryKey.getAttribute('tableName') || '',
    columnNames: columnNames,
  });
};

export const parseAddColumn = (
  addColumn: Element,
  statements: Statement[],
  dialect: Dialect = defaultDialect
) => {
  const tableName: string = addColumn.getAttribute('tableName') || '';

  statements.push({
    type: 'alter.table.add.column',
    name: tableName,
    columns: parseColumns(addColumn, dialect),
  });
};

export const parseDropColumn = (
  dropColumn: Element,
  statements: Statement[],
  dialect: Dialect = defaultDialect
) => {
  const tableName: string = dropColumn.getAttribute('tableName') || '';
  const column: Column = {
    name: dropColumn.getAttribute('columnName') || '',
    dataType: '',
    default: '',
    comment: '',
    primaryKey: false,
    autoIncrement: false,
    unique: false,
    nullable: false,
  };

  statements.push({
    type: 'alter.table.drop.column',
    name: tableName,
    columns: [column, ...parseColumns(dropColumn, dialect)],
  });
};

export const parseDropTable = (dropTable: Element, statements: Statement[]) => {
  const tableName: string = dropTable.getAttribute('tableName') || '';

  statements.push({
    type: 'drop.table',
    name: tableName,
  });
};

export const parseDropForeignKeyConstraint = (
  dropFk: Element,
  statements: Statement[]
) => {
  statements.push({
    type: 'alter.table.drop.foreignKey',
    name: dropFk.getAttribute('constraintName') || '',
    baseTableName: dropFk.getAttribute('baseTableName') || '',
  });
};

export const parseAddUniqueConstraint = (
  addUniqueConstraint: Element,
  statements: Statement[]
) => {
  const columnNames = addUniqueConstraint.getAttribute('columnNames');
  if (!columnNames) return;

  const columns: string[] = columnNames.split(',').map(col => col.trim());

  statements.push({
    type: 'alter.table.add.unique',
    name: addUniqueConstraint.getAttribute('tableName') || '',
    columnNames: columns,
  });
};

export const parsers: Record<Operation, ParserCallback> = {
  createTable: parseCreateTable,
  createIndex: parseCreateIndex,
  addForeignKeyConstraint: parseAddForeignKeyConstraint,
  addPrimaryKey: parseAddPrimaryKey,
  addColumn: parseAddColumn,
  dropColumn: parseDropColumn,
  dropTable: parseDropTable,
  dropForeignKeyConstraint: parseDropForeignKeyConstraint,
  addUniqueConstraint: parseAddUniqueConstraint,
};
