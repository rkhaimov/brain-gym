import type { RefObject } from 'react';

import { MaintenanceFormDialog } from '@/client/components/maintenance/maintenance-form-dialog.js';
import type {
  CreateOutletResponse,
  UpdateOutletResponse,
} from '@/shared/gen/ceramics/v1/outlet_pb.js';
import { OutletMutationFailureField } from '@/shared/gen/ceramics/v1/outlet_pb.js';

import { useRefreshOutletCatalog } from './-outlet-catalog-query.js';

interface OutletFormDialogProps {
  readonly defaultCode: string;
  readonly defaultName: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
  readonly submit: (
    name: string,
    code: string | undefined,
  ) => Promise<CreateOutletResponse | UpdateOutletResponse>;
  readonly submitLabel: string;
  readonly title: string;
}

export function OutletFormDialog({
  defaultCode,
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
      codeField={{ label: 'Код магазина', placeholder: 'Необязательно' }}
      defaultValues={{ code: defaultCode, name: defaultName }}
      description="Название и код сохраняются точно как введены"
      namePlaceholder={defaultName.length === 0 ? 'Например, Гончарная лавка' : undefined}
      onOpenChange={onOpenChange}
      open={open}
      refresh={refreshOutletCatalog}
      requiredNameMessage="Введите название магазина"
      returnFocusTo={returnFocusTo}
      submit={async ({ code, name }) => {
        const response = await submit(name, code.length === 0 ? undefined : code);
        switch (response.result.case) {
          case 'failure':
            return {
              case: 'failure',
              field:
                response.result.value.field === OutletMutationFailureField.CODE ? 'code' : 'name',
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
