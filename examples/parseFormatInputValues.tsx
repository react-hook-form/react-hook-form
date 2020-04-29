import React from 'react';
import { Controller, useForm } from 'react-hook-form';

const ParseFormatTextarea = ({ value = [], onChange }) => {
  const [text, setText] = React.useState(value);

  const handleChange = (e) => {
    const value = e.target.value.split('\n');

    setText(value);
    onChange(value);
  };

  return <textarea onChange={handleChange} value={text} />;
};

export default function App() {
  const { control, handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller name="emails" as={ParseFormatTextarea} control={control} />

      <Controller
        name="number"
        as={<input type="number" />}
        onChange={([e]) => parseInt(e.target.value, 10)}
        control={control}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
