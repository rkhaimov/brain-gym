import { useMutation, useQuery } from '@connectrpc/connect-query';
import { createFileRoute } from '@tanstack/react-router';
import { PackageOpen } from 'lucide-react';

import {
  MaintenanceCatalog,
  type MaintenanceCatalogCopy,
} from '@/client/components/maintenance/maintenance-catalog.js';
import { useMaintenancePage } from '@/client/components/maintenance/use-maintenance-page.js';
import {
  listProducts,
  setProductArchived,
} from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';

import { CreateProductDialog } from './-create-product-dialog.js';
import { EditProductDialog } from './-edit-product-dialog.js';
import { useRefreshProductCatalog } from './-product-catalog-query.js';

const productCatalogCopy: MaintenanceCatalogCopy = {
  archiveAction: (name) => `Архивировать ${name}`,
  archivedEmptyDescription: 'Архивированные штучки появятся здесь',
  archivedEmptyTitle: 'Архив пока пуст',
  countLabel: (count) => `Количество штучек: ${count}`,
  createAction: 'Создать штучку',
  createFirstAction: 'Создать первую штучку',
  editAction: (name) => `Переименовать ${name}`,
  editButton: 'Переименовать',
  emptyDescription: 'Добавьте первую штучку, чтобы начать вести каталог',
  emptyTitle: 'Каталог пока пуст',
  loadErrorDescription: 'Проверьте соединение с сервером и попробуйте снова.',
  loadErrorTitle: 'Не удалось загрузить каталог',
  loading: 'Загружаем каталог',
  regionLabel: 'Все штучки',
  restoreAction: (name) => `Восстановить ${name}`,
  tableLabel: 'Штучки',
};

function ProductsPage() {
  const archiveMutation = useMutation(setProductArchived);
  const refreshProductCatalog = useRefreshProductCatalog();
  const page = useMaintenancePage<Product>({
    refresh: refreshProductCatalog,
    async setArchived(product, archived) {
      const response = await archiveMutation.mutateAsync({ archived, id: product.id });
      return response.result.case === 'success'
        ? { case: 'success' }
        : {
            case: 'failure',
            message: response.result.case === 'failure' ? response.result.value : 'Missing result',
          };
    },
  });
  const catalog = useQuery(listProducts, { archived: page.showArchived });

  return (
    <>
      <MaintenanceCatalog
        archivePending={archiveMutation.isPending}
        catalog={{
          entities: catalog.data?.products,
          isError: catalog.isError,
          isPending: catalog.isPending,
          refetch: catalog.refetch,
        }}
        copy={productCatalogCopy}
        emptyIcon={<PackageOpen />}
        onCreate={page.openCreateDialog}
        onEdit={page.openEditDialog}
        onSetArchived={page.changeArchived}
        onShowArchivedChange={page.setShowArchived}
        showArchived={page.showArchived}
      />

      {page.createDialogOpen ? (
        <CreateProductDialog
          onOpenChange={page.setCreateDialogOpen}
          open
          returnFocusTo={page.createDialogTrigger}
        />
      ) : null}
      {page.editedEntity === undefined ? null : (
        <EditProductDialog
          onOpenChange={(open) => {
            if (!open) page.setEditedEntity(undefined);
          }}
          product={page.editedEntity}
          returnFocusTo={page.editDialogTrigger}
        />
      )}
    </>
  );
}

export const Route = createFileRoute('/products')({
  component: ProductsPage,
  staticData: { pageTitle: 'Штучки' },
});
