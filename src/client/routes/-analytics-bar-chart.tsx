import { barX, barY, colorLegend, defineChart, group, stack } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal';
import { tooltip } from '@tanstack/charts/tooltip';
import { cn } from 'cn';
import * as React from 'react';

interface ChartSourceRow {
  readonly [key: string]: string | number;
}

export interface BarTooltipRow {
  readonly category: string;
  readonly series: string;
  readonly source: ChartSourceRow;
  readonly value: number;
}

interface BarProps {
  readonly dataKey: string;
  readonly fill?: string;
  readonly label: string;
}

interface GridProps {
  readonly horizontal?: boolean;
  readonly vertical?: boolean;
}

interface AxisProps {
  readonly format?: (value: number | string) => string;
  readonly label?: string;
}

interface ChartTooltipProps {
  readonly formatGroup?: (rows: readonly BarTooltipRow[]) => string;
}

interface BarChartProps {
  readonly ariaDescription?: string;
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly data: readonly ChartSourceRow[];
  readonly height?: number;
  readonly orientation?: 'horizontal' | 'vertical';
  readonly stacked?: boolean;
  readonly xDataKey: string;
}

function Bar(_props: BarProps) {
  return null;
}

function Grid(_props: GridProps) {
  return null;
}

function BarXAxis(_props: AxisProps) {
  return null;
}

function BarYAxis(_props: AxisProps) {
  return null;
}

function ChartTooltip(_props: ChartTooltipProps) {
  return null;
}

function isElementOfType<P>(
  candidate: React.ReactNode,
  type: React.JSXElementConstructor<P>,
): candidate is React.ReactElement<P> {
  return React.isValidElement<P>(candidate) && candidate.type === type;
}

function propsFor<P>(
  children: React.ReactNode,
  type: React.JSXElementConstructor<P>,
): P | undefined {
  const child = React.Children.toArray(children).find(
    (candidate): candidate is React.ReactElement<P> => isElementOfType(candidate, type),
  );
  return child?.props;
}

function axisOptions(axis: AxisProps | undefined) {
  return {
    ...(axis?.label === undefined ? {} : { label: axis.label }),
    ...(axis?.format === undefined ? {} : { ticks: { format: axis.format } }),
  };
}

function BarChart({
  ariaDescription,
  ariaLabel,
  children,
  className,
  data,
  height = 320,
  orientation = 'vertical',
  stacked = false,
  xDataKey,
}: BarChartProps) {
  const bars = React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<BarProps>(child) && child.type === Bar ? [child.props] : [],
  );
  const grid = propsFor(children, Grid);
  const xAxis = propsFor(children, BarXAxis);
  const yAxis = propsFor(children, BarYAxis);
  const chartTooltip = propsFor(children, ChartTooltip);
  const definitions = React.useMemo(() => {
    const rows: BarTooltipRow[] = data.flatMap((source) => {
      const category = String(source[xDataKey] ?? '');
      return bars.map((bar) => ({
        category,
        series: bar.label,
        source,
        value: Number(source[bar.dataKey] ?? 0),
      }));
    });
    const series = bars.map(({ label }) => label);
    const fills = bars.map(({ fill }, index) => fill ?? `var(--chart-${index + 1})`);
    const categoricalScale = () => scaleBand().padding(0.18);
    const colors = () => scaleOrdinal().domain(series).range(fills);
    const formatTooltip = chartTooltip?.formatGroup;
    const tooltipOptions = {
      use: tooltip,
      ...(formatTooltip === undefined
        ? {}
        : {
            formatGroup(points: readonly { readonly datum: BarTooltipRow }[]) {
              return formatTooltip(points.map(({ datum }) => datum));
            },
          }),
    };
    const quantitativeGrid = grid?.horizontal === true || grid?.vertical === true;
    return {
      horizontal: defineChart({
        color: {
          legend: colorLegend({ placement: 'top' }),
          scale: colors,
        },
        focus: 'group-y',
        keyboard: true,
        marks: [
          barX(rows, {
            color: 'series',
            layout: stacked ? stack({ order: series }) : group({ padding: 0.15 }),
            radius: { end: 4 },
            x: 'value',
            y: 'category',
            z: 'series',
          }),
        ],
        maxFocusDistance: Number.POSITIVE_INFINITY,
        scales: {
          x: {
            axis: axisOptions(xAxis),
            grid: quantitativeGrid,
            scale: scaleLinear,
          },
          y: {
            axis: axisOptions(yAxis),
            scale: categoricalScale,
          },
        },
        svgAnimation: true,
        tooltip: tooltipOptions,
      }),
      vertical: defineChart({
        color: {
          legend: colorLegend({ placement: 'top' }),
          scale: colors,
        },
        focus: 'group-x',
        keyboard: true,
        marks: [
          barY(rows, {
            color: 'series',
            layout: stacked ? stack({ order: series }) : group({ padding: 0.15 }),
            radius: { end: 4 },
            x: 'category',
            y: 'value',
            z: 'series',
          }),
        ],
        maxFocusDistance: Number.POSITIVE_INFINITY,
        scales: {
          x: {
            axis: axisOptions(xAxis),
            scale: categoricalScale,
          },
          y: {
            axis: axisOptions(yAxis),
            grid: quantitativeGrid,
            scale: scaleLinear,
          },
        },
        svgAnimation: true,
        tooltip: tooltipOptions,
      }),
    };
  }, [bars, chartTooltip?.formatGroup, data, grid, stacked, xAxis, xDataKey, yAxis]);

  const chartProps = {
    ...(ariaDescription === undefined ? {} : { ariaDescription }),
    ariaLabel,
    className: cn('w-full text-xs', className),
    height,
    initialWidth: 800,
  };
  if (orientation === 'horizontal') {
    return <Chart {...chartProps} definition={definitions.horizontal} />;
  }
  return <Chart {...chartProps} definition={definitions.vertical} />;
}

export { Bar, BarChart, BarXAxis, BarYAxis, ChartTooltip, Grid };
