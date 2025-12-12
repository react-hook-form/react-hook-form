import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type FormValues = {
  date: Date | null;
};

export default function MuiDatePickerExample() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: null,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Submitted:', data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 320,
        }}
      >
        <Controller
          name="date"
          control={control}
          rules={{ required: 'Date is required' }}
          render={({ field, fieldState }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              slotProps={{
                textField: {
                  inputRef: field.ref,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                } as any,
              }}
            />
          )}
        />

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#e91e63',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
    </LocalizationProvider>
  );
}
