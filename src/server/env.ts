import { randomUUID } from 'node:crypto';

import { createProductId } from '../shared/product-id.js';
import type { ProductId } from '../shared/product-id.js';

export interface EnvService {
  newProductId(): ProductId;
  now(): Date;
}

export const productionEnv: EnvService = {
  newProductId: () => createProductId(randomUUID()),
  now: () => new Date(),
};
