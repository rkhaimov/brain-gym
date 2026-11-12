import { useMutation, useQuery } from '@connectrpc/connect-query';
import {
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CircleIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { useRefreshProductCatalog } from '@/client/components/products/product-catalog-query.js';
import { ProductFormDialog } from '@/client/components/products/product-form-dialog.js';
import { Button } from '@/client/components/ui/button.js';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/client/components/ui/command.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/client/components/ui/popover.js';
import { listProducts } from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import {
  createProductAndMapReportListing,
  setReportListingProduct,
} from '@/shared/gen/ceramics/v1/report_listing-ReportListingService_connectquery.js';
import type { ReportListing } from '@/shared/gen/ceramics/v1/report_listing_pb.js';

import { reportListingProductComboboxContract } from './report-listing-product-combobox-test-tags.js';

interface ReportListingProductComboboxProps {
  readonly listing: ReportListing;
  readonly refreshListings: () => Promise<unknown>;
}

function ReportListingProductComboboxImplementation({
  listing,
  refreshListings,
}: ReportListingProductComboboxProps) {
  const products = useQuery(listProducts, { archived: false });
  const setProduct = useMutation(setReportListingProduct);
  const createAndMap = useMutation(createProductAndMapReportListing);
  const refreshProductCatalog = useRefreshProductCatalog();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const createdProduct = useRef(false);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const pending = setProduct.isPending;
  const normalizedSearch = search.toLocaleLowerCase('ru-RU');
  const filteredProducts =
    products.data?.products.filter((product) =>
      product.name.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
    ) ?? [];

  async function selectProduct(productId?: string): Promise<void> {
    setError(undefined);
    const response = await setProduct.mutateAsync({ productId, reportListingId: listing.id });
    if (response.result.case !== 'success') {
      setError(
        response.result.case === 'failure' ? response.result.value : 'Не удалось сопоставить',
      );
      return;
    }
    await refreshListings();
    setOpen(false);
  }

  return (
    <>
      <Popover
        onOpenChange={(nextOpen) => {
          if (pending) return;
          setOpen(nextOpen);
          if (!nextOpen) {
            setError(undefined);
            setSearch('');
          }
        }}
        open={open}
      >
        <PopoverTrigger asChild>
          <Button
            aria-label={
              listing.product === undefined
                ? `Сопоставить ${listing.name}`
                : `Изменить сопоставление ${listing.name}`
            }
            className="w-full min-w-52 justify-between font-normal"
            ref={trigger}
            role="combobox"
            variant="outline"
          >
            <span className="flex min-w-0 items-center gap-2">
              {listing.product === undefined ? (
                <CircleIcon className="fill-warning text-warning" />
              ) : (
                <CircleCheckIcon className="text-success" />
              )}
              <span className="truncate">
                {listing.product === undefined ? 'Сопоставить' : listing.product.name}
              </span>
              {listing.product?.archived === true ? (
                <span className="text-xs text-muted-foreground">Архив</span>
              ) : null}
            </span>
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-80 p-0"
          onCloseAutoFocus={(event) => {
            if (createOpen) event.preventDefault();
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput onValueChange={setSearch} placeholder="Поиск штучки…" value={search} />
            <CommandList>
              {products.isPending ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Загружаем…</div>
              ) : filteredProducts.length === 0 ? (
                <CommandEmpty>Ничего не найдено</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      disabled={pending}
                      key={product.id}
                      onSelect={() => void selectProduct(product.id)}
                      value={product.id}
                    >
                      <CheckIcon
                        className={listing.product?.id === product.id ? 'opacity-100' : 'opacity-0'}
                      />
                      {product.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            {error === undefined ? null : (
              <p className="border-t px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <CommandSeparator />
            <div className="p-1">
              {listing.product === undefined ? null : (
                <Button
                  className="w-full justify-start"
                  disabled={pending}
                  onClick={() => void selectProduct()}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <XIcon /> Убрать сопоставление
                </Button>
              )}
              <Button
                className="w-full justify-start"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <PlusIcon /> Создать штучку
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {createOpen ? (
        <ProductFormDialog
          defaultName=""
          onOpenChange={(nextOpen) => {
            setCreateOpen(nextOpen);
            if (!nextOpen && createdProduct.current) {
              createdProduct.current = false;
              window.setTimeout(() => void refreshListings(), 0);
            }
          }}
          open
          refresh={refreshProductCatalog}
          returnFocusTo={trigger}
          submit={async (name) => {
            const response = await createAndMap.mutateAsync({
              name,
              reportListingId: listing.id,
            });
            createdProduct.current = response.result.case === 'success';
            return response;
          }}
          submitLabel="Создать и сопоставить"
          title="Новая штучка"
        />
      ) : null}
    </>
  );
}

export const ReportListingProductCombobox = Object.assign(
  ReportListingProductComboboxImplementation,
  { testTag: reportListingProductComboboxContract.testTag },
);
