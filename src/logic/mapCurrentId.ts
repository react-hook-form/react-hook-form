const mapCurrentId = <T, K>(
  values: T[],
  _fieldIds: React.MutableRefObject<K>,
  keyName: string,
) =>
  values.map((value, index) => {
    // @ts-ignore
    const output = _fieldIds.current[index];

    return {
      ...value,
      ...(output ? { [keyName]: output[keyName] } : {}),
    };
  });
