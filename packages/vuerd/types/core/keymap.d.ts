export interface KeymapOption {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  key?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface Keymap {
  edit: KeymapOption[];
  stop: KeymapOption[];
  find: KeymapOption[];
  undo: KeymapOption[];
  redo: KeymapOption[];
  addTable: KeymapOption[];
  addColumn: KeymapOption[];
  addMemo: KeymapOption[];
  removeTable: KeymapOption[];
  hideTable: KeymapOption[];
  removeColumn: KeymapOption[];
  primaryKey: KeymapOption[];
  selectAllTable: KeymapOption[];
  selectAllColumn: KeymapOption[];
  copyColumn: KeymapOption[];
  pasteColumn: KeymapOption[];
  relationshipZeroOne: KeymapOption[];
  relationshipZeroN: KeymapOption[];
  relationshipOneOnly: KeymapOption[];
  relationshipOneN: KeymapOption[];
  tableProperties: KeymapOption[];
  zoomIn: KeymapOption[];
  zoomOut: KeymapOption[];
}

export type KeymapKey = keyof Keymap;

export type MultipleKey = 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey';

export type RelationshipKeymapName =
  | 'relationshipZeroOne'
  | 'relationshipZeroN'
  | 'relationshipOneN'
  | 'relationshipOneOnly';
