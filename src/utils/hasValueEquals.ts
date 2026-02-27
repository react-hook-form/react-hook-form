import isNullOrUndefined from './isNullOrUndefined';
import { isObjectType } from './isObjectType';

export default (value: unknown): value is { equals: (other: any) => boolean } =>
  !isNullOrUndefined(value) &&
  isObjectType(value) &&
  'equals' in value &&
  typeof (value as any).equals === 'function';
