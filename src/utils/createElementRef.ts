export default (elm: any) => ({
  focus: () => elm.focus(),
  select: () => elm.select(),
  setCustomValidity: (message: string) => elm.setCustomValidity(message),
  reportValidity: () => elm.reportValidity(),
});
