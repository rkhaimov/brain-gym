import {
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
    if (
      sale.outletPriceKopecks !== undefined &&
      !validWholeNumber(sale.outletPriceKopecks)
    ) {
      issues.push({
        field: SalesReportMutationFailureField.OUTLET_PRICE,
        message: 'Введите целую неотрицательную сумму в копейках',
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

  request.sales.forEach((sale, rowIndex) => {
    const location = { rowIndex, section: SalesReportSection.SALES };
    const stock = request.stockBalances.find(
      (candidate) => candidate.listingName === sale.listingName,
    );
    if (stock === undefined && sale.outletPriceKopecks === undefined) {
      issues.push({
        field: SalesReportMutationFailureField.OUTLET_PRICE,
        message: 'Укажите цену в точке для позиции из продаж',
        ...location,
      });
      return;
    }
    if (
      stock !== undefined &&
      sale.outletPriceKopecks !== undefined &&
      sale.outletPriceKopecks !== stock.outletPriceKopecks
    ) {
      issues.push({
        field: SalesReportMutationFailureField.OUTLET_PRICE,
        message: 'Для позиции должна использоваться одна цена в точке',
        ...location,
      });
      return;
    }
    const outletPrice = stock?.outletPriceKopecks ?? sale.outletPriceKopecks;
    if (outletPrice === undefined || !validWholeNumber(sale.unitsSold)) return;
    const listedValue = sale.unitsSold * outletPrice;
    if (!Number.isSafeInteger(listedValue)) {
      issues.push({
        field: SalesReportMutationFailureField.OUTLET_PRICE,
        message: 'Количество по цене точки превышает допустимую сумму',
        ...location,
      });
      return;
    }
    if (validWholeNumber(sale.earningsKopecks) && sale.earningsKopecks > listedValue) {
      issues.push({
        field: SalesReportMutationFailureField.EARNINGS,
        message: 'Заработано не может превышать проданное по цене точки',
        ...location,
      });
    }
  });
  return issues;
}
