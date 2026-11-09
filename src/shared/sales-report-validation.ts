import { create } from '@bufbuild/protobuf';

import {
  CreateSalesReportRequestSchema,
  SalesReportMutationFailureField,
  SalesReportSection,
} from './gen/ceramics/v1/sales_report_pb.js';
import type {
  CreateSalesReportRequest,
  SalesReportMutationFailure,
} from './gen/ceramics/v1/sales_report_pb.js';

export type SalesReportValidationIssue = Readonly<
  Pick<SalesReportMutationFailure, 'field' | 'message'> &
    Partial<Pick<SalesReportMutationFailure, 'rowIndex' | 'section'>>
>;

export function normalizeSalesReport(
  request: CreateSalesReportRequest,
): CreateSalesReportRequest {
  return create(CreateSalesReportRequestSchema, {
    outletId: request.outletId,
    periodEndDate: request.periodEndDate,
    periodStartDate: request.periodStartDate,
    sales: request.sales.map((sale) => ({
      ...sale,
      listingName: sale.listingName.trim(),
    })),
    stockBalances: request.stockBalances.map((stock) => ({
      ...stock,
      listingName: stock.listingName.trim(),
    })),
  });
}

export function validReportingDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validWholeNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function validateSalesReport(
  request: CreateSalesReportRequest,
): SalesReportValidationIssue[] {
  const issues: SalesReportValidationIssue[] = [];
  if (!validReportingDate(request.periodStartDate)) {
    issues.push({
      field: SalesReportMutationFailureField.PERIOD_START,
      message: 'Введите дату начала отчётного периода',
    });
  }
  if (!validReportingDate(request.periodEndDate)) {
    issues.push({
      field: SalesReportMutationFailureField.PERIOD_END,
      message: 'Введите дату окончания отчётного периода',
    });
  }
  if (
    validReportingDate(request.periodStartDate) &&
    validReportingDate(request.periodEndDate) &&
    request.periodEndDate < request.periodStartDate
  ) {
    issues.push({
      field: SalesReportMutationFailureField.PERIOD_END,
      message: 'Дата окончания не может быть раньше даты начала',
    });
  }

  const salesNames = new Set<string>();
  request.sales.forEach((sale, rowIndex) => {
    const location = { rowIndex, section: SalesReportSection.SALES };
    if (sale.listingName.length === 0) {
      issues.push({
        field: SalesReportMutationFailureField.LISTING_NAME,
        message: 'Введите название позиции',
        ...location,
      });
    }
    if (salesNames.has(sale.listingName)) {
      issues.push({
        field: SalesReportMutationFailureField.LISTING_NAME,
        message: 'Позиция с таким названием уже добавлена в этот раздел',
        ...location,
      });
    }
    salesNames.add(sale.listingName);
    if (!validWholeNumber(sale.unitsSold)) {
      issues.push({
        field: SalesReportMutationFailureField.UNITS_SOLD,
        message: 'Введите целое неотрицательное число',
        ...location,
      });
    }
    if (!validWholeNumber(sale.earningsKopecks)) {
      issues.push({
        field: SalesReportMutationFailureField.EARNINGS,
        message: 'Введите целую неотрицательную сумму в копейках',
        ...location,
      });
    }
    if (!validWholeNumber(sale.salesValueKopecks)) {
      issues.push({
        field: SalesReportMutationFailureField.SALES_VALUE,
        message: 'Введите целую неотрицательную сумму в копейках',
        ...location,
      });
    }
    if (
      validWholeNumber(sale.earningsKopecks) &&
      validWholeNumber(sale.salesValueKopecks) &&
      sale.earningsKopecks > sale.salesValueKopecks
    ) {
      issues.push({
        field: SalesReportMutationFailureField.EARNINGS,
        message: 'Заработано не может превышать сумму продаж',
        ...location,
      });
    }
  });

  const stockNames = new Set<string>();
  request.stockBalances.forEach((stock, rowIndex) => {
    const location = { rowIndex, section: SalesReportSection.STOCK_BALANCE };
    if (stock.listingName.length === 0) {
      issues.push({
        field: SalesReportMutationFailureField.LISTING_NAME,
        message: 'Введите название позиции',
        ...location,
      });
    }
    if (stockNames.has(stock.listingName)) {
      issues.push({
        field: SalesReportMutationFailureField.LISTING_NAME,
        message: 'Позиция с таким названием уже добавлена в этот раздел',
        ...location,
      });
    }
    stockNames.add(stock.listingName);
    if (!validWholeNumber(stock.stockBalance)) {
      issues.push({
        field: SalesReportMutationFailureField.STOCK_BALANCE,
        message: 'Введите целое неотрицательное число',
        ...location,
      });
    }
    if (!validWholeNumber(stock.outletPriceKopecks)) {
      issues.push({
        field: SalesReportMutationFailureField.OUTLET_PRICE,
        message: 'Введите целую неотрицательную сумму в копейках',
        ...location,
      });
    }
  });

  return issues;
}
