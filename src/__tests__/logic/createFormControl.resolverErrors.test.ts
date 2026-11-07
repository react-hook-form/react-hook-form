import { createFormControl } from '../../logic/createFormControl';
import type { FormState, ResolverResult } from '../../types';

type FormValues = {
  email: string;
  phone?: string;
  contact?: { email: string };
};
type ValidationState = Pick<
  FormState<FormValues>,
  'isValidating' | 'validatingFields'
>;

describe.each(['sync', 'async'] as const)('resolver errors (%s)', (mode) => {
  it.each(['named trigger', 'form trigger', 'submit'] as const)(
    'clears validation state after a rejected %s',
    async (operation) => {
      const error = new Error('Resolver failed');
      const form = createFormControl<FormValues>({
        defaultValues: { email: 'test@example.com' },
        resolver:
          mode === 'sync'
            ? () => {
                throw error;
              }
            : () => Promise.reject(error),
      });
      const states: ValidationState[] = [];
      const unsubscribe = form.subscribe({
        formState: { isValidating: true, validatingFields: true },
        callback: (state) => {
          states.push({
            isValidating: state.isValidating,
            validatingFields: { ...state.validatingFields },
          });
        },
      });
      form.register('email');

      try {
        const validation =
          operation === 'submit'
            ? form.handleSubmit(() => {})()
            : form.trigger(operation === 'named trigger' ? 'email' : undefined);

        await expect(validation).rejects.toBe(error);
        expect(states[0]).toEqual({
          isValidating: true,
          validatingFields: { email: true },
        });
        expect(states.at(-1)).toEqual({
          isValidating: false,
          validatingFields: {},
        });
      } finally {
        unsubscribe();
      }
    },
  );
});

it('preserves a new validation when a resolver rejects after reset', async () => {
  const error = new Error('Previous validation failed');
  const pending = Promise.withResolvers<ResolverResult<FormValues>>();
  let calls = 0;
  const form = createFormControl<FormValues>({
    defaultValues: { email: 'before@example.com' },
    resolver: () => (++calls === 1 ? Promise.reject(error) : pending.promise),
  });
  const states: ValidationState[] = [];
  const unsubscribe = form.subscribe({
    formState: { isValidating: true, validatingFields: true },
    callback: (state) => {
      states.push({
        isValidating: state.isValidating,
        validatingFields: { ...state.validatingFields },
      });
    },
  });
  form.register('email');
  const previousValidation = form.trigger('email');
  form.reset({ email: 'after@example.com' });
  const currentValidation = form.trigger('email');

  try {
    await expect(previousValidation).rejects.toBe(error);
    expect(states.at(-1)).toEqual({
      isValidating: true,
      validatingFields: { email: true },
    });

    pending.resolve({ values: { email: 'after@example.com' }, errors: {} });
    await currentValidation;
    expect(states.at(-1)).toEqual({
      isValidating: false,
      validatingFields: {},
    });
  } finally {
    pending.resolve({ values: { email: 'after@example.com' }, errors: {} });
    await currentValidation;
    unsubscribe();
  }
});

it.each([
  {
    previousField: 'email',
    currentField: 'email',
    value: 'after',
    validatingFields: { email: true },
  },
  {
    previousField: 'email',
    currentField: 'phone',
    value: 'after',
    validatingFields: { phone: true },
  },
  {
    previousField: 'contact',
    currentField: 'contact.email',
    value: 'after',
    validatingFields: { contact: { email: true } },
  },
  {
    previousField: 'contact.email',
    currentField: 'contact',
    value: { email: 'after' },
    validatingFields: { contact: true },
  },
] as const)(
  'keeps a newer $currentField validation pending after $previousField rejects',
  async ({ previousField, currentField, value, validatingFields }) => {
    const error = new Error('Previous validation failed');
    const previous = Promise.withResolvers<ResolverResult<FormValues>>();
    const current = Promise.withResolvers<ResolverResult<FormValues>>();
    let calls = 0;
    const form = createFormControl<FormValues>({
      defaultValues: {
        email: 'before@example.com',
        contact: { email: 'before@example.com' },
      },
      resolver: () => (++calls === 1 ? previous.promise : current.promise),
    });
    const states: ValidationState[] = [];
    const unsubscribe = form.subscribe({
      formState: { isValidating: true, validatingFields: true },
      callback: (state) => {
        states.push({
          isValidating: state.isValidating,
          validatingFields: { ...state.validatingFields },
        });
      },
    });
    form.register('email');
    form.register('phone');
    form.register('contact');
    form.register('contact.email');
    const previousValidation = form.trigger(previousField);
    form.setValue(currentField, value);
    const currentValidation = form.trigger(currentField);

    try {
      previous.reject(error);
      await expect(previousValidation).rejects.toBe(error);
      expect(states.at(-1)).toEqual({
        isValidating: true,
        validatingFields,
      });

      current.resolve({ values: form.getValues(), errors: {} });
      await currentValidation;
      expect(states.at(-1)).toEqual({
        isValidating: false,
        validatingFields: {},
      });
    } finally {
      current.resolve({ values: form.getValues(), errors: {} });
      await currentValidation;
      unsubscribe();
    }
  },
);
