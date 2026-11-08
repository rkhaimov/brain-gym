import { createQueryOptions, useMutation, useQuery, useTransport } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Archive, ArchiveRestore, PackageOpen, Pencil, Plus } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Badge } from '@/client/components/ui/badge.js';
import { Button } from '@/client/components/ui/button.js';
import { Spinner } from '@/client/components/ui/spinner.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import {
  listProducts,
  setProductArchived,
} from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';

import { CreateProductDialog } from './-create-product-dialog.js';
import { EditProductDialog } from './-edit-product-dialog.js';

function ProductsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const catalog = useQuery(listProducts, { archived: showArchived });
  const archiveMutation = useMutation(setProductArchived);
  const queryClient = useQueryClient();
  const transport = useTransport();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>();
  const createDialogTrigger = useRef<HTMLButtonElement | null>(null);
  const editDialogTrigger = useRef<HTMLButtonElement | null>(null);

  function openCreateDialog(event: MouseEvent<HTMLButtonElement>): void {
    createDialogTrigger.current = event.currentTarget;
    setCreateDialogOpen(true);
  }

  function openEditDialog(event: MouseEvent<HTMLButtonElement>, product: Product): void {
    editDialogTrigger.current = event.currentTarget;
    setEditedProduct(product);
  }

  async function changeArchived(product: Product, archived: boolean): Promise<void> {
    const response = await archiveMutation.mutateAsync({ archived, id: product.id });
    if (response.result.case !== 'success') {
      throw new Error(
        response.result.case === 'failure' ? response.result.value : 'Missing result',
      );
    }
    await Promise.all(
      [false, true].map((filterArchived) =>
        queryClient.invalidateQueries({
          queryKey: createQueryOptions(listProducts, { archived: filterArchived }, { transport })
            .queryKey,
        }),
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              aria-pressed={!showArchived}
              onClick={() => setShowArchived(false)}
              size="sm"
              variant={showArchived ? 'outline' : 'secondary'}
            >
              Активные
            </Button>
            <Button
              aria-pressed={showArchived}
              onClick={() => setShowArchived(true)}
              size="sm"
              variant={showArchived ? 'secondary' : 'outline'}
            >
              Архив
            </Button>
          </div>
          {catalog.data === undefined ? null : (
            <Badge
              aria-label={`Количество штучек: ${catalog.data.products.length}`}
              variant="secondary"
            >
              {catalog.data.products.length}
            </Badge>
          )}
        </div>
        {showArchived ? null : (
          <Button onClick={openCreateDialog} size="sm">
            <Plus />
            Создать штучку
          </Button>
        )}
      </div>

      <section aria-labelledby="catalog-heading" className="flex flex-col gap-4 px-6">
        <h2 className="sr-only" id="catalog-heading">
          Все штучки
        </h2>
        <div className="overflow-hidden rounded-lg border">
          <Table aria-label="Штучки">
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.isPending ? (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={2}>
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner aria-label="Загружаем каталог" />
                      Загружаем каталог…
                    </span>
                  </TableCell>
                </TableRow>
              ) : catalog.isError ? (
                <TableRow>
                  <TableCell className="h-32" colSpan={2}>
                    <div className="mx-auto flex max-w-xl flex-col items-start gap-3">
                      <Alert variant="destructive">
                        <AlertTitle>Не удалось загрузить каталог</AlertTitle>
                        <AlertDescription>
                          Проверьте соединение с сервером и попробуйте снова.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={() => catalog.refetch()} size="sm" variant="outline">
                        Попробовать снова
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : catalog.data.products.length === 0 ? (
                <TableRow>
                  <TableCell className="h-48 text-center" colSpan={2}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <PackageOpen />
                      </div>
                      <div>
                        <p className="font-medium">
                          {showArchived ? 'Архив пока пуст' : 'Каталог пока пуст'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {showArchived
                            ? 'Архивированные штучки появятся здесь'
                            : 'Добавьте первую штучку, чтобы начать вести каталог'}
                        </p>
                      </div>
                      {showArchived ? null : (
                        <Button onClick={openCreateDialog} size="sm" variant="outline">
                          <Plus />
                          Создать первую штучку
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                catalog.data.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Переименовать ${product.name}`}
                          onClick={(event) => openEditDialog(event, product)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil />
                          Переименовать
                        </Button>
                        <Button
                          aria-label={`${showArchived ? 'Восстановить' : 'Архивировать'} ${product.name}`}
                          disabled={archiveMutation.isPending}
                          onClick={() => changeArchived(product, !showArchived)}
                          size="sm"
                          variant="ghost"
                        >
                          {showArchived ? <ArchiveRestore /> : <Archive />}
                          {showArchived ? 'Восстановить' : 'В архив'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {createDialogOpen ? (
        <CreateProductDialog
          onOpenChange={setCreateDialogOpen}
          open
          returnFocusTo={createDialogTrigger}
        />
      ) : null}
      {editedProduct === undefined ? null : (
        <EditProductDialog
          onOpenChange={(open) => {
            if (!open) setEditedProduct(undefined);
          }}
          product={editedProduct}
          returnFocusTo={editDialogTrigger}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/products')({
  component: ProductsPage,
  staticData: { pageTitle: 'Штучки' },
});
