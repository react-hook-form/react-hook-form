import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Controller } from '../controller';
import type { Control } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';
import { useFormState } from '../useFormState';
import deepEqual from '../utils/deepEqual';
import noop from '../utils/noop';

describe('useFormState', () => {
  it('should render correct form state with isDirty, dirty, touched', () => {
    let count = 0;
    const Test = ({
      control,
    }: {
      control: Control<{
        test: string;
      }>;
    }) => {
      const { isDirty, dirtyFields, touchedFields } = useFormState({
        control,
      });

      return (
        <>
          <div>{isDirty ? 'isDirty' : ''}</div>
          <div>{dirtyFields['test'] ? 'dirty field' : ''}</div>
          <div>{touchedFields['test'] ? 'isTouched' : ''}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm<{
        test: string;
      }>();

      count++;

      return (
        <div>
          <input aria-label="test" {...register('test')} />
          <Test control={control} />
        </div>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(screen.getByText('isDirty')).toBeVisible();
    expect(screen.getByText('dirty field')).toBeVisible();
    expect(count).toEqual(2);

    fireEvent.blur(screen.getByLabelText('test'));
    expect(screen.getByText('isTouched')).toBeVisible();
    expect(count).toEqual(2);
  });

  it('should render correct isolated errors message', async () => {
    let count = 0;
    const Test = ({ control }: { control: Control }) => {
      const { errors, isValid } = useFormState({
        control,
      });

      return (
        <>
          <div>{errors['test'] ? 'error' : 'valid'}</div>
          <div>{isValid ? 'yes' : 'no'}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm({
        mode: 'onChange',
      });

      count++;

      return (
        <div>
          <input aria-label="test" {...register('test', { minLength: 5 })} />
          <Test control={control} />
        </div>
      );
    };
    render(<Component />);

    await waitFor(() => expect(screen.getByText('yes')).toBeVisible());

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(await screen.findByText('error')).toBeVisible();
    expect(screen.getByText('no')).toBeVisible();

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: 'testtest',
      },
    });

    expect(await screen.findByText('valid')).toBeVisible();
    expect(screen.getByText('yes')).toBeVisible();

    expect(count).toEqual(2);
  });

  it('should update isValidating correctly', async () => {
    function Child() {
      const { isDirty, isValid, isValidating } = useFormState();
      const enabled = !isValidating && isDirty && isValid;

      return (
        <button disabled={!enabled} type="submit">
          Submit
        </button>
      );
    }

    function App() {
      const formFunctions = useForm({
        mode: 'onChange',
      });
      const { register } = formFunctions;

      return (
        <FormProvider {...formFunctions}>
          <form>
            <input {...register('value', { required: true })} />
            <Child />
          </form>
        </FormProvider>
      );
    }

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '12',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('should update formState separately with useFormState', async () => {
    let count = 0;
    let testCount = 0;
    let test1Count = 0;

    const Test1 = ({ control }: { control: Control }) => {
      const { isDirty, dirtyFields } = useFormState({
        control,
      });

      testCount++;

      return (
        <>
          <div>
            {dirtyFields['test'] ? 'hasDirtyField' : 'notHasDirtyField'}
          </div>
          <div>{isDirty ? 'isDirty' : 'notDirty'}</div>
        </>
      );
    };

    const Test = ({ control }: { control: Control }) => {
      const { touchedFields } = useFormState({
        control,
      });

      test1Count++;

      return (
        <>
          <div>{touchedFields['test'] ? 'isTouched' : 'notTouched'}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm({
        mode: 'onChange',
      });

      count++;

      return (
        <div>
          <input aria-label="test" {...register('test', { minLength: 5 })} />
          <Test control={control} />
          <Test1 control={control} />
        </div>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(await screen.findByText('hasDirtyField')).toBeVisible();
    expect(screen.getByText('isDirty')).toBeVisible();

    expect(count).toEqual(2);
    expect(testCount).toEqual(3);
    expect(test1Count).toEqual(2);

    fireEvent.blur(screen.getByLabelText('test'));
    expect(screen.getByText('isTouched')).toBeVisible();

    expect(count).toEqual(2);
    expect(testCount).toEqual(3);
    expect(test1Count).toEqual(3);

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: '',
      },
    });

    expect(count).toEqual(2);
    expect(testCount).toEqual(3);
    expect(test1Count).toEqual(3);
  });

  it('should render correct submit state', async () => {
    let count = 0;
    const Test = ({ control }: { control: Control }) => {
      const { isSubmitted, submitCount } = useFormState({
        control,
      });

      return (
        <>
          <div>{isSubmitted ? 'isSubmitted' : ''}</div>
          <div>{submitCount}</div>
        </>
      );
    };

    const Component = () => {
      const { control, handleSubmit } = useForm();

      count++;

      return (
        <form onSubmit={handleSubmit(noop)}>
          <Test control={control} />
          <button>Submit</button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('isSubmitted')).toBeVisible();
    expect(screen.getByText('1')).toBeVisible();

    expect(count).toEqual(2);
  });

  it('should only re-render when subscribed field name updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: 'firstName',
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} />
        </form>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: {
        value: '',
      },
    });

    await waitFor(() => expect(count).toEqual(2));
  });

  it('should not re-render when subscribed field name is not included', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: 'lastName',
      });

      count++;

      return <>{errors?.lastName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} />
        </form>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: {
        value: '',
      },
    });

    expect(count).toEqual(2);
  });

  it('should only re-render when subscribed field names updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
      age: number;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: ['firstName', 'lastName'],
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input
            {...register('lastName', { required: true })}
            placeholder={'lastName'}
          />
          <input
            {...register('age', { valueAsNumber: true, required: true })}
            type="number"
          />
        </form>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: {
        value: '',
      },
    });

    fireEvent.change(screen.getByPlaceholderText('lastName'), {
      target: {
        value: '',
      },
    });

    await waitFor(() => expect(count).toEqual(2));
  });

  it('should only re-render when subscribed field names updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
      age: number;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: ['age', 'lastName'],
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} placeholder={'lastName'} />
          <input
            {...register('age', { valueAsNumber: true, required: true })}
            type="number"
          />
        </form>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: {
        value: '',
      },
    });

    expect(count).toEqual(2);
  });

  it('should be able to stop the formState subscription', async () => {
    type FormValues = {
      test: string;
    };

    function Child({ control }: { control: Control<FormValues> }) {
      const [disabled, setDisabled] = React.useState(true);
      const { errors } = useFormState({
        control,
        name: 'test',
        disabled,
      });

      return (
        <div>
          {errors.test && <p>error</p>}
          <button onClick={() => setDisabled(!disabled)}>toggle</button>
        </div>
      );
    }

    const App = () => {
      const { trigger, register, control } = useForm<FormValues>();

      return (
        <div>
          <input {...register('test', { required: true })} />
          <Child control={control} />
          <button
            onClick={() => {
              trigger();
            }}
          >
            trigger
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));

    expect(screen.queryByText('error')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));

    expect(await screen.findByText('error')).toBeVisible();
  });

  it('should not start early subscription and throw warning at strict mode', async () => {
    type FormValues = { test: { data: string }[] };

    function FieldArray() {
      const { reset, control } = useForm<FormValues>({
        defaultValues: { test: [] },
      });
      const { fields, append } = useFieldArray({ control, name: 'test' });
      return (
        <div>
          {fields.map((field, index) => (
            <div key={field.id}>
              <Controller
                control={control}
                name={`test.${index}.data` as const}
                render={({ field }) => <input {...field} />}
              />
            </div>
          ))}
          <button
            onClick={() =>
              append({
                data: 'data',
              })
            }
          >
            add
          </button>
          <button onClick={() => reset({})}>reset</button>
        </div>
      );
    }

    const App = () => {
      return (
        <React.StrictMode>
          <FieldArray />
        </React.StrictMode>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'add' }));

    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    fireEvent.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findAllByRole('textbox')).toHaveLength(1);
  });

  it('should subscribe to exact form state update', () => {
    const App = () => {
      const { control, register } = useForm();
      const [exact, setExact] = React.useState(true);
      const { touchedFields } = useFormState({
        name: 'test',
        control,
        exact,
      });

      return (
        <div>
          <input {...register('testData')} />
          <p>{touchedFields.testData && 'touched'}</p>

          <button
            onClick={() => {
              setExact(false);
            }}
          >
            toggle
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.focus(screen.getByRole('textbox'));

    fireEvent.blur(screen.getByRole('textbox'));

    expect(screen.queryByText('touched')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    fireEvent.focus(screen.getByRole('textbox'));

    fireEvent.blur(screen.getByRole('textbox'));

    expect(screen.getByText('touched')).toBeVisible();
  });

  it('should be able to access defaultValues', () => {
    type FormValues = {
      firstName: string;
      lastName: string;
    };

    const defaultValues = {
      firstName: 'a',
      lastName: 'b',
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const formState = useFormState({
        control,
      });

      return (
        <p>
          {deepEqual(formState.defaultValues, defaultValues) ? 'yes' : 'no'}
        </p>
      );
    };

    const Component = () => {
      const { control } = useForm<FormValues>({
        defaultValues,
      });

      return <Test control={control} />;
    };

    render(<Component />);

    expect(screen.getByText('yes')).toBeVisible();
  });

  it('should conditionally update formState after mount', async () => {
    function DirtyState() {
      const { isDirty, isValid } = useFormState();
      return (
        <div>
          <p>{isDirty ? 'dirty' : 'pristine'}</p>
          <p>{isValid ? 'valid' : 'error'}</p>
        </div>
      );
    }

    function App() {
      const [showDirty, toggleShowDirty] = React.useReducer(
        (prev) => !prev,
        false,
      );
      const formMethods = useForm({
        defaultValues: {
          firstname: '',
        },
      });

      return (
        <FormProvider {...formMethods}>
          {showDirty && <DirtyState />}
          <input {...formMethods.register('firstname', { required: true })} />
          <button type="button" onClick={toggleShowDirty} />
        </FormProvider>
      );
    }

    render(<App />);

    expect(screen.queryByRole('pristine')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.queryByText('dirty')).toBeNull();
    expect(await screen.findByText('valid')).toBeVisible();
  });

  it('should subscribe and update formState', async () => {
    function App() {
      const { register, control, handleSubmit } = useForm({
        defaultValues: {
          firstName: '',
        },
      });
      const { errors } = useFormState({ control });

      return (
        <form onSubmit={handleSubmit(noop)}>
          <input {...register('firstName', { required: 'Required' })} />
          <p>{errors.firstName?.message}</p>
          <button>Submit</button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    waitFor(() => screen.getByText('Required'));

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'data' },
    });

    waitFor(() =>
      expect(screen.queryByText('Required')).not.toBeInTheDocument(),
    );
  });

  it('should return the latest values with async values', async () => {
    type FormValues = {
      firstName: string;
    };

    function Input({ control }: { control: Control<FormValues> }) {
      const { isValid } = useFormState({ control });

      return <p>{isValid}</p>;
    }

    function Form({ values }: { values: FormValues }) {
      const { getValues, control } = useForm<FormValues>({
        defaultValues: {
          firstName: '',
        },
        values,
        resetOptions: {
          keepDefaultValues: true,
        },
      });

      return (
        <>
          <p>{getValues().firstName}</p>
          <Input control={control} />
        </>
      );
    }

    function App() {
      return <Form values={{ firstName: 'test' }} />;
    }

    render(<App />);

    await waitFor(() => {
      screen.getByText('test');
    });
  });

  it('should update form state with disabled state', async () => {
    function Form({ control }: { control: Control }) {
      const { disabled } = useFormState({
        control,
      });

      return <p>{disabled ? 'disabled' : ''}</p>;
    }

    function App() {
      const { control } = useForm({
        disabled: true,
      });

      return <Form control={control} />;
    }

    render(<App />);

    await waitFor(() => {
      screen.getByText('disabled');
    });
  });

  describe('focusedField and isFocused', () => {
    it('should track which field is currently focused', async () => {
      let formState: any;

      const Test = ({
        control,
      }: {
        control: Control<{ test1: string; test2: string }>;
      }) => {
        formState = useFormState({ control });

        return (
          <div>
            <div data-testid="focused-field">
              {formState.focusedField || 'none'}
            </div>
            <div data-testid="test1-focused">
              {formState.focusedField === 'test1'
                ? 'test1 focused'
                : 'test1 not focused'}
            </div>
            <div data-testid="test2-focused">
              {formState.focusedField === 'test2'
                ? 'test2 focused'
                : 'test2 not focused'}
            </div>
          </div>
        );
      };

      const Component = () => {
        const { register, control } = useForm<{
          test1: string;
          test2: string;
        }>();

        return (
          <div>
            <input data-testid="test1" {...register('test1')} />
            <input data-testid="test2" {...register('test2')} />
            <Test control={control} />
          </div>
        );
      };

      render(<Component />);

      // Initially no fields should be focused
      expect(screen.getByTestId('focused-field')).toHaveTextContent('none');
      expect(screen.getByTestId('test1-focused')).toHaveTextContent(
        'test1 not focused',
      );
      expect(screen.getByTestId('test2-focused')).toHaveTextContent(
        'test2 not focused',
      );

      // Focus first field
      fireEvent.focus(screen.getByTestId('test1'));

      await waitFor(() => {
        expect(screen.getByTestId('focused-field')).toHaveTextContent('test1');
        expect(screen.getByTestId('test1-focused')).toHaveTextContent(
          'test1 focused',
        );
        expect(screen.getByTestId('test2-focused')).toHaveTextContent(
          'test2 not focused',
        );
      });

      // Focus second field
      fireEvent.focus(screen.getByTestId('test2'));

      await waitFor(() => {
        expect(screen.getByTestId('focused-field')).toHaveTextContent('test2');
        expect(screen.getByTestId('test1-focused')).toHaveTextContent(
          'test1 not focused',
        );
        expect(screen.getByTestId('test2-focused')).toHaveTextContent(
          'test2 focused',
        );
      });

      // Blur second field
      fireEvent.blur(screen.getByTestId('test2'));

      await waitFor(() => {
        expect(screen.getByTestId('focused-field')).toHaveTextContent('none');
        expect(screen.getByTestId('test1-focused')).toHaveTextContent(
          'test1 not focused',
        );
        expect(screen.getByTestId('test2-focused')).toHaveTextContent(
          'test2 not focused',
        );
      });
    });

    it('should reset focused field when form is reset', async () => {
      let formState: any;
      let resetForm: any;

      const Test = ({ control }: { control: Control<{ test: string }> }) => {
        formState = useFormState({ control });

        return (
          <div>
            <div data-testid="focused-field">
              {formState.focusedField || 'none'}
            </div>
          </div>
        );
      };

      const Component = () => {
        const { register, control, reset } = useForm<{ test: string }>();
        resetForm = reset;

        return (
          <div>
            <input data-testid="test" {...register('test')} />
            <Test control={control} />
          </div>
        );
      };

      render(<Component />);

      // Focus the field
      fireEvent.focus(screen.getByTestId('test'));

      await waitFor(() => {
        expect(screen.getByTestId('focused-field')).toHaveTextContent('test');
      });

      // Reset form
      resetForm();

      await waitFor(() => {
        expect(screen.getByTestId('focused-field')).toHaveTextContent('none');
      });
    });

    it('should work with nested field names', async () => {
      let formState: any;

      const Test = ({
        control,
      }: {
        control: Control<{ nested: { field: string } }>;
      }) => {
        formState = useFormState({ control });

        return (
          <div>
            <div data-testid="nested-focused">
              {formState.focusedField === 'nested.field'
                ? 'nested focused'
                : 'nested not focused'}
            </div>
          </div>
        );
      };

      const Component = () => {
        const { register, control } = useForm<{ nested: { field: string } }>();

        return (
          <div>
            <input data-testid="nested-field" {...register('nested.field')} />
            <Test control={control} />
          </div>
        );
      };

      render(<Component />);

      // Focus the nested field
      fireEvent.focus(screen.getByTestId('nested-field'));

      await waitFor(() => {
        expect(screen.getByTestId('nested-focused')).toHaveTextContent(
          'nested focused',
        );
      });

      // Blur the nested field
      fireEvent.blur(screen.getByTestId('nested-field'));

      await waitFor(() => {
        expect(screen.getByTestId('nested-focused')).toHaveTextContent(
          'nested not focused',
        );
      });
    });

    it('should work with Controller and provide isFocused in fieldState', async () => {
      let fieldStateRef: any;

      const Component = () => {
        const { control } = useForm<{ test: string }>();

        return (
          <div>
            <Controller
              name="test"
              control={control}
              render={({ field, fieldState }) => {
                fieldStateRef = fieldState;
                return (
                  <div>
                    <input data-testid="controller-input" {...field} />
                    <div data-testid="controller-focused">
                      {fieldState.isFocused ? 'focused' : 'not focused'}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        );
      };

      render(<Component />);

      // Initially not focused
      expect(screen.getByTestId('controller-focused')).toHaveTextContent(
        'not focused',
      );
      expect(fieldStateRef.isFocused).toBe(false);

      // Focus the controller field
      fireEvent.focus(screen.getByTestId('controller-input'));

      await waitFor(() => {
        expect(screen.getByTestId('controller-focused')).toHaveTextContent(
          'focused',
        );
        expect(fieldStateRef.isFocused).toBe(true);
      });

      // Blur the controller field
      fireEvent.blur(screen.getByTestId('controller-input'));

      await waitFor(() => {
        expect(screen.getByTestId('controller-focused')).toHaveTextContent(
          'not focused',
        );
        expect(fieldStateRef.isFocused).toBe(false);
      });
    });
  });
});
