import { createRollupConfig } from './createRollupConfig';
import pkg from '../../package.json';

const name = 'index';
const options = [{ name, format: 'esm', input: pkg.source }];

export default options.map((option) => createRollupConfig(option));
