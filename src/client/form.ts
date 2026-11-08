import type { FormAsyncValidateOrFn, FormOptions, FormValidateOrFn } from '@tanstack/form-core';
import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const DRAFT_STORAGE_PREFIX = 'ceramics:form-draft:';
const DRAFT_WRITE_INTERVAL_MS = 5_000;
const storedDraftSchema = z.object({
  requestTimestampMs: z.number().int().nonnegative(),
  values: z.unknown(),
});

type NoValidator<T> = undefined | FormValidateOrFn<T>;
type NoAsyncValidator<T> = undefined | FormAsyncValidateOrFn<T>;

type DraftFormOptions<T> = FormOptions<
  T,
  NoValidator<T>,
  NoValidator<T>,
  NoAsyncValidator<T>,
  NoValidator<T>,
  NoAsyncValidator<T>,
  NoValidator<T>,
  NoAsyncValidator<T>,
  NoValidator<T>,
  NoAsyncValidator<T>,
  NoAsyncValidator<T>
>;

interface UseDraftFormOptions<T> extends DraftFormOptions<T> {
  readonly defaultValues: T;
  readonly draftKey: string;
  readonly schema: z.ZodType<T>;
}

interface StoredDraft<T> {
  readonly requestTimestampMs: number;
  readonly values: T;
}

function storageKey(draftKey: string): string {
  return `${DRAFT_STORAGE_PREFIX}${draftKey}`;
}

function readStoredDraft<T>(key: string, schema: z.ZodType<T>): StoredDraft<T> | undefined {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return undefined;
    const envelope = storedDraftSchema.safeParse(JSON.parse(serialized));
    if (!envelope.success) return undefined;
    const values = schema.safeParse(envelope.data.values);
    if (!values.success) return undefined;
    return { requestTimestampMs: envelope.data.requestTimestampMs, values: values.data };
  } catch {
    return undefined;
  }
}

function removeStoredDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Browser-local draft recovery must never prevent form use.
  }
}

function writeStoredDraft<T>(key: string, draft: StoredDraft<T>): void {
  try {
    const current = storedDraftSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? 'null'));
    if (current.success && current.data.requestTimestampMs > draft.requestTimestampMs) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Browser-local draft recovery is best effort when storage is unavailable.
  }
}

export function useDraftForm<T>(options: UseDraftFormOptions<T>) {
  const { defaultValues, draftKey, schema, ...formOptions } = options;
  const key = storageKey(draftKey);
  const [initialValues] = useState<T>(() => readStoredDraft(key, schema)?.values ?? defaultValues);
  const pendingWrite = useRef<StoredDraft<T> | undefined>(undefined);
  const lastSerializedValues = useRef(JSON.stringify(initialValues));
  const suppressSerializedValues = useRef<string | undefined>(undefined);
  const submit = formOptions.onSubmit;

  function clearStoredAfterSubmit(): void {
    pendingWrite.current = undefined;
    removeStoredDraft(key);
    suppressSerializedValues.current = JSON.stringify(defaultValues);
  }

  const form = useForm<
    T,
    NoValidator<T>,
    NoValidator<T>,
    NoAsyncValidator<T>,
    NoValidator<T>,
    NoAsyncValidator<T>,
    NoValidator<T>,
    NoAsyncValidator<T>,
    NoValidator<T>,
    NoAsyncValidator<T>,
    NoAsyncValidator<T>,
    never
  >({
    ...formOptions,
    defaultValues: initialValues,
    async onSubmit(context) {
      await submit?.(context);
      clearStoredAfterSubmit();
    },
  });

  useEffect(() => {
    function flush(): void {
      const draft = pendingWrite.current;
      if (draft === undefined) return;
      writeStoredDraft(key, draft);
      if (pendingWrite.current === draft) pendingWrite.current = undefined;
    }

    const subscription = form.store.subscribe(() => {
      const parsed = schema.safeParse(form.state.values);
      if (!parsed.success) return;
      const serialized = JSON.stringify(parsed.data);
      if (serialized === lastSerializedValues.current) return;
      lastSerializedValues.current = serialized;
      if (serialized === suppressSerializedValues.current) {
        suppressSerializedValues.current = undefined;
        return;
      }
      pendingWrite.current = { requestTimestampMs: Date.now(), values: parsed.data };
    });
    const interval = window.setInterval(flush, DRAFT_WRITE_INTERVAL_MS);
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(interval);
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [form, key, schema]);

  function clearDraft(): void {
    pendingWrite.current = undefined;
    removeStoredDraft(key);
    const serializedDefaults = JSON.stringify(defaultValues);
    lastSerializedValues.current = serializedDefaults;
    suppressSerializedValues.current = undefined;
    form.reset(defaultValues);
  }

  return { clearDraft, form };
}
