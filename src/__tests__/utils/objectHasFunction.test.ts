import objectHasFunction from '../../core/utils/objectHasFunction';

describe('objectHasFunction', () => {
  it('should detect if any object has function', () => {
    expect(objectHasFunction({})).toBeFalsy();
    expect(
      objectHasFunction({
        test: '',
      }),
    ).toBeFalsy();

    expect(
      objectHasFunction({
        test: () => {},
      }),
    ).toBeTruthy();
  });
});
