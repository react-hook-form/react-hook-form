export const EVENTS = {
  BLUR: 'blur',
  CHANGE: 'change',
};

export enum VALIDATION_MODE {
  onBlur = 'onBlur',
  onChange = 'onChange',
  onSubmit = 'onSubmit',
  onTouched = 'onTouched',
  all = 'all',
}

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
};
