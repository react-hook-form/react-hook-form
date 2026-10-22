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

  it('not detect functions inherited from Object.prototype', () => {
    const polyfillKey = '__rhfTestPolyfill__';
    (Object.prototype as any)[polyfillKey] = () => 123;

    try {
      expect(objectHasFunction({})).toBeFalsy();
      expect(objectHasFunction({ test: 'value' })).toBeFalsy();
      expect(objectHasFunction({ test: noop })).toBeTruthy();
    } finally {
      delete (Object.prototype as any)[polyfillKey];
    }
  });

  it('support null-prototype or hasOwnProperty-shadowing objects', () => {
    const nullProto: any = Object.create(null);
    nullProto.a = 1;
    expect(objectHasFunction(nullProto)).toBeFalsy();

    nullProto.fn = noop;
    expect(objectHasFunction(nullProto)).toBeTruthy();

    const shadowed = { hasOwnProperty: 'value', test: 123 };
    expect(objectHasFunction(shadowed)).toBeFalsy();

    const shadowedWithFn = { hasOwnProperty: 'value', test: noop };
    expect(objectHasFunction(shadowedWithFn)).toBeTruthy();
  });

  it('detect methods inherited from a class or constructor prototype', () => {
    function DateValue(this: { $d: Date }) {
      this.$d = new Date('2024-01-01');
    }
    DateValue.prototype.format = noop;

    expect(objectHasFunction(new (DateValue as any)())).toBeTruthy();
    expect(objectHasFunction(new File([''], 'a.png'))).toBeTruthy();
    expect(objectHasFunction(Object.create(FileList.prototype))).toBeTruthy();
  });
});
