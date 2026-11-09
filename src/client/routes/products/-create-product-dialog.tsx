import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { createProduct } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';

import { ProductFormDialog } from './-product-form-dialog.js';

interface CreateProductDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function CreateProductDialog(props: CreateProductDialogProps) {
  const mutation = useMutation(createProduct);
  return (
    <ProductFormDialog
      {...props}
      defaultName=""
      submit={(name) => mutation.mutateAsync({ name })}
      submitLabel="Создать"
      title="Новая штучка"
    />
  );
}
