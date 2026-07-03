import type { ExpectStatic } from 'chai';
import type { describe as VitestDescribe, it as VitestIt } from 'vitest';

declare global {
  const describe: typeof VitestDescribe;
  const it: typeof VitestIt;
  const expect: ExpectStatic;
}

export {};
