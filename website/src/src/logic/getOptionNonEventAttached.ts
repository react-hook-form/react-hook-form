export default function getOptionNonEventAttached(field, type, value) {
  return field.options.findIndex(({ ref, eventAttached }) => value === ref.value && !eventAttached);
}
