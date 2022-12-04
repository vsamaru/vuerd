import {
  ColumnType,
  FilterState,
  FocusFilterType,
  OperatorType,
  TextFilterCode,
} from '@@types/engine/store/editor/filter.state';

export const createFilterState = (): FilterState => ({
  active: false,
  operatorType: 'OR',
  filters: [],
  focus: null,
  draggable: null,
});

export const operatorTypes: OperatorType[] = ['AND', 'OR'];

export const textFilterCodeList: TextFilterCode[] = [
  'eq',
  'ne',
  'contain',
  'start',
  'end',
];

export const columnTypes: ColumnType[] = [
  'tableName',
  'tableComment',
  'option',
  'name',
  'dataType',
  'default',
  'comment',
];

export const focusFilterTypes: FocusFilterType[] = [
  'columnType',
  'filterCode',
  'value',
];
