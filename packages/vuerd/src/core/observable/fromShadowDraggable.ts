import { fromEvent, merge } from 'rxjs';
import { debounceTime, map, takeUntil, throttleTime } from 'rxjs/operators';

export const fromShadowDraggable = (elements: HTMLElement[]) =>
  merge(
    ...elements.map(el =>
      fromEvent<DragEvent>(el, 'dragover').pipe(
        throttleTime(300),
        map(() => el.dataset.id as string)
      )
    )
  ).pipe(
    debounceTime(50),
    takeUntil(merge(...elements.map(el => fromEvent<DragEvent>(el, 'dragend'))))
  );
