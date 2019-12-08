export default function setNativeValue(element: HTMLInputElement, value: any) {
  const valueAttribute = 'value';
  const { set: valueSetter } =
    Object.getOwnPropertyDescriptor(element, valueAttribute) || {};
  const { set: prototypeValueSetter } =
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      valueAttribute,
    ) || {};

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  }
}
