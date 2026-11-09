import { create } from '@bufbuild/protobuf';
import { useMutation, useQuery } from '@connectrpc/connect-query';
import { CircleAlert, Plus, Save, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Button } from '@/client/components/ui/button.js';
import { Field, FieldLabel } from '@/client/components/ui/field.js';
import { Input } from '@/client/components/ui/input.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import { listOutlets } from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';
import { createSalesReport } from '@/shared/gen/ceramics/v1/sales_report-SalesReportService_connectquery.js';
import {
  CreateSalesReportRequestSchema,
  SalesReportSection,
} from '@/shared/gen/ceramics/v1/sales_report_pb.js';
import { validateSalesReport } from '@/shared/sales-report-validation.js';
import type { SalesReportValidationIssue } from '@/shared/sales-report-validation.js';

interface SaleDraft {
  readonly id: number;
  readonly listingName: string;
  readonly unitsSold: string;
  readonly earningsRubles: string;
  readonly outletPriceRubles: string;
}

interface StockDraft {
  readonly id: number;
  readonly listingName: string;
  readonly stockBalance: string;
  readonly outletPriceRubles: string;
}

function wholeNumber(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
}

function kopecksFromRubles(value: string): number | undefined {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value);
  if (match === null) return undefined;
  const rubles = Number(match[1]);
  const kopecks = Number((match[2] ?? '').padEnd(2, '0'));
  const total = rubles * 100 + kopecks;
  return Number.isSafeInteger(total) ? total : undefined;
}

function formatRubles(value: number | undefined): string {
  return value === undefined
    ? '—'
    : new Intl.NumberFormat('ru-RU', {
        currency: 'RUB',
        minimumFractionDigits: 2,
        style: 'currency',
      }).format(value / 100);
}

function clientValidationMessage(issue: SalesReportValidationIssue): string {
  if (issue.message !== 'Позиция с таким названием уже добавлена в этот раздел') {
    return issue.message;
  }
  return issue.section === SalesReportSection.SALES
    ? 'Позиция с таким названием уже добавлена в продажи'
    : 'Позиция с таким названием уже добавлена в остатки';
}

export function ManualSalesReportForm() {
  const outlets = useQuery(listOutlets, { archived: false });
  const mutation = useMutation(createSalesReport);
  const nextRowId = useRef(1);
  const [outletId, setOutletId] = useState('');
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [periodEndDate, setPeriodEndDate] = useState('');
  const [sales, setSales] = useState<SaleDraft[]>([]);
  const [stockBalances, setStockBalances] = useState<StockDraft[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function addSale(): void {
    setSaved(false);
    setSales((rows) => [
      ...rows,
      {
        earningsRubles: '',
        id: nextRowId.current++,
        listingName: '',
        outletPriceRubles: '',
        unitsSold: '',
      },
    ]);
  }

  function addStockBalance(): void {
    setSaved(false);
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
    setSaved(false);
    setSales((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const updated = { ...row, ...change };
        if (change.listingName !== undefined) {
          const stock = stockBalances.find(
            (candidate) => candidate.listingName === change.listingName,
          );
          if (stock !== undefined)
            return { ...updated, outletPriceRubles: stock.outletPriceRubles };
        }
        return updated;
      }),
    );
    if (change.outletPriceRubles !== undefined) {
      const listingName = sales[index]?.listingName;
      setStockBalances((rows) =>
        rows.map((row) =>
          row.listingName === listingName
            ? { ...row, outletPriceRubles: change.outletPriceRubles ?? '' }
            : row,
        ),
      );
    }
  }

  function updateStockBalance(index: number, change: Partial<StockDraft>): void {
    setSaved(false);
    setStockBalances((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const updated = { ...row, ...change };
        if (change.listingName !== undefined) {
          const sale = sales.find((candidate) => candidate.listingName === change.listingName);
          if (sale !== undefined) return { ...updated, outletPriceRubles: sale.outletPriceRubles };
        }
        return updated;
      }),
    );
    if (change.outletPriceRubles === undefined) return;
    const listingName = change.listingName ?? stockBalances[index]?.listingName;
    if (listingName === undefined) return;
    setSales((rows) =>
      rows.map((row) =>
        row.listingName === listingName
          ? { ...row, outletPriceRubles: change.outletPriceRubles ?? '' }
          : row,
      ),
    );
  }

  function requestAndErrors() {
    const parsingErrors: string[] = [];
    if (outletId.length === 0) parsingErrors.push('Выберите торговую точку');
    const request = create(CreateSalesReportRequestSchema, {
      outletId,
      periodEndDate,
      periodStartDate,
      sales: sales.map((sale) => {
        const unitsSold = wholeNumber(sale.unitsSold);
        const earningsKopecks = kopecksFromRubles(sale.earningsRubles);
        const outletPriceKopecks = kopecksFromRubles(sale.outletPriceRubles);
        if (unitsSold === undefined)
          parsingErrors.push('Продано должно быть целым неотрицательным числом');
        if (earningsKopecks === undefined) {
          parsingErrors.push('Заработано указывается в рублях с точностью до копейки');
        }
        if (sale.outletPriceRubles.length > 0 && outletPriceKopecks === undefined) {
          parsingErrors.push('Цена в точке указывается в рублях с точностью до копейки');
        }
        return {
          earningsKopecks: earningsKopecks ?? 0,
          listingName: sale.listingName,
          ...(outletPriceKopecks === undefined ? {} : { outletPriceKopecks }),
          unitsSold: unitsSold ?? 0,
        };
      }),
      stockBalances: stockBalances.map((stock) => {
        const stockBalance = wholeNumber(stock.stockBalance);
        const outletPriceKopecks = kopecksFromRubles(stock.outletPriceRubles);
        if (stockBalance === undefined) {
          parsingErrors.push('Остаток должен быть целым неотрицательным числом');
        }
        if (outletPriceKopecks === undefined) {
          parsingErrors.push('Цена в точке указывается в рублях с точностью до копейки');
        }
        return {
          listingName: stock.listingName,
          outletPriceKopecks: outletPriceKopecks ?? 0,
          stockBalance: stockBalance ?? 0,
        };
      }),
    });
    const domainErrors = validateSalesReport(request).map(clientValidationMessage);
    return { errors: [...new Set([...parsingErrors, ...domainErrors])], request };
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaved(false);
    const { errors: nextErrors, request } = requestAndErrors();
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    const response = await mutation.mutateAsync(request);
    if (response.result.case === 'success') {
      setErrors([]);
      setSaved(true);
      return;
    }
    setErrors([
      response.result.case === 'failure'
        ? response.result.value.message
        : 'Сервер вернул неполный ответ',
    ]);
  }

  return (
    <form className="flex flex-col gap-6 p-6" onSubmit={submit}>
      <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-4">
        <Field>
          <FieldLabel htmlFor="report-outlet">Торговая точка</FieldLabel>
          <Select
            disabled={outlets.isPending || mutation.isPending}
            onValueChange={setOutletId}
            value={outletId}
          >
            <SelectTrigger id="report-outlet">
              <SelectValue placeholder="Выберите торговую точку" />
            </SelectTrigger>
            <SelectContent>
              {outlets.data?.outlets.map((outlet) => (
                <SelectItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="period-start">Начало периода</FieldLabel>
          <Input
            disabled={mutation.isPending}
            id="period-start"
            onChange={(event) => setPeriodStartDate(event.target.value)}
            type="date"
            value={periodStartDate}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="period-end">Конец периода</FieldLabel>
          <Input
            disabled={mutation.isPending}
            id="period-end"
            onChange={(event) => setPeriodEndDate(event.target.value)}
            type="date"
            value={periodEndDate}
          />
        </Field>
      </div>

      <Alert>
        <CircleAlert />
        <AlertTitle>Как сохраняется отчёт</AlertTitle>
        <AlertDescription>
          <p>Остатки — полный снимок на конец периода: пропущенная позиция считается нулём.</p>
          <p>
            Суммы вводятся в рублях с точностью до копейки. Новые позиции можно сохранить
            несопоставленными.
          </p>
          <p>Пустой отчёт означает нулевые продажи и пустой остаток.</p>
        </AlertDescription>
      </Alert>

      {errors.length === 0 ? null : (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Проверьте отчёт</AlertTitle>
          <AlertDescription>
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      {saved ? (
        <Alert className="border-success/40 bg-success/10 text-success [&_[data-slot=alert-description]]:text-success">
          <Save />
          <AlertTitle>Отчёт сохранён</AlertTitle>
          <AlertDescription>Продажи и полный остаток записаны одним сохранением.</AlertDescription>
        </Alert>
      ) : null}

      <section className="rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 className="font-bold">Остатки на конец периода</h2>
            <p className="text-sm text-muted-foreground">
              Укажите все позиции, которые остались в точке.
            </p>
          </div>
          <Button
            disabled={mutation.isPending}
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
            Пустой остаток: в точке ничего не осталось.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Позиция точки</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Цена в точке, ₽</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockBalances.map((stock, index) => (
                <TableRow aria-label={`Остаток ${String(index + 1)}`} key={stock.id} role="group">
                  <TableCell>
                    <Input
                      aria-label="Позиция точки"
                      disabled={mutation.isPending}
                      onChange={(event) =>
                        updateStockBalance(index, { listingName: event.target.value })
                      }
                      value={stock.listingName}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label="Остаток"
                      disabled={mutation.isPending}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateStockBalance(index, { stockBalance: event.target.value })
                      }
                      value={stock.stockBalance}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label="Цена в точке"
                      disabled={mutation.isPending}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateStockBalance(index, { outletPriceRubles: event.target.value })
                      }
                      value={stock.outletPriceRubles}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      aria-label={`Удалить остаток ${String(index + 1)}`}
                      disabled={mutation.isPending}
                      onClick={() =>
                        setStockBalances((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 />
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 className="font-bold">Продажи за период</h2>
            <p className="text-sm text-muted-foreground">
              Заработано не может превышать количество по цене точки.
            </p>
          </div>
          <Button disabled={mutation.isPending} onClick={addSale} type="button" variant="outline">
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
                <TableHead>Позиция точки</TableHead>
                <TableHead>Продано, шт.</TableHead>
                <TableHead>Цена в точке, ₽</TableHead>
                <TableHead>Заработано, ₽</TableHead>
                <TableHead>Комиссия точки</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale, index) => {
                const units = wholeNumber(sale.unitsSold);
                const price = kopecksFromRubles(sale.outletPriceRubles);
                const earnings = kopecksFromRubles(sale.earningsRubles);
                const share =
                  units === undefined || price === undefined || earnings === undefined
                    ? undefined
                    : units * price - earnings;
                return (
                  <TableRow aria-label={`Продажа ${String(index + 1)}`} key={sale.id} role="group">
                    <TableCell>
                      <Input
                        aria-label="Позиция точки"
                        disabled={mutation.isPending}
                        onChange={(event) => updateSale(index, { listingName: event.target.value })}
                        value={sale.listingName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label="Продано, шт."
                        disabled={mutation.isPending}
                        inputMode="numeric"
                        onChange={(event) => updateSale(index, { unitsSold: event.target.value })}
                        value={sale.unitsSold}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label="Цена в точке"
                        disabled={mutation.isPending}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateSale(index, { outletPriceRubles: event.target.value })
                        }
                        value={sale.outletPriceRubles}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label="Заработано"
                        disabled={mutation.isPending}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateSale(index, { earningsRubles: event.target.value })
                        }
                        value={sale.earningsRubles}
                      />
                    </TableCell>
                    <TableCell>
                      <output aria-label="Комиссия точки">{formatRubles(share)}</output>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        aria-label={`Удалить продажу ${String(index + 1)}`}
                        disabled={mutation.isPending}
                        onClick={() =>
                          setSales((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                        }
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

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Отчёт сохраняется целиком одной операцией.</p>
        <Button disabled={mutation.isPending} type="submit">
          <Save />
          {mutation.isPending ? 'Сохраняем…' : 'Сохранить отчёт'}
        </Button>
      </div>
    </form>
  );
}
