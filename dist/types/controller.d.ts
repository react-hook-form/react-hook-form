import React from 'react';
import { RegisterOptions } from './validator';
import { Control, FieldError, FieldPath, FieldPathValue, FieldValues, Noop, RefCallBack, UnpackNestedValue, UseFormStateReturn } from './';
export declare type ControllerFieldState = {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
};
export declare type ControllerRenderProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    onChange: (...event: any[]) => void;
    onBlur: Noop;
    value: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
    name: TName;
    ref: RefCallBack;
};
export declare type UseControllerProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName;
    rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    shouldUnregister?: boolean;
    defaultValue?: UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
    control?: Control<TFieldValues>;
};
export declare type UseControllerReturn<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    field: ControllerRenderProps<TFieldValues, TName>;
    formState: UseFormStateReturn<TFieldValues>;
    fieldState: ControllerFieldState;
};
/**
 * Render function to provide the control for the field.
 *
 * @returns all the event handler, and relevant field and form state.
 *
 * @example
 * ```tsx
 * const { field, fieldState, formState } = useController();
 *
 * <Controller
 *   render={({ field, formState, fieldState }) => ({
 *     <input
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       name={field.name}
 *       ref={field.ref} // optional for focus management
 *     />
 *   })}
 * />
 * ```
 */
export declare type ControllerProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    render: ({ field, fieldState, formState, }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
    }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;
//# sourceMappingURL=controller.d.ts.map