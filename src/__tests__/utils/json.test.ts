import safeJSON, { safeJSONParse, safeJSONStringify } from '../../utils/json';

describe('safeJSONStringify', () => {
  it('should stringify a serialisable value', () => {
    expect(safeJSONStringify({ test: 'data' })).toEqual('{"test":"data"}');
    expect(safeJSONStringify([1, 2, 3])).toEqual('[1,2,3]');
    expect(safeJSONStringify(null)).toEqual('null');
  });

  it('should serialise a nested date to an ISO string', () => {
    expect(safeJSONStringify({ test: new Date(0) })).toEqual(
      '{"test":"1970-01-01T00:00:00.000Z"}',
    );
  });

  it('should return an empty string when stringify throws', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(safeJSONStringify(circular)).toEqual('');
    expect(safeJSONStringify({ test: BigInt(1) })).toEqual('');
  });

  it('should return undefined for values stringify omits', () => {
    expect(safeJSONStringify(undefined)).toBeUndefined();
    expect(safeJSONStringify()).toBeUndefined();
    expect(safeJSONStringify(() => {})).toBeUndefined();
  });
});

describe('safeJSONParse', () => {
  it('should parse valid JSON', () => {
    expect(safeJSONParse('{"test":"data"}')).toEqual({ test: 'data' });
    expect(safeJSONParse('[1,2,3]')).toEqual([1, 2, 3]);
    expect(safeJSONParse('42')).toEqual(42);
    expect(safeJSONParse('null')).toBeNull();
  });

  it('should return undefined when parse throws', () => {
    expect(safeJSONParse('{test:}')).toBeUndefined();
    expect(safeJSONParse('')).toBeUndefined();
    expect(safeJSONParse(undefined)).toBeUndefined();
  });
});

describe('safeJSON', () => {
  it('should expose stringify and parse', () => {
    expect(safeJSON.stringify).toEqual(safeJSONStringify);
    expect(safeJSON.parse).toEqual(safeJSONParse);
  });

  it('should round-trip a value', () => {
    const value = { test: ['data', 1, true, null] };

    expect(safeJSON.parse(safeJSON.stringify(value))).toEqual(value);
  });
});
