import { useMutation, useQuery } from '@connectrpc/connect-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Eye, FileText, Store } from 'lucide-react';
import { useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Badge } from '@/client/components/ui/badge.js';
import { Button } from '@/client/components/ui/button.js';
import {
  MaintenanceCatalog,
  type MaintenanceCatalogCopy,
} from '@/client/components/maintenance/maintenance-catalog.js';
import { Spinner } from '@/client/components/ui/spinner.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import { listOutlets } from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';
import { listOutletListings } from '@/shared/gen/ceramics/v1/outlet_listing-OutletListingService_connectquery.js';
import {
  listSalesReports,
  setSalesReportArchived,
} from '@/shared/gen/ceramics/v1/sales_report-SalesReportService_connectquery.js';
import type { SalesReportSummary } from '@/shared/gen/ceramics/v1/sales_report_pb.js';

import { SalesReportDialog } from './-sales-report-dialog.js';

const reportCatalogCopy: MaintenanceCatalogCopy = {
  activeFilter: 'Действующие',
  archiveAction: (period) => `Архивировать отчёт ${period}`,
  archivedEmptyDescription: 'Архивированные отчёты появятся здесь',
  archivedEmptyTitle: 'Архив отчётов пока пуст',
  archivedFilter: 'В архиве',
  countLabel: (count) => `Количество отчётов: ${count}`,
  createAction: 'Создать отчёт',
  createFirstAction: 'Создать первый отчёт',
  editAction: (period) => `Открыть отчёт ${period}`,
  editButton: 'Открыть',
  emptyDescription: 'Создайте первый отчёт для этой полки',
  emptyTitle: 'Отчётов пока нет',
  loadErrorDescription: 'Проверьте соединение с сервером и попробуйте снова.',
  loadErrorTitle: 'Не удалось загрузить отчёты',
  loading: 'Загружаем отчёты',
  primaryColumn: 'Отчётный период',
  regionLabel: 'Отчёты полки',
  restoreAction: (period) => `Восстановить отчёт ${period}`,
  tableLabel: 'История отчётов',
};

function formatRubles(kopecks: number): string {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'RUB',
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(kopecks / 100);
}

function OutletDetailsPage() {
  const { outletId } = Route.useParams();
  const outlets = useQuery(listOutlets, { archived: false });
  const listings = useQuery(listOutletListings, { outletId });
  const [showArchivedReports, setShowArchivedReports] = useState(false);
  const reports = useQuery(listSalesReports, { archived: showArchivedReports, outletId });
  const archiveReport = useMutation(setSalesReportArchived);
  const createReportTrigger = useRef<HTMLButtonElement | null>(null);
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const reportDialogTrigger = useRef<HTMLButtonElement | null>(null);
  const [selectedReport, setSelectedReport] = useState<SalesReportSummary>();
  const outlet = outlets.data?.outlets.find((candidate) => candidate.id === outletId);
  const reportEntries = reports.data?.reports;

  async function changeReportArchived(reportId: string, archived: boolean): Promise<void> {
    const response = await archiveReport.mutateAsync({ archived, id: reportId });
    if (response.result.case !== 'success') {
      throw new Error(
        response.result.case === 'failure' ? response.result.value.message : 'Missing result',
      );
    }
    await Promise.all([listings.refetch(), reports.refetch()]);
  }

  if (outlets.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
        <Spinner /> Загружаем полку…
      </div>
    );
  }
  if (outlets.isError) {
    return (
      <Alert className="m-6" variant="destructive">
        <AlertTitle>Не удалось загрузить полку</AlertTitle>
        <AlertDescription>Проверьте соединение с сервером и попробуйте снова.</AlertDescription>
      </Alert>
    );
  }
  if (outlet === undefined) {
    return (
      <Alert className="m-6" variant="destructive">
        <AlertTitle>Полка не найдена</AlertTitle>
        <AlertDescription>Вернитесь к списку полок.</AlertDescription>
      </Alert>
    );
  }

  return (
    <section aria-label="Карточка полки" className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-4">
        <Button asChild size="icon" variant="outline">
          <Link aria-label="Назад к полкам" to="/outlets">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{outlet.name}</h2>
            <Badge variant="secondary">{outlet.code ?? 'Без кода'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Позиции и отчёты полки</p>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList aria-label="Разделы полки">
          <TabsTrigger value="listings">Позиции</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <section aria-label="Позиции полки" className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Последняя цена</TableHead>
                  <TableHead>Продано в последнем отчёте</TableHead>
                  <TableHead>Текущий остаток</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.isPending ? (
                  <TableRow>
                    <TableCell className="h-24 text-center" colSpan={4}>
                      <Spinner />
                    </TableCell>
                  </TableRow>
                ) : listings.isError ? (
                  <TableRow>
                    <TableCell className="h-24 text-center text-destructive" colSpan={4}>
                      Не удалось загрузить позиции
                    </TableCell>
                  </TableRow>
                ) : listings.data?.listings.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-40 text-center" colSpan={4}>
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Store />
                        Позиции появятся после первого отчёта
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.data?.listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.name}</TableCell>
                      <TableCell>{formatRubles(listing.lastOutletPriceKopecks)}</TableCell>
                      <TableCell>{listing.latestUnitsSold}</TableCell>
                      <TableCell>{listing.currentStockBalance}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        </TabsContent>

        <TabsContent value="reports">
          <MaintenanceCatalog
            archivePending={archiveReport.isPending}
            catalog={{
              entities: reportEntries,
              isError: reports.isError,
              isPending: reports.isPending,
              refetch: reports.refetch,
            }}
            copy={reportCatalogCopy}
            detailColumn={{
              header: 'Позиций',
              render: (report) => report.listingCount,
            }}
            emptyIcon={<FileText />}
            editIcon={<Eye />}
            entityLabel={(report) => `${report.periodStartDate} — ${report.periodEndDate}`}
            onCreate={(event) => {
              createReportTrigger.current = event.currentTarget;
              setCreateReportOpen(true);
            }}
            onEdit={(event, report) => {
              reportDialogTrigger.current = event.currentTarget;
              setSelectedReport(report);
            }}
            onSetArchived={(report, archived) => {
              void changeReportArchived(report.id, archived);
            }}
            onShowArchivedChange={setShowArchivedReports}
            showArchived={showArchivedReports}
          />
        </TabsContent>
      </Tabs>

      {createReportOpen ? (
        <SalesReportDialog
          onOpenChange={setCreateReportOpen}
          onSaved={async () => {
            await Promise.all([listings.refetch(), reports.refetch()]);
          }}
          open
          outlet={outlet}
          returnFocusTo={createReportTrigger}
        />
      ) : null}
      {selectedReport === undefined ? null : (
        <SalesReportDialog
          archivePending={archiveReport.isPending}
          onOpenChange={(open) => {
            if (!open) setSelectedReport(undefined);
          }}
          onRestore={
            selectedReport.archived
              ? () => changeReportArchived(selectedReport.id, false)
              : undefined
          }
          onSaved={async () => {
            await Promise.all([listings.refetch(), reports.refetch()]);
          }}
          open
          outlet={outlet}
          report={selectedReport}
          returnFocusTo={reportDialogTrigger}
        />
      )}
    </section>
  );
}

export const Route = createFileRoute('/outlets/$outletId')({
  component: OutletDetailsPage,
  staticData: { pageTitle: 'Полка' },
});
