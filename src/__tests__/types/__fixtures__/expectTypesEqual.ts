import { expectType, TypeEqual } from 'ts-expect';

export function expectTypesEqual<Expected, Actual>(
  shouldEqual: TypeEqual<Expected, Actual>,
) {
  expectType<TypeEqual<Expected, Actual>>(shouldEqual);
}
