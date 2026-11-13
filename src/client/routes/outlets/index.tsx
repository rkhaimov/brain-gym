import { useMutation, useQuery } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, LoaderCircle, MailCheck, Pencil, Store } from 'lucide-react';

import {
  MaintenanceCatalog,
  type MaintenanceCatalogCopy,
} from '@/client/components/maintenance/maintenance-catalog.js';
import { useMaintenancePage } from '@/client/components/maintenance/use-maintenance-page.js';
import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Button } from '@/client/components/ui/button.js';
import { formatRussianDateTime } from '@/client/lib/localization.js';
import {
  getReportImportStatus,
  importNewReportFiles,
} from '@/shared/gen/ceramics/v1/report_import-ReportImportService_connectquery.js';
import {
  listOutlets,
  setOutletArchived,
} from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';
import type { Outlet } from '@/shared/gen/ceramics/v1/outlet_pb.js';

import { CreateOutletDialog } from './-create-outlet-dialog.js';
import { EditOutletDialog } from './-edit-outlet-dialog.js';
import { useRefreshOutletCatalog } from './-outlet-catalog-query.js';

const outletCatalogCopy: MaintenanceCatalogCopy = {
  activeFilter: 'Активные',
  archiveAction: (name) => `Архивировать ${name}`,
  archivedEmptyDescription: 'Архивированные магазины появятся здесь',
  archivedEmptyTitle: 'Архив пока пуст',
  archivedFilter: 'Архив',
  countLabel: (count) => `Количество полок: ${count}`,
  createAction: 'Создать магазин',
  createFirstAction: 'Создать первый магазин',
  editAction: (name) => `Изменить ${name}`,
  editButton: 'Изменить',
  emptyDescription: 'Добавьте первый магазин, чтобы начать вести отчёты',
  emptyTitle: 'Полок пока нет',
  loadErrorDescription: 'Проверьте соединение с сервером и попробуйте снова.',
  loadErrorTitle: 'Не удалось загрузить магазины',
  loading: 'Загружаем магазины',
  primaryColumn: 'Название',
  regionLabel: 'Все магазины',
  restoreAction: (name) => `Восстановить ${name}`,
  tableLabel: 'Магазины',
};

function OutletsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const archiveMutation = useMutation(setOutletArchived);
  const importStatus = useQuery(getReportImportStatus, {});
  const importMutation = useMutation(importNewReportFiles, {
    async onSuccess(response) {
      if (response.result.case === 'success') await queryClient.invalidateQueries();
    },
  });
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
  const importResult = importMutation.data?.result;
  const lastSyncedAtMs = importStatus.data?.lastSyncedAtMs;
  const importFailure =
    importMutation.error instanceof Error
      ? `Не удалось загрузить отчёты из почты: ${importMutation.error.message}`
      : importResult?.case === 'failure'
        ? [
            importResult.value.message,
            importResult.value.attachmentName,
            importResult.value.location,
          ]
            .filter(Boolean)
            .join(' · ')
        : undefined;

  return (
    <>
      <div className="px-6 pt-6">
        <section
          aria-labelledby="mail-import-title"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="space-y-1">
            <h2 id="mail-import-title" className="flex items-center gap-2 font-semibold">
              <MailCheck aria-hidden="true" className="text-primary" />
              Отчёты из Яндекс Почты
            </h2>
            <p className="text-sm text-muted-foreground">
              Новые отчёты «Твоя Полка» добавятся вместе с найденными магазинами и позициями.
            </p>
            <p className="text-xs text-muted-foreground">
              {importStatus.isPending
                ? 'Проверяем последнюю синхронизацию…'
                : importStatus.isError
                  ? 'Не удалось получить время последней синхронизации'
                  : lastSyncedAtMs === undefined
                    ? 'Синхронизация ещё не выполнялась'
                    : `Последняя синхронизация: ${formatRussianDateTime(lastSyncedAtMs)}`}
            </p>
          </div>
          <Button
            disabled={importMutation.isPending}
            onClick={() => importMutation.mutate({})}
            type="button"
          >
            {importMutation.isPending ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <MailCheck aria-hidden="true" />
            )}
            {importMutation.isPending ? 'Загружаем отчёты…' : 'Загрузить отчёты из почты'}
          </Button>
          {importFailure === undefined ? null : (
            <Alert className="basis-full" variant="destructive">
              <AlertTitle>Импорт не выполнен</AlertTitle>
              <AlertDescription>{importFailure}</AlertDescription>
            </Alert>
          )}
          {importResult?.case === 'success' ? (
            <Alert className="basis-full border-success/40">
              <AlertTitle>
                {importResult.value.importedFileCount === 0
                  ? 'Новых отчётов нет'
                  : 'Отчёты загружены'}
              </AlertTitle>
              {importResult.value.importedFileCount === 0 ? null : (
                <AlertDescription>
                  Файлов: {importResult.value.importedFileCount}; отчётов:{' '}
                  {importResult.value.createdReportCount}; магазинов:{' '}
                  {importResult.value.createdOutletCount}; позиций:{' '}
                  {importResult.value.createdReportListingCount}.
                </AlertDescription>
              )}
            </Alert>
          ) : null}
        </section>
      </div>
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
        emptyIcon={<Store />}
        editIcon={<Pencil />}
        entityLabel={(outlet) => outlet.name}
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
  staticData: { pageTitle: 'Магазины' },
});
