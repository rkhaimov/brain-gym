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
import { useDraftForm } from '@/client/lib/form.js';
import type {
  CreateProductResponse,
  RenameProductResponse,
} from '@/shared/gen/ceramics/v1/product_pb.js';

import { useRefreshProductCatalog } from './-product-catalog-query.js';

const fieldErrorsSchema = z.array(z.object({ message: z.string() }));
const submissionErrorSchema = z.string().optional();
const productDraftSchema = z.object({ name: z.string() });

interface ProductFormDialogProps {
  readonly defaultName: string;
  readonly draftKey: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
  readonly submit: (name: string) => Promise<CreateProductResponse | RenameProductResponse>;
  readonly submitLabel: string;
  readonly title: string;
}

export function ProductFormDialog({
  defaultName,
  draftKey,
  onOpenChange,
  open,
  returnFocusTo,
  submit,
  submitLabel,
  title,
}: ProductFormDialogProps) {
  const refreshProductCatalog = useRefreshProductCatalog();
  const { clearDraft, form, handleSubmit } = useDraftForm({
    defaultValues: { name: defaultName },
    draftKey,
    async onSubmit({ formApi, value }) {
      function rejectUnexpected(error: unknown): never {
        console.error('Unexpected Product form failure', error);
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
        response = await submit(value.name);
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
            await refreshProductCatalog();
          } catch (error) {
            rejectUnexpected(error);
          }
          return;
        default:
          rejectUnexpected(new Error('Product mutation response is missing a result'));
      }
    },
    schema: productDraftSchema,
  });

  function changeOpen(nextOpen: boolean): void {
    if (!nextOpen && form.state.isSubmitting) return;
    onOpenChange(nextOpen);
  }

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    event.stopPropagation();
    handleSubmit()
      .then((submitted) => {
        if (submitted) onOpenChange(false);
      })
      .catch(() => undefined);
  }

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Dialog onOpenChange={changeOpen} open={open}>
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
              <DialogTitle>{title}</DialogTitle>
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
                      <FieldLabel htmlFor={`${draftKey}-${field.name}`}>Название</FieldLabel>
                      <Input
                        aria-describedby={
                          fieldError === undefined ? undefined : `${draftKey}-${field.name}-error`
                        }
                        aria-invalid={fieldError === undefined ? undefined : true}
                        autoComplete="off"
                        autoFocus
                        disabled={isSubmitting}
                        id={`${draftKey}-${field.name}`}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder={defaultName.length === 0 ? 'Например, Кольцо' : undefined}
                        value={field.state.value}
                      />
                      <FieldError errors={fieldErrors} id={`${draftKey}-${field.name}-error`} />
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
                  {isSubmitting ? 'Сохраняем…' : submitLabel}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </form.Subscribe>
  );
}
