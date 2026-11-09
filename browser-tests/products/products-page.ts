import { page } from 'vitest/browser';

import { screenshot } from '@/test/browser/runtime/screenshot.js';

export function createProductsPage() {
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
    screenshotModalState: (name: string) => screenshot(page.getByRole('dialog'), name),
    screenshotLoadingPage: (name: string) =>
      screenshot(catalog(), name, { noTransientUIProtection: true }),
    screenshotPage: (name: string) => screenshot(catalog(), name),
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

export function createDeferred<Value>(): Deferred<Value> {
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
