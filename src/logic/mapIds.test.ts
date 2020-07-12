import { appendId, mapIds } from './mapIds';

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

describe('mapIds', () => {
  it('should map ID to each element of an array', () => {
    expect(mapIds([1, 2, 3], 'id')).toEqual([
      { value: 1, id: '1' },
      { value: 2, id: '1' },
      { value: 3, id: '1' },
    ]);
  });

  it('should return an empty array when data passed is not an array', () => {
    expect(mapIds({} as any, 'id')).toEqual([]);
  });
});
