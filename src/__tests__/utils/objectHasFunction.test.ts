import noop from '../../utils/noop';
import objectHasFunction from '../../utils/objectHasFunction';

describe('objectHasFunction', () => {
  it('detect if any object has function', () => {
    expect(objectHasFunction({})).toBeFalsy();
    expect(
      objectHasFunction({
        test: '',
      }),
    ).toBeFalsy();

    expect(
      objectHasFunction({
        test: noop,
      }),
    ).toBeTruthy();
  });

  it('ignores inherited prototype functions and works on null-prototype objects', () => {
    const inherited = Object.create({ inheritedFn: noop });
    inherited.test = '';
    expect(objectHasFunction(inherited)).toBeFalsy();

    const nullProto = Object.assign(Object.create(null), {
      hasOwnProperty: 'value',
      fn: noop,
    });
    expect(objectHasFunction(nullProto)).toBeTruthy();
  });
});
