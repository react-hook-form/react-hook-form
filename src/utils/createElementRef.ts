export default function createElementRef(elm: any) {
  return {
    focus: () => elm.focus(),
    select: () => elm.select(),
    setCustomValidity: (message: string) => elm.setCustomValidity(message),
    reportValidity: () => elm.reportValidity(),
  };
}
