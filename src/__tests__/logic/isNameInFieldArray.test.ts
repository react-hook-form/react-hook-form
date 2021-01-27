import isNameInFieldArray from '../../logic/isNameInFieldArray';

describe('isNameInFieldArray', () => {
  it('should find match array field', () => {
    expect(isNameInFieldArray(new Set(['test']), 'test.0')).toBeTruthy();
    expect(isNameInFieldArray(new Set(['te']), 'test.0')).toBeFalsy();
    expect(isNameInFieldArray(new Set(['te']), 'test.0')).toBeFalsy();
    expect(isNameInFieldArray(new Set(['test1']), 'test[0]')).toBeFalsy();
    expect(isNameInFieldArray(new Set(['test1']), 'test.0')).toBeFalsy();
    expect(
      isNameInFieldArray(new Set(['test']), 'test.0.data[0]'),
    ).toBeTruthy();
    expect(isNameInFieldArray(new Set(['test']), 'test.0.data.0')).toBeTruthy();
    expect(isNameInFieldArray(new Set(['test']), 'test1.0.data.0')).toBeFalsy();
    expect(isNameInFieldArray(new Set(['test']), 'data.0.data.0')).toBeFalsy();
  });
});
