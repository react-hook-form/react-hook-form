import { FieldValues } from '../types';

export default <T, K>(values: T[], _fieldIds: K, keyName: string) =>
  values.map((value, index) => {
    const output = _fieldIds[index as keyof K];

    return {
      ...value,
      ...(output ? { [keyName]: (output as FieldValues)[keyName] } : {}),
    };
  });
