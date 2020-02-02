import { UNDEFINED } from '../constants';

export default (data: object) =>
  typeof FileList !== UNDEFINED && data instanceof FileList;
