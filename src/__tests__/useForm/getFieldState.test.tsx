import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Control } from '../../types';
import { useController } from '../../useController';
import { useForm } from '../../useForm';

type FormValues = {
  nested: {
    first: string;
    last: string;
  };
};

const NestedInput = ({ control }: { control: Control<FormValues> }) => {
  const { field } = useController({
    control,
    name: 'nested',
    rules: {
      validate: (data) => {
        return data.first && data.last ? true : 'This is required';
      },
    },
  });

  return (
    <fieldset>
      <input
        value={field.value.first}
        onChange={(e) => {
          field.onChange({
            ...field.value,
            first: e.target.value,
          });
        }}
        onBlur={field.onBlur}
      />
      <input
        value={field.value.last}
        onChange={(e) => {
          field.onChange({
            ...field.value,
            last: e.target.value,
          });
        }}
        onBlur={field.onBlur}
      />
    </fieldset>
  );
};

describe('getFieldState', () => {
  describe('with field name supplied', () => {
    describe('when input is primitive data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const {
            trigger,
            register,
            getFieldState,
            formState: { errors },
          } = useForm({
            defaultValues: {
              test: '',
            },
          });

          errors;

          return (
            <form>
              <input {...register('test', { required: 'This is required' })} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{getFieldState('test')?.error?.message}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('This is required');
      });

      it('should display isValid state', async () => {
        const App = () => {
          const {
            trigger,
            register,
            getFieldState,
            formState: { errors },
          } = useForm({
            defaultValues: {
              test: '',
            },
          });

          errors;

          return (
            <form>
              <input {...register('test', { required: 'This is required' })} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{getFieldState('test')?.invalid ? 'error' : 'valid'}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('error');
      });

      it('should display isTouched state', async () => {
        const App = () => {
          const {
            register,
            getFieldState,
            formState: { touchedFields },
          } = useForm({
            defaultValues: {
              test: '',
            },
          });

          touchedFields;

          return (
            <form>
              <input {...register('test')} />
              <p>{getFieldState('test')?.isTouched ? 'touched' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.focus(screen.getByRole('textbox'));
          fireEvent.blur(screen.getByRole('textbox'));
        });

        screen.getByText('touched');
      });

      it('should display isDirty state', async () => {
        const App = () => {
          const {
            register,
            getFieldState,
            formState: { dirtyFields },
          } = useForm({
            defaultValues: {
              test: '',
            },
          });

          dirtyFields;

          return (
            <form>
              <input {...register('test')} />
              <p>{getFieldState('test')?.isDirty ? 'dirty' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.change(screen.getByRole('textbox'), {
            target: { value: ' test' },
          });
        });

        screen.getByText('dirty');
      });

      it('should not have error', () => {
        const App = () => {
          const {
            register,
            getFieldState,
            formState: { dirtyFields },
          } = useForm({
            defaultValues: {
              test: '',
            },
          });

          dirtyFields;

          return (
            <form>
              <input {...register('test')} />
              <p>
                {getFieldState('test').error === undefined
                  ? 'error undefined'
                  : ''}
              </p>
            </form>
          );
        };

        render(<App />);

        screen.getByText('error undefined');
      });
    });

    describe('when input is nested data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const {
            trigger,
            getFieldState,
            control,
            formState: { errors },
          } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          errors;

          return (
            <form>
              <NestedInput control={control} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{getFieldState('nested')?.error?.message}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('This is required');
      });

      it('should display isValid state', async () => {
        const App = () => {
          const {
            trigger,
            control,
            getFieldState,
            formState: { errors },
          } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          errors;

          return (
            <form>
              <NestedInput control={control} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{getFieldState('nested')?.invalid ? 'error' : 'valid'}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('error');
      });

      it('should display isTouched state', async () => {
        const App = () => {
          const {
            control,
            getFieldState,
            formState: { touchedFields },
          } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          touchedFields;

          return (
            <form>
              <NestedInput control={control} />
              <p>{getFieldState('nested')?.isTouched ? 'touched' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.focus(screen.getAllByRole('textbox')[0]);
          fireEvent.blur(screen.getAllByRole('textbox')[0]);
        });

        screen.getByText('touched');
      });

      it('should display isDirty state', async () => {
        const App = () => {
          const {
            control,
            getFieldState,
            formState: { dirtyFields },
          } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          dirtyFields;

          return (
            <form>
              <NestedInput control={control} />
              <p>{getFieldState('nested')?.isDirty ? 'dirty' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.change(screen.getAllByRole('textbox')[0], {
            target: { value: ' test' },
          });
        });

        screen.getByText('dirty');
      });

      it('should not have error', () => {
        const App = () => {
          const {
            control,
            getFieldState,
            formState: { dirtyFields },
          } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          dirtyFields;

          return (
            <form>
              <NestedInput control={control} />
              <p>
                {getFieldState('nested').error === undefined
                  ? 'error undefined'
                  : ''}
              </p>
            </form>
          );
        };

        render(<App />);

        screen.getByText('error undefined');
      });
    });
  });

  describe('with form state and field name supplied', () => {
    describe('when input is primitive data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const { trigger, register, getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { error } = getFieldState('test', formState);

          return (
            <form>
              <input {...register('test', { required: 'This is required' })} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{error?.message}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('This is required');
      });

      it('should display isValid state', async () => {
        const App = () => {
          const { trigger, register, getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { invalid } = getFieldState('test', formState);

          return (
            <form>
              <input {...register('test', { required: 'This is required' })} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{invalid ? 'error' : 'valid'}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('error');
      });

      it('should display isTouched state', async () => {
        const App = () => {
          const { register, getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { isTouched } = getFieldState('test', formState);

          return (
            <form>
              <input {...register('test')} />
              <p>{isTouched ? 'touched' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.focus(screen.getByRole('textbox'));
          fireEvent.blur(screen.getByRole('textbox'));
        });

        screen.getByText('touched');
      });

      it('should display isDirty state', async () => {
        const App = () => {
          const { register, getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { isDirty } = getFieldState('test', formState);

          return (
            <form>
              <input {...register('test')} />
              <p>{isDirty ? 'dirty' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.change(screen.getByRole('textbox'), {
            target: { value: ' test' },
          });
        });

        screen.getByText('dirty');
      });

      it('should not have error', () => {
        const App = () => {
          const { register, getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { error } = getFieldState('test', formState);

          return (
            <form>
              <input {...register('test')} />
              <p>{error === undefined ? 'error undefined' : ''}</p>
            </form>
          );
        };

        render(<App />);

        screen.getByText('error undefined');
      });
    });

    describe('when input is nested data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const { trigger, getFieldState, control, formState } =
            useForm<FormValues>({
              defaultValues: {
                nested: {
                  first: '',
                  last: '',
                },
              },
            });

          const { error } = getFieldState('nested', formState);

          return (
            <form>
              <NestedInput control={control} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{error?.message}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('This is required');
      });

      it('should display isValid state', async () => {
        const App = () => {
          const { trigger, control, getFieldState, formState } =
            useForm<FormValues>({
              defaultValues: {
                nested: {
                  first: '',
                  last: '',
                },
              },
            });

          const { invalid } = getFieldState('nested', formState);

          return (
            <form>
              <NestedInput control={control} />
              <button type={'button'} onClick={() => trigger()}>
                trigger
              </button>
              <p>{invalid ? 'error' : 'valid'}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.click(screen.getByRole('button'));
        });

        screen.getByText('error');
      });

      it('should display isTouched state', async () => {
        const App = () => {
          const { control, getFieldState, formState } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          const { isTouched } = getFieldState('nested', formState);

          return (
            <form>
              <NestedInput control={control} />
              <p>{isTouched ? 'touched' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.focus(screen.getAllByRole('textbox')[0]);
          fireEvent.blur(screen.getAllByRole('textbox')[0]);
        });

        screen.getByText('touched');
      });

      it('should display isDirty state', async () => {
        const App = () => {
          const { control, getFieldState, formState } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          const { isDirty } = getFieldState('nested', formState);

          return (
            <form>
              <NestedInput control={control} />
              <p>{isDirty ? 'dirty' : ''}</p>
            </form>
          );
        };

        render(<App />);

        await act(async () => {
          fireEvent.change(screen.getAllByRole('textbox')[0], {
            target: { value: ' test' },
          });
        });

        screen.getByText('dirty');
      });

      it('should not have error', () => {
        const App = () => {
          const { control, getFieldState, formState } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          const { error } = getFieldState('nested', formState);

          return (
            <form>
              <NestedInput control={control} />
              <p>{error === undefined ? 'error undefined' : ''}</p>
            </form>
          );
        };

        render(<App />);

        screen.getByText('error undefined');
      });
    });
  });

  describe('when field is not found', () => {
    it('should return field state', async () => {
      const App = () => {
        const { control, getFieldState, formState } = useForm<FormValues>({
          defaultValues: {
            nested: {
              first: '',
              last: '',
            },
          },
        });

        // @ts-expect-error expected to show type error for field name
        const { isDirty } = getFieldState('nestedMissing', formState);

        // @ts-expect-error expected to show type error for field name
        const { isTouched, error } = getFieldState('nestedMissing');

        return (
          <form>
            <NestedInput control={control} />
            <p>{isDirty ? 'dirty' : 'notDirty'}</p>
            <p>{isTouched ? 'touched' : 'notTouched'}</p>
            <p>{error === undefined ? 'error undefined' : 'error defined'}</p>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: { value: ' test' },
        });
      });

      screen.getByText('notDirty');
      screen.getByText('notTouched');
      screen.getByText('error undefined');
    });
  });
});
