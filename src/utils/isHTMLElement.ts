export default (value: unknown): value is HTMLElement => {
  const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0;
  return (
    value instanceof
    (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement)
  );
};
