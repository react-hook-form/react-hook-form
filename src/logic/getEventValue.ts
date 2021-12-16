import isCheckBoxInput from '../utils/isCheckBoxInput';
import isCustomEvent from '../utils/isCustomEvent';
import isObject from '../utils/isObject';

type Event = { target: any };

export default (event: unknown) => {
  if (isObject(event)) {
    if ((event as Event).target) {
      return isCheckBoxInput((event as Event).target)
        ? (event as Event).target.checked
        : (event as Event).target.value;
    }

    if ((event as CustomEvent).detail && isCustomEvent(event)) {
      return (event as CustomEvent).detail.value;
    }
  }

  return event;
};
