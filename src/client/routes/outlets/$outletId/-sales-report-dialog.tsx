import { create } from '@bufbuild/protobuf';
import { useMutation, useQuery } from '@connectrpc/connect-query';
import { ArchiveRestore, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';
import { createPortal } from 'react-dom';

import { Alert, AlertDescription } from '@/client/components/ui/alert.js';
import { Button } from '@/client/components/ui/button.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog.js';
import { Field, FieldError, FieldLabel } from '@/client/components/ui/field.js';
import { Input } from '@/client/components/ui/input.js';
import {
  formatRussianCurrency,
  formatRussianCurrencyInput,
  formatRussianDate,
  parseRussianDate,
  parseRussianRubles,
} from '@/client/lib/localization.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import type { Outlet } from '@/shared/gen/ceramics/v1/outlet_pb.js';
import { listReportListings } from '@/shared/gen/ceramics/v1/report_listing-ReportListingService_connectquery.js';
import {
  createSalesReport,
  getSalesReport,
  updateSalesReport,
} from '@/shared/gen/ceramics/v1/sales_report-SalesReportService_connectquery.js';
import {
  CreateSalesReportRequestSchema,
  SalesReportMutationFailureField,
  SalesReportSection,
} from '@/shared/gen/ceramics/v1/sales_report_pb.js';
import type { SalesReport, SalesReportSummary } from '@/shared/gen/ceramics/v1/sales_report_pb.js';
import { normalizeSalesReport, validateSalesReport } from '@/shared/sales-report-validation.js';
import type { SalesReportValidationIssue } from '@/shared/sales-report-validation.js';

import { CurrencyInput } from './-currency-input.js';

interface SaleDraft {
  readonly id: number;
  readonly listingName: string;
  readonly unitsSold: string;
  readonly earningsRubles: string;
  readonly salesValueRubles: string;
}

interface StockDraft {
  readonly id: number;
  readonly listingName: string;
  readonly stockBalance: string;
  readonly outletPriceRubles: string;
}

interface ErrorBag {
  readonly [field: string]: readonly string[];
}

interface MutableErrorBag {
  [field: string]: string[];
}

const FORM_ERROR = 'form';
const PERIOD_START_ERROR = 'period-start';
const PERIOD_END_ERROR = 'period-end';

function salesError(index: number, field: string): string {
  return `sales.${String(index)}.${field}`;
}

function stockError(index: number, field: string): string {
  return `stock.${String(index)}.${field}`;
}

function wholeNumber(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
}

function clientValidationMessage(issue: SalesReportValidationIssue): string {
  if (issue.message !== 'Позиция с таким названием уже добавлена в этот раздел') {
    return issue.message;
  }
  return issue.section === SalesReportSection.SALES
    ? 'Позиция с таким названием уже добавлена в продажи'
    : 'Позиция с таким названием уже добавлена в остатки';
}

function issueField(issue: SalesReportValidationIssue): string {
  if (issue.field === SalesReportMutationFailureField.PERIOD_START) return PERIOD_START_ERROR;
  if (issue.field === SalesReportMutationFailureField.PERIOD_END) return PERIOD_END_ERROR;
  if (issue.rowIndex === undefined) return FORM_ERROR;
  const sectionField = issue.section === SalesReportSection.STOCK_BALANCE ? stockError : salesError;
  switch (issue.field) {
    case SalesReportMutationFailureField.LISTING_NAME:
      return sectionField(issue.rowIndex, 'listing-name');
    case SalesReportMutationFailureField.UNITS_SOLD:
      return salesError(issue.rowIndex, 'units-sold');
    case SalesReportMutationFailureField.EARNINGS:
      return salesError(issue.rowIndex, 'earnings');
    case SalesReportMutationFailureField.STOCK_BALANCE:
      return stockError(issue.rowIndex, 'stock-balance');
    case SalesReportMutationFailureField.OUTLET_PRICE:
      return stockError(issue.rowIndex, 'outlet-price');
    case SalesReportMutationFailureField.SALES_VALUE:
      return salesError(issue.rowIndex, 'sales-value');
    default:
      return FORM_ERROR;
  }
}

function addError(errors: MutableErrorBag, field: string, message: string): void {
  const messages = errors[field] ?? [];
  if (!messages.includes(message)) errors[field] = [...messages, message];
}

function errorsFromIssues(issues: readonly SalesReportValidationIssue[]): ErrorBag {
  const errors: MutableErrorBag = {};
  issues.forEach((issue) => addError(errors, issueField(issue), clientValidationMessage(issue)));
  return errors;
}

function FieldMessages({
  errors,
  id,
}: Readonly<{ errors: readonly string[] | undefined; id: string }>) {
  if (errors === undefined) return null;
  return <FieldError errors={errors.map((message) => ({ message }))} id={id} />;
}

function ReportListingInput({
  describedBy,
  disabled,
  invalid,
  onChange,
  suggestions,
  value,
}: Readonly<{
  describedBy?: string | undefined;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  value: string;
}>) {
  const listId = `listing-suggestions-${useId()}`;
  const container = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const listbox = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [popupRoot, setPopupRoot] = useState<HTMLElement>();
  const [popupPosition, setPopupPosition] = useState<
    Readonly<{ left: number; top: number; width: number }> | undefined
  >();
  const query = value.toLocaleLowerCase('ru');
  const visibleSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLocaleLowerCase('ru').includes(query),
  );
  const positionPopup = useCallback(() => {
    const bounds = input.current?.getBoundingClientRect();
    const root = input.current?.closest<HTMLElement>('[data-slot="dialog-content"]');
    if (bounds === undefined || root === undefined || root === null) return;
    const rootBounds = root.getBoundingClientRect();
    setPopupRoot(root);
    setPopupPosition({
      left: bounds.left - rootBounds.left + root.scrollLeft,
      top: bounds.bottom - rootBounds.top + root.scrollTop + 4,
      width: bounds.width,
    });
  }, []);

  useEffect(() => {
    if (!open || visibleSuggestions.length === 0) return undefined;
    positionPopup();
    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);
    return () => {
      window.removeEventListener('resize', positionPopup);
      window.removeEventListener('scroll', positionPopup, true);
    };
  }, [open, positionPopup, visibleSuggestions.length]);

  return (
    <div className="relative" ref={container}>
      <Input
        aria-autocomplete="list"
        aria-controls={listId}
        aria-describedby={describedBy}
        aria-expanded={open && visibleSuggestions.length > 0}
        aria-invalid={invalid || undefined}
        aria-label="Позиция отчёта"
        autoComplete="off"
        disabled={disabled}
        onBlur={(event) => {
          if (
            !container.current?.contains(event.relatedTarget) &&
            !listbox.current?.contains(event.relatedTarget)
          ) {
            setOpen(false);
          }
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        ref={input}
        role="combobox"
        value={value}
      />
      {open &&
      visibleSuggestions.length > 0 &&
      popupPosition !== undefined &&
      popupRoot !== undefined
        ? createPortal(
            <div
              className="absolute z-[60] max-h-48 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              id={listId}
              ref={listbox}
              role="listbox"
              style={popupPosition}
            >
              {visibleSuggestions.map((suggestion) => (
                <button
                  className="flex w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                  key={suggestion}
                  onClick={() => {
                    onChange(suggestion);
                    setOpen(false);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  role="option"
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>,
            popupRoot,
          )
        : null}
    </div>
  );
}

interface SalesReportDialogProps {
  readonly archivePending?: boolean | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly onRestore?: (() => Promise<void>) | undefined;
  readonly onSaved: () => Promise<void>;
  readonly open: boolean;
  readonly outlet: Outlet;
  readonly report?: SalesReportSummary | undefined;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function SalesReportDialog({ report, ...props }: SalesReportDialogProps) {
  const reportQuery = useQuery(
    getSalesReport,
    { id: report?.id ?? '' },
    { enabled: report !== undefined },
  );
  const reportValue =
    reportQuery.data?.result.case === 'success' ? reportQuery.data.result.value : undefined;
  const formKey =
    report === undefined
      ? 'create'
      : `${report.id}:${reportValue === undefined ? 'empty' : 'loaded'}`;

  return (
    <SalesReportDialogForm
      {...props}
      key={formKey}
      report={report}
      reportLoadFailed={
        report !== undefined &&
        !reportQuery.isPending &&
        reportQuery.data?.result.case !== 'success'
      }
      reportLoadPending={report !== undefined && reportQuery.isPending}
      reportValue={reportValue}
    />
  );
}

interface SalesReportDialogFormProps extends SalesReportDialogProps {
  readonly reportLoadFailed: boolean;
  readonly reportLoadPending: boolean;
  readonly reportValue?: SalesReport | undefined;
}

function SalesReportDialogForm({
  archivePending = false,
  onOpenChange,
  onRestore,
  onSaved,
  open,
  outlet,
  report,
  reportLoadFailed,
  reportLoadPending,
  reportValue,
  returnFocusTo,
}: SalesReportDialogFormProps) {
  const createMutation = useMutation(createSalesReport);
  const updateMutation = useMutation(updateSalesReport);
  const listings = useQuery(listReportListings, { outletId: outlet.id });
  const nextRowId = useRef(
    (reportValue?.sales.length ?? 0) + (reportValue?.stockBalances.length ?? 0) + 1,
  );
  const [periodStartDate, setPeriodStartDate] = useState(
    formatRussianDate(reportValue?.periodStartDate ?? ''),
  );
  const [periodEndDate, setPeriodEndDate] = useState(
    formatRussianDate(reportValue?.periodEndDate ?? ''),
  );
  const [sales, setSales] = useState<SaleDraft[]>(() =>
    (reportValue?.sales ?? []).map((sale, index) => ({
      earningsRubles: formatRussianCurrencyInput(sale.earningsKopecks),
      id: index + 1,
      listingName: sale.listingName,
      salesValueRubles: formatRussianCurrencyInput(sale.salesValueKopecks),
      unitsSold: String(sale.unitsSold),
    })),
  );
  const [stockBalances, setStockBalances] = useState<StockDraft[]>(() =>
    (reportValue?.stockBalances ?? []).map((stock, index) => ({
      id: (reportValue?.sales.length ?? 0) + index + 1,
      listingName: stock.listingName,
      outletPriceRubles: formatRussianCurrencyInput(stock.outletPriceKopecks),
      stockBalance: String(stock.stockBalance),
    })),
  );
  const [errors, setErrors] = useState<ErrorBag>({});
  const mutationPending = createMutation.isPending || updateMutation.isPending || archivePending;
  const readOnly = report?.archived === true;

  function clearError(...fields: string[]): void {
    setErrors((current) => {
      if (!fields.some((field) => current[field] !== undefined)) return current;
      const next = { ...current };
      fields.forEach((field) => delete next[field]);
      return next;
    });
  }

  function addSale(): void {
    setSales((rows) => [
      ...rows,
      {
        earningsRubles: '',
        id: nextRowId.current++,
        listingName: '',
        salesValueRubles: '',
        unitsSold: '',
      },
    ]);
  }

  function addStockBalance(): void {
    setStockBalances((rows) => [
      ...rows,
      {
        id: nextRowId.current++,
        listingName: '',
        outletPriceRubles: '',
        stockBalance: '',
      },
    ]);
  }

  function updateSale(index: number, change: Partial<SaleDraft>): void {
    if (change.listingName !== undefined) clearError(salesError(index, 'listing-name'));
    if (change.unitsSold !== undefined) clearError(salesError(index, 'units-sold'));
    if (change.earningsRubles !== undefined) clearError(salesError(index, 'earnings'));
    if (change.salesValueRubles !== undefined) clearError(salesError(index, 'sales-value'));
    setSales((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...change } : row)),
    );
  }

  function updateStockBalance(index: number, change: Partial<StockDraft>): void {
    if (change.listingName !== undefined) clearError(stockError(index, 'listing-name'));
    if (change.stockBalance !== undefined) clearError(stockError(index, 'stock-balance'));
    if (change.outletPriceRubles !== undefined) clearError(stockError(index, 'outlet-price'));
    setStockBalances((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...change } : row)),
    );
  }

  function requestAndErrors() {
    const parsingErrors: MutableErrorBag = {};
    const request = normalizeSalesReport(
      create(CreateSalesReportRequestSchema, {
        outletId: outlet.id,
        periodEndDate: parseRussianDate(periodEndDate) ?? '',
        periodStartDate: parseRussianDate(periodStartDate) ?? '',
        sales: sales.map((sale, index) => {
          const unitsSold = wholeNumber(sale.unitsSold);
          const earningsKopecks = parseRussianRubles(sale.earningsRubles);
          const salesValueKopecks = parseRussianRubles(sale.salesValueRubles);
          if (unitsSold === undefined) {
            addError(
              parsingErrors,
              salesError(index, 'units-sold'),
              'Продано должно быть целым неотрицательным числом',
            );
          }
          if (earningsKopecks === undefined) {
            addError(
              parsingErrors,
              salesError(index, 'earnings'),
              'Заработано указывается в рублях с точностью до копейки',
            );
          }
          if (salesValueKopecks === undefined) {
            addError(
              parsingErrors,
              salesError(index, 'sales-value'),
              'Сумма продаж указывается в рублях с точностью до копейки',
            );
          }
          return {
            earningsKopecks: earningsKopecks ?? 0,
            listingName: sale.listingName,
            salesValueKopecks: salesValueKopecks ?? 0,
            unitsSold: unitsSold ?? 0,
          };
        }),
        stockBalances: stockBalances.map((stock, index) => {
          const stockBalance = wholeNumber(stock.stockBalance);
          const outletPriceKopecks = parseRussianRubles(stock.outletPriceRubles);
          if (stockBalance === undefined) {
            addError(
              parsingErrors,
              stockError(index, 'stock-balance'),
              'Остаток должен быть целым неотрицательным числом',
            );
          }
          if (outletPriceKopecks === undefined) {
            addError(
              parsingErrors,
              stockError(index, 'outlet-price'),
              'Цена указывается в рублях с точностью до копейки',
            );
          }
          return {
            listingName: stock.listingName,
            outletPriceKopecks: outletPriceKopecks ?? 0,
            stockBalance: stockBalance ?? 0,
          };
        }),
      }),
    );
    const domainErrors = errorsFromIssues(validateSalesReport(request));
    Object.entries(domainErrors).forEach(([field, messages]) => {
      messages.forEach((message) => addError(parsingErrors, field, message));
    });
    return { errors: parsingErrors, request };
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = requestAndErrors();
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    try {
      const response =
        report === undefined
          ? await createMutation.mutateAsync(result.request)
          : await updateMutation.mutateAsync({
              id: report.id,
              periodEndDate: result.request.periodEndDate,
              periodStartDate: result.request.periodStartDate,
              sales: result.request.sales,
              stockBalances: result.request.stockBalances,
            });
      if (response.result.case === 'success') {
        await onSaved();
        onOpenChange(false);
        return;
      }
      setErrors(
        response.result.case === 'failure'
          ? errorsFromIssues([response.result.value])
          : { [FORM_ERROR]: ['Сервер вернул неполный ответ'] },
      );
    } catch (error) {
      console.error('Unexpected Sales report failure', error);
      setErrors({ [FORM_ERROR]: ['Не удалось сохранить отчёт. Попробуйте ещё раз.'] });
    }
  }

  async function restore(): Promise<void> {
    if (onRestore === undefined) return;
    try {
      await onRestore();
      onOpenChange(false);
    } catch (error) {
      console.error('Unexpected Sales report restore failure', error);
      setErrors({ [FORM_ERROR]: ['Не удалось восстановить отчёт. Попробуйте ещё раз.'] });
    }
  }

  function changeOpen(nextOpen: boolean): void {
    if (!nextOpen && mutationPending) return;
    onOpenChange(nextOpen);
  }

  const knownListingNames = listings.data?.listings.map((listing) => listing.name) ?? [];
  const outletDescription =
    outlet.code === undefined ? outlet.name : `${outlet.name} · ${outlet.code}`;

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-6xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (mutationPending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (mutationPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {report === undefined
              ? 'Новый отчёт'
              : readOnly
                ? 'Просмотр отчёта'
                : 'Редактировать отчёт'}
          </DialogTitle>
          <DialogDescription>Магазин: {outletDescription}</DialogDescription>
        </DialogHeader>

        {reportLoadPending ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <span>Загружаем отчёт…</span>
          </div>
        ) : reportLoadFailed ? (
          <Alert variant="destructive">
            <AlertDescription>Не удалось загрузить отчёт. Попробуйте снова.</AlertDescription>
          </Alert>
        ) : (
          <form className="grid gap-5" noValidate onSubmit={submit}>
            <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
              <Field data-invalid={errors[PERIOD_START_ERROR] !== undefined}>
                <FieldLabel htmlFor="period-start">Начало периода</FieldLabel>
                <Input
                  aria-describedby={
                    errors[PERIOD_START_ERROR] === undefined ? undefined : 'period-start-error'
                  }
                  aria-invalid={errors[PERIOD_START_ERROR] === undefined ? undefined : true}
                  autoFocus
                  disabled={mutationPending || readOnly}
                  id="period-start"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(event) => {
                    setPeriodStartDate(event.target.value);
                    clearError(PERIOD_START_ERROR);
                  }}
                  placeholder="ДД.ММ.ГГГГ"
                  type="text"
                  value={periodStartDate}
                />
                <FieldMessages errors={errors[PERIOD_START_ERROR]} id="period-start-error" />
              </Field>
              <Field data-invalid={errors[PERIOD_END_ERROR] !== undefined}>
                <FieldLabel htmlFor="period-end">Конец периода</FieldLabel>
                <Input
                  aria-describedby={
                    errors[PERIOD_END_ERROR] === undefined ? undefined : 'period-end-error'
                  }
                  aria-invalid={errors[PERIOD_END_ERROR] === undefined ? undefined : true}
                  disabled={mutationPending || readOnly}
                  id="period-end"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(event) => {
                    setPeriodEndDate(event.target.value);
                    clearError(PERIOD_END_ERROR);
                  }}
                  placeholder="ДД.ММ.ГГГГ"
                  type="text"
                  value={periodEndDate}
                />
                <FieldMessages errors={errors[PERIOD_END_ERROR]} id="period-end-error" />
              </Field>
            </div>

            <section className="rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-4 border-b p-4">
                <div>
                  <h2 className="font-bold">Остатки на конец периода</h2>
                  <p className="text-sm text-muted-foreground">
                    Укажите все позиции, которые остались в магазине.
                  </p>
                </div>
                <Button
                  disabled={mutationPending || readOnly}
                  onClick={addStockBalance}
                  type="button"
                  variant="outline"
                >
                  <Plus />
                  Добавить остаток
                </Button>
              </div>
              {stockBalances.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Пустой остаток: в магазине ничего не осталось.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Позиция отчёта</TableHead>
                      <TableHead>Остаток</TableHead>
                      <TableHead>Цена в магазине, ₽</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockBalances.map((stock, index) => {
                      const listingKey = stockError(index, 'listing-name');
                      const balanceKey = stockError(index, 'stock-balance');
                      const priceKey = stockError(index, 'outlet-price');
                      return (
                        <TableRow
                          aria-label={`Остаток ${String(index + 1)}`}
                          key={stock.id}
                          role="group"
                        >
                          <TableCell className="min-w-56 align-top whitespace-normal">
                            <ReportListingInput
                              describedBy={
                                errors[listingKey] === undefined ? undefined : `${listingKey}-error`
                              }
                              disabled={mutationPending || readOnly}
                              invalid={errors[listingKey] !== undefined}
                              onChange={(value) =>
                                updateStockBalance(index, { listingName: value })
                              }
                              suggestions={knownListingNames}
                              value={stock.listingName}
                            />
                            <FieldMessages errors={errors[listingKey]} id={`${listingKey}-error`} />
                          </TableCell>
                          <TableCell className="min-w-40 align-top whitespace-normal">
                            <Input
                              aria-describedby={
                                errors[balanceKey] === undefined ? undefined : `${balanceKey}-error`
                              }
                              aria-invalid={errors[balanceKey] === undefined ? undefined : true}
                              aria-label="Остаток"
                              disabled={mutationPending || readOnly}
                              min="0"
                              onChange={(event) =>
                                updateStockBalance(index, { stockBalance: event.target.value })
                              }
                              step="1"
                              type="number"
                              value={stock.stockBalance}
                            />
                            <FieldMessages errors={errors[balanceKey]} id={`${balanceKey}-error`} />
                          </TableCell>
                          <TableCell className="min-w-44 align-top whitespace-normal">
                            <CurrencyInput
                              aria-describedby={
                                errors[priceKey] === undefined ? undefined : `${priceKey}-error`
                              }
                              aria-invalid={errors[priceKey] === undefined ? undefined : true}
                              aria-label="Цена в магазине"
                              disabled={mutationPending || readOnly}
                              onValueChange={(value) =>
                                updateStockBalance(index, {
                                  outletPriceRubles: value,
                                })
                              }
                              value={stock.outletPriceRubles}
                            />
                            <FieldMessages errors={errors[priceKey]} id={`${priceKey}-error`} />
                          </TableCell>
                          <TableCell className="text-right align-top">
                            <Button
                              aria-label={`Удалить остаток ${String(index + 1)}`}
                              disabled={mutationPending || readOnly}
                              onClick={() => {
                                setStockBalances((rows) =>
                                  rows.filter((_, rowIndex) => rowIndex !== index),
                                );
                                setErrors({});
                              }}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 />
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </section>

            <section className="rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-4 border-b p-4">
                <div>
                  <h2 className="font-bold">Продажи за период</h2>
                  <p className="text-sm text-muted-foreground">
                    Заработано не может превышать сумму продаж.
                  </p>
                </div>
                <Button
                  disabled={mutationPending || readOnly}
                  onClick={addSale}
                  type="button"
                  variant="outline"
                >
                  <Plus />
                  Добавить продажу
                </Button>
              </div>
              {sales.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Продаж за период не было.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Позиция отчёта</TableHead>
                      <TableHead>Продано, шт.</TableHead>
                      <TableHead>Сумма продаж, ₽</TableHead>
                      <TableHead>Заработано, ₽</TableHead>
                      <TableHead>Комиссия магазина</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale, index) => {
                      const listingKey = salesError(index, 'listing-name');
                      const unitsKey = salesError(index, 'units-sold');
                      const salesValueKey = salesError(index, 'sales-value');
                      const earningsKey = salesError(index, 'earnings');
                      const salesValue = parseRussianRubles(sale.salesValueRubles);
                      const earnings = parseRussianRubles(sale.earningsRubles);
                      const share =
                        salesValue === undefined || earnings === undefined || earnings > salesValue
                          ? undefined
                          : salesValue - earnings;
                      return (
                        <TableRow
                          aria-label={`Продажа ${String(index + 1)}`}
                          key={sale.id}
                          role="group"
                        >
                          <TableCell className="min-w-52 align-top whitespace-normal">
                            <ReportListingInput
                              describedBy={
                                errors[listingKey] === undefined ? undefined : `${listingKey}-error`
                              }
                              disabled={mutationPending || readOnly}
                              invalid={errors[listingKey] !== undefined}
                              onChange={(value) => updateSale(index, { listingName: value })}
                              suggestions={knownListingNames}
                              value={sale.listingName}
                            />
                            <FieldMessages errors={errors[listingKey]} id={`${listingKey}-error`} />
                          </TableCell>
                          <TableCell className="min-w-36 align-top whitespace-normal">
                            <Input
                              aria-describedby={
                                errors[unitsKey] === undefined ? undefined : `${unitsKey}-error`
                              }
                              aria-invalid={errors[unitsKey] === undefined ? undefined : true}
                              aria-label="Продано, шт."
                              disabled={mutationPending || readOnly}
                              min="0"
                              onChange={(event) =>
                                updateSale(index, { unitsSold: event.target.value })
                              }
                              step="1"
                              type="number"
                              value={sale.unitsSold}
                            />
                            <FieldMessages errors={errors[unitsKey]} id={`${unitsKey}-error`} />
                          </TableCell>
                          <TableCell className="min-w-40 align-top whitespace-normal">
                            <CurrencyInput
                              aria-describedby={
                                errors[salesValueKey] === undefined
                                  ? undefined
                                  : `${salesValueKey}-error`
                              }
                              aria-invalid={errors[salesValueKey] === undefined ? undefined : true}
                              aria-label="Сумма продаж"
                              disabled={mutationPending || readOnly}
                              onValueChange={(value) =>
                                updateSale(index, { salesValueRubles: value })
                              }
                              value={sale.salesValueRubles}
                            />
                            <FieldMessages
                              errors={errors[salesValueKey]}
                              id={`${salesValueKey}-error`}
                            />
                          </TableCell>
                          <TableCell className="min-w-40 align-top whitespace-normal">
                            <CurrencyInput
                              aria-describedby={
                                errors[earningsKey] === undefined
                                  ? undefined
                                  : `${earningsKey}-error`
                              }
                              aria-invalid={errors[earningsKey] === undefined ? undefined : true}
                              aria-label="Заработано"
                              disabled={mutationPending || readOnly}
                              onValueChange={(value) =>
                                updateSale(index, { earningsRubles: value })
                              }
                              value={sale.earningsRubles}
                            />
                            <FieldMessages
                              errors={errors[earningsKey]}
                              id={`${earningsKey}-error`}
                            />
                          </TableCell>
                          <TableCell className="min-w-36 align-top">
                            <output aria-label="Комиссия магазина">
                              {formatRussianCurrency(share)}
                            </output>
                          </TableCell>
                          <TableCell className="text-right align-top">
                            <Button
                              aria-label={`Удалить продажу ${String(index + 1)}`}
                              disabled={mutationPending || readOnly}
                              onClick={() => {
                                setSales((rows) =>
                                  rows.filter((_, rowIndex) => rowIndex !== index),
                                );
                                setErrors({});
                              }}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 />
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </section>

            {errors[FORM_ERROR] === undefined ? null : (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors[FORM_ERROR].map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="sticky bottom-0 border-t bg-background pt-4">
              <Button
                disabled={mutationPending}
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                {readOnly ? 'Закрыть' : 'Отмена'}
              </Button>
              {readOnly && onRestore !== undefined ? (
                <Button disabled={mutationPending} onClick={() => void restore()} type="button">
                  <ArchiveRestore />
                  {archivePending ? 'Восстанавливаем…' : 'Восстановить отчёт'}
                </Button>
              ) : null}
              {readOnly ? null : (
                <Button disabled={mutationPending} type="submit">
                  <Save />
                  {mutationPending ? 'Сохраняем…' : 'Сохранить отчёт'}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
