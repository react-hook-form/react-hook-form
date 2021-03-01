const isWeb = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const isWeb = require('./isWeb');

  return isWeb.default;
};

describe('isWeb', () => {
  let productGetter: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    productGetter = jest.spyOn(window.navigator, 'product', 'get');
  });

  it('should return true when in a browser', () => {
    expect(isWeb()).toBeTruthy();
  });

  it('should return false when navigator product is ReactNative', () => {
    productGetter.mockReturnValue('ReactNative');
    expect(isWeb()).toBeFalsy();
  });
});
