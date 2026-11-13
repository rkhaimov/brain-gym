import { CalendarDays, X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';

import { Button } from '@/client/components/ui/button.js';
import { Calendar } from '@/client/components/ui/calendar.js';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/client/components/ui/combobox.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/client/components/ui/popover.js';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/client/components/ui/tooltip.js';
import { formatRussianDate } from '@/client/lib/localization.js';
import type {
  AnalyticsOutletOption,
  AnalyticsProductOption,
} from '@/shared/gen/ceramics/v1/analytics_pb.js';

import { currentDate, daysBefore, localCalendarDate, parseLocalDate } from './-analytics-date.js';

interface AnalyticsFiltersProps {
  readonly allTime: boolean;
  readonly outletIds: readonly string[];
  readonly outlets: readonly AnalyticsOutletOption[];
  readonly periodEndDate: string;
  readonly periodStartDate: string;
  readonly productIds: readonly string[];
  readonly products: readonly AnalyticsProductOption[];
  readonly onChange: (filters: {
    readonly outletIds?: readonly string[];
    readonly period?:
      | { readonly kind: 'all' }
      | {
          readonly endDate: string;
          readonly kind: 'range';
          readonly startDate: string;
        };
    readonly productIds?: readonly string[];
  }) => void;
}

interface MultipleFilterProps {
  readonly clearLabel: string;
  readonly label: string;
  readonly onChange: (ids: readonly string[]) => void;
  readonly options: readonly Readonly<{ id: string; name: string }>[];
  readonly selectedIds: readonly string[];
}

function MultipleFilter({
  clearLabel,
  label,
  onChange,
  options,
  selectedIds,
}: MultipleFilterProps) {
  const anchor = useComboboxAnchor();
  const names = new Map(options.map((option) => [option.id, option.name]));
  return (
    <div className="min-w-72 space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      <Combobox
        isItemEqualToValue={(item, value) => item === value}
        itemToStringLabel={(id) => names.get(id) ?? id}
        itemToStringValue={(id) => names.get(id) ?? id}
        items={options.map(({ id }) => id)}
        multiple
        onValueChange={(value) => onChange(value)}
        value={[...selectedIds]}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {selectedIds.map((id) => (
              <ComboboxChip key={id}>{names.get(id) ?? id}</ComboboxChip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput
            aria-label={label}
            placeholder={
              selectedIds.length === 0 ? `Все ${label.toLocaleLowerCase('ru-RU')}` : 'Добавить…'
            }
          />
          {selectedIds.length === 0 ? null : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={clearLabel}
                  className="size-6 shrink-0"
                  onClick={() => onChange([])}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{clearLabel}</TooltipContent>
            </Tooltip>
          )}
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
          <ComboboxList>
            {(id: string) => (
              <ComboboxItem key={id} value={id}>
                {names.get(id) ?? id}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function AnalyticsFilters({
  allTime,
  outletIds,
  outlets,
  periodEndDate,
  periodStartDate,
  productIds,
  products,
  onChange,
}: AnalyticsFiltersProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>();

  function chooseRollingPeriod(days: number): void {
    const today = currentDate();
    onChange({
      period: {
        endDate: localCalendarDate(today),
        kind: 'range',
        startDate: localCalendarDate(daysBefore(today, days - 1)),
      },
    });
    setPeriodOpen(false);
  }

  function clearPeriod(): void {
    setDraftRange(undefined);
    setPeriodOpen(false);
    onChange({ period: { kind: 'all' } });
  }

  return (
    <section
      aria-label="Фильтры аналитики"
      className="flex flex-wrap items-start gap-4 px-4 lg:px-6"
    >
      <div className="min-w-72 space-y-1.5">
        <span className="block text-sm font-medium">Период</span>
        <Popover
          onOpenChange={(open) => {
            setPeriodOpen(open);
            if (open) setDraftRange(undefined);
          }}
          open={periodOpen}
        >
          <div className="flex w-full">
            <PopoverTrigger asChild>
              <Button
                aria-label="Выбрать период"
                className={
                  allTime ? 'w-full justify-start' : 'min-w-0 flex-1 justify-start rounded-r-none'
                }
                variant="outline"
              >
                <CalendarDays />
                {allTime
                  ? 'За всё время'
                  : `${formatRussianDate(periodStartDate)} — ${formatRussianDate(periodEndDate)}`}
              </Button>
            </PopoverTrigger>
            {allTime ? null : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Очистить период и показать данные за всё время"
                    className="rounded-l-none border-l-0"
                    onClick={clearPeriod}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <X />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Показать за всё время</TooltipContent>
              </Tooltip>
            )}
          </div>
          <PopoverContent align="start" className="w-auto p-0">
            <div className="flex gap-2 border-b p-3">
              <Button onClick={() => chooseRollingPeriod(7)} size="sm" variant="outline">
                Последние 7 дней
              </Button>
              <Button onClick={() => chooseRollingPeriod(30)} size="sm" variant="outline">
                Последние 30 дней
              </Button>
            </div>
            <Calendar
              defaultMonth={parseLocalDate(periodStartDate)}
              locale={ru}
              mode="range"
              numberOfMonths={2}
              onSelect={(range) => {
                if (draftRange === undefined && range?.from !== undefined) {
                  setDraftRange({ from: range.from });
                  return;
                }
                setDraftRange(range);
                if (range?.from === undefined || range.to === undefined) return;
                onChange({
                  period: {
                    endDate: localCalendarDate(range.to),
                    kind: 'range',
                    startDate: localCalendarDate(range.from),
                  },
                });
                setPeriodOpen(false);
              }}
              selected={draftRange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <MultipleFilter
        clearLabel="Очистить магазины"
        label="Магазины"
        onChange={(ids) => onChange({ outletIds: ids })}
        options={outlets}
        selectedIds={outletIds}
      />
      <MultipleFilter
        clearLabel="Очистить штучки"
        label="Штучки"
        onChange={(ids) => onChange({ productIds: ids })}
        options={products}
        selectedIds={productIds}
      />
    </section>
  );
}
