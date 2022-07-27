import { describe } from '../../reusables/describe';
import { moduleMetadata } from '@storybook/angular';
import { ShippingComponent } from './shipping.component';
import { config } from './pure-config';
import { CartService } from '../../globals/cart.service';
import { createMockApi } from '../../externals';
import { resolving } from '@reksoft/pure-utils';
import { ShippingService } from './shipping.service';
import { NEVER, timer } from 'rxjs';

const { exporting, it } = describe({
  title: 'Shipping',
  component: ShippingComponent,
  decorators: [moduleMetadata(config)],
});

export default exporting;

export const TimerLoading = it({
  moduleMetadata: {
    providers: [
      CartService,
      {
        provide: ShippingService,
        useFactory: () => new ShippingService(() => NEVER),
      },
      createMockApi({ getAllShipping: resolving([]) }),
    ],
  },
});

export const TimerDone = it({
  moduleMetadata: {
    providers: [
      CartService,
      {
        provide: ShippingService,
        useFactory: () => new ShippingService(() => timer(0)),
      },
      createMockApi({ getAllShipping: resolving([]) }),
    ],
  },
});
