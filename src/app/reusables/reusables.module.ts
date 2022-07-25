import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscribeDirective } from './subscribe.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [SubscribeDirective],
  exports: [CommonModule, SubscribeDirective],
})
export class ReusablesModule {}
