import { getData, getIndex } from '@/core/helper';
import {
  commentWidthBalanceRange,
  getColumn,
  getDataTypeSyncColumns,
} from '@/engine/store/helper/column.helper';
import {
  removeValidColumnIndex,
  removeValidColumnRelationship,
  validIdentification,
  validStartRelationship,
} from '@/engine/store/helper/valid.helper';
import { ColumnModel } from '@/engine/store/models/column.model';
import { ExecuteCommand } from '@/internal-types/command';
import {
  ActiveColumn,
  AddColumn,
  AddCustomColumn,
  ChangeColumnOption,
  ChangeColumnValue,
  ColumnCommandMap,
  LoadColumn,
  MoveColumn,
  RemoveColumn,
} from '@@types/engine/command/column.cmd';
import { State } from '@@types/engine/store';
import { Column } from '@@types/engine/store/table.state';

export function executeAddColumn(
  { tableState: { tables } }: State,
  data: AddColumn[]
) {
  data.forEach((addColumn: AddColumn) => {
    const table = getData(tables, addColumn.tableId);

    table && table.columns.push(new ColumnModel({ addColumn }));
  });
}

export function executeAddCustomColumn(
  { tableState: { tables } }: State,
  data: AddCustomColumn[]
) {
  data.forEach((addCustomColumn: AddCustomColumn) => {
    const table = getData(tables, addCustomColumn.tableId);
    if (!table) return;

    table.columns.push(new ColumnModel({ addCustomColumn }));
  });
}

export function executeRemoveColumn(state: State, data: RemoveColumn) {
  const {
    tableState: { tables },
  } = state;
  const table = getData(tables, data.tableId);
  if (!table) return;

  for (let i = 0; i < table.columns.length; i++) {
    const column = table.columns[i];

    if (data.columnIds.includes(column.id)) {
      table.columns.splice(i, 1);
      i--;
    }
  }

  // TODO: Refactoring
  removeValidColumnIndex(state, table, data.columnIds);
  removeValidColumnRelationship(state, table, data.columnIds);
  validIdentification(state);
  validStartRelationship(state);
}

export function executeRemoveOnlyColumn(state: State, data: RemoveColumn) {
  const {
    tableState: { tables },
  } = state;
  const table = getData(tables, data.tableId);
  if (!table) return;

  for (let i = 0; i < table.columns.length; i++) {
    const column = table.columns[i];

    if (data.columnIds.includes(column.id)) {
      table.columns.splice(i, 1);
      i--;
    }
  }
}

export function executeChangeColumnName(
  { tableState: { tables } }: State,
  data: ChangeColumnValue
) {
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.name = data.value;
  column.ui.widthName = data.width;
}

export function executeChangeColumnComment(
  { tableState: { tables } }: State,
  data: ChangeColumnValue
) {
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.comment = data.value;
  column.ui.widthComment = commentWidthBalanceRange(data.width);
}

export function executeChangeColumnDataType(
  {
    canvasState: { setting },
    tableState: { tables },
    relationshipState: { relationships },
  }: State,
  data: ChangeColumnValue
) {
  const targetColumn = getColumn(tables, data.tableId, data.columnId);
  if (!targetColumn) return;

  let columns: Column[] = [targetColumn];
  if (setting.relationshipDataTypeSync) {
    columns = getDataTypeSyncColumns([targetColumn], tables, relationships);
  }

  columns.forEach(column => {
    column.dataType = data.value;
    column.ui.widthDataType = data.width;
  });
}

export function executeChangeColumnDefault(
  { tableState: { tables } }: State,
  data: ChangeColumnValue
) {
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.default = data.value;
  column.ui.widthDefault = data.width;
}

export function executeChangeColumnAutoIncrement(
  { tableState: { tables } }: State,
  data: ChangeColumnOption
) {
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.option.autoIncrement = data.value;
}

export function executeChangeColumnPrimaryKey(
  state: State,
  data: ChangeColumnOption
) {
  const {
    tableState: { tables },
  } = state;
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  if (data.value) {
    if (column.ui.fk) {
      column.ui.fk = false;
      column.ui.pfk = true;
    } else {
      column.ui.pk = true;
    }
  } else {
    if (column.ui.pfk) {
      column.ui.pfk = false;
      column.ui.fk = true;
    } else {
      column.ui.pk = false;
    }
  }
  column.option.primaryKey = data.value;

  // TODO: Refactoring
  validIdentification(state);
}

export function executeChangeColumnUnique(
  { tableState: { tables } }: State,
  data: ChangeColumnOption
) {
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.option.unique = data.value;
}

export function executeChangeColumnNotNull(
  state: State,
  data: ChangeColumnOption
) {
  const {
    tableState: { tables },
  } = state;
  const column = getColumn(tables, data.tableId, data.columnId);
  if (!column) return;

  column.option.notNull = data.value;

  // TODO: Refactoring
  validStartRelationship(state);
}

export function executeMoveColumn(state: State, data: MoveColumn) {
  const {
    tableState: { tables },
  } = state;
  const currentTable = getData(tables, data.tableId);
  const currentColumns: Column[] = [];

  data.columnIds.forEach(columnId => {
    const column = getColumn(tables, data.tableId, columnId);

    column && currentColumns.push(column);
  });

  const targetTable = getData(tables, data.targetTableId);
  const targetColumn = getColumn(
    tables,
    data.targetTableId,
    data.targetColumnId
  );

  if (!currentTable || !targetTable || !currentColumns.length || !targetColumn)
    return;

  if (
    data.tableId === data.targetTableId &&
    !data.columnIds.includes(data.targetColumnId)
  ) {
    const targetIndex = getIndex(currentTable.columns, targetColumn.id);
    if (targetIndex === -1) return;

    currentColumns.forEach(currentColumn => {
      const currentIndex = getIndex(currentTable.columns, currentColumn.id);
      if (currentIndex === -1) return;

      currentTable.columns.splice(currentIndex, 1);
    });

    currentTable.columns.splice(targetIndex, 0, ...currentColumns);
  } else if (
    data.tableId !== data.targetTableId &&
    !data.columnIds.includes(data.targetColumnId)
  ) {
    const targetIndex = getIndex(targetTable.columns, targetColumn.id);
    if (targetIndex === -1) return;

    currentColumns.forEach(currentColumn => {
      const currentIndex = getIndex(currentTable.columns, currentColumn.id);
      if (currentIndex === -1) return;

      currentTable.columns.splice(currentIndex, 1);
    });

    targetTable.columns.splice(targetIndex, 0, ...currentColumns);

    // TODO: Refactoring
    removeValidColumnIndex(state, currentTable, data.columnIds);
    removeValidColumnRelationship(state, currentTable, data.columnIds);
    validIdentification(state);
    validStartRelationship(state);
  }
}

export function executeActiveColumn(
  { tableState: { tables } }: State,
  data: ActiveColumn[]
) {
  data.forEach(activeColumn => {
    const table = getData(tables, activeColumn.tableId);
    if (!table) return;

    activeColumn.columnIds.forEach(columnId => {
      const column = getData(table.columns, columnId);

      column && (column.ui.active = true);
    });
  });
}

export function executeActiveEndColumn(
  { tableState: { tables } }: State,
  data: ActiveColumn[]
) {
  data.forEach(activeColumn => {
    const table = getData(tables, activeColumn.tableId);
    if (!table) return;

    activeColumn.columnIds.forEach(columnId => {
      const column = getData(table.columns, columnId);

      column && (column.ui.active = false);
    });
  });
}

export function executeLoadColumn(
  { tableState: { tables } }: State,
  data: LoadColumn
) {
  const table = getData(tables, data.tableId);
  if (!table) return;

  data.columns.forEach((column, index) => {
    column.ui.active = false;
    table.columns.splice(data.indexList[index], 0, column);
  });
}

export const executeColumnCommandMap: Record<
  keyof ColumnCommandMap,
  ExecuteCommand
> = {
  'column.add': executeAddColumn,
  'column.addCustom': executeAddCustomColumn,
  'column.remove': executeRemoveColumn,
  'column.removeOnly': executeRemoveOnlyColumn,
  'column.changeName': executeChangeColumnName,
  'column.changeComment': executeChangeColumnComment,
  'column.changeDataType': executeChangeColumnDataType,
  'column.changeDefault': executeChangeColumnDefault,
  'column.changeAutoIncrement': executeChangeColumnAutoIncrement,
  'column.changePrimaryKey': executeChangeColumnPrimaryKey,
  'column.changeUnique': executeChangeColumnUnique,
  'column.changeNotNull': executeChangeColumnNotNull,
  'column.move': executeMoveColumn,
  'column.active': executeActiveColumn,
  'column.activeEnd': executeActiveEndColumn,
  'column.load': executeLoadColumn,
};
