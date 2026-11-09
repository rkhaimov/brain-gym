import type { RefObject } from 'react';

import { MaintenanceFormDialog } from '@/client/components/maintenance/maintenance-form-dialog.js';
import type {
  CreateProductResponse,
  RenameProductResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';

import { useRefreshProductCatalog } from './-product-catalog-query.js';

interface ProductFormDialogProps {
  readonly defaultName: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
  readonly submit: (name: string) => Promise<CreateProductResponse | RenameProductResponse>;
  readonly submitLabel: string;
  readonly title: string;
}

export function ProductFormDialog({
  defaultName,
  onOpenChange,
  open,
  returnFocusTo,
  submit,
  submitLabel,
  title,
}: ProductFormDialogProps) {
  const refreshProductCatalog = useRefreshProductCatalog();

  return (
    <MaintenanceFormDialog
      defaultValues={{ code: '', name: defaultName }}
      description="Название сохраняется точно как введено"
      namePlaceholder={defaultName.length === 0 ? 'Например, Кольцо' : undefined}
      onOpenChange={onOpenChange}
      open={open}
      refresh={refreshProductCatalog}
      requiredNameMessage="Введите название штучки"
      returnFocusTo={returnFocusTo}
      submit={async ({ name }) => {
        const response = await submit(name);
        switch (response.result.case) {
          case 'failure':
            return { case: 'failure', field: 'name', message: response.result.value };
          case 'success':
            return { case: 'success' };
          default:
            throw new Error('Product mutation response is missing a result');
        }
      }}
      submitLabel={submitLabel}
      title={title}
      unexpectedErrorMessage="Не удалось сохранить штучку. Попробуйте ещё раз."
    />
  );
}
