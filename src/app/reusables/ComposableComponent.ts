import { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { identity } from 'rxjs';

function Identity() {
  return identity;
}

export type Hook = OnDestroy | OnInit | OnChanges;

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
