import isRadioInput from "./utils/isRadioInput";
import isCheckBoxInput from "./utils/isCheckBoxInput";

export default <Data, Name extends keyof Data>(
  name: Extract<Name, string>,
  value: Data[Name],
  shouldRender: boolean = true,
  {
    touchedFieldsRef,
    fieldsRef,
    isDirtyRef,
    reRenderForm,
  }
): void => {
  const field = fieldsRef.current[name];
  if (!field) return;

  if (shouldRender) {
    if (!touchedFieldsRef.current.includes(name)) {
      touchedFieldsRef.current.push(name);
    }
    isDirtyRef.current = true;
  }

  const ref = field.ref;
  const options = field.options;

  if (isRadioInput(ref.type) && options) {
    options.forEach(
      ({ ref: radioRef }): void => {
        if (radioRef.value === value) radioRef.checked = true;
      },
    );
    return;
  }

  ref[isCheckBoxInput(ref.type) ? 'checked' : 'value'] = value;
  if (shouldRender) reRenderForm({});
};
