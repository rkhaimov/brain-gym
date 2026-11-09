import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { createOutlet } from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';

import { OutletFormDialog } from './-outlet-form-dialog.js';

interface CreateOutletDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function CreateOutletDialog(props: CreateOutletDialogProps) {
  const mutation = useMutation(createOutlet);
  return (
    <OutletFormDialog
      {...props}
      defaultCode=""
      defaultName=""
      submit={(name, code) =>
        mutation.mutateAsync({ name, ...(code === undefined ? {} : { code }) })
      }
      submitLabel="Создать"
      title="Новая торговая точка"
    />
  );
}
