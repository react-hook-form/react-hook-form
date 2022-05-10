const STR_UNDEFINED = 'undefined';

export default typeof window !== STR_UNDEFINED &&
  typeof window.HTMLElement !== STR_UNDEFINED &&
  typeof document !== STR_UNDEFINED;
