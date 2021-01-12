import { DeepMap } from './utils';

// @ts-ignore
function DeepMapGenericTest<T extends { a: string; b: string; c: string }>() {
  const a = (null as any) as DeepMap<T, { test: 'A' }>;
  a.a?.test;
  a.b?.test;
  a.c?.test;
}
