import { ReactiveFormsModule } from '@angular/forms';
import { ReusablesModule } from '../../reusables/reusables.module';
import { CartComponent } from './cart.component';
import { SizerComponent } from './sizer/sizer.component';
import { ChangesComponent } from './changes/changes.component';
import { UnlessDirective } from './unless.directive';

// TODO: Reimpl as function
export const config = {
  imports: [ReactiveFormsModule, ReusablesModule],
  declarations: [
    CartComponent,
    SizerComponent,
    ChangesComponent,
    UnlessDirective,
  ],
};
