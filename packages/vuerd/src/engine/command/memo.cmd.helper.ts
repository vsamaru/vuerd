import { uuid } from '@/core/helper';
import { SIZE_MEMO_HEIGHT, SIZE_MEMO_WIDTH } from '@/core/layout';
import { nextPoint, nextZIndex } from '@/engine/store/helper';
import { Store } from '@@types/engine/store';
import { Memo } from '@@types/engine/store/memo.state';
import { Point } from '@@types/engine/store/relationship.state';

import { createCommand } from './helper';

export * from './memo.cmd.helper.gen';

export function addMemo(store: Store, active = true) {
  const { tableState, memoState } = store;
  const point = nextPoint(store);
  return createCommand('memo.add', {
    id: uuid(),
    ui: {
      active,
      left: point.x,
      top: point.y,
      zIndex: nextZIndex(tableState.tables, memoState.memos),
      width: SIZE_MEMO_WIDTH,
      height: SIZE_MEMO_HEIGHT,
    },
  });
}

export const moveMemo = (
  {
    tableState: { tables },
    memoState: { memos },
    canvasState: { zoomLevel },
  }: Store,
  ctrlKey: boolean,
  movementX: number,
  movementY: number,
  memoId: string
) =>
  createCommand('memo.move', {
    movementX: movementX / zoomLevel,
    movementY: movementY / zoomLevel,
    tableIds: ctrlKey
      ? tables.filter(table => table.ui.active).map(table => table.id)
      : [],
    memoIds: ctrlKey
      ? memos.filter(memo => memo.ui.active).map(memo => memo.id)
      : [memoId],
  });

export const removeMemo = ({ memoState: { memos } }: Store, memoId?: string) =>
  createCommand('memo.remove', {
    memoIds: memoId
      ? [memoId]
      : memos.filter(memo => memo.ui.active).map(memo => memo.id),
  });

export const selectMemo = (
  { tableState: { tables }, memoState: { memos } }: Store,
  ctrlKey: boolean,
  memoId: string
) =>
  createCommand('memo.select', {
    ctrlKey,
    memoId,
    zIndex: nextZIndex(tables, memos),
  });

export const selectEndMemo = () => createCommand('memo.selectEnd', null);

export const selectAllMemo = () => createCommand('memo.selectAll', null);

export const changeMemoValue = (memoId: string, value: string) =>
  createCommand('memo.changeValue', { memoId, value });

export const resizeMemo = (
  memoId: string,
  top: number,
  left: number,
  width: number,
  height: number
) =>
  createCommand('memo.resize', {
    memoId,
    top,
    left,
    width,
    height,
  });

export const dragSelectMemo = (min: Point, max: Point) =>
  createCommand('memo.dragSelect', { min, max });

export const loadMemo = (memo: Memo) => createCommand('memo.load', memo);

export const changeColorMemo = (
  { tableState: { tables }, memoState: { memos } }: Store,
  ctrlKey: boolean,
  color: string,
  memoId: string
) =>
  createCommand('memo.changeColor', {
    tableIds: ctrlKey
      ? tables.filter(table => table.ui.active).map(table => table.id)
      : [],
    memoIds: ctrlKey
      ? memos.filter(memo => memo.ui.active).map(memo => memo.id)
      : [memoId],
    color,
  });
