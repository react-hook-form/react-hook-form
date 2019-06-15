import { Ref, RegisterInput } from './types';
import warnMissingRef from './utils/warnMissingRef';
import isRadioInput from './utils/isRadioInput';
import onDomRemove from './utils/onDomRemove';
import setValueFunc from './setValue';
import attachEventListeners from './logic/attachEventListeners';

function registerIntoFieldsRef(
  elementRef,
  data: RegisterInput | undefined,
  {
    fieldsRef,
    defaultValues,
    touchedFieldsRef,
    isDirtyRef,
    reRenderForm,
    validateAndStateUpdateRef,
  },
): void {
  if (elementRef && !elementRef.name) return warnMissingRef(elementRef);

  const { name, type, value } = elementRef;
  const { required = false, validate = undefined } = data || {};
  const inputData = {
    ...data,
    ref: elementRef,
  };
  const fields = fieldsRef.current;
  const isRadio = isRadioInput(type);
  const field = fields[name];
  const existRadioOptionIndex =
    isRadio && field && Array.isArray(field.options)
      ? field.options.findIndex(({ ref }): boolean => value === ref.value)
      : -1;

  if ((!isRadio && field) || (isRadio && existRadioOptionIndex > -1)) return;

  if (!type) {
    fields[name] = { ref: { name }, ...data };
  } else {
    if (isRadio) {
      if (!field)
        fields[name] = {
          options: [],
          required,
          validate,
          ref: { type: 'radio', name },
        };
      if (validate) fields[name]!.validate = validate;

      (fields[name]!.options || []).push({
        ...inputData,
        mutationWatcher: onDomRemove(
          elementRef,
          // @ts-ignore
          (): Function => removeEventListener(inputData, true),
        ),
      });
    } else {
      fields[name] = {
        ...inputData,
        mutationWatcher: onDomRemove(
          elementRef,
          // @ts-ignore
          (): Function => removeEventListener(inputData, true),
        ),
      };
    }
  }

  if (defaultValues && defaultValues[name]) {
    // @ts-ignore
    setValueFunc(name, defaultValues[name], false, {
      touchedFieldsRef,
      fieldsRef,
      isDirtyRef,
      reRenderForm,
    });
  }

  if (!type) {
    return;
  }

  const fieldData = isRadio
    ? (fields[name]!.options || [])[(fields[name]!.options || []).length - 1]
    : fields[name];

  if (!fieldData) return;

  attachEventListeners({
    field: fieldData,
    isRadio,
    validateAndStateUpdate: validateAndStateUpdateRef.current,
  });
}

export default (
  refOrValidateRule: RegisterInput | Ref,
  validateRule?: RegisterInput,
  payload?,
) => {
  if (!refOrValidateRule || typeof window === 'undefined') return;

  if (validateRule && !refOrValidateRule.name) {
    warnMissingRef(refOrValidateRule);
    return;
  }

  if (refOrValidateRule.name) {
    registerIntoFieldsRef(refOrValidateRule, validateRule, payload);
  }

  return (ref: Ref): void =>
    ref && registerIntoFieldsRef(ref, refOrValidateRule, payload);
};
