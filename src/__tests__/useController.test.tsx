import React, { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Controller } from '../controller';
import { Control, FieldPath, FieldValues } from '../types';
import { useController } from '../useController';
import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';
import isBoolean from '../utils/isBoolean';
import noop from '../utils/noop';

describe('useController', () => {
  it('should render input correctly', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
        test1: { test: string }[];
      }>();

      useController({
        name: 'test',
        control,
        defaultValue: '',
      });

      return null;
    };

    render(<Component />);
  });

  it('should only subscribe to formState at each useController level', async () => {
    const renderCounter = [0, 0];
    type FormValues = {
      test: string;
      test1: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { field } = useController({
        name: 'test',
        control,
      });

      renderCounter[0]++;

      return <input {...field} />;
    };

    const Test1 = ({ control }: { control: Control<FormValues> }) => {
      const {
        field,
        fieldState: { isDirty, isTouched },
      } = useController({
        name: 'test1',
        control,
      });

      renderCounter[1]++;

      return (
        <div>
          <input {...field} />
          {isDirty && <p>isDirty</p>}
          {isTouched && <p>isTouched</p>}
        </div>
      );
    };

    const Component = () => {
      const { control } = useForm<FormValues>({
        defaultValues: {
          test: '',
          test1: '',
        },
      });

      return (
        <div>
          <Test control={control} />
          <Test1 control={control} />
        </div>
      );
    };

    render(<Component />);

    expect(renderCounter).toEqual([1, 1]);

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: {
        value: '1232',
      },
    });

    expect(screen.getByText('isDirty')).toBeVisible();

    fireEvent.blur(screen.getAllByRole('textbox')[1]);

    expect(screen.getByText('isTouched')).toBeVisible();

    expect(renderCounter).toEqual([1, 3]);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: {
        value: '1232',
      },
    });

    fireEvent.blur(screen.getAllByRole('textbox')[0]);

    expect(renderCounter).toEqual([3, 3]);
  });

  describe('checkbox', () => {
    it('should work for checkbox by spread the field object', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return <input type="checkbox" {...field} />;
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: true }]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: true }, { test: false }]);
    });

    it('should work for checkbox by assign checked', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return (
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        );
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: true }]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: true }, { test: false }]);
    });

    it('should work for checkbox by assign value manually', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return (
          <input
            value="on"
            type="checkbox"
            checked={!!field.value}
            onChange={(e) =>
              field.onChange(e.target.checked ? e.target.value : false)
            }
          />
        );
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: 'on' }]);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(watchResult).toEqual([{}, { test: 'on' }, { test: false }]);
    });
  });

  it('should subscribe to formState update with trigger re-render at root', () => {
    type FormValues = {
      test: string;
    };
    let counter = 0;

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { field, formState } = useController({
        control,
        name: 'test',
      });

      return (
        <>
          <input {...field} />
          <p>{formState.dirtyFields.test && 'dirty'}</p>
          <p>{formState.touchedFields.test && 'touched'}</p>
        </>
      );
    };

    const Component = () => {
      const { control } = useForm<FormValues>({
        defaultValues: {
          test: '',
        },
      });
      counter++;

      return <Test control={control} />;
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.blur(screen.getByRole('textbox'));

    expect(counter).toEqual(1);

    expect(screen.getByText('dirty')).toBeVisible();
    expect(screen.getByText('touched')).toBeVisible();
  });

  it('should not overwrite defaultValues with defaultValue', () => {
    const App = () => {
      const { control } = useForm({
        defaultValues: {
          test: 'bill',
        },
      });

      return (
        <Controller
          render={({ field }) => {
            return <input {...field} />;
          }}
          control={control}
          name={'test'}
          defaultValue={'luo'}
        />
      );
    };

    render(<App />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      'bill',
    );
  });

  it('should be able to update input value without ref', () => {
    const App = () => {
      const { control, setValue } = useForm();
      const { field } = useController({
        control,
        name: 'test',
        defaultValue: '',
      });

      return (
        <div>
          <input value={field.value} onChange={field.onChange} />
          <button
            onClick={() => {
              setValue('test', 'data');
            }}
          >
            setValue
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'data',
    );
  });

  it('should not change reference for onChange and onBlur on input value change', () => {
    let counter = 0;

    const App = () => {
      const { control } = useForm();
      const { field } = useController({
        control,
        name: 'test',
        defaultValue: '',
      });

      useEffect(() => {
        counter++;
        field.onBlur;
        field.onChange;
        field.ref;
      }, [field.onChange, field.onBlur, field.ref]);

      return (
        <div>
          <input value={field.value} onChange={field.onChange} />
          <button
            onClick={() => {
              field.onChange('data');
            }}
          >
            setValue
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'b',
      },
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bi',
      },
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bil',
      },
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bill',
      },
    });

    expect(counter).toEqual(1);
  });

  it('should be able to setValue after reset', async () => {
    let renderCount = 0;

    type FormValues = {
      name: string;
    };

    const Input = ({ control }: { control: Control<FormValues> }) => {
      renderCount++;
      const { field } = useController({
        name: 'name',
        control,
        defaultValue: '',
      });

      return <input {...field} />;
    };

    function App() {
      const { reset, control, setValue } = useForm<FormValues>();

      React.useEffect(() => {
        reset({ name: 'initial' });
      }, [reset]);

      return (
        <div>
          <Input control={control} />
          <button type="button" onClick={() => setValue('name', 'test', {})}>
            setValue
          </button>
        </div>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );
    expect(renderCount).toEqual(3);
  });

  it('should invoke native validation with Controller', async () => {
    const setCustomValidity = jest.fn();
    const reportValidity = jest.fn();
    const focus = jest.fn();
    const message = 'This is required';

    type FormValues = {
      test: string;
    };

    function Input({ control }: { control: Control<FormValues> }) {
      const { field } = useController({
        control,
        rules: { required: message },
        name: 'test',
      });

      return (
        <div>
          <input
            {...field}
            ref={() => {
              field.ref({
                focus,
                setCustomValidity,
                reportValidity,
              });
            }}
          />
        </div>
      );
    }

    function App() {
      const { handleSubmit, control } = useForm<FormValues>({
        defaultValues: {
          test: '',
        },
        mode: 'onChange',
        shouldUseNativeValidation: true,
      });

      return (
        <form onSubmit={handleSubmit(noop)}>
          <Input control={control} />
          <input type="submit" />
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(focus).toBeCalled());
    expect(setCustomValidity).toBeCalledWith(message);
    expect(reportValidity).toBeCalled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bill',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(setCustomValidity).toBeCalledTimes(3));
    expect(reportValidity).toBeCalledTimes(3);
    expect(focus).toBeCalledTimes(2);
  });

  it('should update with inline defaultValue', async () => {
    const onSubmit = jest.fn();
    const App = () => {
      const { control, handleSubmit } = useForm();
      useController({ control, defaultValue: 'test', name: 'test' });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
          })}
        >
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith({
        test: 'test',
      }),
    );
  });

  it('should return defaultValues when component is not yet mounted', async () => {
    const defaultValues = {
      test: {
        deep: [
          {
            test: '0',
            test1: '1',
          },
        ],
      },
    };

    const App = () => {
      const { control, getValues } = useForm<{
        test: {
          deep: { test: string; test1: string }[];
        };
      }>({
        defaultValues,
      });

      const { field } = useController({
        control,
        name: 'test.deep.0.test',
      });

      return (
        <div>
          <input {...field} />
          <p>{JSON.stringify(getValues())}</p>
        </div>
      );
    };

    render(<App />);

    expect(true).toEqual(true);

    expect(
      await screen.findByText('{"test":{"deep":[{"test":"0","test1":"1"}]}}'),
    ).toBeVisible();
  });

  it('should trigger extra re-render and update latest value when setValue called during mount', async () => {
    const Child = () => {
      const { setValue } = useFormContext();
      const {
        field: { value },
      } = useController({
        name: 'content',
      });

      React.useEffect(() => {
        setValue('content', 'expected value');
      }, [setValue]);

      return <p>{value}</p>;
    };

    function App() {
      const methods = useForm({
        defaultValues: {
          content: 'default',
        },
      });

      return (
        <FormProvider {...methods}>
          <form>
            <Child />
            <input type="submit" />
          </form>
        </FormProvider>
      );
    }

    render(<App />);

    expect(await screen.findByText('expected value')).toBeVisible();
  });

  it('should remount with input with current formValue', () => {
    let data: unknown;

    function Input<T extends FieldValues>({
      control,
      name,
    }: {
      control: Control<T>;
      name: FieldPath<T>;
    }) {
      const {
        field: { value },
      } = useController({
        control,
        name,
        shouldUnregister: true,
      });

      data = value;

      return null;
    }

    const App = () => {
      const { control } = useForm<{
        test: string;
      }>({
        defaultValues: {
          test: 'test',
        },
      });
      const [toggle, setToggle] = React.useState(true);

      return (
        <div>
          {toggle && <Input control={control} name={'test'} />}
          <button onClick={() => setToggle(!toggle)}>toggle</button>
        </div>
      );
    };

    render(<App />);

    expect(data).toEqual('test');

    fireEvent.click(screen.getByRole('button'));

    fireEvent.click(screen.getByRole('button'));

    expect(data).toBeUndefined();
  });

  it('should always get the latest value for onBlur event', async () => {
    const watchResults: unknown[] = [];

    const App = () => {
      const { control, watch } = useForm();
      const { field } = useController({
        control,
        name: 'test',
        defaultValue: '',
      });

      watchResults.push(watch());

      return (
        <button
          onClick={() => {
            field.onChange('updated value');
            field.onBlur();
          }}
        >
          test
        </button>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'), {
      target: {
        value: 'test',
      },
    });

    expect(watchResults).toEqual([
      {},
      {
        test: 'updated value',
      },
    ]);
  });

  it('should focus and select the input text', () => {
    const select = jest.fn();
    const focus = jest.fn();

    const App = () => {
      const { control, setFocus } = useForm({
        defaultValues: {
          test: 'data',
        },
      });
      const { field } = useController({
        control,
        name: 'test',
      });

      field.ref({
        select,
        focus,
      });

      React.useEffect(() => {
        setFocus('test', { shouldSelect: true });
      }, [setFocus]);

      return null;
    };

    render(<App />);

    expect(select).toBeCalled();
    expect(focus).toBeCalled();
  });

  it('should update isValid correctly with strict mode', async () => {
    const App = () => {
      const form = useForm({
        mode: 'onChange',
        defaultValues: {
          name: '',
        },
      });
      const { isValid } = form.formState;

      return (
        <React.StrictMode>
          <FormProvider {...form}>
            <Controller
              render={({ field }) => (
                <input value={field.value} onChange={field.onChange} />
              )}
              name="name"
              rules={{
                required: true,
              }}
            />
            <p>{isValid ? 'valid' : 'not'}</p>
          </FormProvider>
        </React.StrictMode>
      );
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('not');
    });
  });

  it('should restore defaultValues with react strict mode double useEffect', () => {
    function Form() {
      return (
        <Controller
          name="lastName"
          shouldUnregister={true}
          render={({ field }) => <input {...field} />}
        />
      );
    }

    function App() {
      const methods = useForm({
        defaultValues: {
          lastName: 'luo',
        },
      });
      const {
        formState: { dirtyFields },
      } = methods;

      return (
        <React.StrictMode>
          <FormProvider {...methods}>
            <form>
              <Form />
              {dirtyFields.lastName ? 'dirty' : 'pristine'}
            </form>
          </FormProvider>
        </React.StrictMode>
      );
    }

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'luo1',
      },
    });

    screen.getByText('dirty');

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'luo',
      },
    });

    screen.getByText('pristine');
  });

  it('should disable the controller input', async () => {
    function Form() {
      const { field } = useController({
        name: 'lastName',
      });
      return <p>{field.disabled ? 'disabled' : ''}</p>;
    }

    function App() {
      const methods = useForm({
        disabled: true,
      });

      return (
        <FormProvider {...methods}>
          <form>
            <Form />
          </form>
        </FormProvider>
      );
    }

    render(<App />);

    await waitFor(() => {
      screen.getByText('disabled');
    });
  });

  it('should disable form input with disabled prop', async () => {
    const App = () => {
      const [disabled, setDisabled] = React.useState(false);
      const { control, watch } = useForm({
        defaultValues: {
          test: 'test',
        },
      });
      const {
        field: { disabled: disabledProps },
      } = useController({
        control,
        name: 'test',
        disabled,
      });

      const input = watch('test');

      return (
        <form>
          <p>{input}</p>
          <button
            onClick={() => {
              setDisabled(!disabled);
            }}
            type={'button'}
          >
            toggle
          </button>
          <p>{disabledProps ? 'disable' : 'notDisabled'}</p>
        </form>
      );
    };

    render(<App />);

    screen.getByText('test');
    screen.getByText('notDisabled');

    fireEvent.click(screen.getByRole('button'));

    waitFor(() => {
      screen.getByText('');
      screen.getByText('disable');
    });
  });

  it('should disable form input field with disabled prop', async () => {
    const App = () => {
      const { control } = useForm();
      const {
        field,
        fieldState: { invalid, isTouched, isDirty },
      } = useController({
        name: 'test',
        control,
        disabled: true,
        rules: { required: true },
      });

      return (
        <form>
          <input {...field} />
          <button>submit</button>
          {invalid && <p>invalid</p>}
          {isTouched && <p>isTouched</p>}
          {isDirty && <p>isDirty</p>}
        </form>
      );
    };

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  it('should not disable form input field with disabled=false', async () => {
    const App = () => {
      const { control } = useForm();
      const {
        field,
        fieldState: { invalid, isTouched, isDirty },
      } = useController({
        name: 'test',
        control,
        disabled: false,
        rules: { required: true },
      });

      return (
        <form>
          <input {...field} />
          <button>submit</button>
          {invalid && <p>invalid</p>}
          {isTouched && <p>isTouched</p>}
          {isDirty && <p>isDirty</p>}
        </form>
      );
    };

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  it('should pass validation with disabled to set to true', () => {
    const callback = jest.fn();

    const App = () => {
      const { handleSubmit, control } = useForm({
        defaultValues: {
          test: 'test',
        },
      });
      const { field } = useController({
        control,
        rules: {
          required: true,
        },
        name: 'test',
        disabled: true,
      });

      return (
        <form onSubmit={handleSubmit(callback)}>
          <input {...field} />
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    waitFor(() => {
      expect(callback).toBeCalled();
    });
  });

  it('should not omit form value when disabled is not been presented', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const { handleSubmit, control } = useForm({
        defaultValues: {
          test: 'test',
        },
      });
      const [toggle, setToggle] = useState<boolean | undefined>(undefined);
      const { field } = useController({
        control,
        name: 'test',
        disabled: toggle,
      });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
          })}
        >
          <input {...field} />
          <button>submit</button>
          <button
            type={'button'}
            onClick={() => {
              setToggle((value) => {
                if (isBoolean(value)) {
                  return false;
                }

                return !value;
              });
            }}
          >
            toggle
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith({
        test: 'test',
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith({
        test: 'test',
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith({
        test: undefined,
      }),
    );
  });

  it('should subscribe to exact form state update', () => {
    type FormValues = {
      test: string;
      test_with_suffix: string;
    };

    const renderCounter: Record<keyof FormValues, number> = {
      test: 0,
      test_with_suffix: 0,
    };

    const ControlledInput = ({
      name,
      control,
    }: {
      name: keyof FormValues;
      control: Control<FormValues>;
    }) => {
      const {
        field,
        fieldState: { error, isDirty },
      } = useController({
        name,
        control,
        rules: { required: 'is required' },
      });

      renderCounter[name]++;

      return (
        <div>
          <input aria-label={name} {...field} />
          {error && (
            <p>
              {name} {error.message}
            </p>
          )}
          {isDirty && <p>{name} isDirty</p>}
        </div>
      );
    };

    const App = () => {
      const { control } = useForm<FormValues>({
        mode: 'onBlur',
        defaultValues: {
          test: '1234',
          test_with_suffix: '1234',
        },
      });
      return (
        <form>
          <ControlledInput name="test" control={control} />
          <ControlledInput name="test_with_suffix" control={control} />
        </form>
      );
    };

    render(<App />);

    expect(renderCounter).toEqual({ test: 1, test_with_suffix: 1 });
    expect(screen.queryByText('test is required')).toBeNull();
    expect(screen.queryByText('test_with_suffix is required')).toBeNull();

    fireEvent.change(screen.getByRole('textbox', { name: 'test' }), {
      target: {
        value: '',
      },
    });

    fireEvent.blur(screen.getByRole('textbox', { name: 'test' }));

    expect(screen.getByText('test isDirty')).toBeVisible();

    expect(renderCounter).toEqual({ test: 2, test_with_suffix: 1 });

    fireEvent.change(
      screen.getByRole('textbox', { name: 'test_with_suffix' }),
      {
        target: {
          value: '',
        },
      },
    );

    fireEvent.blur(screen.getByRole('textbox', { name: 'test_with_suffix' }));

    expect(screen.getByText('test_with_suffix isDirty')).toBeVisible();

    expect(renderCounter).toEqual({ test: 2, test_with_suffix: 2 });
  });
});
