import { createQueryOptions, useMutation, useTransport } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent, RefObject } from 'react';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/client/components/ui/alert.js';
import { Button } from '@/client/components/ui/button.js';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog.js';
import { Field, FieldError, FieldLabel } from '@/client/components/ui/field.js';
import { Input } from '@/client/components/ui/input.js';
import { useDraftForm } from '@/client/form.js';
import {
  listProducts,
  renameProduct,
} from '@/shared/gen/ceramics/v1/product-ProductService_connectquery.js';
import type { Product } from '@/shared/gen/ceramics/v1/product_pb.js';

const fieldErrorsSchema = z.array(z.object({ message: z.string() }));
const submissionErrorSchema = z.string().optional();
const productDraftSchema = z.object({ name: z.string() });

interface EditProductDialogProps {
  readonly onOpenChange: (open: boolean) => void;
  readonly product: Product;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function EditProductDialog({
  onOpenChange,
  product,
  returnFocusTo,
}: EditProductDialogProps) {
  const renameProductMutation = useMutation(renameProduct);
  const queryClient = useQueryClient();
  const transport = useTransport();
  const { clearDraft, form } = useDraftForm({
    defaultValues: { name: product.name },
    draftKey: `product:edit:${product.id}`,
    async onSubmit({ formApi, value }) {
      function rejectUnexpected(error: unknown): never {
        console.error('Unexpected Product rename failure', error);
        formApi.setErrorMap({
          onSubmit: {
            fields: {},
            form: 'Не удалось сохранить штучку. Попробуйте ещё раз.',
          },
        });
        throw error;
      }

      let response;
      try {
        response = await renameProductMutation.mutateAsync({ id: product.id, name: value.name });
      } catch (error) {
        rejectUnexpected(error);
      }

      switch (response.result.case) {
        case 'failure':
          formApi.setErrorMap({
            onSubmit: { fields: { name: [{ message: response.result.value }] } },
          });
          throw new Error(response.result.value);
        case 'success':
          try {
            await Promise.all(
              [false, true].map((archived) =>
                queryClient.invalidateQueries({
                  queryKey: createQueryOptions(listProducts, { archived }, { transport }).queryKey,
                }),
              ),
            );
          } catch (error) {
            rejectUnexpected(error);
          }
          onOpenChange(false);
          return;
        default:
          rejectUnexpected(new Error('RenameProduct response is missing a result'));
      }
    },
    schema: productDraftSchema,
  });

  function changeOpen(nextOpen: boolean): void {
    if (!nextOpen && form.state.isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
  }

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit().catch(() => undefined);
  }

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Dialog onOpenChange={changeOpen} open>
          <DialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              returnFocusTo.current?.focus();
            }}
            onEscapeKeyDown={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Переименовать штучку</DialogTitle>
              <DialogDescription>Название сохраняется точно как введено</DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" noValidate onSubmit={submitForm}>
              <form.Field
                name="name"
                validators={{ onSubmit: z.string().min(1, 'Введите название штучки') }}
              >
                {(field) => {
                  const fieldErrors = fieldErrorsSchema.parse(field.state.meta.errors);
                  const fieldError = fieldErrors[0];
                  return (
                    <Field data-invalid={fieldError !== undefined}>
                      <FieldLabel htmlFor={`edit-${field.name}`}>Название</FieldLabel>
                      <Input
                        aria-describedby={
                          fieldError === undefined ? undefined : `edit-${field.name}-error`
                        }
                        aria-invalid={fieldError === undefined ? undefined : true}
                        autoComplete="off"
                        autoFocus
                        disabled={isSubmitting}
                        id={`edit-${field.name}`}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        value={field.state.value}
                      />
                      <FieldError errors={fieldErrors} id={`edit-${field.name}-error`} />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                {(submissionError) => {
                  const error = submissionErrorSchema.parse(submissionError);
                  return error === undefined ? null : (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  );
                }}
              </form.Subscribe>

              <DialogFooter>
                <Button disabled={isSubmitting} onClick={clearDraft} type="button" variant="ghost">
                  Очистить
                </Button>
                <DialogClose asChild>
                  <Button disabled={isSubmitting} type="button" variant="outline">
                    Отмена
                  </Button>
                </DialogClose>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </form.Subscribe>
  );
}
