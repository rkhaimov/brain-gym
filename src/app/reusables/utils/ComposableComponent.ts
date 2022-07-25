import { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { identity } from 'rxjs';
import { Hook } from './hook';

function Identity() {
  return identity;
}

@Identity()
export class ComposableComponent implements OnDestroy, OnInit, OnChanges {
  private fns: Hook[] = [];

  ngOnInit() {
    this.fns.forEach((fn) => fn.ngOnInit());
  }

  ngOnDestroy() {
    this.fns.forEach((fn) => fn.ngOnDestroy());
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fns.forEach((fn) => fn.ngOnChanges(changes));
  }

  protected compose(...fns: Hook[]): void {
    this.fns = fns;
  }
}
