import { NgModule } from '@angular/core';
import { ReusablesModule } from '../../reusables/reusables.module';
import { RouterModule } from '@angular/router';
import { ProductDetailsComponent } from './product-details.component';
import { HighlightDirective } from './highlight.directive';
import { MyPipe } from './my.pipe';

@NgModule({
  imports: [
    ReusablesModule,
    RouterModule.forChild([{ path: '', component: ProductDetailsComponent }]),
  ],
  declarations: [ProductDetailsComponent, HighlightDirective, MyPipe],
})
export class ProductDetailsModule {}
