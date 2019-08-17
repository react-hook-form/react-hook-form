export const DATE_INPUTS = [
  'date',
  'time',
  'month',
  'datetime',
  'datetime-local',
  'week',
];

export const STRING_INPUTS = [
  'text',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'textarea',
];

export interface ValidationMode {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
}

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
};
