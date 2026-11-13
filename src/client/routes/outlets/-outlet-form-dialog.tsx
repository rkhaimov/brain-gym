import type { RefObject } from 'react';

import { MaintenanceFormDialog } from '@/client/components/maintenance/maintenance-form-dialog.js';
import type {
  CreateOutletResponse,
  UpdateOutletResponse,
} from '@/shared/gen/ceramics/v1/outlet_pb.js';

import { useRefreshOutletCatalog } from './-outlet-catalog-query.js';

interface OutletFormDialogProps {
  readonly defaultName: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
  readonly submit: (name: string) => Promise<CreateOutletResponse | UpdateOutletResponse>;
  readonly submitLabel: string;
  readonly title: string;
}

export function OutletFormDialog({
  defaultName,
  onOpenChange,
  open,
  returnFocusTo,
  submit,
  submitLabel,
  title,
}: OutletFormDialogProps) {
  const refreshOutletCatalog = useRefreshOutletCatalog();

  return (
    <MaintenanceFormDialog
      defaultValues={{ name: defaultName }}
      description="Название сохраняется точно как введено"
      namePlaceholder={defaultName.length === 0 ? 'Например, Гончарная лавка' : undefined}
      onOpenChange={onOpenChange}
      open={open}
      refresh={refreshOutletCatalog}
      requiredNameMessage="Введите название магазина"
      returnFocusTo={returnFocusTo}
      submit={async ({ name }) => {
        const response = await submit(name);
        switch (response.result.case) {
          case 'failure':
            return {
              case: 'failure',
              field: 'name',
              message: response.result.value.message,
            };
          case 'success':
            return { case: 'success' };
          default:
            throw new Error('Outlet mutation response is missing a result');
        }
      }}
      submitLabel={submitLabel}
      title={title}
      unexpectedErrorMessage="Не удалось сохранить магазин. Попробуйте ещё раз."
    />
  );
}
