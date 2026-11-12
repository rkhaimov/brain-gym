import { Rows3Icon } from 'lucide-react';

import { ReportListingProductCombobox } from '@/client/components/report-listing/report-listing-product-combobox.js';
import { Button } from '@/client/components/ui/button.js';
import { Spinner } from '@/client/components/ui/spinner.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table.js';
import type {
  ListReportListingsResponse,
  ReportListing,
} from '@/shared/gen/ceramics/v1/report_listing_pb.js';

export type MappingFilter = 'all' | 'unmapped' | 'mapped';

interface ReportListingsTabProps {
  readonly data: ListReportListingsResponse | undefined;
  readonly filter: MappingFilter;
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly onFilterChange: (filter: MappingFilter) => void;
  readonly refresh: () => Promise<unknown>;
}

export function ReportListingsTab({
  data,
  filter,
  isError,
  isPending,
  onFilterChange,
  refresh,
}: ReportListingsTabProps) {
  return (
    <>
      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Фильтр сопоставлений"
      >
        <FilterButton
          active={filter === 'all'}
          count={data?.allCount ?? 0}
          label="Все"
          onClick={() => onFilterChange('all')}
        />
        <FilterButton
          active={filter === 'unmapped'}
          count={data?.unmappedCount ?? 0}
          label="Несопоставленные"
          onClick={() => onFilterChange('unmapped')}
        />
        <FilterButton
          active={filter === 'mapped'}
          count={data?.mappedCount ?? 0}
          label="Сопоставленные"
          onClick={() => onFilterChange('mapped')}
        />
      </div>

      <section aria-label="Позиции отчётов" className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Штучка</TableHead>
              <TableHead>Название в отчёте</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ReportListingRows
              isError={isError}
              isPending={isPending}
              listings={data?.listings}
              refresh={refresh}
            />
          </TableBody>
        </Table>
      </section>
    </>
  );
}

interface FilterButtonProps {
  readonly active: boolean;
  readonly count: number;
  readonly label: string;
  readonly onClick: () => void;
}

function FilterButton({ active, count, label, onClick }: FilterButtonProps) {
  return (
    <Button onClick={onClick} size="sm" variant={active ? 'default' : 'outline'}>
      {label} {count}
    </Button>
  );
}

interface ReportListingRowsProps {
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly listings: readonly ReportListing[] | undefined;
  readonly refresh: () => Promise<unknown>;
}

function ReportListingRows({ isError, isPending, listings, refresh }: ReportListingRowsProps) {
  if (isPending) {
    return (
      <TableRow>
        <TableCell className="h-24 text-center" colSpan={2}>
          <Spinner />
        </TableCell>
      </TableRow>
    );
  }
  if (isError) {
    return (
      <TableRow>
        <TableCell className="h-24 text-center text-destructive" colSpan={2}>
          Не удалось загрузить позиции отчётов
        </TableCell>
      </TableRow>
    );
  }
  if (listings?.length === 0) {
    return (
      <TableRow>
        <TableCell className="h-40 text-center" colSpan={2}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Rows3Icon /> В этом фильтре пока нет позиций
          </div>
        </TableCell>
      </TableRow>
    );
  }
  return listings?.map((listing) => (
    <TableRow key={listing.id}>
      <TableCell className="w-80">
        <ReportListingProductCombobox listing={listing} refreshListings={refresh} />
      </TableCell>
      <TableCell className="font-medium">{listing.name}</TableCell>
    </TableRow>
  ));
}
