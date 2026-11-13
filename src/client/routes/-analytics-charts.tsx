import { ChartNoAxesColumn } from 'lucide-react';

import {
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  Grid,
  type BarTooltipRow,
} from './-analytics-bar-chart.js';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/client/components/ui/card.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs.js';
import { formatRussianCurrency, formatRussianDate } from '@/client/lib/localization.js';
import {
  AnalyticsBucketGranularity,
  type AnalyticsOutletFinancials,
  type AnalyticsOutletOption,
  type AnalyticsPeriodBucket,
} from '@/shared/gen/ceramics/v1/analytics_pb.js';

export type AnalyticsChartView = 'outlets' | 'trend';

interface AnalyticsChartsProps {
  readonly bucketGranularity: AnalyticsBucketGranularity;
  readonly onViewChange: (view: AnalyticsChartView) => void;
  readonly outletFinancials: readonly AnalyticsOutletFinancials[];
  readonly outlets: readonly AnalyticsOutletOption[];
  readonly trendBuckets: readonly AnalyticsPeriodBucket[];
  readonly view: AnalyticsChartView;
}

interface ChartSeries {
  readonly color: string;
  readonly id: string;
  readonly key: string;
  readonly name: string;
}

const compactCurrency = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
  notation: 'compact',
});
const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const shortMonth = new Intl.DateTimeFormat('ru-RU', { month: 'short', year: '2-digit' });
const percent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, style: 'percent' });
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const;
const OTHER_COLOR = 'color-mix(in oklab, var(--muted-foreground) 55%, transparent)';

function dateFromCalendar(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatBucketLabel(
  bucket: Pick<AnalyticsPeriodBucket, 'periodEndDate' | 'periodStartDate'>,
  granularity: AnalyticsBucketGranularity,
): string {
  const start = dateFromCalendar(bucket.periodStartDate);
  const end = dateFromCalendar(bucket.periodEndDate);
  if (granularity === AnalyticsBucketGranularity.DAY) return shortDate.format(start);
  if (granularity === AnalyticsBucketGranularity.MONTH) return shortMonth.format(start);
  return `${shortDate.format(start)}–${shortDate.format(end)}`;
}

function formatAxisCurrency(value: number | string): string {
  return `${compactCurrency.format(Number(value) / 100)} ₽`;
}

function rankedFinancials(
  financials: readonly AnalyticsOutletFinancials[],
  outletsById: ReadonlyMap<string, AnalyticsOutletOption>,
): AnalyticsOutletFinancials[] {
  return financials
    .filter(
      (row) =>
        outletsById.has(row.outletId) &&
        (row.earningsKopecks !== 0 || row.outletShareKopecks !== 0),
    )
    .toSorted((left, right) => {
      const salesDifference =
        right.earningsKopecks +
        right.outletShareKopecks -
        (left.earningsKopecks + left.outletShareKopecks);
      return (
        salesDifference ||
        (outletsById.get(left.outletId)?.name ?? '').localeCompare(
          outletsById.get(right.outletId)?.name ?? '',
          'ru-RU',
        )
      );
    });
}

function trendSeries(
  financials: readonly AnalyticsOutletFinancials[],
  outletsById: ReadonlyMap<string, AnalyticsOutletOption>,
): ChartSeries[] {
  const ranked = financials
    .filter(({ earningsKopecks, outletId }) => earningsKopecks !== 0 && outletsById.has(outletId))
    .toSorted((left, right) => right.earningsKopecks - left.earningsKopecks);
  const leading = ranked.slice(0, 5).map((row, index) => ({
    color: CHART_COLORS[index] ?? 'var(--chart-1)',
    id: row.outletId,
    key: `outlet${index}`,
    name: outletsById.get(row.outletId)?.name ?? row.outletId,
  }));
  return ranked.length <= 5
    ? leading
    : [...leading, { color: OTHER_COLOR, id: 'other', key: 'other', name: 'Остальные' }];
}

function trendData(buckets: readonly AnalyticsPeriodBucket[], series: readonly ChartSeries[]) {
  const leadingOutletIds = new Set(series.filter(({ id }) => id !== 'other').map(({ id }) => id));
  return buckets.map((bucket) => {
    const row: { [key: string]: string | number } = {
      period: bucket.periodStartDate,
      periodEndDate: bucket.periodEndDate,
      periodStartDate: bucket.periodStartDate,
    };
    for (const item of series) row[item.key] = 0;
    for (const contribution of bucket.outletEarnings) {
      const item = series.find(({ id }) => id === contribution.outletId);
      if (item !== undefined) {
        row[item.key] = contribution.earningsKopecks;
      } else if (!leadingOutletIds.has(contribution.outletId) && 'other' in row) {
        row['other'] = Number(row['other']) + contribution.earningsKopecks;
      }
    }
    return row;
  });
}

function comparisonData(
  financials: readonly AnalyticsOutletFinancials[],
  outletsById: ReadonlyMap<string, AnalyticsOutletOption>,
) {
  const ranked = rankedFinancials(financials, outletsById);
  const rows = ranked.slice(0, 10).map((row) => ({
    earnings: row.earningsKopecks,
    outlet: outletsById.get(row.outletId)?.name ?? row.outletId,
    outletShare: row.outletShareKopecks,
    salesValue: row.earningsKopecks + row.outletShareKopecks,
  }));
  if (ranked.length > 10) {
    const other = ranked.slice(10).reduce(
      (total, row) => ({
        earnings: total.earnings + row.earningsKopecks,
        outletShare: total.outletShare + row.outletShareKopecks,
      }),
      { earnings: 0, outletShare: 0 },
    );
    rows.push({
      ...other,
      outlet: 'Остальные',
      salesValue: other.earnings + other.outletShare,
    });
  }
  return rows;
}

function trendTooltip(rows: readonly BarTooltipRow[], series: readonly ChartSeries[]): string {
  const source = rows[0]?.source;
  if (source === undefined) return '';
  const period = `${formatRussianDate(String(source['periodStartDate']))}–${formatRussianDate(String(source['periodEndDate']))}`;
  const values = rows
    .filter(({ value }) => value !== 0)
    .map(
      (row) =>
        `${series.find(({ name }) => name === row.series)?.name ?? row.series}: ${formatRussianCurrency(row.value)}`,
    );
  const total = rows.reduce((sum, { value }) => sum + value, 0);
  return `${period}. ${values.join('. ')}. Всего: ${formatRussianCurrency(total)}.`;
}

function outletTooltip(rows: readonly BarTooltipRow[]): string {
  const source = rows[0]?.source;
  if (source === undefined) return '';
  const salesValue = Number(source['salesValue']);
  const outletShare = Number(source['outletShare']);
  return `${source['outlet']}. Заработано: ${formatRussianCurrency(Number(source['earnings']))}. Комиссия: ${formatRussianCurrency(outletShare)} (${percent.format(salesValue === 0 ? 0 : outletShare / salesValue)}).`;
}

function EmptyChart() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2 text-muted-foreground">
      <ChartNoAxesColumn />
      За выбранный период финансовых данных пока нет
    </div>
  );
}

export function AnalyticsCharts({
  bucketGranularity,
  onViewChange,
  outletFinancials,
  outlets,
  trendBuckets,
  view,
}: AnalyticsChartsProps) {
  const outletsById = new Map(outlets.map((outlet) => [outlet.id, outlet]));
  const series = trendSeries(outletFinancials, outletsById);
  const timeline =
    series.length === 0
      ? []
      : trendData(trendBuckets, series).map((row) => ({
          ...row,
          period: formatBucketLabel(
            {
              periodEndDate: String(row['periodEndDate']),
              periodStartDate: String(row['periodStartDate']),
            },
            bucketGranularity,
          ),
        }));
  const outletRows = comparisonData(outletFinancials, outletsById);
  const title = view === 'trend' ? 'Динамика заработка' : 'Заработано и комиссия';
  const description =
    view === 'trend'
      ? 'Вклад магазинов в заработок за выбранный период'
      : 'Абсолютные суммы по магазинам за выбранный период';

  return (
    <Tabs
      onValueChange={(value) => {
        if (value === 'outlets' || value === 'trend') onViewChange(value);
      }}
      value={view}
    >
      <Card aria-label="Графики аналитики" role="region">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <TabsList aria-label="Вид графика">
              <TabsTrigger value="trend">Динамика</TabsTrigger>
              <TabsTrigger value="outlets">По магазинам</TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TabsContent value="trend">
            {series.length === 0 ? (
              <EmptyChart />
            ) : (
              <BarChart
                ariaDescription="Столбцы показывают заработок за каждый интервал и вклад выбранных магазинов."
                ariaLabel="Динамика заработка по магазинам"
                data={timeline}
                stacked
                xDataKey="period"
              >
                <Grid horizontal />
                {series.map((item) => (
                  <Bar dataKey={item.key} fill={item.color} key={item.id} label={item.name} />
                ))}
                <BarXAxis />
                <BarYAxis format={formatAxisCurrency} label="Заработано" />
                <ChartTooltip formatGroup={(rows) => trendTooltip(rows, series)} />
              </BarChart>
            )}
          </TabsContent>
          <TabsContent value="outlets">
            {outletRows.length === 0 ? (
              <EmptyChart />
            ) : (
              <BarChart
                ariaDescription="Для каждого магазина рядом показаны заработок автора и комиссия магазина."
                ariaLabel="Заработано и комиссия по магазинам"
                data={outletRows}
                height={Math.max(320, outletRows.length * 52)}
                orientation="horizontal"
                xDataKey="outlet"
              >
                <Grid vertical />
                <Bar dataKey="earnings" fill="var(--chart-1)" label="Заработано" />
                <Bar dataKey="outletShare" fill="var(--chart-2)" label="Комиссия" />
                <BarXAxis format={formatAxisCurrency} />
                <BarYAxis />
                <ChartTooltip formatGroup={outletTooltip} />
              </BarChart>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
