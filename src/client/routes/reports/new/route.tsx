import { createFileRoute } from '@tanstack/react-router';

import { ManualSalesReportForm } from './-manual-sales-report-form.js';

function NewReportPage() {
  return <ManualSalesReportForm />;
}

export const Route = createFileRoute('/reports/new')({
  component: NewReportPage,
  staticData: { pageTitle: 'Новый отчёт' },
});
