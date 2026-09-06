import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { useForm } from '../../useForm';
import { useFormState } from '../../useFormState';

describe('resetField', () => {
  it('should reset input value', () => {
    const App = () => {
      const { register, resetField } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      return (
        <form>
          <input {...register('test')} />
          <button
            type={'button'}
            onClick={() => {
              resetField('test');
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1234',
      },
    });

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      '1234',
    );

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );
  });

  it('should reset input touched field state', async () => {
    const App = () => {
      const {
        register,
        resetField,
        formState: { touchedFields },
      } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      return (
        <form>
          <input {...register('test')} />
          <p>{touchedFields.test ? 'touched' : 'noTouched'}</p>
          <button
            type={'button'}
            onClick={() => {
              resetField('test');
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.focus(screen.getByRole('textbox'));

    fireEvent.blur(screen.getByRole('textbox'));

    expect(await screen.findByText('touched')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('noTouched')).toBeVisible();
  });

  it('should reset input dirty field and dirty state', async () => {
    const App = () => {
      const {
        register,
        resetField,
        formState: { dirtyFields, isDirty },
      } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      return (
        <form>
          <input {...register('test')} />
          <p>{dirtyFields.test ? 'dirty' : 'notDirty'}</p>
          <p>{isDirty ? 'formDirty' : 'formNotDirty'}</p>
          <button
            type={'button'}
            onClick={() => {
              resetField('test');
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1234',
      },
    });

    expect(await screen.findByText('dirty')).toBeVisible();
    expect(screen.getByText('formDirty')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('notDirty')).toBeVisible();
    expect(screen.getByText('formNotDirty')).toBeVisible();
  });

  it('should reset input error field and isValid state', async () => {
    const App = () => {
      const {
        register,
        resetField,
        formState: { errors, isValid },
      } = useForm({
        defaultValues: {
          test: 'test',
        },
        mode: 'onChange',
      });

      return (
        <form>
          <input {...register('test', { maxLength: 4 })} />
          <p>{errors.test ? 'error' : 'noError'}</p>
          <p>{isValid ? 'valid' : 'NotValid'}</p>
          <button
            type={'button'}
            onClick={() => {
              resetField('test');
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    expect(await screen.findByText('valid')).toBeVisible();
    expect(screen.getByText('noError')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test12345',
      },
    });

    expect(await screen.findByText('NotValid')).toBeVisible();
    expect(screen.getByText('error')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('valid')).toBeVisible();
    expect(screen.getByText('noError')).toBeVisible();
  });

  it('should reset input file to empty string only', () => {
    const getValuesFn = jest.fn();

    const App = () => {
      const { register, resetField, getValues } = useForm({
        defaultValues: {
          test: '',
        },
      });

      return (
        <form>
          <input type={'file'} {...register('test')} />
          <button
            type={'button'}
            onClick={() => {
              resetField('test', { defaultValue: '' });
            }}
          >
            reset
          </button>
          <button
            type={'button'}
            onClick={() => {
              getValuesFn(getValues());
            }}
          >
            getValues
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'getValues' }));

    expect(getValuesFn).toHaveBeenCalledWith({ test: '' });

    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    expect(getValuesFn).toHaveBeenCalledWith({ test: '' });
  });

  it('should notify a memoized field-scoped subscriber after an unrelated field validated via onChange', async () => {
    const BWatcher = React.memo(({ control }: { control: any }) => {
      const { touchedFields } = useFormState({
        control,
        name: 'b',
        exact: true,
      });
      return <p>b-touched:{String(!!touchedFields.b)}</p>;
    });

    const App = () => {
      const { register, control, resetField } = useForm({
        mode: 'onChange',
        defaultValues: { a: '', b: '' },
      });

      return (
        <div>
          <input {...register('a', { required: true })} />
          <input {...register('b')} />
          <BWatcher control={control} />
          <button
            type={'button'}
            onClick={() => resetField('b', { keepTouched: false })}
          >
            resetB
          </button>
        </div>
      );
    };

    render(<App />);

    // Touch field 'b' so there is a real touched:true -> false transition
    // to observe.
    await act(async () => {
      fireEvent.blur(screen.getAllByRole('textbox')[1]);
    });
    expect(await screen.findByText('b-touched:true')).toBeVisible();

    // Drive an unrelated field 'a' through onChange validation. Before the
    // fix, this permanently leaked `name: 'a'` into `_formState`, which
    // caused later notifications that don't set their own `name` (like
    // resetField's) to inherit it and get gated out for any other
    // field-scoped subscriber.
    await act(async () => {
      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: { value: 'x' },
      });
    });
    await act(async () => {
      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: { value: '' },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'resetB' }));
    });

    expect(await screen.findByText('b-touched:false')).toBeVisible();
  });

  describe('when provided with options', () => {
    it('should update input value and its defaultValue', () => {
      const App = () => {
        const { register, resetField } = useForm({
          defaultValues: {
            test: 'test',
          },
        });

        return (
          <form>
            <input {...register('test')} />
            <button
              type={'button'}
              onClick={() => {
                resetField('test', {
                  defaultValue: 'test1234',
                });
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: '1234',
        },
      });

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '1234',
      );

      fireEvent.click(screen.getByRole('button'));

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        'test1234',
      );
    });

    it('should keep touched field state', async () => {
      const App = () => {
        const {
          register,
          resetField,
          formState: { touchedFields },
        } = useForm({
          defaultValues: {
            test: 'test',
          },
        });

        return (
          <form>
            <input {...register('test')} />
            <p>{touchedFields.test ? 'touched' : 'noTouched'}</p>
            <button
              type={'button'}
              onClick={() => {
                resetField('test', { keepTouched: true });
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      fireEvent.focus(screen.getByRole('textbox'));

      fireEvent.blur(screen.getByRole('textbox'));

      expect(await screen.findByText('touched')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByText('touched')).toBeVisible();
    });

    it('should keep dirty field and isDirty state', async () => {
      const App = () => {
        const {
          register,
          resetField,
          formState: { dirtyFields, isDirty },
        } = useForm({
          defaultValues: {
            test: 'test',
          },
        });

        return (
          <form>
            <input {...register('test')} />
            <p>{dirtyFields.test ? 'dirty' : 'notDirty'}</p>
            <p>{isDirty ? 'formDirty' : 'formNotDirty'}</p>
            <button
              type={'button'}
              onClick={() => {
                resetField('test', { keepDirty: true });
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: '1234',
        },
      });

      expect(await screen.findByText('dirty')).toBeVisible();
      expect(screen.getByText('formDirty')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByText('dirty')).toBeVisible();
      expect(screen.getByText('formDirty')).toBeVisible();
    });

    it('should skip reset error field and isValid state', async () => {
      const App = () => {
        const {
          register,
          resetField,
          formState: { errors, isValid },
        } = useForm({
          defaultValues: {
            test: 'test',
          },
          mode: 'onChange',
        });

        return (
          <form>
            <input {...register('test', { maxLength: 4 })} />
            <p>{errors.test ? 'error' : 'noError'}</p>
            <p>{isValid ? 'valid' : 'NotValid'}</p>
            <button
              type={'button'}
              onClick={() => {
                resetField('test', { keepError: true });
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      expect(await screen.findByText('valid')).toBeVisible();
      expect(screen.getByText('noError')).toBeVisible();

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: 'test12345',
        },
      });

      expect(await screen.findByText('NotValid')).toBeVisible();
      expect(screen.getByText('error')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByText('NotValid')).toBeVisible();
      expect(screen.getByText('error')).toBeVisible();
    });

    it('should work with objects as defaultValue', async () => {
      const App = () => {
        const {
          register,
          resetField,
          formState: { isDirty },
        } = useForm({
          defaultValues: {
            nestedObjectTest: {
              test: 'test',
            },
          },
          mode: 'onChange',
        });

        return (
          <form>
            <input {...register('nestedObjectTest.test', { maxLength: 4 })} />
            <p>{isDirty ? 'isDirty' : 'isNotDirty'}</p>
            <button
              type={'button'}
              onClick={() => {
                resetField('nestedObjectTest', {
                  defaultValue: { test: 'test2' },
                });
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      expect(await screen.findByText('isNotDirty')).toBeVisible();

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: 'abcd',
        },
      });

      expect(await screen.findByText('isDirty')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: '1234',
        },
      });

      expect(await screen.findByText('isDirty')).toBeVisible();
    });
  });

  it('should update isValid state for a subscribe only consumer', async () => {
    const App = () => {
      const { register, resetField, subscribe } = useForm({
        defaultValues: {
          test: 'test',
        },
        mode: 'onChange',
      });
      const [isValid, setIsValid] = React.useState(false);

      React.useEffect(() => {
        return subscribe({
          formState: {
            isValid: true,
          },
          callback: (formState) => setIsValid(formState.isValid),
        });
      }, [subscribe]);

      return (
        <form>
          <input {...register('test', { required: true })} />
          <p>{isValid ? 'valid' : 'NotValid'}</p>
          <button
            type={'button'}
            onClick={() => {
              resetField('test');
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    expect(await screen.findByText('NotValid')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('valid')).toBeVisible();
  });
});
