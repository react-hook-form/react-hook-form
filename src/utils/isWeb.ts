import { UNDEFINED } from '../constants';

export default typeof window !== UNDEFINED &&
  typeof window.HTMLElement !== UNDEFINED &&
  typeof document !== UNDEFINED;
