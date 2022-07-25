import { Injectable } from '@angular/core';
import { ComposableService } from '../../reusables/utils/ComposableService';
import { useEffect } from '../../reusables/utils/useEffect';

@Injectable()
export class ShippingService extends ComposableService {
  constructor() {
    super();

    this.compose(
      useEffect(() => {
        console.log('ShippingService loaded!');

        return () => console.log('ShippingService destroyed!');
      })
    );
  }
}
