import { Code, ConnectError } from '@connectrpc/connect';
import { expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { maintenanceFormContract } from '@/client/components/maintenance/maintenance-test-tags.js';
import {
  createCreateProductResponseStub,
  createListProductsResponseStub,
  createProductStub,
  createRenameProductResponseStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import type {
  CreateProductResponse,
  ListProductsResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';
import { test } from '@/test/browser/runtime/test.js';

import { createDeferred, createProductsPage } from './products-page.js';

test.describe(
  'MaintenanceFormDialog through the Product catalog',
  { tags: maintenanceFormContract.testTag },
  () => {
    test.beforeEach(({ productService }) => {
      productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
    });

    test('opens the create dialog with focus and dismisses it accessibly', async () => {
      const products = createProductsPage();
      await products.open();

      await products.openCreateDialog();
      await expect.element(products.dialog()).toBeVisible();
      await expect.element(products.name()).toHaveFocus();
      await products.screenshotModalState('Create Product dialog');

      await userEvent.keyboard('{Escape}');
      await expect.element(products.dialog()).not.toBeInTheDocument();
      await expect.element(products.headerCreateButton()).toHaveFocus();

      await products.openEmptyCreateDialog();
      await products.cancel();
      await expect.element(products.dialog()).not.toBeInTheDocument();
      await expect.element(products.emptyCreateButton()).toHaveFocus();
    });

    test('keeps the server duplicate message in the dialog', async ({ productService }) => {
      productService.createProduct.resolves(
        createCreateProductResponseStub({
          result: {
            case: 'failure',
            value: 'Штучка с таким названием уже существует',
          },
        }),
      );

      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.name().fill('Кольцо');
      await products.submit();

      await expect.element(products.dialog()).toBeVisible();
      await expect.element(products.name()).toHaveAttribute('aria-invalid', 'true');
      await expect
        .element(products.nameError())
        .toHaveTextContent('Штучка с таким названием уже существует');
      await products.screenshotModalState('Duplicate name validation');

      await products.name().fill('Кулон');
      await expect.element(products.nameError()).not.toBeInTheDocument();
      await expect.element(products.name()).not.toHaveAttribute('aria-invalid');
    });

    test('validates an empty Product name before creation', async ({ productService }) => {
      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.submit();

      await expect.element(products.dialog()).toBeVisible();
      await expect.element(products.name()).toHaveAttribute('aria-invalid', 'true');
      await expect.element(products.nameError()).toHaveTextContent('Введите название штучки');
      expect(productService.createProduct.handler).not.toHaveBeenCalled();
    });

    test('submits a whitespace-only Product name unchanged', async ({ productService }) => {
      const product = createProductStub({ name: '   ' });
      productService.createProduct.resolves(
        createCreateProductResponseStub({
          result: { case: 'success', value: product },
        }),
      );

      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.name().fill(product.name);
      await products.submit();

      await expect.element(products.dialog()).not.toBeInTheDocument();
      await expect(productService.createProduct.getLastRequest()).resolves.toMatchObject({
        name: product.name,
      });
    });

    test('prevents dismissal while creation is pending', async ({ productService }) => {
      const product = createProductStub({ name: 'Кольцо' });
      const response = createCreateProductResponseStub({
        result: { case: 'success', value: product },
      });
      const pendingCreation = createDeferred<CreateProductResponse>();
      productService.createProduct.handler.mockImplementation(() => pendingCreation.promise);

      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.name().fill(product.name);
      await products.submit();

      await expect.element(products.pendingSubmitButton()).toBeVisible();
      await expect.element(products.cancelButton()).toBeDisabled();
      await products.screenshotModalState('Pending Product creation');
      await userEvent.keyboard('{Escape}');
      await expect.element(products.dialog()).toBeVisible();

      pendingCreation.resolve(response);
      await expect.element(products.dialog()).not.toBeInTheDocument();
    });

    test('prevents dismissal while the Product catalog refresh is pending', async ({
      productService,
    }) => {
      const product = createProductStub({ name: 'Кольцо' });
      const pendingRefresh = createDeferred<ListProductsResponse>();
      productService.createProduct.resolves(
        createCreateProductResponseStub({
          result: { case: 'success', value: product },
        }),
      );
      productService.listProducts.handler
        .mockResolvedValueOnce(createListProductsResponseStub({ products: [] }))
        .mockImplementationOnce(() => pendingRefresh.promise);

      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.name().fill(product.name);
      await products.submit();

      await expect.element(products.pendingSubmitButton()).toBeVisible();
      await expect.element(products.cancelButton()).toBeDisabled();
      await userEvent.keyboard('{Escape}');
      await expect.element(products.dialog()).toBeVisible();

      pendingRefresh.resolve(createListProductsResponseStub({ products: [product] }));
      await expect.element(products.dialog()).not.toBeInTheDocument();
      await expect.element(products.product(product.name)).toBeVisible();
    });

    test('creates a Product, closes the dialog, and displays it', async ({ productService }) => {
      const product = createProductStub({ name: 'Кольцо' });
      productService.createProduct.resolves(
        createCreateProductResponseStub({
          result: { case: 'success', value: product },
        }),
      );
      productService.listProducts.handler.mockImplementation(async () =>
        createListProductsResponseStub({
          products: productService.createProduct.handler.mock.calls.length === 0 ? [] : [product],
        }),
      );

      const products = createProductsPage();
      await products.open();
      await products.openCreateDialog();
      await products.name().fill(product.name);
      await products.submit();

      await expect.element(products.dialog()).not.toBeInTheDocument();
      await expect.element(products.headerCreateButton()).toHaveFocus();
      await expect.element(products.product(product.name)).toBeVisible();
      await expect.element(products.count(1)).toBeVisible();
      await products.screenshotPage('Created Product');
    });

    test('opens the edit form with current values and renames a Product', async ({
      productService,
    }) => {
      let product = createProductStub({ archived: false, id: 'ring-id', name: 'Кольцо' });
      productService.listProducts.handler.mockImplementation(async () =>
        createListProductsResponseStub({ products: [product] }),
      );
      productService.renameProduct.handler.mockImplementation(async (request) => {
        product = createProductStub({ ...product, name: request.name });
        return createRenameProductResponseStub({
          result: { case: 'success', value: product },
        });
      });

      const products = createProductsPage();
      await products.open();
      await products.openRenameDialog('Кольцо');
      await expect.element(products.editName()).toHaveValue('Кольцо');
      await expect.element(products.editName()).toHaveFocus();
      await products.screenshotModalState('Edit Product dialog');
      await products.editName().fill('Кольцо с гранатом');
      await products.saveRename();

      await expect.element(products.product('Кольцо с гранатом')).toBeVisible();
      await expect(productService.renameProduct.getLastRequest()).resolves.toMatchObject({
        id: 'ring-id',
        name: 'Кольцо с гранатом',
      });
    });

    test('shows a generic message for a transport failure', async ({ productService }) => {
      productService.createProduct.rejects(
        new ConnectError('Server unavailable', Code.Unavailable),
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
      await products.screenshotModalState('Product form error');
    });
  },
);
