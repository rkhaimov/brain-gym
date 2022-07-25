import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

export function createRouteModule(route: Route, config: NgModule): Route {
  @NgModule({
    ...config,
    imports: [
      RouterModule.forChild([{ path: '', component: route.component }]),
    ],
  })
  class Inner {}

  return { path: route.path, loadChildren: () => Promise.resolve(Inner) };
}
