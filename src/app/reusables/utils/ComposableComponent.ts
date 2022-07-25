import { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { identity, noop } from 'rxjs';

function Identity() {
  return identity;
}

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

@Identity()
export class ComposableComponent implements OnDestroy, OnInit, OnChanges {
  private fns: Hook[] = [];

  ngOnInit() {
    this.fns.forEach((fn) => 'ngOnInit' in fn && fn.ngOnInit());
  }

  ngOnDestroy() {
    this.fns.forEach((fn) => 'ngOnDestroy' in fn && fn.ngOnDestroy());
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fns.forEach((fn) => 'ngOnChanges' in fn && fn.ngOnChanges(changes));
  }

  protected compose(...fns: Hook[]): void {
    this.fns = fns;
  }
}
