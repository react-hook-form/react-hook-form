// @flow
import getValidRadioValue from './getValidRadioValue';
import getMultipleSelectValue from "./getMultipleSelectValue";

export default (fields: Object, filedNames?: string | Array<string>) => {
  let tempValue;
  const data: Array<Object> = Object.values(fields);

  return Array.isArray(data)
    ? data.reduce((previous, { ref }: any) => {
        if (ref.type === 'radio') {
          tempValue = getValidRadioValue(fields[ref.name].options).value;
        } else if (ref.type === 'select-multiple') {
          tempValue = getMultipleSelectValue([...ref.options])
        } else if (ref.type === 'checkbox') {
          tempValue = ref.checked;
        } else {
          tempValue = ref.value;
        }

        if (typeof filedNames === 'string') {
          if (ref.name === filedNames) {
            return tempValue;
          }
        } else {
          // @ts-ignore:
          const copy = { ...previous };
          if (Array.isArray(filedNames) && filedNames.includes(ref.name)) {
            copy[ref.name] = tempValue;
          } else if (!filedNames) {
            copy[ref.name] = tempValue;
          }

          return copy;
        }

        return previous;
      }, undefined)
    : undefined;
};
