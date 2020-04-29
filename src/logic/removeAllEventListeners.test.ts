import removeAllEventListeners from './removeAllEventListeners';

describe('removeAllEventListeners', () => {
  it('should return undefined when removeEventListener is not defined', () => {
    expect(removeAllEventListeners({}, () => {})).toBeUndefined();
  });

  it('should remove all events', () => {
    const removeEventListener = jest.fn();
    const validateWithStateUpdate = jest.fn();
    const ref = {
      removeEventListener,
    };
    removeAllEventListeners(ref, validateWithStateUpdate);
    expect(removeEventListener).toBeCalledWith(
      'input',
      validateWithStateUpdate,
    );
    expect(removeEventListener).toBeCalledWith(
      'change',
      validateWithStateUpdate,
    );
    expect(removeEventListener).toBeCalledWith('blur', validateWithStateUpdate);
  });
});
