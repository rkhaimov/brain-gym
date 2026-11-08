import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { renameProduct } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';

import { ProductFormDialog } from './-product-form-dialog.js';

interface EditProductDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly product: Product;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function EditProductDialog({ product, ...props }: EditProductDialogProps) {
  const mutation = useMutation(renameProduct);
  return (
    <ProductFormDialog
      {...props}
      defaultName={product.name}
      draftKey={`product:edit:${product.id}`}
      open
      submit={(name) => mutation.mutateAsync({ id: product.id, name })}
      submitLabel="Сохранить"
      title="Переименовать штучку"
    />
  );
}
