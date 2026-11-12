import { useMutation } from '@connectrpc/connect-query';
import type { RefObject } from 'react';

import { useRefreshProductCatalog } from '@/client/components/products/product-catalog-query.js';
import { ProductFormDialog } from '@/client/components/products/product-form-dialog.js';
import { renameProduct } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';

interface EditProductDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly product: Product;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function EditProductDialog({ product, ...props }: EditProductDialogProps) {
  const mutation = useMutation(renameProduct);
  const refreshProductCatalog = useRefreshProductCatalog();
  return (
    <ProductFormDialog
      {...props}
      defaultName={product.name}
      open
      refresh={refreshProductCatalog}
      submit={(name) => mutation.mutateAsync({ id: product.id, name })}
      submitLabel="Сохранить"
      title="Переименовать штучку"
    />
  );
}
