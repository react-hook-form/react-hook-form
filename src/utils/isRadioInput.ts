import { Ref } from '../types/form';

export default (element: Ref): element is HTMLInputElement =>
  element.type === 'radio';
