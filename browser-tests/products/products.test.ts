import { Code, ConnectError } from '@connectrpc/connect';
import { expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  createCreateProductResponseStub,
  createListProductsResponseStub,
  createProductStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import type {
  CreateProductResponse,
  ListProductsResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Product catalog', () => {
  test('displays the empty catalog', async ({ productService }) => {
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
  const emptyCreateButton = () => page.getByRole('button', { name: 'Создать первую штучку' });
  const headerCreateButton = () => page.getByRole('button', { name: 'Создать штучку' });

  return {
    cancel: () => dialog().getByRole('button', { name: 'Отмена' }).click(),
    cancelButton: () => dialog().getByRole('button', { name: 'Отмена' }),
    count: (count: number) => page.getByLabelText(`Количество штучек: ${count}`),
    dialog,
    emptyCreateButton,
    header: () => page.getByRole('heading', { level: 1, name: 'Штучки' }),
    headerCreateButton,
    name: () => dialog().getByRole('textbox', { name: 'Название' }),
    nameError: () => dialog().getByRole('alert'),
    navigation: () => page.getByRole('link', { exact: true, name: 'Штучки' }),
    open: () => window.openApplicationRoute('/products'),
    openCreateDialog: () => headerCreateButton().click(),
    openEmptyCreateDialog: () => emptyCreateButton().click(),
    pendingSubmitButton: () => dialog().getByRole('button', { name: 'Сохраняем…' }),
    product: (name: string) => catalog().getByText(name, { exact: true }),
    screenshotModalState: (name: string) => screenshot(page.elementLocator(document.body), name),
    screenshotPage: (name: string) => screenshot(page.elementLocator(document.body), name),
    submit: () => dialog().getByRole('button', { name: 'Создать' }).click(),
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
