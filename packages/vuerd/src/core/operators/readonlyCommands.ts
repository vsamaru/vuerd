import { Observable } from 'rxjs';

import { notEmptyCommands } from '@/core/operators/notEmptyCommands';
import { readonlyCommandTypes } from '@/engine/command/helper';
import { CommandTypeAll } from '@@types/engine/command';
import { State } from '@@types/engine/store';

export const readonlyCommands =
  ({ editorState }: State) =>
  (source$: Observable<Array<CommandTypeAll>>) =>
    new Observable<Array<CommandTypeAll>>(subscriber =>
      source$.subscribe({
        next: commands =>
          editorState.readonly
            ? subscriber.next(
                commands.filter(command =>
                  readonlyCommandTypes.includes(command.name)
                )
              )
            : subscriber.next(commands),
        error: value => subscriber.error(value),
        complete: () => subscriber.complete(),
      })
    ).pipe(notEmptyCommands);
