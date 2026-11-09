import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { updateOutlet } from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';
import type { Outlet } from '@/shared/gen/ceramics/v1/outlet_pb.js';

import { OutletFormDialog } from './-outlet-form-dialog.js';

interface EditOutletDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly outlet: Outlet;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function EditOutletDialog({ outlet, ...props }: EditOutletDialogProps) {
  const mutation = useMutation(updateOutlet);
  return (
    <OutletFormDialog
      {...props}
      defaultCode={outlet.code ?? ''}
      defaultName={outlet.name}
      open
      submit={(name, code) =>
        mutation.mutateAsync({
          id: outlet.id,
          name,
          ...(code === undefined ? {} : { code }),
        })
      }
      submitLabel="Сохранить"
      title="Изменить торговую точку"
    />
  );
}
