import { createQueryOptions, useTransport } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';

import { listOutlets } from '@/shared/gen/ceramics/v1/outlet-OutletService_connectquery.js';

export function useRefreshOutletCatalog(): () => Promise<void> {
  const queryClient = useQueryClient();
  const transport = useTransport();

  return async () => {
    await Promise.all(
      [false, true].map((archived) =>
        queryClient.invalidateQueries({
          queryKey: createQueryOptions(listOutlets, { archived }, { transport }).queryKey,
        }),
      ),
    );
  };
}
