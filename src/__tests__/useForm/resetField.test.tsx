import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../../useForm';

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

    await waitFor(async () => {
      screen.getByText('touched');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(async () => {
      screen.getByText('noTouched');
    });
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

    await waitFor(async () => {
      screen.getByText('dirty');
      screen.getByText('formDirty');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(async () => {
      screen.getByText('notDirty');
      screen.getByText('formNotDirty');
    });
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

    await waitFor(async () => {
      screen.getByText('noError');
      screen.getByText('valid');
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test12345',
      },
    });

    await waitFor(async () => {
      screen.getByText('error');
      screen.getByText('NotValid');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(async () => {
      screen.getByText('noError');
      screen.getByText('valid');
    });
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

      await waitFor(async () => {
        screen.getByText('touched');
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(async () => {
        screen.getByText('touched');
      });
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

      await waitFor(async () => {
        screen.getByText('dirty');
        screen.getByText('formDirty');
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(async () => {
        screen.getByText('dirty');
        screen.getByText('formDirty');
      });
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

      await waitFor(async () => {
        screen.getByText('noError');
        screen.getByText('valid');
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: 'test12345',
        },
      });

      await waitFor(async () => {
        screen.getByText('error');
        screen.getByText('NotValid');
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(async () => {
        screen.getByText('error');
        screen.getByText('NotValid');
      });
    });
  });
});
