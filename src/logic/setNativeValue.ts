export default function setNativeValue(element: HTMLInputElement, value: any) {
  const getOwnProperty = (element: HTMLInputElement) => {
    const valueAttribute = 'value';
    return Object.getOwnPropertyDescriptor(element, valueAttribute) || {};
  };
  const { set: valueSetter } = getOwnProperty(element);
  const { set: prototypeValueSetter } = getOwnProperty(
    Object.getPrototypeOf(element),
  );

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  }
}
