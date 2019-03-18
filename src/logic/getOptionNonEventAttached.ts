export default function getOptionNonEventAttached(options, type, value): number {
  return options.findIndex(({ ref, eventAttached }) => value === ref.value && !eventAttached);
}
