export type EventType =
  | 'focus'
  | 'blur'
  | 'change'
  | 'changeText'
  | 'valueChange'
  | 'contentSizeChange'
  | 'endEditing'
  | 'keyPress'
  | 'submitEditing'
  | 'layout'
  | 'selectionChange'
  | 'longPress'
  | 'press'
  | 'pressIn'
  | 'pressOut'
  | 'momentumScrollBegin'
  | 'momentumScrollEnd'
  | 'scroll'
  | 'scrollBeginDrag'
  | 'scrollEndDrag'
  | 'load'
  | 'error'
  | 'progress'
  | 'custom';

// the nativeEvent is not included in the type definition of synthetic events
export type NativeEventWithSubmitter = {
  submitter: React.ReactNode & {
    formNoValidate?: boolean;
  };
};
