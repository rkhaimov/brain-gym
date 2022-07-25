import { NgModule } from '@angular/core';
import { ReusablesModule } from '../../reusables/reusables.module';
import { RouterModule } from '@angular/router';
import { CartComponent } from './cart.component';
import { SizerComponent } from './sizer/sizer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangesComponent } from './changes/changes.component';
import { UnlessDirective } from './unless.directive';

@NgModule({
  imports: [
    ReactiveFormsModule,
    ReusablesModule,
    RouterModule.forChild([{ path: '', component: CartComponent }]),
  ],
  declarations: [CartComponent, SizerComponent, ChangesComponent, UnlessDirective],
})
export class CartModule {}
