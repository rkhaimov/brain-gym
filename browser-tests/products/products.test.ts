import { expect } from 'vitest';
import { page } from 'vitest/browser';

import {
  createCreateProductResponseStub,
  createListProductsResponseStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import { test } from '@/test/browser/runtime/test.js';

import { createProductsPage } from './products-page.js';

test.describe('Product catalog adapters', () => {
  test('shows a generic message for a malformed creation response', async ({ productService }) => {
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
    productService.createProduct.resolves(
      createCreateProductResponseStub({ result: { case: undefined } }),
    );

    const products = createProductsPage();
    await products.open();
    await products.openCreateDialog();
    await products.name().fill('Кольцо');
    await products.submit();

    await expect.element(products.dialog()).toBeVisible();
    await expect
      .element(page.getByText('Не удалось сохранить штучку. Попробуйте ещё раз.'))
      .toBeVisible();
  });
});
