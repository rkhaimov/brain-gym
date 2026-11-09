import { Archive, ArchiveRestore, Pencil, Plus } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Badge } from '@/client/components/ui/badge.js';
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

import { maintenanceCatalogContract } from './maintenance-test-tags.js';

export interface MaintenanceEntity {
  readonly archived: boolean;
  readonly id: string;
  readonly name: string;
}

export interface MaintenanceCatalogCopy {
  readonly archiveAction: (name: string) => string;
  readonly archivedEmptyDescription: string;
  readonly archivedEmptyTitle: string;
  readonly countLabel: (count: number) => string;
  readonly createAction: string;
  readonly createFirstAction: string;
  readonly editAction: (name: string) => string;
  readonly emptyDescription: string;
  readonly emptyTitle: string;
  readonly editButton: string;
  readonly loadErrorDescription: string;
  readonly loadErrorTitle: string;
  readonly loading: string;
  readonly regionLabel: string;
  readonly restoreAction: (name: string) => string;
  readonly tableLabel: string;
}

export interface MaintenanceCatalogState<Entity extends MaintenanceEntity> {
  readonly entities: readonly Entity[] | undefined;
  readonly isError: boolean;
  readonly isPending: boolean;
  refetch(): Promise<unknown>;
}

interface MaintenanceCatalogActiveAction<Entity extends MaintenanceEntity> {
  readonly icon: ReactNode;
  readonly label: (entity: Entity) => string;
  readonly text: string;
  readonly onAction: (event: MouseEvent<HTMLButtonElement>, entity: Entity) => void;
}

interface MaintenanceCatalogProps<Entity extends MaintenanceEntity> {
  readonly activeEntityAction?: MaintenanceCatalogActiveAction<Entity> | undefined;
  readonly archivePending: boolean;
  readonly catalog: MaintenanceCatalogState<Entity>;
  readonly copy: MaintenanceCatalogCopy;
  readonly detailColumn?:
    | Readonly<{
        header: string;
        render(entity: Entity): ReactNode;
      }>
    | undefined;
  readonly emptyIcon: ReactNode;
  readonly onCreate: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly onEdit: (event: MouseEvent<HTMLButtonElement>, entity: Entity) => void;
  readonly onSetArchived: (entity: Entity, archived: boolean) => void;
  readonly onShowArchivedChange: (archived: boolean) => void;
  readonly showArchived: boolean;
}

function MaintenanceCatalogImplementation<Entity extends MaintenanceEntity>({
  activeEntityAction,
  archivePending,
  catalog,
  copy,
  detailColumn,
  emptyIcon,
  onCreate,
  onEdit,
  onSetArchived,
  onShowArchivedChange,
  showArchived,
}: MaintenanceCatalogProps<Entity>) {
  const columnCount = detailColumn === undefined ? 2 : 3;

  return (
    <section aria-label={copy.regionLabel} className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              aria-pressed={!showArchived}
              onClick={() => onShowArchivedChange(false)}
              size="sm"
              variant={showArchived ? 'outline' : 'secondary'}
            >
              Активные
            </Button>
            <Button
              aria-pressed={showArchived}
              onClick={() => onShowArchivedChange(true)}
              size="sm"
              variant={showArchived ? 'secondary' : 'outline'}
            >
              Архив
            </Button>
          </div>
          {catalog.entities === undefined ? null : (
            <Badge aria-label={copy.countLabel(catalog.entities.length)} variant="secondary">
              {catalog.entities.length}
            </Badge>
          )}
        </div>
        {showArchived ? null : (
          <Button onClick={onCreate} size="sm">
            <Plus />
            {copy.createAction}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table aria-label={copy.tableLabel}>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                <TableHead>Название</TableHead>
                {detailColumn === undefined ? null : <TableHead>{detailColumn.header}</TableHead>}
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.isPending ? (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={columnCount}>
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner aria-label={copy.loading} />
                      {copy.loading}…
                    </span>
                  </TableCell>
                </TableRow>
              ) : catalog.isError ? (
                <TableRow>
                  <TableCell className="h-32" colSpan={columnCount}>
                    <div className="mx-auto flex max-w-xl flex-col items-start gap-3">
                      <Alert variant="destructive">
                        <AlertTitle>{copy.loadErrorTitle}</AlertTitle>
                        <AlertDescription>{copy.loadErrorDescription}</AlertDescription>
                      </Alert>
                      <Button onClick={() => catalog.refetch()} size="sm" variant="outline">
                        Попробовать снова
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : catalog.entities?.length === 0 ? (
                <TableRow>
                  <TableCell className="h-48 text-center" colSpan={columnCount}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        {emptyIcon}
                      </div>
                      <div>
                        <p className="font-medium">
                          {showArchived ? copy.archivedEmptyTitle : copy.emptyTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {showArchived ? copy.archivedEmptyDescription : copy.emptyDescription}
                        </p>
                      </div>
                      {showArchived ? null : (
                        <Button onClick={onCreate} size="sm" variant="outline">
                          <Plus />
                          {copy.createFirstAction}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                catalog.entities?.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>{entity.name}</TableCell>
                    {detailColumn === undefined ? null : (
                      <TableCell>{detailColumn.render(entity)}</TableCell>
                    )}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {showArchived || activeEntityAction === undefined ? null : (
                          <Button
                            aria-label={activeEntityAction.label(entity)}
                            onClick={(event) => activeEntityAction.onAction(event, entity)}
                            size="sm"
                            variant="ghost"
                          >
                            {activeEntityAction.icon}
                            {activeEntityAction.text}
                          </Button>
                        )}
                        <Button
                          aria-label={copy.editAction(entity.name)}
                          onClick={(event) => onEdit(event, entity)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil />
                          {copy.editButton}
                        </Button>
                        <Button
                          aria-label={
                            showArchived
                              ? copy.restoreAction(entity.name)
                              : copy.archiveAction(entity.name)
                          }
                          disabled={archivePending}
                          onClick={() => onSetArchived(entity, !showArchived)}
                          size="sm"
                          variant="ghost"
                        >
                          {showArchived ? <ArchiveRestore /> : <Archive />}
                          {showArchived ? 'Восстановить' : 'В архив'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export const MaintenanceCatalog = Object.assign(MaintenanceCatalogImplementation, {
  testTag: maintenanceCatalogContract.testTag,
});
