import { useQuery } from '@connectrpc/connect-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, FilePlus2, Store } from 'lucide-react';
import { useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Badge } from '@/client/components/ui/badge.js';
import { Button } from '@/client/components/ui/button.js';
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
import { listSalesReports } from '@/shared/gen/ceramics/v1/sales_report-SalesReportService_connectquery.js';

import { ManualSalesReportDialog } from './-manual-sales-report-dialog.js';

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
  const reports = useQuery(listSalesReports, { archived: false, outletId });
  const createReportTrigger = useRef<HTMLButtonElement | null>(null);
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const outlet = outlets.data?.outlets.find((candidate) => candidate.id === outletId);

  if (outlets.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
        <Spinner /> Загружаем торговую точку…
      </div>
    );
  }
  if (outlets.isError) {
    return (
      <Alert className="m-6" variant="destructive">
        <AlertTitle>Не удалось загрузить торговую точку</AlertTitle>
        <AlertDescription>Проверьте соединение с сервером и попробуйте снова.</AlertDescription>
      </Alert>
    );
  }
  if (outlet === undefined) {
    return (
      <Alert className="m-6" variant="destructive">
        <AlertTitle>Торговая точка не найдена</AlertTitle>
        <AlertDescription>Вернитесь к списку торговых точек.</AlertDescription>
      </Alert>
    );
  }

  return (
    <section aria-label="Карточка торговой точки" className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-4">
        <Button asChild size="icon" variant="outline">
          <Link aria-label="Назад к торговым точкам" to="/outlets">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{outlet.name}</h2>
            <Badge variant="secondary">{outlet.code ?? 'Без кода'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Позиции и отчёты торговой точки</p>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList aria-label="Разделы торговой точки">
          <TabsTrigger value="listings">Позиции</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <section
            aria-label="Позиции торговой точки"
            className="overflow-hidden rounded-lg border"
          >
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
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button
                onClick={(event) => {
                  createReportTrigger.current = event.currentTarget;
                  setCreateReportOpen(true);
                }}
              >
                <FilePlus2 /> Создать отчёт
              </Button>
            </div>
            <section
              aria-label="Отчёты торговой точки"
              className="overflow-hidden rounded-lg border"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Период</TableHead>
                    <TableHead>Позиций</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.isPending ? (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={2}>
                        <Spinner />
                      </TableCell>
                    </TableRow>
                  ) : reports.isError ? (
                    <TableRow>
                      <TableCell className="h-24 text-center text-destructive" colSpan={2}>
                        Не удалось загрузить отчёты
                      </TableCell>
                    </TableRow>
                  ) : reports.data?.reports.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-40 text-center text-muted-foreground" colSpan={2}>
                        Отчётов пока нет
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.data?.reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {report.periodStartDate} — {report.periodEndDate}
                        </TableCell>
                        <TableCell>{report.listingCount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {createReportOpen ? (
        <ManualSalesReportDialog
          onOpenChange={setCreateReportOpen}
          onSaved={async () => {
            await Promise.all([listings.refetch(), reports.refetch()]);
          }}
          open
          outlet={outlet}
          returnFocusTo={createReportTrigger}
        />
      ) : null}
    </section>
  );
}

export const Route = createFileRoute('/outlets/$outletId')({
  component: OutletDetailsPage,
  staticData: { pageTitle: 'Торговая точка' },
});
