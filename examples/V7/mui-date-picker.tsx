import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
    defaultValues: { date: null },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
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
                  inputRef: field.ref, // fix: ensures proper focus on error
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />

        <button type="submit" style={{ marginTop: 20 }}>
          Submit
        </button>
      </form>
    </LocalizationProvider>
  );
}
