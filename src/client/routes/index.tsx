import { useQuery } from '@connectrpc/connect-query';
import { createFileRoute, Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Minus, PackageSearch, TriangleAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Badge } from '@/client/components/ui/badge.js';
import { Button } from '@/client/components/ui/button.js';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/client/components/ui/card.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/client/components/ui/tooltip.js';
import { formatRussianCurrency, formatRussianDate } from '@/client/lib/localization.js';
import { Spinner } from '@/client/components/ui/spinner.js';
import { getProductAnalytics } from '@/shared/gen/ceramics/v1/analytics-AnalyticsService_connectquery.js';
import type { AnalyticsMetrics } from '@/shared/gen/ceramics/v1/analytics_pb.js';

import { currentDate, daysBefore, localCalendarDate } from './-analytics-date.js';
import { AnalyticsCharts, type AnalyticsChartView } from './-analytics-charts.js';
import { AnalyticsFilters } from './-analytics-filters.js';
import { ReportSyncPanel } from './-report-sync-panel.js';

function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isCalendarDate);
const searchSchema = z
  .object({
    from: calendarDate.optional().catch(undefined),
    outlets: z.array(z.string()).optional().catch(undefined),
    products: z.array(z.string()).optional().catch(undefined),
    to: calendarDate.optional().catch(undefined),
  })
  .transform((search) => {
    const hasStart = search.from !== undefined;
    const hasEnd = search.to !== undefined;
    if (hasStart !== hasEnd) return { ...search, from: undefined, to: undefined };
    if (search.from !== undefined && search.to !== undefined && search.from > search.to) {
      return { ...search, from: undefined, to: undefined };
    }
    return search;
  });

const russianInteger = new Intl.NumberFormat('ru-RU');

function signedCurrency(value: number): string {
  if (value === 0) return formatRussianCurrency(0);
  return `${value > 0 ? '+' : '−'}${formatRussianCurrency(Math.abs(value))}`;
}

function signedUnits(value: number): string {
  if (value === 0) return '0 шт.';
  return `${value > 0 ? '+' : '−'}${russianInteger.format(Math.abs(value))} шт.`;
}

interface KpiCardProps {
  readonly current: number;
  readonly formatDifference: (value: number) => string;
  readonly formatValue: (value: number) => string;
  readonly label: string;
  readonly previous: number;
  readonly previousPeriod: string;
  readonly selectedPeriod: string;
}

function KpiCard({
  current,
  formatDifference,
  formatValue,
  label,
  previous,
  previousPeriod,
  selectedPeriod,
}: KpiCardProps) {
  const difference = current - previous;
  const TrendIcon = difference < 0 ? TrendingDown : difference > 0 ? TrendingUp : Minus;
  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="col-span-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatValue(current)}
        </CardTitle>
        <CardAction className="row-span-1">
          <Tooltip>
            <Badge asChild variant="outline">
              <TooltipTrigger
                aria-label={`${label}: изменение ${formatDifference(difference)}. Показать сравнение периодов`}
              >
                <TrendIcon /> {formatDifference(difference)}
              </TooltipTrigger>
            </Badge>
            <TooltipContent className="max-w-72">
              {selectedPeriod}: {formatValue(current)}. {previousPeriod}: {formatValue(previous)}.
            </TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function DashboardPage() {
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate({ from: '/' });
  const [today] = useState(currentDate);
  const periodEndDate = search.to ?? localCalendarDate(today);
  const periodStartDate = search.from ?? localCalendarDate(daysBefore(today, 29));
  const analytics = useQuery(getProductAnalytics, {
    outletIds: search.outlets ?? [],
    periodEndDate,
    periodStartDate,
    productIds: search.products ?? [],
  });
  const data = analytics.data;
  const [chartView, setChartView] = useState<AnalyticsChartView>('trend');
  const [sort, setSort] = useState<{
    readonly descending: boolean;
    readonly metric: keyof Pick<
      AnalyticsMetrics,
      'currentStockBalance' | 'earningsKopecks' | 'outletShareKopecks' | 'unitsSold'
    >;
  }>({ descending: true, metric: 'unitsSold' });
  const totals = data?.totals;
  const previous = data?.previousPeriodTotals;
  const selectedPeriod = `${formatRussianDate(periodStartDate)}–${formatRussianDate(periodEndDate)}`;
  const previousPeriod =
    data === undefined
      ? 'Предыдущий период'
      : `${formatRussianDate(data.previousPeriodStartDate)}–${formatRussianDate(data.previousPeriodEndDate)}`;
  const rows = (data?.rows ?? []).toSorted((left, right) => {
    const leftValue = left.metrics?.[sort.metric] ?? 0;
    const rightValue = right.metrics?.[sort.metric] ?? 0;
    const difference = sort.descending ? rightValue - leftValue : leftValue - rightValue;
    return (
      difference || (left.product?.name ?? '').localeCompare(right.product?.name ?? '', 'ru-RU')
    );
  });

  function selectSort(
    metric: keyof Pick<
      AnalyticsMetrics,
      'currentStockBalance' | 'earningsKopecks' | 'outletShareKopecks' | 'unitsSold'
    >,
    descending = true,
  ): void {
    setSort((current) =>
      current.metric === metric
        ? { descending: !current.descending, metric }
        : { descending, metric },
    );
  }

  return (
    <TooltipProvider>
      <section aria-label="Обзор" className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <ReportSyncPanel />
          </div>

          {analytics.isPending ? (
            <div className="flex min-h-64 items-center justify-center gap-2 px-4 text-muted-foreground lg:px-6">
              <Spinner /> Загружаем аналитику…
            </div>
          ) : analytics.isError ? (
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>Не удалось загрузить аналитику</AlertTitle>
                <AlertDescription>
                  <Button onClick={() => analytics.refetch()} size="sm" variant="outline">
                    Повторить
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : data === undefined ? null : (
            <>
              <AnalyticsFilters
                onChange={(filters) =>
                  navigate({
                    replace: true,
                    search: (priorSearch) => ({
                      ...priorSearch,
                      ...(filters.periodStartDate === undefined
                        ? {}
                        : { from: filters.periodStartDate }),
                      ...(filters.periodEndDate === undefined ? {} : { to: filters.periodEndDate }),
                      ...(filters.outletIds === undefined
                        ? {}
                        : { outlets: [...filters.outletIds] }),
                      ...(filters.productIds === undefined
                        ? {}
                        : { products: [...filters.productIds] }),
                    }),
                  })
                }
                outletIds={search.outlets ?? []}
                outlets={data.outlets}
                periodEndDate={periodEndDate}
                periodStartDate={periodStartDate}
                productIds={search.products ?? []}
                products={data.products}
              />

              {data.unmappedListingCount === 0 ? null : (
                <div className="px-4 lg:px-6">
                  <Alert className="border-warning/50 bg-warning/10 text-foreground">
                    <TriangleAlert aria-hidden="true" className="text-warning" />
                    <AlertTitle>
                      {data.unmappedListingCount} несопоставленные позиции не включены в аналитику
                    </AlertTitle>
                    <AlertDescription>
                      <p>Сопоставьте их со штучками, чтобы показатели стали полными.</p>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          search={{
                            filter: 'unmapped',
                            returnTo: location.href,
                            tab: 'report-listings',
                          }}
                          to="/products"
                        >
                          Сопоставить позиции
                        </Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <KpiCard
                  current={totals?.earningsKopecks ?? 0}
                  formatDifference={signedCurrency}
                  formatValue={formatRussianCurrency}
                  label="Заработано"
                  previous={previous?.earningsKopecks ?? 0}
                  previousPeriod={previousPeriod}
                  selectedPeriod={selectedPeriod}
                />
                <KpiCard
                  current={totals?.outletShareKopecks ?? 0}
                  formatDifference={signedCurrency}
                  formatValue={formatRussianCurrency}
                  label="Комиссия"
                  previous={previous?.outletShareKopecks ?? 0}
                  previousPeriod={previousPeriod}
                  selectedPeriod={selectedPeriod}
                />
                <KpiCard
                  current={totals?.unitsSold ?? 0}
                  formatDifference={signedUnits}
                  formatValue={(value) => `${russianInteger.format(value)} шт.`}
                  label="Продано"
                  previous={previous?.unitsSold ?? 0}
                  previousPeriod={previousPeriod}
                  selectedPeriod={selectedPeriod}
                />
                <KpiCard
                  current={totals?.currentStockBalance ?? 0}
                  formatDifference={signedUnits}
                  formatValue={(value) => `${russianInteger.format(value)} шт.`}
                  label="Остаток"
                  previous={previous?.currentStockBalance ?? 0}
                  previousPeriod={previousPeriod}
                  selectedPeriod={selectedPeriod}
                />
              </div>

              <div className="px-4 lg:px-6">
                <AnalyticsCharts
                  bucketGranularity={data.bucketGranularity}
                  onViewChange={setChartView}
                  outletFinancials={data.outletFinancials}
                  outlets={data.outlets}
                  trendBuckets={data.trendBuckets}
                  view={chartView}
                />
              </div>

              <div className="px-4 lg:px-6">
                <div
                  className="mb-4 flex items-center gap-2"
                  role="group"
                  aria-label="Рейтинг штучек"
                >
                  <Button
                    onClick={() => setSort({ descending: true, metric: 'unitsSold' })}
                    size="sm"
                    variant={sort.metric === 'unitsSold' && sort.descending ? 'default' : 'outline'}
                  >
                    Лучшие продажи
                  </Button>
                  <Button
                    onClick={() => setSort({ descending: true, metric: 'earningsKopecks' })}
                    size="sm"
                    variant={
                      sort.metric === 'earningsKopecks' && sort.descending ? 'default' : 'outline'
                    }
                  >
                    Больше заработано
                  </Button>
                  <Button
                    onClick={() => setSort({ descending: false, metric: 'currentStockBalance' })}
                    size="sm"
                    variant={
                      sort.metric === 'currentStockBalance' && !sort.descending
                        ? 'default'
                        : 'outline'
                    }
                  >
                    Мало остатка
                  </Button>
                </div>
                <section
                  aria-label="Сравнение штучек"
                  className="overflow-hidden rounded-lg border"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Штучка</TableHead>
                        <SortableHead
                          label="Заработано"
                          onClick={() => selectSort('earningsKopecks')}
                          sortLabel="Сортировать по заработку"
                        />
                        <SortableHead
                          label="Комиссия"
                          onClick={() => selectSort('outletShareKopecks')}
                          sortLabel="Сортировать по комиссии"
                        />
                        <SortableHead
                          label="Остаток"
                          onClick={() => selectSort('currentStockBalance')}
                          sortLabel="Сортировать по остатку"
                        />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell className="h-40 text-center" colSpan={4}>
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <PackageSearch /> За выбранный период данных пока нет
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => (
                          <TableRow key={row.product?.id}>
                            <TableCell className="font-medium">{row.product?.name}</TableCell>
                            <MetricCells metrics={row.metrics} />
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </section>
              </div>
            </>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}

function SortableHead({
  label,
  onClick,
  sortLabel,
}: Readonly<{ label: string; onClick: () => void; sortLabel: string }>) {
  return (
    <TableHead className="text-right">
      <Button aria-label={sortLabel} onClick={onClick} size="sm" variant="ghost">
        {label}
      </Button>
    </TableHead>
  );
}

function MetricCells({ metrics }: Readonly<{ metrics: AnalyticsMetrics | undefined }>) {
  return (
    <>
      <TableCell className="text-right">
        {formatRussianCurrency(metrics?.earningsKopecks)}
      </TableCell>
      <TableCell className="text-right">
        {formatRussianCurrency(metrics?.outletShareKopecks)}
      </TableCell>
      <TableCell className="text-right">
        {russianInteger.format(metrics?.currentStockBalance ?? 0)} шт.
      </TableCell>
    </>
  );
}

export const Route = createFileRoute('/')({
  component: DashboardPage,
  staticData: { pageTitle: 'Обзор' },
  validateSearch: searchSchema,
});
