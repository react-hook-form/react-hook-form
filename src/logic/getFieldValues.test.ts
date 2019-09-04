import getFieldsValues from './getFieldValues';

jest.mock('./getFieldValue', () => ({
  default: () => 'test',
}));

describe('getFieldsValues', () => {
  it('should return all fields value', () => {
    expect(
      getFieldsValues({
        test: {
          ref: { name: 'test' },
        },
        test1: {
          ref: { name: 'test1' },
        },
      }),
    ).toEqual({
      test: 'test',
      test1: 'test',
    });
  });
});
