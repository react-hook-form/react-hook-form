import omit from '../../utils/omit';

describe('omit', () => {
  it('should remove the property of the object', () => {
    const o = { a: 2, b: 4, c: 'c' };

    expect(omit(o, 'b')).toEqual({ a: 2, c: 'c' });
  });

  it("should return the object if the property doesn't exist", () => {
    const o = { a: 2, b: 4, c: 'c' };

    // @ts-expect-error for testing purpose
    expect(omit(o, 'z')).toEqual(o);
  });
});
