import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type FormValues = {
  date: Date | null;
};

const theme = createTheme();

export default function MuiDatePickerExample() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { date: null },
  });

  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 300,
        }}
      >
        <Controller
          name="date"
          control={control}
          rules={{ required: 'Date is required' }}
          render={({ field, fieldState }) => (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    inputRef: field.ref, // فیکس اصلی فوکوس
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            </LocalizationProvider>
          )}
        />

        <button type="submit">Submit</button>
      </form>
    </ThemeProvider>
  );
}
