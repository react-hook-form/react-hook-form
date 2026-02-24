import isCheckBoxInput from '../utils/isCheckBoxInput';
import isFileInput from '../utils/isFileInput'
import isObject from '../utils/isObject';

type Event = { target: any };

export default (event: unknown) =>
  isObject(event) && (event as Event).target
    ? isCheckBoxInput((event as Event).target)
      ? (event as Event).target.checked
      : isFileInput((event as Event).target)
        ? (event as Event).target.files
        : (event as Event).target.value
    : event;
