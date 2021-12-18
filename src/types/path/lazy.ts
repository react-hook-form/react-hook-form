import { FieldValues } from '../fields';

import {
  ArrayKey,
  AsKeyList,
  EvaluateKeyList,
  IsTuple,
  JoinKeyList,
  KeyList,
  PathString,
  SplitPathString,
  ToKey,
  Traversable,
  TupleKey,
} from './internal';

type CheckKeyConstraint<T, K extends keyof T, U> = T[K] extends U
  ? ToKey<K>
  : never;

type Keys<T, U = unknown> = T extends Traversable
  ? T extends ReadonlyArray<any>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKey<T>]-?: CheckKeyConstraint<T, K, U>;
        }[TupleKey<T>]
      : CheckKeyConstraint<T, ArrayKey, U>
    : {
        [K in keyof T]-?: CheckKeyConstraint<T, K, U>;
      }[keyof T]
  : never;

type ValidKeyListPrefixTailRecursive<
  T,
  KL extends KeyList,
  VKL extends KeyList,
> = KL extends [infer K, ...infer R]
  ? K extends Keys<T>
    ? ValidKeyListPrefixTailRecursive<
        EvaluateKeyList<T, AsKeyList<[K]>>,
        AsKeyList<R>,
        AsKeyList<[...VKL, K]>
      >
    : VKL
  : VKL;

type ValidKeyListPrefix<
  T,
  KL extends KeyList,
> = ValidKeyListPrefixTailRecursive<T, KL, []>;

type SuggestParentPath<KL extends KeyList> = JoinKeyList<DropLastElement<KL>>;

type SuggestChildPaths<
  T,
  KL extends KeyList,
  U,
  _K = Keys<EvaluateKeyList<T, KL>, U | Traversable>,
> = [_K] extends [never] ? never : JoinKeyList<AsKeyList<[...KL, _K]>>;

type DropLastElement<T extends ReadonlyArray<any>> = T extends [...infer R, any]
  ? R
  : [];

type CompletePathString<
  T,
  PS extends PathString,
  U,
  _VKLP extends KeyList = ValidKeyListPrefix<T, SplitPathString<PS>>,
  _VPS extends PathString = JoinKeyList<_VKLP>,
> =
  | SuggestChildPaths<T, _VKLP, U>
  | (PS extends _VPS
      ?
          | SuggestParentPath<_VKLP>
          | (EvaluateKeyList<T, _VKLP> extends U ? PS : never)
      : _VPS);

export type LazyPath<T, TPathString extends PathString> = CompletePathString<
  T,
  TPathString,
  unknown
>;

export type LazyFieldPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyPath<TFieldValues, TPathString>;

export type LazyArrayPath<
  T,
  TPathString extends PathString,
> = CompletePathString<T, TPathString, ReadonlyArray<any>>;

export type LazyFieldArrayPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = LazyArrayPath<TFieldValues, TPathString>;
