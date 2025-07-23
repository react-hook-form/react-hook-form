import { describe, expect, it } from 'tstyche';

import type { DeepPartial, ExtractObjects, IsAny, IsNever } from '../types';

describe('IsAny', () => {
  it('should evaluate to true for any', () => {
    expect<IsAny<any>>().type.toBe<true>();
  });

  it('should evaluate to false for never', () => {
    expect<IsAny<never>>().type.toBe<false>();
  });

  it('should evaluate to false for unknown', () => {
    expect<IsAny<unknown>>().type.toBe<false>();
  });

  it('should evaluate to false for string', () => {
    expect<IsAny<string>>().type.toBe<false>();
  });
});

describe('IsNever', () => {
  it('should evaluate to false for any', () => {
    expect<IsNever<any>>().type.toBe<false>();
  });

  it('should evaluate to true for never', () => {
    expect<IsNever<never>>().type.toBe<true>();
  });

  it('should evaluate to false for unknown', () => {
    expect<IsNever<unknown>>().type.toBe<false>();
  });

  it('should evaluate to false for string', () => {
    expect<IsNever<string>>().type.toBe<false>();
  });
});

describe('ExtractObjects', () => {
  it('should extract all objects from a union', () => {
    expect<
      ExtractObjects<
        { x: string } | { y: number; z: { w: number } } | number | string | null
      >
    >().type.toBe<{ x: string } | { y: number; z: { w: number } }>();
  });
});

describe('DeepPartial', () => {
  it('should make all nested properties optional', () => {
    expect<
      DeepPartial<{ x: string; y: number; z: { w: boolean } }>
    >().type.toBe<{ x?: string; y?: number; z?: { w?: boolean } }>();
  });

  it('should make all nested properties optional for union types', () => {
    expect<
      DeepPartial<{ x: string | number; y: { a: string | null } | null }>
    >().type.toBe<{ x?: string | number; y?: { a?: string | null } | null }>();
  });

  it('should make all nested properties optional for intersection types', () => {
    expect<
      DeepPartial<{ x: string; y: { a: string } & { b: number } }>
    >().type.toBe<{ x?: string; y?: { a?: string; b?: number } }>();
  });

  it('should be assignable for types containing unknown', () => {
    expect<DeepPartial<{ x: unknown }>>().type.toBeAssignableWith<{
      x: unknown;
    }>();
  });
});
