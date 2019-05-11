import filterUndefinedErrors from './filterUndefinedErrors';

describe('filterUndefinedErrors', () => {
  it('should filter out undefined errors fields', () => {
    const errors = {
      test: { type: 'test' },
      bill: { type: undefined },
    };
    // @ts-ignore
    expect(filterUndefinedErrors(errors)).toEqual({ test: { type: 'test' } });
  });
});
