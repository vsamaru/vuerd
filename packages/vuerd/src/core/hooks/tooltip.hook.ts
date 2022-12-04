import {
  closestElement,
  mounted,
  queryAll,
  unmounted,
} from '@vuerd/lit-observable';
import tippy, {
  createSingleton,
  CreateSingletonInstance,
  Instance,
  Props,
} from 'tippy.js';

import { flat, isArray } from '@/core/helper';

export function useTooltip(
  selectors: string[],
  ctx: HTMLElement,
  options: Partial<Props> = {}
) {
  const elementsRefs = selectors.map(selector =>
    queryAll<Array<HTMLElement>>(selector)
  );
  let singleton: CreateSingletonInstance | null = null;
  let instances: Instance[] | null = null;

  const createTooltip = () => {
    const root = closestElement('.vuerd-editor', ctx);
    const elements = [
      ...flat<HTMLElement>(
        elementsRefs.map(ref => ref.value).filter(elements => isArray(elements))
      ),
    ];

    instances = tippy(elements, {
      appendTo: root ?? 'parent',
      trigger: 'manual',
    });

    singleton = createSingleton(
      instances,
      Object.assign(
        {
          appendTo: root ?? 'parent',
          delay: [500, 100],
          moveTransition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        },
        options
      )
    );
  };

  const destroyTooltip = () => {
    singleton?.destroy();
    instances?.forEach(instance => instance.destroy());
    singleton = null;
    instances = null;
  };

  const resetTooltip = () => {
    destroyTooltip();
    createTooltip();
  };

  mounted(createTooltip);
  unmounted(destroyTooltip);

  return {
    resetTooltip,
  };
}
