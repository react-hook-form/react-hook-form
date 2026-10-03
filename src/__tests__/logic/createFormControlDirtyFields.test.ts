import { createFormControl } from '../../logic/createFormControl';

describe('createFormControl dirtyFields', () => {
  it.each([
    { dirtyFields: true },
    { dirtyFields: true, isDirty: true },
    { isDirty: true },
  ])(
    'should not retroactively mark setValue without shouldDirty as dirty (%o)',
    async (formState) => {
      const { control, register, setValue, subscribe } = createFormControl<{
        firstName: string;
        lastName: string;
      }>({
        defaultValues: {
          firstName: '',
          lastName: '',
        },
      });

      subscribe({ formState, callback: jest.fn() });

      register('firstName');
      const lastName = register('lastName');

      setValue('firstName', 'Bill');

      expect(control._formState.dirtyFields).toEqual({});

      await lastName.onChange({
        type: 'change',
        target: { name: 'lastName', value: 'Smith' },
      });

      expect(control._formState.dirtyFields).toEqual({ lastName: true });
    },
  );

  describe('parent object and nested field dirty transitions', () => {
    type FormValues = { user: { name: string; age: number } };

    const setup = ({
      registerChildren,
      formState,
    }: {
      registerChildren: boolean;
      formState: Record<string, boolean>;
    }) => {
      const form = createFormControl<FormValues>({
        defaultValues: { user: { name: 'Bill', age: 20 } },
      });

      form.subscribe({ formState, callback: jest.fn() });

      if (registerChildren) {
        form.register('user.name');
        form.register('user.age');
      }

      return form;
    };

    describe.each([
      { registerChildren: true, formState: { dirtyFields: true } },
      {
        registerChildren: true,
        formState: { dirtyFields: true, isDirty: true },
      },
      { registerChildren: false, formState: { dirtyFields: true } },
      {
        registerChildren: false,
        formState: { dirtyFields: true, isDirty: true },
      },
    ])('%o', (options) => {
      it('should clear nested dirty state when a child restores a parent update', () => {
        const { control, setValue } = setup(options);

        setValue(
          'user',
          { name: 'John', age: 20 },
          {
            shouldDirty: true,
          },
        );

        expect(control._formState.dirtyFields).toEqual({
          user: { name: true },
        });

        setValue('user.name', 'Bill', { shouldDirty: true });

        expect(control._formState.dirtyFields).toEqual({});
      });

      it('should clear nested dirty state when a parent restores a child update', () => {
        const { control, setValue } = setup(options);

        setValue('user.name', 'John', { shouldDirty: true });

        expect(control._formState.dirtyFields).toEqual({
          user: { name: true },
        });

        setValue(
          'user',
          { name: 'Bill', age: 20 },
          {
            shouldDirty: true,
          },
        );

        expect(control._formState.dirtyFields).toEqual({});
      });

      it('should keep sibling dirty state when a child restores part of a parent update', () => {
        const { control, setValue } = setup(options);

        setValue(
          'user',
          { name: 'John', age: 21 },
          {
            shouldDirty: true,
          },
        );

        expect(control._formState.dirtyFields).toEqual({
          user: { name: true, age: true },
        });

        setValue('user.name', 'Bill', { shouldDirty: true });

        expect(control._formState.dirtyFields).toEqual({
          user: { age: true },
        });
      });

      it('should settle nested dirty state across child, parent, child updates', () => {
        const { control, setValue } = setup(options);

        setValue('user.name', 'John', { shouldDirty: true });
        setValue(
          'user',
          { name: 'John', age: 20 },
          {
            shouldDirty: true,
          },
        );

        expect(control._formState.dirtyFields).toEqual({
          user: { name: true },
        });

        setValue('user.name', 'Bill', { shouldDirty: true });

        expect(control._formState.dirtyFields).toEqual({});
      });
    });

    it('should clear nested dirty state when a parent update restores a user edit', async () => {
      const { control, register, setValue } = setup({
        registerChildren: true,
        formState: { dirtyFields: true },
      });

      await register('user.name').onChange({
        type: 'change',
        target: { name: 'user.name', value: 'John' },
      });

      expect(control._formState.dirtyFields).toEqual({
        user: { name: true },
      });

      setValue(
        'user',
        { name: 'Bill', age: 20 },
        {
          shouldDirty: true,
        },
      );

      expect(control._formState.dirtyFields).toEqual({});
    });

    it('should clear nested dirty state when a user edit restores a parent update', async () => {
      const { control, register, setValue } = setup({
        registerChildren: true,
        formState: { dirtyFields: true },
      });

      setValue(
        'user',
        { name: 'John', age: 20 },
        {
          shouldDirty: true,
        },
      );

      await register('user.name').onChange({
        type: 'change',
        target: { name: 'user.name', value: 'Bill' },
      });

      expect(control._formState.dirtyFields).toEqual({});
    });
  });
});
