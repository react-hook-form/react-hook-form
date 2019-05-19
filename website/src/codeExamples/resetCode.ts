export default `import React from "react";
import useForm from "react-hook-form";

export default function YourForm() {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data, e) => {
    e.target.reset(); // standard reset after form submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" name="First name" ref={register({ required: true })} />
      <input type="text" name="Last name" ref={register} />

      <input type="submit" />
      <input style={{ display: "block", marginTop: 20 }} type="reset" />
      <input style={{ display: "block", marginTop: 20 }} type="button" onClick={reset} />
    </form>
  );
}
`
