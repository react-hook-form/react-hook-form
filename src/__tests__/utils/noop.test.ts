import noop from '../../utils/noop';

describe('noop', () => {
  it('be a function', () => {
    expect(noop instanceof Function).toBeTruthy();
  });

  it('return undefined', () => {
    const result = noop();

    expect(result).toBeUndefined();
  });
});
