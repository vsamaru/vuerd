import {
  BracketType,
  ColumnType,
  Database,
  HighlightTheme,
  Language,
  NameCase,
  ShowKey,
} from '../store/canvas.state';

export interface MoveCanvas {
  scrollTop: number;
  scrollLeft: number;
}

export interface MovementCanvas {
  movementX: number;
  movementY: number;
}

export interface ResizeCanvas {
  width: number;
  height: number;
}

export interface ZoomCanvas {
  zoomLevel: number;
}

export interface MovementZoomCanvas {
  movementZoomLevel: number;
}

export interface ChangeCanvasShow {
  showKey: ShowKey;
  value: boolean;
}

export interface ChangeDatabase {
  database: Database;
}

export interface ChangeDatabaseName {
  value: string;
}

export interface ChangeCanvasType {
  canvasType: string;
}

export interface ChangeLanguage {
  language: Language;
}

export interface ChangeNameCase {
  nameCase: NameCase;
}

export interface ChangeRelationshipDataTypeSync {
  value: boolean;
}

export interface ChangeRelationshipOptimization {
  value: boolean;
}

export interface MoveColumnOrder {
  columnType: ColumnType;
  targetColumnType: ColumnType;
}

export interface ChangeHighlightTheme {
  highlightTheme: HighlightTheme;
}

export interface ChangeBracketType {
  bracketType: BracketType;
}

export interface ChangePluginSerialization {
  key: string;
  value: string;
}

export interface CanvasCommandMap {
  'canvas.move': MoveCanvas;
  'canvas.movement': MovementCanvas;
  'canvas.resize': ResizeCanvas;
  'canvas.zoom': ZoomCanvas;
  'canvas.movementZoom': MovementZoomCanvas;
  'canvas.changeShow': ChangeCanvasShow;
  'canvas.changeDatabase': ChangeDatabase;
  'canvas.changeDatabaseName': ChangeDatabaseName;
  'canvas.changeCanvasType': ChangeCanvasType;
  'canvas.changeLanguage': ChangeLanguage;
  'canvas.changeTableCase': ChangeNameCase;
  'canvas.changeColumnCase': ChangeNameCase;
  'canvas.changeRelationshipDataTypeSync': ChangeRelationshipDataTypeSync;
  'canvas.changeRelationshipOptimization': ChangeRelationshipOptimization;
  'canvas.moveColumnOrder': MoveColumnOrder;
  'canvas.changeHighlightTheme': ChangeHighlightTheme;
  'canvas.changeBracketType': ChangeBracketType;
  'canvas.changePluginSerialization': ChangePluginSerialization;
}
