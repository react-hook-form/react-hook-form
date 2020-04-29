import { appendId } from './mapIds';

describe('appendId', () => {
  it('should add an auto-generated ID', () => {
    expect(appendId({ value: 42 }, 'id')).toEqual({
      value: 42,
      id: expect.any(String),
    });
  });

  it('should not override the keyName if already present', () => {
    expect(appendId({ value: 42, id: 1 }, 'id')).toEqual({ value: 42, id: 1 });
  });
});
