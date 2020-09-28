import { createRollupConfig } from './createRollupConfig';
import pkg from '../../package.json';

export default createRollupConfig({
  name: 'index',
  format: 'esm',
  input: pkg.source,
});
