export default (id: string) => {
  try {
    document?.getElementById(id)?.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      }),
    );
  } catch {
    // noop
  }
};
