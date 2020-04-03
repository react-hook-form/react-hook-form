import React from 'react';
import { Controller, useForm } from 'react-hook-form';

const ParseFormatTextarea = ({ value = [], onChange }) => {
  const [text, setText] = React.useState<string>(value.join("\n"));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.split("\n");

    setText(value);
    onChange(value);
  };

  return <textarea onChange={handleChange} value={text} />;
};

export default function App() {
  const { errors, control, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.emails && (
        <ul>
          {errors.emails.filter(message => !!message).map(({ message }, index) => (
            <li>Email #{index}: {message}</li>
          ))}
        </ul>
      )}
      <Controller name="emails" as={ParseFormatTextarea} control={control} />
      <button type="submit">Submit</button>
    </form>
  );
}
