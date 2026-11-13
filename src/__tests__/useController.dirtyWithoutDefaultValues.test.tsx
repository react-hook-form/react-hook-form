import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import type { Control, UseFormProps, UseFormReturn } from '../types';
import { useController } from '../useController';
import { useForm } from '../useForm';
import { useFormState } from '../useFormState';
import noop from '../utils/noop';

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  nickname?: string;
};

function Input({
  control,
  name,
  defaultValue = '',
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  defaultValue?: string;
}) {
  const { field, fieldState } = useController({
    control,
    name,
    defaultValue,
  });

  return (
    <label>
      {name}
      <input aria-label={name} {...field} />
      <span data-testid={`${name}-dirty`}>{String(fieldState.isDirty)}</span>
    </label>
  );
}

function DefaultValuesView({ control }: { control: Control<FormValues> }) {
  const { defaultValues } = useFormState({ control });

  return (
    <pre data-testid="subscriber-defaultValues">
      {JSON.stringify(defaultValues)}
    </pre>
  );
}

type CapturedForm = {
  dirtyFields?: unknown;
  isDirty?: boolean;
  isLoading?: boolean;
  defaultValues?: unknown;
  methods?: UseFormReturn<FormValues>;
};

const renderForm = (
  props?: UseFormProps<FormValues>,
  { nicknameDefault = 'foo' }: { nicknameDefault?: string } = {},
) => {
  const formState: CapturedForm = {};

  function App() {
    const methods = useForm<FormValues>(props);
    const { control, formState: state } = methods;
    const [showNickname, setShowNickname] = React.useState(false);
    formState.dirtyFields = state.dirtyFields;
    formState.isDirty = state.isDirty;
    formState.isLoading = state.isLoading;
    formState.defaultValues = state.defaultValues;
    formState.methods = methods;

    return (
      <>
        <Input control={control} name="firstName" />
        <Input control={control} name="lastName" />
        <Input control={control} name="email" />
        {showNickname && (
          <Input
            control={control}
            name="nickname"
            defaultValue={nicknameDefault}
          />
        )}
        <button type="button" onClick={() => setShowNickname((v) => !v)}>
          toggle
        </button>
        <pre data-testid="root-defaultValues">
          {JSON.stringify(state.defaultValues)}
        </pre>
        <DefaultValuesView control={control} />
      </>
    );
  }

  const utils = render(<App />);

  return Object.assign(formState, {
    rerenderWith: (nextNicknameDefault: string) => {
      nicknameDefault = nextNicknameDefault;
      utils.rerender(<App />);
    },
  });
};

const change = (name: keyof FormValues, value: string) =>
  fireEvent.change(screen.getByLabelText(name), { target: { value } });

const toggleNickname = () => fireEvent.click(screen.getByText('toggle'));

describe('useController defaultValue without useForm defaultValues', () => {
  it.each([
    ['omitted', undefined],
    ['an empty object', { defaultValues: {} }],
  ])(
    'should only mark the changed field as dirty when useForm defaultValues is %s',
    (_, props) => {
      const formState = renderForm(props);

      change('firstName', 'a');

      expect(formState.dirtyFields).toEqual({ firstName: true });
      expect(formState.isDirty).toBe(true);
      expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('true');
      expect(screen.getByTestId('lastName-dirty')).toHaveTextContent('false');
      expect(screen.getByTestId('email-dirty')).toHaveTextContent('false');
    },
  );

  it('should not be dirty on mount', () => {
    const formState = renderForm();

    expect(formState.dirtyFields).toEqual({});
    expect(formState.isDirty).toBe(false);
  });

  it('should become pristine again when the changed field returns to its default', () => {
    const formState = renderForm();

    change('firstName', 'a');
    change('firstName', '');

    expect(formState.dirtyFields).toEqual({});
    expect(formState.isDirty).toBe(false);
    expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('false');
  });

  it('should not mark siblings dirty when another field with a form default is reverted', () => {
    const formState = renderForm({
      defaultValues: { firstName: 'x' } as FormValues,
    });

    change('firstName', 'xa');
    change('lastName', 'b');
    change('firstName', 'x');

    expect(formState.dirtyFields).toEqual({ lastName: true });
    expect(screen.getByTestId('email-dirty')).toHaveTextContent('false');
  });

  it('should keep useForm defaultValues over the controller defaultValue', () => {
    const formState = renderForm({
      defaultValues: { firstName: 'x', lastName: '', email: '' },
    });

    change('firstName', '');

    expect(formState.dirtyFields).toEqual({ firstName: true });
    expect(formState.isDirty).toBe(true);
  });

  describe('reset behaviour', () => {
    it('should restore controller defaults on reset() and keep them as the dirty baseline', () => {
      const form = renderForm();

      change('firstName', 'a');
      change('lastName', 'b');

      act(() => form.methods!.reset());

      expect(screen.getByLabelText('firstName')).toHaveValue('');
      expect(screen.getByLabelText('lastName')).toHaveValue('');
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('firstName', 'a');

      expect(form.dirtyFields).toEqual({ firstName: true });

      change('firstName', '');

      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
      expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('false');
    });

    it('should use reset(values) as the new baseline over controller defaults', () => {
      const form = renderForm();
      const values = { firstName: 'x', lastName: '', email: '' };

      act(() => form.methods!.reset(values));

      expect(screen.getByLabelText('firstName')).toHaveValue('x');
      expect(form.defaultValues).toEqual(values);
      expect(form.isDirty).toBe(false);

      change('firstName', '');

      expect(form.dirtyFields).toEqual({ firstName: true });
      expect(form.isDirty).toBe(true);
    });

    it('should keep controller defaults as the baseline when reset with keepDefaultValues', () => {
      const form = renderForm();

      act(() =>
        form.methods!.reset(
          { firstName: 'x', lastName: '', email: '' },
          { keepDefaultValues: true },
        ),
      );

      expect(screen.getByLabelText('firstName')).toHaveValue('x');
      expect(form.dirtyFields).toEqual({ firstName: true });
      expect(form.isDirty).toBe(true);

      change('firstName', '');

      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
    });

    it('should restore the controller defaultValue on resetField', () => {
      const form = renderForm();

      change('firstName', 'a');

      act(() => form.methods!.resetField('firstName'));

      expect(screen.getByLabelText('firstName')).toHaveValue('');
      expect(form.methods!.getValues('firstName')).toBe('');
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
    });

    it('should use resetField defaultValue as the baseline without affecting siblings', () => {
      const form = renderForm();

      change('lastName', 'b');

      act(() => form.methods!.resetField('firstName', { defaultValue: 'new' }));

      expect(screen.getByLabelText('firstName')).toHaveValue('new');
      expect(form.dirtyFields).toEqual({ lastName: true });
      expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('false');

      change('firstName', '');

      expect(form.dirtyFields).toEqual({ firstName: true, lastName: true });

      change('lastName', '');

      expect(form.dirtyFields).toEqual({ firstName: true });
    });

    it.each([false, true])(
      'should expose controller defaults in formState.defaultValues (shouldUnregister: %s)',
      (shouldUnregister) => {
        const form = renderForm({ shouldUnregister });

        change('firstName', 'a');

        expect(form.defaultValues).toEqual({
          firstName: '',
          lastName: '',
          email: '',
        });
      },
    );

    it('should not mutate the defaultValues object passed to useForm', () => {
      const defaultValues = {} as FormValues;
      renderForm({ defaultValues });

      change('firstName', 'a');

      expect(defaultValues).toEqual({});
    });
  });

  describe('conditional Controller mounting', () => {
    it('should notify formState.defaultValues subscribers when a Controller mounts after the form is ready', () => {
      const form = renderForm();
      const renderedDefaults = (testId: string) =>
        JSON.parse(screen.getByTestId(testId).textContent || 'null');

      expect(form.methods!.formState.isReady).toBe(true);
      expect(renderedDefaults('root-defaultValues')).toEqual({
        firstName: '',
        lastName: '',
        email: '',
      });

      toggleNickname();

      const expected = {
        firstName: '',
        lastName: '',
        email: '',
        nickname: 'foo',
      };
      expect(renderedDefaults('root-defaultValues')).toEqual(expected);
      expect(renderedDefaults('subscriber-defaultValues')).toEqual(expected);
    });

    it('should not be dirty when a Controller mounts after the initial render', () => {
      const form = renderForm();

      toggleNickname();

      expect(screen.getByLabelText('nickname')).toHaveValue('foo');
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('nickname', 'bar');

      expect(form.dirtyFields).toEqual({ nickname: true });
      expect(form.isDirty).toBe(true);

      change('nickname', 'foo');

      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
      expect(screen.getByTestId('nickname-dirty')).toHaveTextContent('false');
    });

    it('should become pristine when a field is reverted after another Controller mounted', () => {
      const form = renderForm();

      change('firstName', 'a');
      toggleNickname();
      change('firstName', '');

      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
    });

    it('should keep the first value and baseline when remounted with a different defaultValue', () => {
      const form = renderForm();

      toggleNickname();
      toggleNickname();
      form.rerenderWith('baz');
      toggleNickname();

      expect(screen.getByLabelText('nickname')).toHaveValue('foo');
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('nickname', 'baz');

      expect(form.dirtyFields).toEqual({ nickname: true });
    });

    it('should discard edits and restore the original default when remounted with shouldUnregister', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(noop);

      const form = renderForm({ shouldUnregister: true });

      toggleNickname();
      change('nickname', 'edited');
      toggleNickname();
      form.rerenderWith('baz');
      toggleNickname();

      const unexpectedErrors = consoleError.mock.calls.filter(
        ([message]) =>
          !String(message).includes('while rendering a different component'),
      );
      consoleError.mockRestore();

      expect(unexpectedErrors).toEqual([]);
      expect(screen.getByLabelText('nickname')).toHaveValue('foo');
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);
    });
  });

  describe('async defaultValues', () => {
    it('should use resolved async defaultValues over controller defaults', async () => {
      const values = { firstName: 'async', lastName: 'last', email: '' };
      const form = renderForm({ defaultValues: async () => values });

      await waitFor(() =>
        expect(screen.getByLabelText('firstName')).toHaveValue('async'),
      );

      expect(screen.getByLabelText('lastName')).toHaveValue('last');
      expect(form.isLoading).toBe(false);
      expect(form.defaultValues).toEqual(values);
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('firstName', 'a');
      change('firstName', 'async');

      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('firstName', '');

      expect(form.dirtyFields).toEqual({ firstName: true });
      expect(form.isDirty).toBe(true);
    });

    it('should keep omitted fields pristine when async defaultValues are partial', async () => {
      const form = renderForm({
        defaultValues: async () => ({ firstName: 'async' }) as FormValues,
      });

      await waitFor(() =>
        expect(screen.getByLabelText('firstName')).toHaveValue('async'),
      );

      expect(screen.getByLabelText('lastName')).toHaveValue('');
      expect(screen.getByLabelText('email')).toHaveValue('');
      expect(form.isLoading).toBe(false);
      expect(form.dirtyFields).toEqual({});
      expect(form.isDirty).toBe(false);

      change('firstName', 'a');

      expect(form.dirtyFields).toEqual({ firstName: true });
      expect(screen.getByTestId('lastName-dirty')).toHaveTextContent('false');
    });
  });
});
