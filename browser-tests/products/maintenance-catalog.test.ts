import { Code, ConnectError } from '@connectrpc/connect';
import { expect } from 'vitest';
import { page } from 'vitest/browser';

import { maintenanceCatalogContract } from '@/client/components/maintenance/maintenance-test-tags.js';
import {
  createListProductsResponseStub,
  createProductStub,
  createSetProductArchivedResponseStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import type {
  ListProductsResponse,
  SetProductArchivedResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';
import { test } from '@/test/browser/runtime/test.js';

import { createDeferred, createProductsPage } from './products-page.js';

test.describe(
  'MaintenanceCatalog through the Product catalog',
  { tags: maintenanceCatalogContract.testTag },
  () => {
    test('displays the catalog while it is loading', async ({ productService }) => {
      const pendingCatalog = createDeferred<ListProductsResponse>();
      productService.listProducts.handler.mockImplementation(() => pendingCatalog.promise);

      const products = createProductsPage();
      await products.open();

      await expect.element(products.catalogLoading()).toBeVisible();
      await expect.element(products.count(0)).not.toBeInTheDocument();
      await products.screenshotLoadingPage('Loading catalog');

      pendingCatalog.resolve(createListProductsResponseStub({ products: [] }));
      await expect.element(products.emptyCatalogMessage()).toBeVisible();
    });

    test('displays a catalog error and retries the request', async ({ productService }) => {
      productService.listProducts.rejects(new ConnectError('Server unavailable', Code.Unavailable));

      const products = createProductsPage();
      await products.open();

      await expect.element(products.catalogError()).toBeVisible();
      await products.screenshotPage('Catalog load error');

      const callsBeforeRetry = productService.listProducts.handler.mock.calls.length;
      productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
      await products.retryCatalog();
      await expect.element(products.emptyCatalogMessage()).toBeVisible();
      expect(productService.listProducts.handler.mock.calls.length).toBeGreaterThan(
        callsBeforeRetry,
      );
    });

    test('displays the empty active and archived catalogs', async ({ productService }) => {
      productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
      const products = createProductsPage();
      await products.open();

      await expect.element(products.navigation()).toHaveAttribute('aria-current', 'page');
      await expect.element(products.header()).toHaveTextContent('Штучки');
      await expect.element(products.count(0)).toBeVisible();
      await expect.element(page.getByText('Quick Create', { exact: true })).not.toBeInTheDocument();
      await expect.element(page.getByText('Inbox', { exact: true })).not.toBeInTheDocument();
      await expect.element(page.getByRole('link', { name: 'GitHub' })).not.toBeInTheDocument();
      await products.screenshotPage('Empty catalog');

      await products.showArchived();
      await expect.element(products.emptyArchiveMessage()).toBeVisible();
      await expect.element(products.headerCreateButton()).not.toBeInTheDocument();
      await products.screenshotPage('Empty archive');
    });

    test('moves a Product between active and archived filters', async ({ productService }) => {
      let product = createProductStub({
        archived: false,
        id: 'ring-id',
        name: 'Кольцо с гранатом',
      });
      productService.listProducts.handler.mockImplementation(async (request) =>
        createListProductsResponseStub({
          products: request.archived === product.archived ? [product] : [],
        }),
      );
      productService.setProductArchived.handler.mockImplementation(async (request) => {
        product = createProductStub({ ...product, archived: request.archived });
        return createSetProductArchivedResponseStub({
          result: { case: 'success', value: product },
        });
      });

      const products = createProductsPage();
      await products.open();
      await products.archive(product.name);
      await expect.element(products.product(product.name)).not.toBeInTheDocument();
      await products.showArchived();
      await expect.element(products.product(product.name)).toBeVisible();
      await expect.element(products.headerCreateButton()).not.toBeInTheDocument();
      await products.screenshotPage('Archived Product');

      await products.restore(product.name);
      await expect.element(products.product(product.name)).not.toBeInTheDocument();
      await products.showActive();
      await expect.element(products.product(product.name)).toBeVisible();
    });

    test('disables archive actions while an archive request is pending', async ({
      productService,
    }) => {
      const product = createProductStub({ archived: false, id: 'ring-id', name: 'Кольцо' });
      const pendingArchive = createDeferred<SetProductArchivedResponse>();
      productService.listProducts.resolves(createListProductsResponseStub({ products: [product] }));
      productService.setProductArchived.handler.mockImplementation(() => pendingArchive.promise);

      const products = createProductsPage();
      await products.open();
      await products.archive(product.name);

      await expect.element(products.archiveButton(product.name)).toBeDisabled();
      await products.screenshotPage('Pending Product archival');

      pendingArchive.resolve(
        createSetProductArchivedResponseStub({
          result: { case: 'success', value: createProductStub({ ...product, archived: true }) },
        }),
      );
      await expect.element(products.archiveButton(product.name)).not.toBeDisabled();
    });
  },
);
