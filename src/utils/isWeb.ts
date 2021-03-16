import { UNDEFINED } from '../constants';

export default typeof window !== UNDEFINED && 
  window.HTMLElement !== UNDEFINED && 
  typeof document !== UNDEFINED;;
