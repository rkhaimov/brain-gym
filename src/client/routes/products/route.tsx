import { useQuery } from '@connectrpc/connect-query';
import { createFileRoute } from '@tanstack/react-router';
import { PackageOpen, Plus } from 'lucide-react';
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
import { listProducts } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';

import { CreateProductDialog } from './-create-product-dialog.js';

function ProductsPage() {
  const catalog = useQuery(listProducts, {});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const createDialogTrigger = useRef<HTMLButtonElement | null>(null);

  function openCreateDialog(event: MouseEvent<HTMLButtonElement>): void {
    createDialogTrigger.current = event.currentTarget;
    setCreateDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">Все</h2>
          {catalog.data === undefined ? null : (
            <Badge
              aria-label={`Количество штучек: ${catalog.data.products.length}`}
              variant="secondary"
            >
              {catalog.data.products.length}
            </Badge>
          )}
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus />
          Создать штучку
        </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.isPending ? (
                <TableRow>
                  <TableCell className="h-24 text-center">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner aria-label="Загружаем каталог" />
                      Загружаем каталог…
                    </span>
                  </TableCell>
                </TableRow>
              ) : catalog.isError ? (
                <TableRow>
                  <TableCell className="h-32">
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
                  <TableCell className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <PackageOpen />
                      </div>
                      <div>
                        <p className="font-medium">Каталог пока пуст</p>
                        <p className="text-sm text-muted-foreground">
                          Добавьте первую штучку, чтобы начать вести каталог
                        </p>
                      </div>
                      <Button onClick={openCreateDialog} size="sm" variant="outline">
                        <Plus />
                        Создать первую штучку
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                catalog.data.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <CreateProductDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
        returnFocusTo={createDialogTrigger}
      />
    </div>
  );
}

export const Route = createFileRoute('/products')({
  component: ProductsPage,
  staticData: { pageTitle: 'Штучки' },
});
