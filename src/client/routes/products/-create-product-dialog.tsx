import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { useRefreshProductCatalog } from '@/client/components/products/product-catalog-query.js';
import { ProductFormDialog } from '@/client/components/products/product-form-dialog.js';
import { createProduct } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';

interface CreateProductDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function CreateProductDialog(props: CreateProductDialogProps) {
  const mutation = useMutation(createProduct);
  const refreshProductCatalog = useRefreshProductCatalog();
  return (
    <ProductFormDialog
      {...props}
      defaultName=""
      refresh={refreshProductCatalog}
      submit={(name) => mutation.mutateAsync({ name })}
      submitLabel="Создать"
      title="Новая штучка"
    />
  );
}
