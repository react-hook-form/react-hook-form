export type UpdatePayload<
  TFieldValues extends Record<string, any> = Record<string, any>,
> = {
  id: string;
  data: {
    formValues: TFieldValues;
    formState: {
      errors: Record<keyof TFieldValues, { type?: string; message?: string }>;
      dirtyFields: Record<keyof TFieldValues, boolean>;
      touchedFields: Record<keyof TFieldValues, boolean>;
      submitCount: number;
      isSubmitted: boolean;
      isSubmitting: boolean;
      isSubmitSuccessful: boolean;
      isValid: boolean;
      isValidating: boolean;
      isDirty: boolean;
    };
  };
};

type InitMessageData = {
  source: string;
  type: 'INIT' | 'WELCOME';
};

type UpdateMessageData<
  TFieldValues extends Record<string, any> = Record<string, any>,
> = {
  source: string;
  type: 'UPDATE';
  payload: UpdatePayload<TFieldValues>;
};

export type MessageData<
  TFieldValues extends Record<string, any> = Record<string, any>,
> = InitMessageData | UpdateMessageData<TFieldValues>;
