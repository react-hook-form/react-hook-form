import displayNativeError from './displayNativeError';

describe('displayNativeError', () => {
  it('should call setCustomValidity when is using native validation and message is a string', () => {
    const setCustomValidity = jest.fn();
    const ref = {
      setCustomValidity,
    };
    displayNativeError(true, ref, 'test');
    expect(setCustomValidity).toBeCalledWith('test');
  });
});
