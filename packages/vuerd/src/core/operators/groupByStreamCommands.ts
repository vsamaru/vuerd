import { Observable } from 'rxjs';
import { buffer, debounceTime, groupBy, map, mergeMap } from 'rxjs/operators';

import { notEmptyCommands } from '@/core/operators/notEmptyCommands';
import { streamCommandTypes } from '@/engine/command/helper';
import { CommandTypeAll } from '@@types/engine/command';

export const groupByStreamCommands = (
  source$: Observable<Array<CommandTypeAll>>
) =>
  new Observable<Array<CommandTypeAll>>(subscriber =>
    source$.subscribe({
      next: commands => {
        const batchCommands: CommandTypeAll[] = [];
        const streamCommands: CommandTypeAll[] = [];

        commands.forEach(command =>
          streamCommandTypes.includes(command.name)
            ? streamCommands.push(command)
            : batchCommands.push(command)
        );

        subscriber.next(batchCommands);
        subscriber.next(streamCommands);
      },
      error: value => subscriber.error(value),
      complete: () => subscriber.complete(),
    })
  ).pipe(
    notEmptyCommands,
    groupBy(commands =>
      commands.some(command => streamCommandTypes.includes(command.name))
    ),
    mergeMap(group$ =>
      group$.key
        ? group$.pipe(
            buffer(group$.pipe(debounceTime(200))),
            map(buff => buff.reduce((acc, cur) => acc.concat(cur), []))
          )
        : group$
    )
  );
