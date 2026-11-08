import { ConnectError } from '@connectrpc/connect';
import {
  createConnectQueryKey,
  useMutation,
  useQuery,
  useTransport,
} from '@connectrpc/connect-query';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PackageOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import {
  createProduct,
  listProducts,
} from '../../shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import {
  ProductValidationErrorSchema,
  ProductValidationField,
  ProductValidationReason,
} from '../../shared/gen/ceramics/v1/product_pb.js';

function nameErrorMessage(error: ConnectError): string | undefined {
  const detail = error.findDetails(ProductValidationErrorSchema)[0];
  if (detail === undefined || detail.field !== ProductValidationField.NAME) {
    return undefined;
  }

  switch (detail.reason) {
    case ProductValidationReason.NAME_REQUIRED:
      return 'Введите название штучки';
    case ProductValidationReason.NAME_ALREADY_EXISTS:
      return 'Штучка с таким названием уже существует';
    case ProductValidationReason.UNSPECIFIED:
      return undefined;
    default:
      return undefined;
  }
}

function ProductsPage() {
  const catalog = useQuery(listProducts, {});
  const createProductMutation = useMutation(createProduct);
  const queryClient = useQueryClient();
  const transport = useTransport();
  const [nameError, setNameError] = useState<string>();
  const [unexpectedError, setUnexpectedError] = useState<string>();
  const form = useForm({
    defaultValues: { name: '' },
    async onSubmit({ value }) {
      setNameError(undefined);
      setUnexpectedError(undefined);
      try {
        await createProductMutation.mutateAsync({ name: value.name });
        await queryClient.invalidateQueries({
          queryKey: createConnectQueryKey({
            cardinality: 'finite',
            input: {},
            schema: listProducts,
            transport,
          }),
        });
        form.reset();
      } catch (error) {
        const connectError = ConnectError.from(error);
        const fieldMessage = nameErrorMessage(connectError);
        if (fieldMessage !== undefined) {
          setNameError(fieldMessage);
          return;
        }
        setUnexpectedError('Не удалось сохранить штучку. Попробуйте ещё раз.');
      }
    },
  });

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit().catch((error: unknown) => {
      console.error('Unexpected Product form failure', error);
      setUnexpectedError('Не удалось сохранить штучку. Попробуйте ещё раз.');
    });
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
          Штучки
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Каталог штучек</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Добавляйте названия, под которыми вы объединяете одинаковые штучки из разных торговых
          точек.
        </p>
      </header>

      <section
        aria-labelledby="new-product-heading"
        className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_rgba(57,39,31,0.05)]"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-hover)]">
            <Plus aria-hidden size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold" id="new-product-heading">
              Новая штучка
            </h2>
            <p className="text-sm text-[var(--muted)]">Название сохраняется точно как введено</p>
          </div>
        </div>

        <form className="flex items-start gap-4" noValidate onSubmit={submitForm}>
          <form.Field name="name">
            {(field) => (
              <div className="min-w-0 flex-1">
                <label className="mb-2 block text-sm font-semibold" htmlFor={field.name}>
                  Название
                </label>
                <Input
                  aria-describedby={nameError === undefined ? undefined : `${field.name}-error`}
                  aria-invalid={nameError === undefined ? undefined : true}
                  autoComplete="off"
                  disabled={createProductMutation.isPending}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setNameError(undefined);
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Например, Кольцо"
                  value={field.state.value}
                />
                {nameError === undefined ? null : (
                  <p
                    className="mt-2 text-sm font-medium text-[var(--danger)]"
                    id={`${field.name}-error`}
                    role="alert"
                  >
                    {nameError}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <Button
            className="mt-7 min-w-44"
            disabled={createProductMutation.isPending}
            type="submit"
          >
            <Plus aria-hidden size={16} strokeWidth={1.75} />
            {createProductMutation.isPending ? 'Сохраняем…' : 'Создать штучку'}
          </Button>
        </form>
        {unexpectedError === undefined ? null : (
          <p
            className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            role="alert"
          >
            {unexpectedError}
          </p>
        )}
      </section>

      <section
        aria-labelledby="catalog-heading"
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(57,39,31,0.05)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-xl font-bold" id="catalog-heading">
            Все штучки
          </h2>
          {catalog.data === undefined ? null : (
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-hover)]">
              {catalog.data.products.length}
            </span>
          )}
        </div>

        {catalog.isPending ? (
          <p className="px-6 py-10 text-center text-sm text-[var(--muted)]">Загружаем каталог…</p>
        ) : catalog.isError ? (
          <div className="px-6 py-10 text-center">
            <p className="font-semibold text-[var(--danger)]">Не удалось загрузить каталог</p>
            <Button className="mt-4" onClick={() => catalog.refetch()}>
              Попробовать снова
            </Button>
          </div>
        ) : catalog.data.products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-hover)]">
              <PackageOpen aria-hidden size={24} strokeWidth={1.75} />
            </div>
            <p className="text-lg font-bold">Каталог пока пуст</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Создайте первую штучку с помощью формы выше
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]" aria-label="Штучки">
            {catalog.data.products.map((product) => (
              <li className="flex items-center gap-4 px-6 py-4" key={product.id}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-hover)]">
                  <PackageOpen aria-hidden size={17} strokeWidth={1.75} />
                </div>
                <span className="whitespace-pre-wrap font-semibold">{product.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const Route = createFileRoute('/products')({ component: ProductsPage });
