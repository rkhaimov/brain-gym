import { OnDestroy } from '@angular/core';
import { identity } from 'rxjs';
import { Hook } from './hook';

function Identity() {
  return identity;
}

@Identity()
export class ComposableService implements OnDestroy {
  private fns: Hook[] = [];

  ngOnDestroy() {
    this.fns.forEach((fn) => fn.ngOnDestroy());
  }

  protected compose(...fns: Hook[]): void {
    fns.forEach((fn) => fn.ngOnInit());

    this.fns = fns;
  }
}
