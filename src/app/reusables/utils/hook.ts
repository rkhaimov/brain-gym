import { noop } from 'rxjs';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';

export type Hook = OnDestroy & OnInit & OnChanges;

export function createHook(config: Partial<Hook>): Hook {
  return {
    ngOnChanges: noop,
    ngOnInit: noop,
    ngOnDestroy: noop,
    ...config,
  };
}

export function joinHooks(left: Hook, right: Hook): Hook {
  return createHook({
    ngOnChanges: (changes) => {
      left.ngOnChanges(changes);
      right.ngOnChanges(changes);
    },
    ngOnInit: () => {
      left.ngOnInit();
      right.ngOnInit();
    },
    ngOnDestroy: () => {
      left.ngOnDestroy();
      right.ngOnDestroy();
    },
  });
}
