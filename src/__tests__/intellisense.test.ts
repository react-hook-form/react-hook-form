import { completionsFactory } from './__fixtures__/completions';

const completions = completionsFactory(__dirname);

describe('IntelliSense', () => {
  it('should show completions for useController name prop', () => {
    const [result] = completions`
      import {useController, Control} from '..'
      declare const control: Control<{foo: string}>
      useController({
        control,
        name: '${undefined}'
      })`;
    expect(result).toContainEqual({ kind: 'string', name: 'foo' });
  });

  it('should show completions for useWatch name prop', () => {
    const [result] = completions`
      import {useWatch, Control} from '..'
      declare const control: Control<{foo: string}>
      useWatch({
        control,
        name: '${undefined}'
      })`;
    expect(result).toContainEqual({ kind: 'string', name: 'foo' });
  });

  it('should show completions for useWatch name tuple prop', () => {
    const [result] = completions`
      import {useWatch, Control} from '..'
      declare const control: Control<{foo: string}>
      useWatch({
        control,
        name: ['${undefined}']
      })`;
    expect(result).toContainEqual({ kind: 'string', name: 'foo' });
  });
});
