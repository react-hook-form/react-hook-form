import { createFormControl } from '../../logic/createFormControl';
import cloneObject from '../../utils/cloneObject';

describe('cloning sparse arrays', () => {
  it('preserves the length and holes of an array with no assigned slots', () => {
    const data = new Array(3);
    const copy = cloneObject(data);

    expect(copy).not.toBe(data);
    expect(copy).toHaveLength(3);
    expect(Object.keys(copy)).toEqual([]);
  });

  it('preserves trailing holes while cloning assigned values', () => {
    const data = new Array(4);
    data[1] = { value: 'before' };
    const copy = cloneObject(data);

    expect(copy).toHaveLength(4);
    expect(Object.keys(copy)).toEqual(['1']);
    expect(copy[1]).not.toBe(data[1]);
    copy[1].value = 'after';
    expect(data[1].value).toBe('before');
  });

  it('preserves sparse array length in default values', () => {
    const form = createFormControl({ defaultValues: { items: new Array(3) } });

    expect(form.getValues('items')).toHaveLength(3);
  });

  it('preserves sparse array length in reset values', () => {
    const form = createFormControl({ defaultValues: { items: [] } });

    form.reset({ items: new Array(5) });
    expect(form.getValues('items')).toHaveLength(5);
    expect(Object.keys(form.getValues('items'))).toEqual([]);
  });
});
