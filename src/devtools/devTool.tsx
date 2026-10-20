import React from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Logo } from './logo';
import { Panel } from './panel';
import { styles as css } from './styles';
import { useExtension } from './useExtension';

export type Placement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type DevToolProps<T extends FieldValues = FieldValues> = {
  id?: string;
  control?: Control<T>;
  placement?: Placement;
  styles?: {
    button?: React.CSSProperties;
    panel?: React.CSSProperties;
  };
};

const STORAGE_KEY = '__REACT_HOOK_FORM_DEVTOOLS__';

type Position = { x: number; y: number };

type Settings = { open: boolean; expanded: boolean; position?: Position };

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

function useSettings(key: string) {
  const [settings, setSettings] = React.useState<Settings>({
    open: false,
    expanded: true,
  });

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      setSettings((current) => ({ ...current, ...saved }));
    } catch {}
  }, [key]);

  const update = (patch: Partial<Settings>) =>
    setSettings((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });

  return [settings, update] as const;
}

function DevToolUI({
  id,
  control,
  placement = 'top-right',
  styles,
}: DevToolProps & { control: Control }) {
  const [{ open, expanded, ...settings }, update] = useSettings(
    id ? `${STORAGE_KEY}:${id}` : STORAGE_KEY,
  );
  const [drag, setDrag] = React.useState<Position | null>(null);
  const dragRef = React.useRef<
    (Position & { dx: number; dy: number; moved: boolean }) | null
  >(null);
  const position = drag || settings.position;
  const showRef = React.useRef<HTMLButtonElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const previousOpen = React.useRef(open);

  React.useEffect(() => {
    if (previousOpen.current !== open) {
      previousOpen.current = open;
      (open ? closeRef : showRef).current?.focus();
    }
  }, [open]);

  return (
    <div
      className="rhf-dt"
      data-placement={
        position
          ? position.x < window.innerWidth / 2
            ? 'top-left'
            : 'top-right'
          : placement
      }
    >
      <style>{css}</style>
      {!open && (
        <button
          ref={showRef}
          type="button"
          className="rhf-dt-toggle"
          aria-label="Show dev panel"
          title="Show dev panel"
          style={{
            ...(position && {
              top: clamp(position.y, window.innerHeight - 40),
              left: clamp(position.x, window.innerWidth - 40),
              right: 'auto',
              bottom: 'auto',
            }),
            ...styles?.button,
          }}
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            dragRef.current = {
              x: event.clientX,
              y: event.clientY,
              dx: event.clientX - rect.left,
              dy: event.clientY - rect.top,
              moved: false,
            };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = dragRef.current;

            if (
              !start ||
              (!start.moved &&
                Math.hypot(event.clientX - start.x, event.clientY - start.y) <
                  4)
            ) {
              return;
            }

            start.moved = true;
            setDrag({
              x: clamp(event.clientX - start.dx, window.innerWidth - 40),
              y: clamp(event.clientY - start.dy, window.innerHeight - 40),
            });
          }}
          onPointerUp={() => {
            if (drag) {
              update({ position: drag });
              setDrag(null);
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            setDrag(null);
          }}
          onClick={() => {
            const moved = dragRef.current?.moved;
            dragRef.current = null;

            if (!moved) {
              update({ open: true });
            }
          }}
        >
          <Logo />
        </button>
      )}
      <Panel
        control={control}
        open={open}
        expanded={expanded}
        style={styles?.panel}
        closeRef={closeRef}
        onClose={() => update({ open: false })}
        onExpand={() => update({ expanded: !expanded })}
      />
    </div>
  );
}

export const DevTool = <T extends FieldValues>({
  id,
  control,
  ...props
}: DevToolProps<T> = {}) => {
  const methods = useFormContext<T>();
  const formControl = control || methods?.control;
  const [fallbackId] = React.useState(() =>
    Math.random().toString(36).slice(2),
  );

  if (!formControl) {
    throw new Error(
      'DevTool requires a `control` prop or to be rendered inside <FormProvider>.',
    );
  }

  useExtension(id || fallbackId, formControl);

  return (
    <DevToolUI id={id} control={formControl as unknown as Control} {...props} />
  );
};
