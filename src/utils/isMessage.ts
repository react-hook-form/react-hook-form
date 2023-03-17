import { Message } from '../types';
import isString from '../utils/isString';

export default (value: unknown): value is Message => isString(value);
