export default (value: unknown): value is HTMLElement => {
  const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0;
  const ElementClass =
    owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement;
  return value instanceof ElementClass;
};
