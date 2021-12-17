import {
  AsKeyList,
  EvaluateKeyList,
  JoinKeyList,
  KeyList,
  Keys,
  PathString,
  SplitPathString,
  Traversable,
} from './internal';

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

type PreviousSuggestion<KL extends KeyList> = JoinKeyList<DropLastElement<KL>>;

type NextKeySuggestions<
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
  | NextKeySuggestions<T, _VKLP, U>
  | (PS extends _VPS
      ?
          | PreviousSuggestion<_VKLP>
          | (EvaluateKeyList<T, _VKLP> extends U ? PS : never)
      : _VPS);

export type LazyPath<T, PS extends PathString> = CompletePathString<
  T,
  PS,
  unknown
>;

export type LazyArrayPath<T, PS extends PathString> = CompletePathString<
  T,
  PS,
  ReadonlyArray<any>
>;
