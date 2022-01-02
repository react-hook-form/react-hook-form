import { Primitive } from '../types';

export default (value: unknown): value is Primitive => Object(value) !== value;
