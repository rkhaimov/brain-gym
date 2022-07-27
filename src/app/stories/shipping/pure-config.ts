import { ReusablesModule } from '../../reusables/reusables.module';
import { ShippingComponent, ShippingContainer } from './shipping.component';
import { ProjectionComponent } from './projection/projection.component';
import { GuardDirective } from './guard.directive';

export const config = {
  imports: [ReusablesModule],
  declarations: [
    ShippingContainer,
    ShippingComponent,
    ProjectionComponent,
    GuardDirective,
  ],
};
