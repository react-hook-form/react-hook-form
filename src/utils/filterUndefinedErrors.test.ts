import filterUndefinedErrors from './filterUndefinedErrors';

describe('filterUndefinedErrors', () => {
  it('should filter out undefined errors fields', () => {
    const errors = {
      test: { type: 'test' },
      bill: { type: undefined },
      bill1: { type: 'required' },
      bill2: { type: 'required' },
    };
    // @ts-ignore
    expect(filterUndefinedErrors(errors)).toEqual({
      test: { type: 'test' },
      bill1: { type: 'required' },
      bill2: { type: 'required' },
    });
  });
});
