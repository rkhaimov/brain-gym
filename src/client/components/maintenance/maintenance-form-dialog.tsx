import { useForm } from '@tanstack/react-form';
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

const fieldErrorsSchema = z.array(z.object({ message: z.string() }));
const submissionErrorSchema = z.string().optional();

export interface MaintenanceFormValues {
  readonly code: string;
  readonly name: string;
}

export type MaintenanceFormResult =
  | Readonly<{ case: 'success' }>
  | Readonly<{
      case: 'failure';
      field: 'code' | 'name';
      message: string;
    }>;

interface MaintenanceFormDialogProps {
  readonly codeField?:
    | Readonly<{
        label: string;
        placeholder: string;
      }>
    | undefined;
  readonly defaultValues: MaintenanceFormValues;
  readonly description: string;
  readonly namePlaceholder?: string | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly refresh: () => Promise<void>;
  readonly requiredNameMessage: string;
  readonly returnFocusTo: RefObject<HTMLButtonElement | null>;
  readonly submit: (values: MaintenanceFormValues) => Promise<MaintenanceFormResult>;
  readonly submitLabel: string;
  readonly title: string;
  readonly unexpectedErrorMessage: string;
}

export function MaintenanceFormDialog({
  codeField,
  defaultValues,
  description,
  namePlaceholder,
  onOpenChange,
  open,
  refresh,
  requiredNameMessage,
  returnFocusTo,
  submit,
  submitLabel,
  title,
  unexpectedErrorMessage,
}: MaintenanceFormDialogProps) {
  const form = useForm({
    defaultValues,
    async onSubmit({ formApi, value }) {
      function rejectUnexpected(error: unknown): never {
        console.error('Unexpected maintenance form failure', error);
        formApi.setErrorMap({
          onSubmit: {
            fields: {},
            form: unexpectedErrorMessage,
          },
        });
        throw error;
      }

      let response;
      try {
        response = await submit(value);
      } catch (error) {
        rejectUnexpected(error);
      }

      if (response.case === 'failure') {
        formApi.setErrorMap({
          onSubmit: {
            fields: { [response.field]: [{ message: response.message }] },
          },
        });
        throw new Error(response.message);
      }

      try {
        await refresh();
      } catch (error) {
        rejectUnexpected(error);
      }
    },
  });

  function changeOpen(nextOpen: boolean): void {
    if (!nextOpen && form.state.isSubmitting) return;
    onOpenChange(nextOpen);
  }

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    event.stopPropagation();
    form
      .handleSubmit()
      .then(() => {
        if (form.state.isSubmitSuccessful) onOpenChange(false);
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
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" noValidate onSubmit={submitForm}>
              <form.Field
                name="name"
                validators={{ onSubmit: z.string().min(1, requiredNameMessage) }}
              >
                {(field) => {
                  const fieldErrors = fieldErrorsSchema.parse(field.state.meta.errors);
                  const fieldError = fieldErrors[0];
                  return (
                    <Field data-invalid={fieldError !== undefined}>
                      <FieldLabel htmlFor="maintenance-name">Название</FieldLabel>
                      <Input
                        aria-describedby={
                          fieldError === undefined ? undefined : 'maintenance-name-error'
                        }
                        aria-invalid={fieldError === undefined ? undefined : true}
                        autoComplete="off"
                        autoFocus
                        disabled={isSubmitting}
                        id="maintenance-name"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder={namePlaceholder}
                        value={field.state.value}
                      />
                      <FieldError errors={fieldErrors} id="maintenance-name-error" />
                    </Field>
                  );
                }}
              </form.Field>

              {codeField === undefined ? null : (
                <form.Field name="code">
                  {(field) => {
                    const fieldErrors = fieldErrorsSchema.parse(field.state.meta.errors);
                    const fieldError = fieldErrors[0];
                    return (
                      <Field data-invalid={fieldError !== undefined}>
                        <FieldLabel htmlFor="maintenance-code">{codeField.label}</FieldLabel>
                        <Input
                          aria-describedby={
                            fieldError === undefined ? undefined : 'maintenance-code-error'
                          }
                          aria-invalid={fieldError === undefined ? undefined : true}
                          autoComplete="off"
                          disabled={isSubmitting}
                          id="maintenance-code"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder={codeField.placeholder}
                          value={field.state.value}
                        />
                        <FieldError errors={fieldErrors} id="maintenance-code-error" />
                      </Field>
                    );
                  }}
                </form.Field>
              )}

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
