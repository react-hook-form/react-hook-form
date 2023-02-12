import isString from '../utils/isString';
import { Message } from '..';

export default (value: unknown): value is Message => isString(value);
