import { useMutation, useQuery } from '@connectrpc/connect-query';
import { createFileRoute } from '@tanstack/react-router';
import { PackageOpen, Pencil } from 'lucide-react';
import { z } from 'zod';

import {
  MaintenanceCatalog,
  type MaintenanceCatalogCopy,
} from '@/client/components/maintenance/maintenance-catalog.js';
import { useMaintenancePage } from '@/client/components/maintenance/use-maintenance-page.js';
import { useRefreshProductCatalog } from '@/client/components/products/product-catalog-query.js';
import { Badge } from '@/client/components/ui/badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs.js';
import {
  listProducts,
  setProductArchived,
} from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';
import { listReportListings } from '@/shared/gen/ceramics/v1/report_listing-ReportListingService_connectquery.js';
import { ReportListingFilter } from '@/shared/gen/ceramics/v1/report_listing_pb.js';

import { CreateProductDialog } from './-create-product-dialog.js';
import { EditProductDialog } from './-edit-product-dialog.js';
import { type MappingFilter, ReportListingsTab } from './-report-listings-tab.js';

const productCatalogCopy: MaintenanceCatalogCopy = {
  activeFilter: 'Активные',
  archiveAction: (name) => `Архивировать ${name}`,
  archivedEmptyDescription: 'Архивированные штучки появятся здесь',
  archivedEmptyTitle: 'Архив пока пуст',
  archivedFilter: 'Архив',
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
  primaryColumn: 'Название',
  regionLabel: 'Все штучки',
  restoreAction: (name) => `Восстановить ${name}`,
  tableLabel: 'Штучки',
};

const searchSchema = z.object({
  filter: z.enum(['all', 'unmapped', 'mapped']).optional().catch(undefined),
  tab: z.enum(['catalog', 'report-listings']).optional().catch(undefined),
});

const filterToProto: Readonly<{
  all: ReportListingFilter;
  mapped: ReportListingFilter;
  unmapped: ReportListingFilter;
}> = {
  all: ReportListingFilter.ALL,
  mapped: ReportListingFilter.MAPPED,
  unmapped: ReportListingFilter.UNMAPPED,
};

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = search.tab ?? 'catalog';
  const mappingFilter = search.filter ?? 'unmapped';
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
  const reportListings = useQuery(listReportListings, { filter: filterToProto[mappingFilter] });

  function changeTab(value: string): void {
    void navigate({
      search:
        value === 'report-listings'
          ? { filter: search.filter ?? 'unmapped', tab: 'report-listings' }
          : { tab: 'catalog' },
    });
  }

  function changeFilter(filter: MappingFilter): void {
    void navigate({ search: { filter, tab: 'report-listings' } });
  }

  return (
    <>
      <section aria-label="Штучки" className="flex flex-col">
        <Tabs onValueChange={changeTab} value={activeTab}>
          <TabsList aria-label="Разделы штучек" className="mt-6 ml-6">
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="report-listings">
              Позиции отчётов
              {reportListings.data === undefined ? null : (
                <Badge className="ml-1" variant="secondary">
                  {reportListings.data.unmappedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
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
              editIcon={<Pencil />}
              entityLabel={(product) => product.name}
              onCreate={page.openCreateDialog}
              onEdit={page.openEditDialog}
              onSetArchived={page.changeArchived}
              onShowArchivedChange={page.setShowArchived}
              showArchived={page.showArchived}
            />
          </TabsContent>

          <TabsContent className="px-6 pb-6" value="report-listings">
            <ReportListingsTab
              data={reportListings.data}
              filter={mappingFilter}
              isError={reportListings.isError}
              isPending={reportListings.isPending}
              onFilterChange={changeFilter}
              refresh={reportListings.refetch}
            />
          </TabsContent>
        </Tabs>
      </section>

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
  validateSearch: searchSchema,
});
