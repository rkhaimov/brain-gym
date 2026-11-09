import { useMutation, useQuery } from '@connectrpc/connect-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Store } from 'lucide-react';

import {
  MaintenanceCatalog,
  type MaintenanceCatalogCopy,
} from '@/client/components/maintenance/maintenance-catalog.js';
import { useMaintenancePage } from '@/client/components/maintenance/use-maintenance-page.js';
import {
  listOutlets,
  setOutletArchived,
} from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';
import type { Outlet } from '@/shared/gen/ceramics/v1/outlet_pb.js';

import { CreateOutletDialog } from './-create-outlet-dialog.js';
import { EditOutletDialog } from './-edit-outlet-dialog.js';
import { useRefreshOutletCatalog } from './-outlet-catalog-query.js';

const outletCatalogCopy: MaintenanceCatalogCopy = {
  archiveAction: (name) => `Архивировать ${name}`,
  archivedEmptyDescription: 'Архивированные торговые точки появятся здесь',
  archivedEmptyTitle: 'Архив пока пуст',
  countLabel: (count) => `Количество торговых точек: ${count}`,
  createAction: 'Создать торговую точку',
  createFirstAction: 'Создать первую торговую точку',
  editAction: (name) => `Изменить ${name}`,
  editButton: 'Изменить',
  emptyDescription: 'Добавьте первую торговую точку, чтобы начать вести отчёты',
  emptyTitle: 'Торговых точек пока нет',
  loadErrorDescription: 'Проверьте соединение с сервером и попробуйте снова.',
  loadErrorTitle: 'Не удалось загрузить торговые точки',
  loading: 'Загружаем торговые точки',
  regionLabel: 'Все торговые точки',
  restoreAction: (name) => `Восстановить ${name}`,
  tableLabel: 'Торговые точки',
};

function OutletsPage() {
  const navigate = useNavigate();
  const archiveMutation = useMutation(setOutletArchived);
  const refreshOutletCatalog = useRefreshOutletCatalog();
  const page = useMaintenancePage<Outlet>({
    refresh: refreshOutletCatalog,
    async setArchived(outlet, archived) {
      const response = await archiveMutation.mutateAsync({ archived, id: outlet.id });
      return response.result.case === 'success'
        ? { case: 'success' }
        : {
            case: 'failure',
            message:
              response.result.case === 'failure' ? response.result.value.message : 'Missing result',
          };
    },
  });
  const catalog = useQuery(listOutlets, { archived: page.showArchived });

  return (
    <>
      <MaintenanceCatalog
        activeEntityAction={{
          icon: <ArrowRight />,
          label: (outlet) => `Открыть ${outlet.name}`,
          onAction: (_event, outlet) =>
            navigate({ params: { outletId: outlet.id }, to: '/outlets/$outletId' }),
          text: 'Открыть',
        }}
        archivePending={archiveMutation.isPending}
        catalog={{
          entities: catalog.data?.outlets,
          isError: catalog.isError,
          isPending: catalog.isPending,
          refetch: catalog.refetch,
        }}
        copy={outletCatalogCopy}
        detailColumn={{
          header: 'Код точки',
          render: (outlet) =>
            outlet.code === undefined ? (
              <span className="text-muted-foreground">Без кода</span>
            ) : (
              outlet.code
            ),
        }}
        emptyIcon={<Store />}
        onCreate={page.openCreateDialog}
        onEdit={page.openEditDialog}
        onSetArchived={page.changeArchived}
        onShowArchivedChange={page.setShowArchived}
        showArchived={page.showArchived}
      />

      {page.createDialogOpen ? (
        <CreateOutletDialog
          onOpenChange={page.setCreateDialogOpen}
          open
          returnFocusTo={page.createDialogTrigger}
        />
      ) : null}
      {page.editedEntity === undefined ? null : (
        <EditOutletDialog
          onOpenChange={(open) => {
            if (!open) page.setEditedEntity(undefined);
          }}
          outlet={page.editedEntity}
          returnFocusTo={page.editDialogTrigger}
        />
      )}
    </>
  );
}

export const Route = createFileRoute('/outlets/')({
  component: OutletsPage,
  staticData: { pageTitle: 'Торговые точки' },
});
