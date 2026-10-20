import React from 'react';
import type { Control, FieldError } from 'react-hook-form';
import { get, useFormState, useWatch } from 'react-hook-form';

import { Logo } from './logo';

type PanelProps = {
  control: Control;
  open: boolean;
  expanded: boolean;
  style?: React.CSSProperties;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onExpand: () => void;
};

const FORM_STATE = [
  'isValid',
  'isDirty',
  'isSubmitted',
  'isSubmitSuccessful',
  'isSubmitting',
  'isValidating',
  'isLoading',
  'submitCount',
] as const;

const stringify = (value: unknown) => {
  try {
    return typeof value === 'object' || typeof value === 'string'
      ? JSON.stringify(value, null, 2)
      : String(value);
  } catch {
    return String(value);
  }
};

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </>
);

const Value = ({ value }: { value: unknown }) => (
  <code data-type={typeof value}>{stringify(value)}</code>
);

const Chip = ({ on, children }: { on: boolean; children: React.ReactNode }) => (
  <span className="rhf-dt-chip" data-on={on || undefined}>
    {children}
  </span>
);

function Field({
  name,
  control,
  value,
  error,
  touched,
  dirty,
  expanded,
}: {
  name: string;
  control: Control;
  value: unknown;
  error?: FieldError;
  touched: boolean;
  dirty: boolean;
  expanded: boolean;
}) {
  const ref: any = get(control._fields, `${name}._f.ref`);

  return (
    <details
      className="rhf-dt-field"
      open={expanded}
      data-error={error ? true : undefined}
    >
      <summary>
        <span className="rhf-dt-name" title={name}>
          {name}
        </span>
        <span className="rhf-dt-tag">{ref?.type || 'custom'}</span>
      </summary>
      <dl>
        <Row label="Value">
          <Value value={value} />
        </Row>
        {error && <Row label="Error">{error.type}</Row>}
        {error?.message && <Row label="Message">{String(error.message)}</Row>}
      </dl>
      <div className="rhf-dt-chips">
        <Chip on={touched}>touched</Chip>
        <Chip on={dirty}>dirty</Chip>
        {typeof ref?.scrollIntoView === 'function' && (
          <button
            type="button"
            className="rhf-dt-link"
            onClick={() =>
              ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          >
            Scroll into view
          </button>
        )}
      </div>
    </details>
  );
}

export function Panel({
  control,
  open,
  expanded,
  style,
  closeRef,
  onClose,
  onExpand,
}: PanelProps) {
  const formState = useFormState({ control });
  const values = useWatch({ control });
  const [filter, setFilter] = React.useState('');
  const [, refresh] = React.useReducer((count: number) => count + 1, 0);

  React.useEffect(() => refresh(), []);

  const names = [...control._names.mount].filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <aside
      className="rhf-dt-panel"
      data-open={open || undefined}
      aria-label="React Hook Form DevTools"
      style={style}
    >
      <header className="rhf-dt-header">
        <Logo />
        <div className="rhf-dt-title">
          <strong>React Hook Form</strong>
          <span
            className="rhf-dt-status"
            data-valid={formState.isValid || undefined}
          >
            {formState.isValid ? 'valid' : 'invalid'}
          </span>
        </div>
        <button
          ref={closeRef}
          type="button"
          className="rhf-dt-icon"
          aria-label="Close dev panel"
          title="Close dev panel"
          onClick={onClose}
        >
          ✕
        </button>
      </header>
      <div className="rhf-dt-toolbar">
        <input
          type="search"
          className="rhf-dt-search"
          placeholder="Filter fields…"
          aria-label="Filter fields"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <button
          type="button"
          className="rhf-dt-icon"
          aria-label="Refresh"
          title="Refresh"
          onClick={refresh}
        >
          ↻
        </button>
        <button
          type="button"
          className="rhf-dt-icon"
          aria-label={expanded ? 'Collapse all' : 'Expand all'}
          title={expanded ? 'Collapse all' : 'Expand all'}
          onClick={onExpand}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>
      <p className="rhf-dt-label">
        Fields <span>{names.length}</span>
      </p>
      <div className="rhf-dt-fields">
        {names.map((name) => (
          <Field
            key={name}
            name={name}
            control={control}
            value={get(values, name)}
            error={get(formState.errors, name)}
            touched={!!get(formState.touchedFields, name)}
            dirty={!!get(formState.dirtyFields, name)}
            expanded={expanded}
          />
        ))}
        {!names.length && <p className="rhf-dt-empty">No fields</p>}
      </div>
      <footer className="rhf-dt-state">
        <p className="rhf-dt-label">Form state</p>
        <div className="rhf-dt-chips">
          {FORM_STATE.map((key) => (
            <Chip key={key} on={!!formState[key]}>
              {key === 'submitCount' ? `${key}: ${formState[key]}` : key}
            </Chip>
          ))}
        </div>
      </footer>
    </aside>
  );
}
