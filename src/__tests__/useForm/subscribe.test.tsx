import { createFormControl } from '../../logic';

describe('subscribe', () => {
  it('should subscribe to correct form state', () => {
    const { subscribe, register, setValue } = createFormControl({
      defaultValues: {
        test: '',
      },
    });

    subscribe({
      formState: {
        isDirty: true,
      },
      callback: () => {},
    });

    register('test');
    setValue('test', 'data', { shouldDirty: true });
  });
});
