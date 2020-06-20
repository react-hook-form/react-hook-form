import { appendId } from './mapIds';

jest.mock('../logic/generateId', () => ({
  default: () => '1',
}));

describe('appendId', () => {
  it('should add an auto-generated ID', () => {
    expect(appendId({ value: 42 }, 'id')).toEqual({
      value: 42,
      id: '1',
    });
  });

  it('should not override the keyName if already present', () => {
    expect(appendId({ value: 42, id: 1 }, 'id')).toEqual({ value: 42, id: 1 });
  });

  it('should be object when value is number', () => {
    expect(appendId(42 as any, 'id')).toEqual({ value: 42, id: '1' });
  });
});
