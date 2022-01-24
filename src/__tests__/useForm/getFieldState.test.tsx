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
            _getFieldState,
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
              <p>{_getFieldState('test')?.error?.message}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('test')?.invalid ? 'error' : 'valid'}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('test')?.isTouched ? 'touched' : ''}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('test')?.isDirty ? 'dirty' : ''}</p>
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
    });

    describe('when input is nested data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const {
            trigger,
            _getFieldState,
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
              <p>{_getFieldState('nested')?.error?.message}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('nested')?.invalid ? 'error' : 'valid'}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('nested')?.isTouched ? 'touched' : ''}</p>
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
            _getFieldState,
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
              <p>{_getFieldState('nested')?.isDirty ? 'dirty' : ''}</p>
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
    });
  });

  describe('with form state and field name supplied', () => {
    describe('when input is primitive data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const { trigger, register, _getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { error } = _getFieldState('test', formState);

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
          const { trigger, register, _getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { invalid } = _getFieldState('test', formState);

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
          const { register, _getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { isTouched } = _getFieldState('test', formState);

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
          const { register, _getFieldState, formState } = useForm({
            defaultValues: {
              test: '',
            },
          });

          const { isDirty } = _getFieldState('test', formState);

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
    });

    describe('when input is nested data type', () => {
      it('should display error state', async () => {
        const App = () => {
          const { trigger, _getFieldState, control, formState } =
            useForm<FormValues>({
              defaultValues: {
                nested: {
                  first: '',
                  last: '',
                },
              },
            });

          const { error } = _getFieldState('nested', formState);

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
          const { trigger, control, _getFieldState, formState } =
            useForm<FormValues>({
              defaultValues: {
                nested: {
                  first: '',
                  last: '',
                },
              },
            });

          const { invalid } = _getFieldState('nested', formState);

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
          const { control, _getFieldState, formState } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          const { isTouched } = _getFieldState('nested', formState);

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
          const { control, _getFieldState, formState } = useForm<FormValues>({
            defaultValues: {
              nested: {
                first: '',
                last: '',
              },
            },
          });

          const { isDirty } = _getFieldState('nested', formState);

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
    });
  });

  describe('when field is not found', () => {
    it('should return field state', async () => {
      const App = () => {
        const { control, _getFieldState, formState } = useForm<FormValues>({
          defaultValues: {
            nested: {
              first: '',
              last: '',
            },
          },
        });

        // @ts-expect-error expected to show type error for field name
        const { isDirty } = _getFieldState(formState, 'nestedMissing');

        // @ts-expect-error expected to show type error for field name
        const { isTouched } = _getFieldState('nestedMissing');

        return (
          <form>
            <NestedInput control={control} />
            <p>{isDirty ? 'dirty' : 'notDirty'}</p>
            <p>{isTouched ? 'touched' : 'notTouched'}</p>
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
    });
  });
});
