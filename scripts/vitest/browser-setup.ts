import { cleanup } from '@testing-library/react';
import { expect as chaiExpect } from 'chai';
import { afterEach, beforeEach } from 'vitest';

import { cy, flushCyCommands } from '../../cypress/support/cy';

Object.assign(globalThis, {
  cy,
  expect: chaiExpect,
});

beforeEach(async () => {
  await flushCyCommands();
  cleanup();
});

afterEach(async () => {
  await flushCyCommands();
  cleanup();
});
