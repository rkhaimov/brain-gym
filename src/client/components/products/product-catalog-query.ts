import { createQueryOptions, useTransport } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';

import { listProducts } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';

export function useRefreshProductCatalog(): () => Promise<void> {
  const queryClient = useQueryClient();
  const transport = useTransport();

  return async () => {
    await Promise.all(
      [false, true].map((archived) =>
        queryClient.invalidateQueries({
          queryKey: createQueryOptions(listProducts, { archived }, { transport }).queryKey,
        }),
      ),
    );
  };
}
