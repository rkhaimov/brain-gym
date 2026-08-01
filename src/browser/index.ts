import { schemas } from '../schemas';
import type { Schema } from '../types';

type StoredRow = {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
};

type FieldKind = 'datetime' | 'number' | 'string' | 'json';

type FieldDefinition = {
  name: string;
  description?: string;
  kind: FieldKind;
  optional: boolean;
  integer: boolean;
};

type ZodLike = {
  description?: string;
  _zod?: {
    def?: {
      type?: string;
      format?: string;
      innerType?: ZodLike;
    };
  };
};

type SchemaState = {
  schema: Schema;
  fields: FieldDefinition[];
  rows: StoredRow[];
  selectedRow: StoredRow | undefined;
  container: HTMLElement;
  form: HTMLFormElement;
  tableSummary: HTMLElement;
  status: HTMLElement;
  tbody: HTMLTableSectionElement;
  submitButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  modeLabel: HTMLElement;
};

const appRoot = getAppRoot();

const states = schemas.map((schema) => createSchemaState(schema));

renderApp();
void Promise.all(states.map((state) => refreshRows(state)));

function renderApp(): void {
  document.title = 'Brain Gym Records';

  const shell = document.createElement('main');
  shell.className = 'shell';

  const header = document.createElement('header');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <p class="eyebrow">Schema records</p>
      <h1>Brain Gym Records</h1>
    </div>
    <div class="schema-count">${schemas.length} schema${schemas.length === 1 ? '' : 's'}</div>
  `;

  const layout = document.createElement('div');
  layout.className = 'schema-layout';

  for (const state of states) {
    layout.append(state.container);
  }

  shell.append(header, layout);
  appRoot.replaceChildren(shell);
}

function getAppRoot(): HTMLDivElement {
  const element = document.querySelector<HTMLDivElement>('#app');

  if (element === null) {
    throw new Error('Missing #app root element.');
  }

  return element;
}

function createSchemaState(schema: Schema): SchemaState {
  const fields = getFields(schema);
  const section = document.createElement('section');
  section.className = 'schema-panel';

  const title = document.createElement('div');
  title.className = 'schema-title';
  title.innerHTML = `
    <div>
      <p class="eyebrow">${schema.name}</p>
      <h2>${toTitle(schema.name)}</h2>
      <p class="description">${escapeHtml(schema.schema.description ?? 'Manage records for this schema.')}</p>
    </div>
  `;

  const table = document.createElement('table');
  table.className = 'records-table';
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      ${fields.map((field) => `<th>${escapeHtml(toTitle(field.name))}</th>`).join('')}
      <th>Created</th>
      <th>Actions</th>
    </tr>
  `;
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';
  tableWrap.append(table);

  const tableSummary = document.createElement('p');
  tableSummary.className = 'table-summary';

  const form = document.createElement('form');
  form.className = 'record-form';

  const modeLabel = document.createElement('div');
  modeLabel.className = 'mode-label';
  modeLabel.textContent = 'Create record';

  const grid = document.createElement('div');
  grid.className = 'field-grid';

  for (const field of fields) {
    grid.append(createFieldControl(field));
  }

  const status = document.createElement('p');
  status.className = 'status';
  status.setAttribute('role', 'status');

  const submitButton = document.createElement('button');
  submitButton.className = 'primary-button';
  submitButton.type = 'submit';
  submitButton.textContent = 'Create';

  const resetButton = document.createElement('button');
  resetButton.className = 'secondary-button';
  resetButton.type = 'button';
  resetButton.textContent = 'Clear';

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  actions.append(submitButton, resetButton);

  form.append(modeLabel, grid, actions, status);
  section.append(title, tableWrap, tableSummary, form);

  const state: SchemaState = {
    schema,
    fields,
    rows: [],
    selectedRow: undefined,
    container: section,
    form,
    tableSummary,
    status,
    tbody,
    submitButton,
    resetButton,
    modeLabel
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveRecord(state);
  });

  resetButton.addEventListener('click', () => clearSelection(state));

  setCreateModeDefaults(state);

  return state;
}

function createFieldControl(field: FieldDefinition): HTMLElement {
  const label = document.createElement('label');
  label.className = 'field';

  const labelText = document.createElement('span');
  labelText.className = 'field-label';
  labelText.textContent = toTitle(field.name);

  const input = document.createElement(field.kind === 'json' ? 'textarea' : 'input');
  input.className = 'field-input';
  input.name = field.name;
  input.required = !field.optional;

  if (input instanceof HTMLInputElement) {
    input.type = field.kind === 'datetime' ? 'datetime-local' : field.kind === 'number' ? 'number' : 'text';
    input.step = field.kind === 'number' && !field.integer ? 'any' : '1';
  }

  if (input instanceof HTMLTextAreaElement) {
    input.rows = 3;
  }

  const hint = document.createElement('span');
  hint.className = 'field-hint';
  hint.textContent = field.description ?? field.kind;

  label.append(labelText, input, hint);
  return label;
}

async function refreshRows(state: SchemaState): Promise<void> {
  setStatus(state, 'Loading records...');
  const rows = await request<StoredRow[]>(state.schema.name);
  state.rows = rows;
  renderRows(state);
  setStatus(state, `${rows.length} record${rows.length === 1 ? '' : 's'} loaded.`);
}

function renderRows(state: SchemaState): void {
  const visibleRows = state.rows.slice(0, 3);
  const visibleCount = visibleRows.length;
  const totalCount = state.rows.length;
  state.tableSummary.textContent = totalCount === 0
    ? '0 records total.'
    : `Showing ${visibleCount} of ${totalCount} record${totalCount === 1 ? '' : 's'} total.`;

  if (state.rows.length === 0) {
    const colSpan = state.fields.length + 2;
    state.tbody.innerHTML = `<tr><td colspan="${colSpan}" class="empty-cell">No records yet.</td></tr>`;
    return;
  }

  state.tbody.replaceChildren(
    ...visibleRows.map((row) => {
      const tr = document.createElement('tr');
      if (state.selectedRow?.id === row.id) {
        tr.className = 'selected-row';
      }

      for (const field of state.fields) {
        const td = document.createElement('td');
        td.textContent = formatValue(row.data[field.name]);
        tr.append(td);
      }

      const createdAt = document.createElement('td');
      createdAt.textContent = formatDate(row.createdAt);
      tr.append(createdAt);

      const actions = document.createElement('td');
      actions.className = 'row-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'ghost-button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => selectRow(state, row));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger-button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => void deleteRecord(state, row));

      actions.append(editButton, deleteButton);
      tr.append(actions);

      return tr;
    })
  );
}

async function saveRecord(state: SchemaState): Promise<void> {
  try {
    const payload = readPayload(state);
    const selectedId = state.selectedRow?.id;

    setFormDisabled(state, true);

    if (selectedId === undefined) {
      await request<StoredRow>(state.schema.name, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await refreshRows(state);
      setStatus(state, 'Record created.');
    } else {
      await request<null>(`${state.schema.name}/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await refreshRows(state);
      setStatus(state, 'Record updated.');
    }

    clearSelection(state);
  } catch (error) {
    setStatus(state, getErrorMessage(error), true);
  } finally {
    setFormDisabled(state, false);
  }
}

async function deleteRecord(state: SchemaState, row: StoredRow): Promise<void> {
  const confirmed = window.confirm(`Delete this ${toTitle(state.schema.name)} record?`);

  if (!confirmed) {
    setStatus(state, 'Delete canceled.');
    return;
  }

  setFormDisabled(state, true);

  try {
    await request<null>(`${state.schema.name}/${row.id}`, { method: 'DELETE' });
    if (state.selectedRow?.id === row.id) {
      clearSelection(state);
    }
    await refreshRows(state);
    setStatus(state, 'Record deleted.');
  } catch (error) {
    setStatus(state, getErrorMessage(error), true);
  } finally {
    setFormDisabled(state, false);
  }
}

function selectRow(state: SchemaState, row: StoredRow): void {
  state.selectedRow = row;
  state.modeLabel.textContent = `Editing ${row.id}`;
  state.submitButton.textContent = 'Update';
  state.resetButton.textContent = 'Cancel';

  for (const field of state.fields) {
    const input = state.form.elements.namedItem(field.name);
    const value = row.data[field.name];

    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.value = field.kind === 'datetime' && typeof value === 'string'
        ? isoToDatetimeLocal(value)
        : field.kind === 'json'
          ? JSON.stringify(value, null, 2)
          : String(value ?? '');
    }
  }

  renderRows(state);
}

function clearSelection(state: SchemaState): void {
  state.selectedRow = undefined;
  state.form.reset();
  state.modeLabel.textContent = 'Create record';
  state.submitButton.textContent = 'Create';
  state.resetButton.textContent = 'Clear';
  setCreateModeDefaults(state);
  renderRows(state);
}

function setCreateModeDefaults(state: SchemaState): void {
  for (const field of state.fields) {
    if (field.kind !== 'datetime') {
      continue;
    }

    const input = state.form.elements.namedItem(field.name);

    if (input instanceof HTMLInputElement) {
      input.value = dateToDatetimeLocal(new Date());
    }
  }
}

function readPayload(state: SchemaState): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of state.fields) {
    const input = state.form.elements.namedItem(field.name);

    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
      continue;
    }

    const parsedValue = parseInputValue(field, input.value);

    if (parsedValue !== undefined || !field.optional) {
      payload[field.name] = parsedValue;
    }
  }

  return payload;
}

function parseInputValue(field: FieldDefinition, value: string): unknown {
  if (field.optional && value === '') {
    return undefined;
  }

  if (field.kind === 'datetime') {
    return datetimeLocalToIsoWithOffset(value);
  }

  if (field.kind === 'number') {
    return Number(value);
  }

  if (field.kind === 'json') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

async function request<TResult>(path: string, init: RequestInit = {}): Promise<TResult> {
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers
    }
  });

  const text = await response.text();
  const body = text === '' ? null : JSON.parse(text);

  if (!response.ok) {
    throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
  }

  return body as TResult;
}

function getFields(schema: Schema): FieldDefinition[] {
  return Object.entries(schema.schema.shape).map(([name, field]) => {
    const zodField = field as ZodLike;
    const unwrappedField = unwrapField(zodField);

    return {
      name,
      description: zodField.description,
      kind: getFieldKind(unwrappedField),
      optional: isOptionalField(zodField),
      integer: isIntegerField(unwrappedField)
    };
  });
}

function getFieldKind(field: ZodLike): FieldKind {
  const definition = field._zod?.def;

  if (definition?.format === 'datetime') {
    return 'datetime';
  }

  if (definition?.type === 'number') {
    return 'number';
  }

  if (definition?.type === 'string') {
    return 'string';
  }

  return 'json';
}

function unwrapField(field: ZodLike): ZodLike {
  return field._zod?.def?.innerType ?? field;
}

function isOptionalField(field: ZodLike): boolean {
  return field._zod?.def?.type === 'optional';
}

function isIntegerField(field: ZodLike): boolean {
  return field._zod?.def?.format === 'safeint';
}

function setFormDisabled(state: SchemaState, disabled: boolean): void {
  for (const element of Array.from(state.form.elements)) {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLButtonElement
    ) {
      element.disabled = disabled;
    }
  }
}

function setStatus(state: SchemaState, message: string, isError = false): void {
  state.status.textContent = message;
  state.status.classList.toggle('is-error', isError);
}

function toTitle(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return JSON.stringify(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function isoToDatetimeLocal(value: string): string {
  return dateToDatetimeLocal(new Date(value));
}

function dateToDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function datetimeLocalToIsoWithOffset(value: string): string {
  const date = new Date(value);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = pad(Math.floor(absoluteOffset / 60));
  const minutes = pad(absoluteOffset % 60);

  return `${value}${sign}${hours}:${minutes}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
