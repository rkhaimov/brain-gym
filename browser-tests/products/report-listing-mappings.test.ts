import { expect } from 'vitest';
import { page } from 'vitest/browser';

import { reportListingProductComboboxContract } from '@/client/components/report-listing/report-listing-product-combobox-test-tags.js';
import {
  createListProductsResponseStub,
  createProductStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import {
  createCreateProductAndMapReportListingResponseStub,
  createListReportListingsResponseStub,
  createReportListingStub,
  createSetReportListingProductResponseStub,
} from '@/shared/gen/ceramics/v1/report_listing_test.js';
import type { ReportListingServiceSpies } from '@/shared/gen/ceramics/v1/report_listing_test.js';
import { ReportListingFilter } from '@/shared/gen/ceramics/v1/report_listing_pb.js';
import type {
  ReportListing,
  SetReportListingProductResponse,
} from '@/shared/gen/ceramics/v1/report_listing_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

const ring = createProductStub({ archived: false, id: 'ring-id', name: 'Кольцо' });
const pendant = createProductStub({ archived: false, id: 'pendant-id', name: 'Кулон' });
const archivedBrooch = createProductStub({ archived: true, id: 'brooch-id', name: 'Брошь' });

test.describe(
  'ReportListingProductCombobox through the Products page',
  { tags: reportListingProductComboboxContract.testTag },
  () => {
    test('keeps Catalog as the default and exposes counts and all mapping filters', async ({
      productService,
      reportListingService,
    }) => {
      const listings = [
        createReportListingStub({ id: 'raw-ring', name: 'Кольцо ручной работы' }),
        createReportListingStub({ id: 'raw-pendant', name: 'Подвеска авторская' }),
        createReportListingStub({ id: 'mapped-ring', name: 'Кольцо (арт. 7)', product: ring }),
        createReportListingStub({
          id: 'mapped-archived',
          name: 'Винтажная брошь',
          product: archivedBrooch,
        }),
      ];
      installListingState(listings, reportListingService);
      productService.listProducts.resolves(
        createListProductsResponseStub({ products: [ring, pendant] }),
      );

      await window.openApplicationRoute('/products');
      await expect
        .element(page.getByRole('tab', { name: 'Каталог' }))
        .toHaveAttribute('data-state', 'active');
      await expect.element(page.getByRole('region', { name: 'Все штучки' })).toBeVisible();

      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      await expect(reportListingService.listReportListings.getLastRequest()).resolves.toMatchObject(
        {
          filter: ReportListingFilter.UNMAPPED,
        },
      );
      await expect.element(page.getByText('Кольцо ручной работы', { exact: true })).toBeVisible();
      await expect
        .element(page.getByText('Кольцо (арт. 7)', { exact: true }))
        .not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: 'Все 4' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Несопоставленные 2' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Сопоставленные 2' })).toBeVisible();

      await page.getByRole('button', { name: 'Все 4' }).click();
      await expect.element(page.getByText('Кольцо (арт. 7)', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Брошь', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Архив', { exact: true })).toBeVisible();
      await screenshot(page.getByRole('region', { name: 'Штучки' }), 'Product mappings all filter');

      await page.getByRole('button', { name: 'Сопоставленные 2' }).click();
      await expect
        .element(page.getByText('Кольцо ручной работы', { exact: true }))
        .not.toBeInTheDocument();
      expect(window.location.search).toContain('filter=mapped');
    });

    test('restores the selected tab and filter from the URL', async ({
      productService,
      reportListingService,
    }) => {
      const listing = createReportListingStub({
        id: 'mapped-ring',
        name: 'Кольцо из отчёта',
        product: ring,
      });
      installListingState([listing], reportListingService);
      productService.listProducts.resolves(createListProductsResponseStub({ products: [ring] }));

      await window.openApplicationRoute('/products?tab=report-listings&filter=mapped');

      await expect
        .element(page.getByRole('tab', { name: /Позиции отчётов/ }))
        .toHaveAttribute('data-state', 'active');
      await expect(reportListingService.listReportListings.getLastRequest()).resolves.toMatchObject(
        {
          filter: ReportListingFilter.MAPPED,
        },
      );
      await expect.element(page.getByText(listing.name, { exact: true })).toBeVisible();
    });

    test('searches by substring, maps, remaps, and unmaps without automatic suggestions', async ({
      productService,
      reportListingService,
    }) => {
      let listing = createReportListingStub({ id: 'listing-id', name: 'Авторское украшение' });
      productService.listProducts.resolves(
        createListProductsResponseStub({ products: [ring, pendant] }),
      );
      reportListingService.listReportListings.handler.mockImplementation(async (request) =>
        createListReportListingsResponseStub({
          allCount: 1,
          listings:
            request.filter === ReportListingFilter.UNMAPPED && listing.product !== undefined
              ? []
              : [listing],
          mappedCount: listing.product === undefined ? 0 : 1,
          unmappedCount: listing.product === undefined ? 1 : 0,
        }),
      );
      reportListingService.setReportListingProduct.handler.mockImplementation(async (request) => {
        listing = createReportListingStub({
          ...listing,
          product: [ring, pendant].find(({ id }) => id === request.productId),
        });
        return createSetReportListingProductResponseStub({
          result: { case: 'success', value: listing },
        });
      });

      await window.openApplicationRoute('/products');
      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      await page.getByRole('button', { name: 'Все 1' }).click();
      await page.getByText('Сопоставить', { exact: true }).click();
      const search = page.getByPlaceholder('Поиск штучки…');
      await search.fill('кул');
      await expect.element(page.getByText('Кулон', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Кольцо', { exact: true })).not.toBeInTheDocument();
      await screenshot(page.getByRole('dialog'), 'Open Product mapping combobox');

      await search.fill('несуществующая');
      await expect.element(page.getByText('Ничего не найдено')).toBeVisible();
      expect(reportListingService.setReportListingProduct.handler).not.toHaveBeenCalled();

      await search.fill('кул');
      await page.getByText('Кулон', { exact: true }).click();
      await expect.element(page.getByText('Кулон', { exact: true })).toBeVisible();
      await expect(
        reportListingService.setReportListingProduct.getLastRequest(),
      ).resolves.toMatchObject({
        productId: pendant.id,
        reportListingId: listing.id,
      });

      await page.getByText('Кулон', { exact: true }).click();
      await page.getByPlaceholder('Поиск штучки…').fill('коль');
      await page.getByText('Кольцо', { exact: true }).click();
      await expect.element(page.getByText('Кольцо', { exact: true })).toBeVisible();

      await page.getByText('Кольцо', { exact: true }).click();
      await page.getByRole('button', { name: 'Убрать сопоставление' }).click();
      await expect.element(page.getByText('Сопоставить', { exact: true })).toBeVisible();
      const unmapRequest = await reportListingService.setReportListingProduct.getLastRequest();
      expect(unmapRequest.productId).toBeUndefined();
      expect(unmapRequest.reportListingId).toBe(listing.id);
    });

    test('reuses the empty Product form for atomic create-and-map and restores focus', async ({
      productService,
      reportListingService,
    }) => {
      let listing = createReportListingStub({ id: 'listing-id', name: 'Неизвестное изделие' });
      productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
      reportListingService.listReportListings.handler.mockImplementation(async () =>
        createListReportListingsResponseStub({
          allCount: 1,
          listings: [listing],
          mappedCount: listing.product === undefined ? 0 : 1,
          unmappedCount: listing.product === undefined ? 1 : 0,
        }),
      );
      reportListingService.createProductAndMapReportListing.handler.mockImplementation(
        async (request) => {
          listing = createReportListingStub({
            ...listing,
            product: createProductStub({ archived: false, id: 'created-id', name: request.name }),
          });
          return createCreateProductAndMapReportListingResponseStub({
            result: { case: 'success', value: listing },
          });
        },
      );

      await window.openApplicationRoute('/products');
      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      await page.getByRole('button', { name: 'Все 1' }).click();
      await page.getByText('Сопоставить', { exact: true }).click();
      await page.getByRole('button', { name: 'Создать штучку' }).click();
      const dialog = page.getByRole('dialog', { name: 'Новая штучка' });
      const name = dialog.getByRole('textbox', { name: 'Название' });
      await expect.element(name).toHaveValue('');
      await expect.element(name).toHaveFocus();
      await screenshot(dialog, 'Create and map Product form');

      await name.fill('Серьги');
      await dialog.getByRole('button', { name: 'Создать и сопоставить' }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      await expect(
        reportListingService.createProductAndMapReportListing.getLastRequest(),
      ).resolves.toMatchObject({
        name: 'Серьги',
        reportListingId: listing.id,
      });
      expect(document.activeElement?.textContent).toContain('Серьги');
    });

    test('returns focus before a newly mapped row leaves the default Unmapped filter', async ({
      productService,
      reportListingService,
    }) => {
      let listing = createReportListingStub({ id: 'listing-id', name: 'Неизвестное изделие' });
      productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
      reportListingService.listReportListings.handler.mockImplementation(async (request) =>
        createListReportListingsResponseStub({
          allCount: 1,
          listings:
            request.filter === ReportListingFilter.UNMAPPED && listing.product !== undefined
              ? []
              : [listing],
          mappedCount: listing.product === undefined ? 0 : 1,
          unmappedCount: listing.product === undefined ? 1 : 0,
        }),
      );
      reportListingService.createProductAndMapReportListing.handler.mockImplementation(
        async (request) => {
          listing = createReportListingStub({
            ...listing,
            product: createProductStub({ archived: false, id: 'created-id', name: request.name }),
          });
          return createCreateProductAndMapReportListingResponseStub({
            result: { case: 'success', value: listing },
          });
        },
      );

      await window.openApplicationRoute('/products');
      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      const trigger = page.getByRole('combobox', { name: 'Сопоставить Неизвестное изделие' });
      let returnedFocus = false;
      trigger.element().addEventListener('focus', () => {
        returnedFocus = true;
      });
      await trigger.click();
      await page.getByRole('button', { name: 'Создать штучку' }).click();
      const dialog = page.getByRole('dialog', { name: 'Новая штучка' });
      await dialog.getByRole('textbox', { name: 'Название' }).fill('Серьги');
      await dialog.getByRole('button', { name: 'Создать и сопоставить' }).click();

      await expect.element(dialog).not.toBeInTheDocument();
      await expect.element(page.getByText(listing.name, { exact: true })).not.toBeInTheDocument();
      expect(returnedFocus).toBe(true);
    });

    test('keeps the popup open after a rejected mapping and allows retry', async ({
      productService,
      reportListingService,
    }) => {
      let listing = createReportListingStub({ id: 'listing-id', name: 'Украшение' });
      let rejectMapping = true;
      productService.listProducts.resolves(createListProductsResponseStub({ products: [pendant] }));
      reportListingService.listReportListings.handler.mockImplementation(async () =>
        createListReportListingsResponseStub({
          allCount: 1,
          listings: [listing],
          unmappedCount: 1,
        }),
      );
      reportListingService.setReportListingProduct.handler.mockImplementation(async () => {
        if (rejectMapping) {
          return createSetReportListingProductResponseStub({
            result: { case: 'failure', value: 'Сопоставление отклонено' },
          });
        }
        listing = createReportListingStub({ ...listing, product: pendant });
        return createSetReportListingProductResponseStub({
          result: { case: 'success', value: listing },
        });
      });

      await window.openApplicationRoute('/products');
      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      await page.getByRole('button', { name: 'Все 1' }).click();
      await page.getByText('Сопоставить', { exact: true }).click();
      await page.getByText('Кулон', { exact: true }).click();
      await expect.element(page.getByRole('alert')).toHaveTextContent('Сопоставление отклонено');
      await expect.element(page.getByPlaceholder('Поиск штучки…')).toBeVisible();

      rejectMapping = false;
      await page.getByText('Кулон', { exact: true }).click();
      await expect.element(page.getByPlaceholder('Поиск штучки…')).not.toBeInTheDocument();
      await expect.element(page.getByText('Кулон', { exact: true })).toBeVisible();
    });

    test('keeps mapping controls pending until the committed response arrives', async ({
      productService,
      reportListingService,
    }) => {
      let listing = createReportListingStub({ id: 'listing-id', name: 'Украшение' });
      const pending = createDeferred<SetReportListingProductResponse>();
      productService.listProducts.resolves(createListProductsResponseStub({ products: [pendant] }));
      reportListingService.listReportListings.handler.mockImplementation(async () =>
        createListReportListingsResponseStub({
          allCount: 1,
          listings: [listing],
          unmappedCount: 1,
        }),
      );
      reportListingService.setReportListingProduct.handler.mockImplementation(
        () => pending.promise,
      );

      await window.openApplicationRoute('/products');
      await page.getByRole('tab', { name: /Позиции отчётов/ }).click();
      await page.getByRole('button', { name: 'Все 1' }).click();
      await page.getByText('Сопоставить', { exact: true }).click();
      await page.getByText('Кулон', { exact: true }).click();
      await expect
        .element(page.getByText('Кулон', { exact: true }))
        .toHaveAttribute('data-disabled');
      await expect.element(page.getByPlaceholder('Поиск штучки…')).toBeVisible();

      listing = createReportListingStub({ ...listing, product: pendant });
      pending.resolve(
        createSetReportListingProductResponseStub({
          result: { case: 'success', value: listing },
        }),
      );
      await expect.element(page.getByPlaceholder('Поиск штучки…')).not.toBeInTheDocument();
    });
  },
);

function installListingState(
  listings: readonly ReportListing[],
  reportListingService: ReportListingServiceSpies,
): void {
  reportListingService.listReportListings.handler.mockImplementation(async (request) => {
    const visible = listings.filter((listing) => {
      if (request.filter === ReportListingFilter.MAPPED) return listing.product !== undefined;
      if (request.filter === ReportListingFilter.UNMAPPED) return listing.product === undefined;
      return true;
    });
    return createListReportListingsResponseStub({
      allCount: listings.length,
      listings: visible,
      mappedCount: listings.filter(({ product }) => product !== undefined).length,
      unmappedCount: listings.filter(({ product }) => product === undefined).length,
    });
  });
}

function createDeferred<Value>() {
  let resolvePromise: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}
