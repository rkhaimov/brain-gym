import { Code, ConnectError } from '@connectrpc/connect';
import { expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  createCreateProductResponseStub,
  createListProductsResponseStub,
  createProductStub,
  createRenameProductResponseStub,
  createSetProductArchivedResponseStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import type {
  CreateProductResponse,
  ListProductsResponse,
  SetProductArchivedResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Product catalog', () => {
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
    expect(productService.listProducts.handler.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
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

  test('opens the create dialog with focus and dismisses it accessibly', async ({
    productService,
  }) => {
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
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
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
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
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));

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
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
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
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
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

  test('renames a Product and moves it between active and archived filters', async ({
    productService,
  }) => {
    let product = createProductStub({ archived: false, id: 'ring-id', name: 'Кольцо' });
    productService.listProducts.handler.mockImplementation(async (request) =>
      createListProductsResponseStub({
        products: request.archived === product.archived ? [product] : [],
      }),
    );
    productService.renameProduct.handler.mockImplementation(async (request) => {
      product = createProductStub({ ...product, name: request.name });
      return createRenameProductResponseStub({
        result: { case: 'success', value: product },
      });
    });
    productService.setProductArchived.handler.mockImplementation(async (request) => {
      product = createProductStub({ ...product, archived: request.archived });
      return createSetProductArchivedResponseStub({
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

    await products.archive('Кольцо с гранатом');
    await expect.element(products.product('Кольцо с гранатом')).not.toBeInTheDocument();
    await products.showArchived();
    await expect.element(products.product('Кольцо с гранатом')).toBeVisible();
    await expect.element(products.headerCreateButton()).not.toBeInTheDocument();
    await products.screenshotPage('Archived Product');

    await products.restore('Кольцо с гранатом');
    await expect.element(products.product('Кольцо с гранатом')).not.toBeInTheDocument();
    await products.showActive();
    await expect.element(products.product('Кольцо с гранатом')).toBeVisible();
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

  test('shows a generic message for a transport failure', async ({ productService }) => {
    productService.listProducts.resolves(createListProductsResponseStub({ products: [] }));
    productService.createProduct.rejects(new ConnectError('Server unavailable', Code.Unavailable));

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

function createProductsPage() {
  const catalog = () => page.getByRole('region', { name: 'Все штучки' });
  const dialog = () => page.getByRole('dialog', { name: 'Новая штучка' });
  const editDialog = () => page.getByRole('dialog', { name: 'Переименовать штучку' });
  const emptyCreateButton = () => page.getByRole('button', { name: 'Создать первую штучку' });
  const headerCreateButton = () => page.getByRole('button', { name: 'Создать штучку' });

  return {
    archive: (name: string) =>
      catalog()
        .getByRole('button', { name: `Архивировать ${name}` })
        .click(),
    archiveButton: (name: string) =>
      catalog().getByRole('button', { name: `Архивировать ${name}` }),
    cancel: () => dialog().getByRole('button', { name: 'Отмена' }).click(),
    cancelButton: () => dialog().getByRole('button', { name: 'Отмена' }),
    catalogError: () => page.getByRole('alert'),
    catalogLoading: () => page.getByText('Загружаем каталог…', { exact: true }),
    count: (count: number) => page.getByLabelText(`Количество штучек: ${count}`),
    dialog,
    editName: () => editDialog().getByRole('textbox', { name: 'Название' }),
    emptyArchiveMessage: () => page.getByText('Архив пока пуст', { exact: true }),
    emptyCatalogMessage: () => page.getByText('Каталог пока пуст', { exact: true }),
    emptyCreateButton,
    header: () => page.getByRole('heading', { level: 1, name: 'Штучки' }),
    headerCreateButton,
    name: () => dialog().getByRole('textbox', { name: 'Название' }),
    nameError: () => dialog().getByRole('alert'),
    navigation: () => page.getByRole('link', { exact: true, name: 'Штучки' }),
    open: () => window.openApplicationRoute('/products'),
    openCreateDialog: () => headerCreateButton().click(),
    openEmptyCreateDialog: () => emptyCreateButton().click(),
    openRenameDialog: (name: string) =>
      catalog()
        .getByRole('button', { name: `Переименовать ${name}` })
        .click(),
    pendingSubmitButton: () => dialog().getByRole('button', { name: 'Сохраняем…' }),
    product: (name: string) => catalog().getByText(name, { exact: true }),
    retryCatalog: () => page.getByRole('button', { name: 'Попробовать снова' }).click(),
    restore: (name: string) =>
      catalog()
        .getByRole('button', { name: `Восстановить ${name}` })
        .click(),
    screenshotModalState: (name: string) => screenshot(page.elementLocator(document.body), name),
    screenshotLoadingPage: (name: string) =>
      screenshot(page.elementLocator(document.body), name, { noTransientUIProtection: true }),
    screenshotPage: (name: string) => screenshot(page.elementLocator(document.body), name),
    saveRename: () => editDialog().getByRole('button', { name: 'Сохранить' }).click(),
    submit: () => dialog().getByRole('button', { name: 'Создать' }).click(),
    showActive: () => page.getByRole('button', { name: 'Активные' }).click(),
    showArchived: () => page.getByRole('button', { name: 'Архив' }).click(),
  };
}

interface Deferred<Value> {
  readonly promise: Promise<Value>;
  resolve(value: Value): void;
}

function createDeferred<Value>(): Deferred<Value> {
  let resolver: ((value: Value) => void) | undefined;
  const promise = new Promise<Value>((resolve) => {
    resolver = resolve;
  });

  return {
    promise,
    resolve(value) {
      if (resolver === undefined) {
        throw new Error('Deferred resolver is unavailable');
      }
      resolver(value);
    },
  };
}
