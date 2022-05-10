const UNDEFINED = 'undefined';

export default typeof window !== UNDEFINED &&
  typeof window.HTMLElement !== UNDEFINED &&
  typeof document !== UNDEFINED;
