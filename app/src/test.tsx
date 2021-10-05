import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';

export default function App() {
  const { control, handleSubmit } = useForm();

  return (
    <form>
      <Controller
        name="Checkbox"
        defaultValue=""
        control={control}
        render={({ field }) => <input {...field} />}
      />
      <input type="submit" />
    </form>
  );
}
