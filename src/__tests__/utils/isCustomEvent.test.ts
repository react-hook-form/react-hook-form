import isCustomEvent from '../../utils/isCustomEvent';

describe('isCustomEvent', () => {
  it('should return true when object instance is CustomEvent', () => {
    const mockCustomEvent = new CustomEvent('event');

    expect(isCustomEvent(mockCustomEvent)).toBe(true);
  });

  it('should return false when object instance is not CustomEvent', () => {
    const mockEvent = new Event('event');

    expect(isCustomEvent(mockEvent)).toBe(false);
  });

  it('should return false when parameter received is not CustomEvent', () => {
    expect(isCustomEvent('something else')).toBe(false);
  });
});
